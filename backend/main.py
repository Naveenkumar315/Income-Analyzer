from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth

from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from app.utils.borrower_cleanup_service import clean_borrower_documents_from_dict

app = FastAPI(title="Income Analyzer API", version="1.0.0")

app.include_router(auth.router)

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
    file_name: str
    raw_json: Dict[str, Any]
    threshold: Optional[float] = 0.7
    borrower_indicators: Optional[List[str]] = None
    employer_indicators: Optional[List[str]] = None

@app.post("/clean-json")
async def clean_json(req: CleanJsonRequest):
    cleaned = clean_borrower_documents_from_dict(
        data=req.raw_json,
        threshold=req.threshold,
        borrower_indicators=req.borrower_indicators,
        employer_indicators=req.employer_indicators,
    )
    return {"file_name": req.file_name, "cleaned_json": cleaned}

