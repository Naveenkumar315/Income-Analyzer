from fastapi import FastAPI, HTTPException, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth

from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from app.utils.borrower_cleanup_service import clean_borrower_documents_from_dict
from app.db import db
from app.routes import uploaded_data

from datetime import datetime  # <-- import datetime


app = FastAPI(title="Income Analyzer API", version="1.0.0")

app.include_router(auth.router)
app.include_router(uploaded_data.router)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # which origins are allowed
    allow_credentials=True,
    allow_methods=["*"],              # allow all HTTP methods
    allow_headers=["*"],              # allow all headers
)


@app.get("/")
async def root():
    return {"message": "Welcome to the Income Analyzer API"}


class CleanJsonRequest(BaseModel):
    username: str
    email: str
    loanID: str
    file_name: str
    raw_json: Dict[str, Any]
    threshold: Optional[float] = 0.7
    borrower_indicators: Optional[List[str]] = None
    employer_indicators: Optional[List[str]] = None


@app.post("/clean-json")
async def clean_json(req: CleanJsonRequest):
    # Clean JSON
    cleaned = clean_borrower_documents_from_dict(
        data=req.raw_json,
        threshold=req.threshold,
        borrower_indicators=req.borrower_indicators,
        employer_indicators=req.employer_indicators,
    )

    # Current timestamp in required format
    timestamp = datetime.now().strftime("%Y-%m-%d %I:%M:%S %p")

    # Save into MongoDB
    record = {
        "username": req.username,
        "email": req.email,
        "loanID": req.loanID,
        "file_name": req.file_name,
        "original_data": req.raw_json,
        "cleaned_data": cleaned,
        "created_at": timestamp,
        "updated_at": timestamp,   # both same at insertion
    }
    await db["uploadedData"].insert_one(record)

    return {"message": "Upload saved successfully", "cleaned_json": cleaned}



@app.post("/update-cleaned-data")
async def update_cleaned_data(
    email: str = Body(...),
    loanID: str = Body(...),
    raw_json: dict = Body(...)
):
    """Update existing cleaned_data with new borrower/file merges or moves"""

    timestamp = datetime.now().strftime("%Y-%m-%d %I:%M:%S %p")

    existing = await db["uploadedData"].find_one({"loanID": loanID, "email": email})
    if not existing:
        return {"message": "No record found", "cleaned_json": {}}

    # Save new cleaned_data
    await db["uploadedData"].update_one(
        {"loanID": loanID, "email": email},
        {"$set": {"cleaned_data": raw_json, "updated_at": timestamp}}
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

