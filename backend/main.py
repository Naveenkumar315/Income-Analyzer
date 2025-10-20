from fastapi import FastAPI, HTTPException, Body, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio
import json
import yaml
import uvicorn
from bson import ObjectId
import logging
import httpx

from app.routes import auth, uploaded_data
from app.utils.borrower_cleanup_service import clean_borrower_documents_from_dict
from app.db import db
from app.services.audit_service import log_action  # <-- audit service
from app.utils.MCP_Connector import MCPClient

from fastapi.responses import StreamingResponse, JSONResponse
# from fastapi.responses import StreamingResponse

# from fastapi import FastAPI, 
# import httpx
# import asyncio
# import json

# -----------------------------
# Logging Setup
# -----------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -----------------------------
# Config
# -----------------------------
allowed_sections = ["BorrowerName", "W2", "VOE", "Paystubs", "Paystub"]
bs_allowed_sections = ["BorrowerName", "W2", "VOE", "Paystubs", "Paystub", "Bank Statement"]
bank_statement = ['Bank Statement']

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
origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

mcp_client = MCPClient("http://localhost:8000/mcp")
client_lock = asyncio.Lock()

# -----------------------------
# Helpers
# -----------------------------
def clean_json_data(obj):
    if isinstance(obj, dict):
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
        for key in list(obj.keys()):
            clean_json_data(obj[key])
    elif isinstance(obj, list):
        for item in obj:
            clean_json_data(item)
    return obj

def filter_documents_by_type(processed_data, document_types):
    filtered_data = {}
    for borrower_name, documents in processed_data.items():
        filtered_borrower_data = {}
        for doc_type, doc_list in documents.items():
            if any(doc_type.lower() == filter_type.lower() for filter_type in document_types):
                filtered_borrower_data[doc_type] = doc_list
        if filtered_borrower_data:
            filtered_data[borrower_name] = filtered_borrower_data
    return filtered_data

def convert_objectid(obj):
    if isinstance(obj, dict):
        return {k: convert_objectid(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_objectid(i) for i in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)
    else:
        return obj

# -----------------------------
# Startup / Shutdown
# -----------------------------
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

# -----------------------------
# Root
# -----------------------------
@app.get("/")
async def root():
    return {"message": "Welcome to the Income Analyzer API"}

# -----------------------------
# Models
# -----------------------------
class CleanJsonRequest(BaseModel):
    username: str
    email: str
    loanID: str
    file_name: str
    raw_json: Dict[str, Any]
    threshold: Optional[float] = 0.7
    borrower_indicators: Optional[List[str]] = None
    employer_indicators: Optional[List[str]] = None

class LoanViewRequest(BaseModel):
    email: str
    loanId: str

class LoanViewResponse(BaseModel):
    cleaned_data: dict
    analyzed_data: bool
    hasModifications: bool

class LoanGETResponse(BaseModel):
    cleaned_data: dict
    analyzed_data: bool

class GetAnalyzedDataRequest(BaseModel):
    email: str
    loanId: str

# -----------------------------
# Routes (core APIs remain unchanged)
# -----------------------------
@app.post("/clean-json")
async def clean_json(req: CleanJsonRequest):
    cleaned = clean_borrower_documents_from_dict(
        data=req.raw_json,
        threshold=req.threshold,
        borrower_indicators=req.borrower_indicators,
        employer_indicators=req.employer_indicators,
    )
    cl_data = clean_json_data(cleaned)
    filtered_data = filter_documents_by_type(cl_data, allowed_sections)
    filtered_data_with_bs = filter_documents_by_type(cl_data, bs_allowed_sections)
    only_bs = filter_documents_by_type(cl_data, bank_statement)
    timestamp = datetime.now().strftime("%Y-%m-%d %I:%M:%S %p")
    record = {
        "username": req.username,
        "email": req.email,
        "loanID": req.loanID,
        "file_name": req.file_name,
        "original_data": req.raw_json,
        "cleaned_data": cleaned,
        "filtered_data": filtered_data,
        "original_cleaned_data": cleaned,
        "only_bs": only_bs,
        "filtered_data_with_bs": filtered_data_with_bs,
        "created_at": timestamp,
        "updated_at": timestamp,
    }
    await db["uploadedData"].insert_one(record)
    return {"message": "Upload saved successfully", "cleaned_json": cleaned}

@app.post("/update-cleaned-data")
async def update_cleaned_data(email: str = Body(...), loanID: str = Body(...), username: str = Body(...),
                              action: str = Body(...), raw_json: dict = Body(...), hasModifications: bool = Body(False)):
    timestamp = datetime.now().strftime("%Y-%m-%d %I:%M:%S %p")
    existing = await db["uploadedData"].find_one({"loanID": loanID, "email": email})
    if not existing:
        raise HTTPException(status_code=404, detail="Record not found")
    old_cleaned = existing.get("cleaned_data", {})
    cl_data = clean_json_data(raw_json)
    filtered_data = filter_documents_by_type(cl_data, allowed_sections)
    filtered_data_with_bs = filter_documents_by_type(cl_data, bs_allowed_sections)
    only_bs = filter_documents_by_type(cl_data, bank_statement)
    updated_analyzed = existing.get("analyzed_data", {})
    await db["uploadedData"].update_one(
        {"loanID": loanID},
        {"$set": {
            "cleaned_data": cl_data,
            "filtered_data": filtered_data,
            "only_bs": only_bs,
            "filtered_data_with_bs": filtered_data_with_bs,
            "hasModifications": hasModifications,
            "updated_at": timestamp
        }}
    )
    await log_action(
        loanID=loanID,
        email=email,
        username=username,
        action=action,
        old_cleaned_data=old_cleaned,
        new_cleaned_data=raw_json,
    )
    updated = await db["uploadedData"].find_one({"loanID": loanID, "email": email})
    return {"message": "Cleaned data updated successfully", "cleaned_json": updated.get("cleaned_data", {})}

@app.get("/check-loanid")
async def check_loanid(email: str = Query(...), loanID: str = Query(...)):
    existing = await db["uploadedData"].find_one({"loanID": loanID, "email": email})
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
async def verify_rules(
    email: str = Query(...),
    loanID: str = Query(...),
    borrower: str = Query("All")
):
    """Verify rules for previously uploaded borrower JSON"""
    content = await db["uploadedData"].find_one(
        {"loanID": loanID, "email": email},
        {"filtered_data": 1, "_id": 0}
    )

    if not content or "filtered_data" not in content:
       return {"status": "error", "results": [], "rule_result": {}}

    data = content["filtered_data"]

    # Handle borrower selection
    if borrower != "All":
        if borrower not in data:
            return {"status": "error", "results": [], "rule_result": {}}
        data = data[borrower]

    if not data:
        return {"status": "error", "results": [], "rule_result": {}}

    try:
        results = []
        rule_result = {"Pass": 0, "Fail": 0,
                       "Insufficient data": 0, "Error": 0}

        async with client_lock:
            for rule in requirements["rules"]:
                try:
                    response = await mcp_client.call_tool(
                        "rule_verification",
                        {"rules": rule, "content": json.dumps(data)}
                    )

                    if response.content and len(response.content) > 0 and response.content[0].text.strip():
                        parsed_response = json.loads(response.content[0].text)
                        if parsed_response["status"] == "Pass":
                            rule_result["Pass"] += 1
                        elif parsed_response["status"] == "Fail":
                            rule_result["Fail"] += 1
                        else:
                            rule_result["Insufficient data"] += 1
                    else:
                        rule_result["Error"] += 1
                        parsed_response = {
                            "error": "Empty response from MCP client"}

                except json.JSONDecodeError as e:
                    rule_result["Error"] += 1
                    logger.error(f"JSON decode error for rule {rule}: {e}")
                    parsed_response = {"error": "Invalid JSON response"}
                except Exception as e:
                    rule_result["Error"] += 1
                    logger.error(f"Rule verification error for {rule}: {e}")
                    parsed_response = {
                        "error": f"Verification failed: {str(e)}"}

                results.append({"rule": rule, "result": parsed_response})

        return {"status": "success", "results": results, "rule_result": rule_result}

    except Exception as e:
        logger.error(f"Rules verification failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"Rules verification failed: {str(e)}")


@app.post("/income-calc")
async def income_calc(
    email: str = Query(...),
    loanID: str = Query(...),
    borrower: str = Query("All")
):
    """Calculate income for previously uploaded borrower JSON"""
    content = await db["uploadedData"].find_one(
        {"loanID": loanID, "email": email},
        {"filtered_data": 1, "_id": 0}
    )

    if not content or "filtered_data" not in content:
        return {"status": "error", "income": []}

    data = content["filtered_data"]

    if borrower != "All":
        if borrower not in data:
            return {"status": "error", "income": []}
        data = data[borrower]

    if not data:
        return {"status": "error", "income": []}

    try:
        final_response = []
        header_key = requirements["required_fields"].keys()
        for key in header_key:
            async with client_lock:
                try:
                    response = await mcp_client.call_tool(
                        "income_calculator",
                        {"fields": requirements["required_fields"]
                            [key], "content": json.dumps(data)},
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
            final_response.append(parsed_response)

        return {"status": "success", "income": final_response}

    except Exception as e:
        logger.error(f"Income calculation failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"Income calculation failed: {str(e)}")


@app.post("/income-insights")
async def income_insights(
    email: str = Query(...),
    loanID: str = Query(...),
    borrower: str = Query("All")
):
    """Generate income insights for borrower JSON"""
    content = await db["uploadedData"].find_one(
        {"loanID": loanID, "email": email},
        {"filtered_data_with_bs": 1, "_id": 0}
    )

    if not content or "filtered_data_with_bs" not in content:
        return {"status": "error", "income_insights": {}}

    data = content["filtered_data_with_bs"]

    if borrower != "All":
        if borrower not in data:
            return {"status": "error", "income_insights": {}}
        data = data[borrower]

    if not data:
        return {"status": "error", "income_insights": {}}

    try:
        async with client_lock:
            try:
                response = await mcp_client.call_tool(
                    "income_insights",
                    {"content": json.dumps(data)},
                )

                if response.content and len(response.content) > 0 and response.content[0].text.strip():
                    parsed_response = json.loads(response.content[0].text)
                else:
                    parsed_response = {
                        "error": "Empty response from MCP client"}

            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error in income insights: {e}")
                parsed_response = {"error": "Invalid JSON response"}
            except Exception as e:
                logger.error(f"Income insights error: {e}")
                parsed_response = {"error": f"Calculation failed: {str(e)}"}

        return {"status": "success", "income_insights": parsed_response}

    except Exception as e:
        logger.error(f"Income insights failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"Income insights failed: {str(e)}")


@app.post("/banksatement-insights")
async def banksatement_insights(email: str = Query(...), loanID: str = Query(...)):
    content = await db["uploadedData"].find_one({"loanID": loanID, "email": email}, {"only_bs": 1, "_id": 0})
    content = content['only_bs']
    if not content:
        return {"status": "Failure", "income_insights": ['Insufficient documents for bank statement insights.']}

    try:
        async def run_insights():
            try:
                response = await mcp_client.call_tool(
                    "bank_statement_insights",
                    {"content": json.dumps(content)},
                )
                if response.content and len(response.content) > 0 and response.content[0].text.strip():
                    parsed_response = json.loads(response.content[0].text)
                else:
                    parsed_response = {
                        "error": "Empty response from MCP client"}
            except Exception as e:
                parsed_response = {"error": str(e)}
            return parsed_response

        parsed_response = await run_insights()

        return {"status": "success", "income_insights": parsed_response}

    except Exception as e:
        logger.error(f"Income insights failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"Income insights failed: {str(e)}")


@app.post("/income-self_emp")
async def income_self_emp(
    email: str = Query(...),
    loanID: str = Query(...),
    borrower: str = Query("All")
):
    """Calculate income for previously uploaded borrower JSON"""
    content = await db["uploadedData"].find_one(
        {"loanID": loanID, "email": email},
        {"cleaned_data": 1, "_id": 0}
    )

    if not content or "cleaned_data" not in content:
        return {"status": "error", "income": {}}

    data = content["cleaned_data"]

    if borrower != "All":
        if borrower not in data:
            return {"status": "error", "income": {}}
        data = data[borrower]

    if not data:
        return {"status": "error", "income": {}}

    # print(data)
    try:
        async with client_lock:
            try:
                response = await mcp_client.call_tool(
                    "IC_self_income",
                    {"content": json.dumps(data)},
                )

                # print('response', response)

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

        return {"status": "success", "income": parsed_response}

    except Exception as e:
        logger.error(f"Self employed Income calculation failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"self Income calculation failed: {str(e)}")


@app.post("/store-analyzed-data")
async def store_analyzed_data(
    email: str = Body(...),
    loanID: str = Body(...),
    borrower: str = Body(...),
    analyzed_data: dict = Body(...)
):
    existing = await db["uploadedData"].find_one({"loanID": loanID, "email": email})
    if not existing:
        raise HTTPException(status_code=404, detail="Record not found")

    timestamp = datetime.now().strftime("%Y-%m-%d %I:%M:%S %p")

    # await db["uploadedData"].update_one(
    #     {"loanID": loanID, "email": email},
    #     {"$set": {"analyzed_data": analyzed_data, "updated_at": timestamp}}
    # )
    # Merge per borrower
    updated_analyzed = existing.get("analyzed_data", {})
    updated_analyzed[borrower] = analyzed_data

    await db["uploadedData"].update_one(
        {"loanID": loanID, "email": email},
        {"$set": {"analyzed_data": updated_analyzed, "updated_at": timestamp}}
    )

    return {"status": "success", "message": "Analyzed data stored"}


@app.post("/view-loan", response_model=LoanViewResponse)
async def view_loan(req: LoanViewRequest):
    # if loanId is an ObjectId, convert it
    # try:
    #     loan_id = ObjectId(req.loanId)
    # except:
    #     raise HTTPException(status_code=400, detail="Invalid loanId format")

    loan = await db["uploadedData"].find_one({"loanID": req.loanId})

    if not loan:
        raise HTTPException(
            status_code=404, detail="Loan not found for this email")

    return {
        "cleaned_data": loan.get("cleaned_data", {}),
        "analyzed_data": bool(loan.get("analyzed_data", False)),
        "hasModifications": bool(loan.get("hasModifications", False)),  # ✅ NEW
    }


@app.post("/get-original-data", response_model=LoanGETResponse)
async def view_loan(req: LoanViewRequest):
    # if loanId is an ObjectId, convert it
    # try:
    #     loan_id = ObjectId(req.loanId)
    # except:
    #     raise HTTPException(status_code=400, detail="Invalid loanId format")

    loan = await db["uploadedData"].find_one({"loanID": req.loanId})

    if not loan:
        raise HTTPException(
            status_code=404, detail="Loan not found for this email")

    return {
        "cleaned_data": loan.get("original_cleaned_data", {}),
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



BACKEND_URL = "http://localhost:8080"

async def fetch_borrower_data(email: str, loanId: str, borrower: str):
    """
    Fetch all data for a single borrower with error handling.
    Returns a dictionary for SSE streaming.
    """
    report = {}

    async with httpx.AsyncClient() as client:
        # 1️⃣ Rules
        try:
            rule_res = await client.post(f"{BACKEND_URL}/rule-results", params={"borrower": borrower, "loanId": loanId, "email": email})
            report["rules"] = rule_res.json()
        except Exception as e:
            report["rules"] = {"results": []}
            print(f"Rule API error for {borrower}: {e}")

        # 2️⃣ Summary / Income
        try:
            income_res = await client.post(f"{BACKEND_URL}/income-summary", params={"borrower": borrower, "loanId": loanId, "email": email})
            report["summary"] = income_res.json()
        except Exception as e:
            report["summary"] = {}
            print(f"Income API error for {borrower}: {e}")

        # 3️⃣ Insights
        try:
            insights_res = await client.post(f"{BACKEND_URL}/insights", params={"borrower": borrower, "loanId": loanId, "email": email})
            report["insights"] = insights_res.json()
        except Exception as e:
            report["insights"] = "No insights available"
            print(f"Insights API error for {borrower}: {e}")

        # 4️⃣ Self Employee
        try:
            self_emp_res = await client.post(f"{BACKEND_URL}/self-employee", params={"borrower": borrower, "loanId": loanId, "email": email})
            report["self_employee"] = self_emp_res.json()
        except Exception as e:
            report["self_employee"] = {}
            print(f"Self Employee API error for {borrower}: {e}")

        # 5️⃣ Bank Statement
        try:
            bs_res = await client.post(f"{BACKEND_URL}/banksatement-insights", params={"borrower": borrower, "loanId": loanId, "email": email})
            content = bs_res.json() or {}
            report["bankStatement"] = content.get("only_bs", [])
        except Exception as e:
            report["bankStatement"] = []
            print(f"Bank statement API error for {borrower}: {e}")

    return report


@app.get("/start-analysis")
async def start_analysis(request: Request, email: str, loanId: str, borrowers: str):
    """
    SSE endpoint for streaming borrower analysis to frontend.
    """
    borrower_list = [b.strip() for b in borrowers.split(",")]

    async def event_generator():
        for idx, borrower in enumerate(borrower_list):
            # Stop if client disconnects
            if await request.is_disconnected():
                print("Client disconnected, stopping SSE")
                break

            data = await fetch_borrower_data(email, loanId, borrower)

            # Build SSE message
            message = {
                "borrower": borrower,
                "step": idx + 1,
                "totalSteps": len(borrower_list),
                "report": data,
                "done": idx + 1 == len(borrower_list)
            }

            yield f"data: {json.dumps(message)}\n\n"

            await asyncio.sleep(0.1)  # optional small delay

    return StreamingResponse(event_generator(), media_type="text/event-stream")


# ======================================
#  Entrypoint
# ======================================
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
