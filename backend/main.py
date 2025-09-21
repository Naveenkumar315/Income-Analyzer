from fastapi import FastAPI, HTTPException, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.routes import auth, uploaded_data
from app.utils.borrower_cleanup_service import clean_borrower_documents_from_dict
from app.db import db
from app.services.audit_service import log_action  # <-- audit service

app = FastAPI(title="Income Analyzer API", version="1.0.0")

# Routers
app.include_router(auth.router)
app.include_router(uploaded_data.router)

# CORS
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Welcome to the Income Analyzer API"}


# ---------- MODELS ----------
class CleanJsonRequest(BaseModel):
    username: str
    email: str
    loanID: str
    file_name: str   # e.g. "folder_merge" / "file_merge" / "upload"
    raw_json: Dict[str, Any]
    threshold: Optional[float] = 0.7
    borrower_indicators: Optional[List[str]] = None
    employer_indicators: Optional[List[str]] = None


# ---------- ROUTES ----------
@app.post("/clean-json")
async def clean_json(req: CleanJsonRequest):
    """Insert new record with cleaned data (first time upload)."""
    cleaned = clean_borrower_documents_from_dict(
        data=req.raw_json,
        threshold=req.threshold,
        borrower_indicators=req.borrower_indicators,
        employer_indicators=req.employer_indicators,
    )

    timestamp = datetime.now().strftime("%Y-%m-%d %I:%M:%S %p")

    record = {
        "username": req.username,
        "email": req.email,
        "loanID": req.loanID,
        "file_name": req.file_name,
        "original_data": req.raw_json,
        "cleaned_data": cleaned,
        "created_at": timestamp,
        "updated_at": timestamp,
    }

    await db["uploadedData"].insert_one(record)

    return {"message": "Upload saved successfully", "cleaned_json": cleaned}


@app.post("/update-cleaned-data")
async def update_cleaned_data(
    email: str = Body(...),
    loanID: str = Body(...),
    username: str = Body(...),
    action: str = Body(...),   # e.g. "folder_merge", "file_merge"
    # description: str = Body(...),
    raw_json: dict = Body(...),
):
    """Update cleaned_data for merges/moves and log into auditLogs."""

    timestamp = datetime.now().strftime("%Y-%m-%d %I:%M:%S %p")

    existing = await db["uploadedData"].find_one({"loanID": loanID, "email": email})
    if not existing:
        raise HTTPException(status_code=404, detail="Record not found")

    old_cleaned = existing.get("cleaned_data", {})

    # Save new cleaned_data
    await db["uploadedData"].update_one(
        {"loanID": loanID, "email": email},
        {"$set": {"cleaned_data": raw_json, "updated_at": timestamp}}
    )

    # Log audit entry
    await log_action(
        loanID=loanID,
        email=email,
        username=username,
        action=action,
        # description=description,
        old_cleaned_data=old_cleaned,
        new_cleaned_data=raw_json,
    )

    # Return updated cleaned_json from DB
    updated = await db["uploadedData"].find_one({"loanID": loanID, "email": email})
    return {
        "message": "Cleaned data updated successfully",
        "cleaned_json": updated.get("cleaned_data", {}),
    }


@app.get("/check-loanid")
async def check_loanid(email: str = Query(...), loanID: str = Query(...)):
    """Check if a loanID already exists for a given email"""
    existing = await db["uploadedData"].find_one({"loanID": loanID, "email": email})
    return {"exists": bool(existing)}
