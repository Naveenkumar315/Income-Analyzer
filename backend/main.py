from fastapi import FastAPI, HTTPException, Body, Query, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio
import json
import yaml
import uvicorn
from bson import ObjectId

from app.routes import auth, uploaded_data
from app.utils.borrower_cleanup_service import clean_borrower_documents_from_dict
from app.db import db
from app.services.audit_service import log_action  # <-- audit service
from app.utils.MCP_Connector import MCPClient
from app.utils.Data_formatter import BorrowerDocumentProcessor
import logging
import os

# -----------------------------
# Logging Setup
# -----------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -----------------------------
# Config
# -----------------------------
allowed_sections = ["BorrowerName", "W2", "VOE", "Paystubs", "Paystub"]

try:
    with open("requirements.yaml") as stream:
        requirements = yaml.safe_load(stream)
except FileNotFoundError:
    logger.error("requirements.yaml file not found")
    requirements = {"rules": [], "required_fields": []}
except yaml.YAMLError as e:
    logger.error(f"Error parsing requirements.yaml: {e}")
    requirements = {"rules": [], "required_fields": []}

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


mcp_client = MCPClient("http://localhost:8000/mcp")
client_lock = asyncio.Lock()


# Storage for uploaded borrower content
uploaded_content: Dict[int, Dict[str, Any]] = {}

# -----------------------------
# Startup / Shutdown
# -----------------------------


def clean_json_data(obj):
    if isinstance(obj, dict):
        # Remove unwanted keys
        obj.pop("Link", None)
        obj.pop("ConfidenceScore", None)
        obj.pop("Url", None)
        obj.pop("LabelOrder", None)
        obj.pop("ScreenshotUrl", None)
        obj.pop("GeneratedOn", None)
        obj.pop("DocTitle", None)
        obj.pop("PageNumber", None)
        obj.pop("StageName", None)
        obj.pop("Title", None)
        obj.pop("SkillName", None)
        # Recursively clean nested dicts
        for key in list(obj.keys()):
            clean_json_data(obj[key])
    elif isinstance(obj, list):
        for item in obj:
            clean_json_data(item)
    return obj


def filter_documents_by_type(processed_data, document_types):
    """
    Filter processed borrower data to include only specified document types.

    Args:
        processed_data (dict): The processed JSON data with borrower names as keys
        document_types (list): List of document types to keep (e.g., ['Paystubs', 'W2'])

    Returns:
        dict: Filtered data containing only the specified document types for each borrower
    """
    filtered_data = {}

    # Iterate through each borrower
    for borrower_name, documents in processed_data.items():
        filtered_borrower_data = {}

        # Iterate through each document type for this borrower
        for doc_type, doc_list in documents.items():
            # Check if this document type is in our filter list (case-insensitive)
            if any(doc_type.lower() == filter_type.lower() for filter_type in document_types):
                filtered_borrower_data[doc_type] = doc_list

        # Only add borrower if they have at least one of the requested document types
        if filtered_borrower_data:
            filtered_data[borrower_name] = filtered_borrower_data

    return filtered_data


@app.on_event("startup")
async def startup_event():
    try:
        await mcp_client.connect()
        logger.info("MCP client connected successfully")
    except Exception as e:
        logger.error(f"Failed to connect MCP client: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    try:
        await mcp_client.cleanup()
        logger.info("MCP client cleanup completed")
    except Exception as e:
        logger.error(f"Error during MCP client cleanup: {e}")


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

class LoanViewRequest(BaseModel):
    email: str
    loanId: str


# --- Response model ---
class LoanViewResponse(BaseModel):
    cleaned_data: dict
    analyzed_data: bool

class GetAnalyzedDataRequest(BaseModel):
    email: str
    loanId: str


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

    cl_data = clean_json_data(cleaned)
    allowed_sections = ["BorrowerName", "W2", "VOE", "Paystubs", "Paystub"]

    filtered_data = filter_documents_by_type(cl_data, allowed_sections)

    timestamp = datetime.now().strftime("%Y-%m-%d %I:%M:%S %p")

    record = {
        "username": req.username,
        "email": req.email,
        "loanID": req.loanID,
        "file_name": req.file_name,
        "original_data": req.raw_json,
        "cleaned_data": cleaned,
        "filtered_data": filtered_data,
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

    existing = await db["uploadedData"].find_one({"loanID": loanID})
    if not existing:
        raise HTTPException(status_code=404, detail="Record not found")

    old_cleaned = existing.get("cleaned_data", {})

    # Save new cleaned_data
    await db["uploadedData"].update_one(
        {"loanID": loanID},
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
    updated = await db["uploadedData"].find_one({"loanID": loanID})
    return {
        "message": "Cleaned data updated successfully",
        "cleaned_json": updated.get("cleaned_data", {}),
    }


@app.get("/check-loanid")
async def check_loanid(email: str = Query(...), loanID: str = Query(...)):
    """Check if a loanID already exists for a given email"""
    existing = await db["uploadedData"].find_one({"loanID": loanID})
    return {"exists": bool(existing)}


def convert_objectid(obj):
    if isinstance(obj, dict):
        return {k: convert_objectid(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_objectid(i) for i in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)
    else:
        return obj


@app.post("/verify-rules")
async def verify_rules(email: str = Query(...), loanID: str = Query(...)):
    """Verify rules for previously uploaded borrower JSON"""
    content = await db["uploadedData"].find_one({"loanID": loanID, "email": email}, {"filtered_data": 1, "_id": 0})
    if not content or 'filtered_data' not in content:
        raise HTTPException(
            status_code=404, detail="File not found or cleaned_data missing."
        )
    content = content['filtered_data']
    # print('===================', content)

    if not content:
        raise HTTPException(status_code=404, detail="Data is not found.")

    # content = convert_objectid(content)

    try:
        results = []
        rule_result = {'Pass': 0, 'Fail': 0,
                       'Insufficient data': 0, 'Error': 0}

        async with client_lock:
            for rule in requirements["rules"]:
                try:
                    response = await mcp_client.call_tool(
                        "rule_verification", {
                            "rules": rule, "content": json.dumps(content)}
                    )

                    if response.content and len(response.content) > 0 and response.content[0].text.strip():
                        parsed_response = json.loads(response.content[0].text)
                        if parsed_response['status'] == 'Pass':
                            rule_result["Pass"] = rule_result["Pass"]+1
                        elif parsed_response['status'] == 'Fail':
                            rule_result["Fail"] = rule_result["Fail"]+1
                        else:
                            rule_result["Insufficient data"] = rule_result["Insufficient data"]+1
                    else:
                        rule_result["Error"] = rule_result["Error"]+1
                        parsed_response = {
                            "error": "Empty response from MCP client"}

                except json.JSONDecodeError as e:
                    rule_result["Error"] = rule_result["Error"]+1
                    logger.error(f"JSON decode error for rule {rule}: {e}")
                    parsed_response = {"error": "Invalid JSON response"}
                except Exception as e:
                    rule_result["Error"] = rule_result["Error"]+1
                    logger.error(f"Rule verification error for {rule}: {e}")
                    parsed_response = {
                        "error": f"Verification failed: {str(e)}"}

                results.append({"rule": rule, "result": parsed_response})

        return {"status": "success", "results": results, "rule_result":  rule_result}

    except Exception as e:
        logger.error(f"Rules verification failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"Rules verification failed: {str(e)}")


@app.post("/income-calc")
async def income_calc(email: str = Query(...), loanID: str = Query(...)):
    """Calculate income for previously uploaded borrower JSON"""
    content = await db["uploadedData"].find_one({"loanID": loanID, "email": email}, {"filtered_data": 1, "_id": 0})
    content = content['filtered_data']
    # print("API calling", content)

    if not content:
        raise HTTPException(
            status_code=404, detail="File not found. Please upload first.")

    try:
        final_resopnse = []
        header_key = requirements["required_fields"].keys()
        for key in header_key:
            async with client_lock:
                try:
                    response = await mcp_client.call_tool(
                        "income_calculator",
                        {"fields": requirements["required_fields"]
                            [key], "content": json.dumps(content)},
                    )

                    if response.content and len(response.content) > 0 and response.content[0].text.strip():
                        parsed_response = json.loads(response.content[0].text)
                    else:
                        parsed_response = {
                            "error": "Empty response from MCP client"}

                except json.JSONDecodeError as e:
                    logger.error(
                        f"JSON decode error in income calculation: {e}")
                    parsed_response = {"error": "Invalid JSON response"}
                except Exception as e:
                    logger.error(f"Income calculation error: {e}")
                    parsed_response = {
                        "error": f"Calculation failed: {str(e)}"}
            final_resopnse.append(parsed_response)

        return {"status": "success", "income": final_resopnse}

    except Exception as e:
        logger.error(f"Income calculation failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"Income calculation failed: {str(e)}")


@app.post("/income-insights")
async def income_insights(email: str = Query(...), loanID: str = Query(...)):
    content = await db["uploadedData"].find_one({"loanID": loanID, "email": email}, {"filtered_data": 1, "_id": 0})
    print(content)
    content = content['filtered_data']
    if not content:
        raise HTTPException(
            status_code=404, detail="File not found. Please upload first.")

    try:
        async with client_lock:
            try:
                response = await mcp_client.call_tool(
                    "income_insights",
                    {"content": json.dumps(content)},
                )

                if response.content and len(response.content) > 0 and response.content[0].text.strip():
                    parsed_response = json.loads(response.content[0].text)
                else:
                    parsed_response = {
                        "error": "Empty response from MCP client"}

            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error in income calculation: {e}")
                parsed_response = {"error": "Invalid JSON response"}
            except Exception as e:
                logger.error(f"Income calculation error: {e}")
                parsed_response = {"error": f"Calculation failed: {str(e)}"}

        return {"status": "success", "income_insights": parsed_response}

    except Exception as e:
        logger.error(f"Income calculation failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"Income calculation failed: {str(e)}")

@app.post("/store-analyzed-data")
async def store_analyzed_data(
    email: str = Body(...),
    loanID: str = Body(...),
    analyzed_data: dict = Body(...)
):
    existing = await db["uploadedData"].find_one({"loanID": loanID, "email": email})
    if not existing:
        raise HTTPException(status_code=404, detail="Record not found")

    timestamp = datetime.now().strftime("%Y-%m-%d %I:%M:%S %p")

    await db["uploadedData"].update_one(
        {"loanID": loanID, "email": email},
        {"$set": {"analyzed_data": analyzed_data, "updated_at": timestamp}}
    )

    return {"status": "success", "message": "Analyzed data stored"}

@app.post("/view-loan", response_model=LoanViewResponse)
async def view_loan(req: LoanViewRequest):
    # if loanId is an ObjectId, convert it
    # try:
    #     loan_id = ObjectId(req.loanId)
    # except:
    #     raise HTTPException(status_code=400, detail="Invalid loanId format")

    loan = await  db["uploadedData"].find_one({"loanID": req.loanId})

    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found for this email")

    return {
        "cleaned_data": loan.get("cleaned_data", {}),
        "analyzed_data": bool(loan.get("analyzed_data", False)),
    }

@app.post("/get-analyzed-data")
async def get_analyzed_data(req: GetAnalyzedDataRequest):
    loan = await db["uploadedData"].find_one({"loanID": req.loanId, "email": req.email})

    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    return {
        "analyzed_data": loan.get("analyzed_data", {})
    }

# ======================================
#  Entrypoint
# ======================================
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
