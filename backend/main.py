from fastapi import FastAPI
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


# @app.post("/clean-json")
# async def clean_json(req: CleanJsonRequest):
#     # Clean JSON
#     cleaned = clean_borrower_documents_from_dict(
#         data=req.raw_json,
#         threshold=req.threshold,
#         borrower_indicators=req.borrower_indicators,
#         employer_indicators=req.employer_indicators,
#     )

#     # Current timestamp in required format
#     timestamp = datetime.now().strftime("%Y-%m-%d %I:%M:%S %p")

#     # Save into MongoDB
#     record = {
#         "username": req.username,
#         "email": req.email,
#         "loanID": req.loanID,
#         "file_name": req.file_name,
#         "original_data": req.raw_json,
#         "cleaned_data": cleaned,
#         "created_at": timestamp,
#         "updated_at": timestamp,   # both same at insertion
#     }
#     await db["uploadedData"].insert_one(record)

#     return {"message": "Upload saved successfully", "cleaned_json": cleaned}

@app.post("/clean-json")
async def clean_json(req: CleanJsonRequest):
    # Run cleaner
    cleaned = clean_borrower_documents_from_dict(
        data=req.raw_json,
        threshold=req.threshold,
        borrower_indicators=req.borrower_indicators,
        employer_indicators=req.employer_indicators,
    )

    # Convert to dict form for saving in DB
    cleaned_dict = {}
    if isinstance(cleaned, list):
        for item in cleaned:
            if isinstance(item, dict) and "borrower" in item:
                borrower_name = item["borrower"]
                cleaned_dict[borrower_name] = item.get("docs", {})
    elif isinstance(cleaned, dict):
        cleaned_dict = cleaned
    else:
        cleaned_dict = {}

    timestamp = datetime.now().strftime("%Y-%m-%d %I:%M:%S %p")

    record = {
        "username": req.username,
        "email": req.email,
        "loanID": req.loanID,
        "file_name": req.file_name,
        # 🔑 keep raw merged json for audit/debug
        "original_data": req.raw_json,
        # 🔑 save the updated merged borrower structure here
        "cleaned_data": cleaned_dict,
        "updated_at": timestamp,
    }

    existing = await db["uploadedData"].find_one(
        {"loanID": req.loanID, "email": req.email}
    )

    if existing:
        await db["uploadedData"].update_one(
            {"loanID": req.loanID, "email": req.email},
            {"$set": record},
        )
    else:
        record["created_at"] = timestamp
        await db["uploadedData"].insert_one(record)

    # ✅ return cleaned_dict so frontend sees the merged borrowers
    return {"message": "Data saved successfully", "cleaned_json": cleaned_dict}



