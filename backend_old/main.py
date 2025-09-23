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


@app.post("/get-analyzing-data")
async def get_analyzing_data():
    try:
        return {
            "status": "success",
            "file": 1,
            "results": [
                {
                    "rule": "Defines stable, predictable income; variable income averaging; income trending analysis; income continuity; use of nontaxable income and tax returns requirements.",
                    "result": {
                        "rule": "Defines stable, predictable income; variable income averaging; income trending analysis; income continuity; use of nontaxable income and tax returns requirements.",
                        "status": "Pass",
                        "commentary": "The loan details provided for Samuel Glynda Sotello Cameron Sotello and Natalie Carrasco Sotello demonstrate stable and predictable income through consistent W2 earnings and VOE records. Samuel's income shows a stable trend with slight variations due to overtime and pay increases, while Natalie's income is consistent with her employment history. Both borrowers have provided sufficient documentation, including W2s and VOEs, to verify income continuity. There is no indication of nontaxable income or missing tax returns that would affect the evaluation."
                    }
                },
                {
                    "rule": "Specifies documentation acceptable for wage earners: current paystubs (dated within 30 days), 1-2yrs W-2s, VOE forms, employer or third party verification.",
                    "result": {
                        "rule": "Specifies documentation acceptable for wage earners: current paystubs (dated within 30 days), 1-2yrs W-2s, VOE forms, employer or third party verification.",
                        "status": "Pass",
                        "commentary": "The loan details provided include W-2 forms for the years 2023 and 2024, a VOE form verified on 5/8/2025, and a paystub dated 4/18/2025. These documents satisfy the rule's requirements for acceptable documentation for wage earners."
                    }
                },
                {
                    "rule": "Specifies documentation acceptable for wage earners: current paystubs (dated within 30 days), 1-2yrs W-2s, VOE forms, employer or third party verification.",
                    "result": {
                        "rule": "Specifies documentation acceptable for wage earners: current paystubs (dated within 30 days), 1-2yrs W-2s, VOE forms, employer or third party verification.",
                        "status": "Pass",
                        "commentary": "The loan details provided include W-2 forms for the years 2023 and 2024, a VOE form verified on 5/8/2025, and a paystub dated 4/18/2025. These documents satisfy the rule's requirements for acceptable documentation for wage earners."
                    }
                },
                {
                    "rule": "Specifies documentation acceptable for wage earners: current paystubs (dated within 30 days), 1-2yrs W-2s, VOE forms, employer or third party verification.",
                    "result": {
                        "rule": "Specifies documentation acceptable for wage earners: current paystubs (dated within 30 days), 1-2yrs W-2s, VOE forms, employer or third party verification.",
                        "status": "Pass",
                        "commentary": "The loan details provided include W-2 forms for the years 2023 and 2024, a VOE form verified on 5/8/2025, and a paystub dated 4/18/2025. These documents satisfy the rule's requirements for acceptable documentation for wage earners."
                    }
                },
                {
                    "rule": "Specifies documentation acceptable for wage earners: current paystubs (dated within 30 days), 1-2yrs W-2s, VOE forms, employer or third party verification.",
                    "result": {
                        "rule": "Specifies documentation acceptable for wage earners: current paystubs (dated within 30 days), 1-2yrs W-2s, VOE forms, employer or third party verification.",
                        "status": "Pass",
                        "commentary": "The loan details provided include W-2 forms for the years 2023 and 2024, a VOE form verified on 5/8/2025, and a paystub dated 4/18/2025. These documents satisfy the rule's requirements for acceptable documentation for wage earners."
                    }
                },
                {
                    "rule": "Specifies documentation acceptable for wage earners: current paystubs (dated within 30 days), 1-2yrs W-2s, VOE forms, employer or third party verification.",
                    "result": {
                        "rule": "Specifies documentation acceptable for wage earners: current paystubs (dated within 30 days), 1-2yrs W-2s, VOE forms, employer or third party verification.",
                        "status": "Pass",
                        "commentary": "The loan details provided include W-2 forms for the years 2023 and 2024, a VOE form verified on 5/8/2025, and a paystub dated 4/18/2025. These documents satisfy the rule's requirements for acceptable documentation for wage earners."
                    }
                },
                {
                    "rule": "Specifies documentation acceptable for wage earners: current paystubs (dated within 30 days), 1-2yrs W-2s, VOE forms, employer or third party verification.",
                    "result": {
                        "rule": "Specifies documentation acceptable for wage earners: current paystubs (dated within 30 days), 1-2yrs W-2s, VOE forms, employer or third party verification.",
                        "status": "Pass",
                        "commentary": "The loan details provided include W-2 forms for the years 2023 and 2024, a VOE form verified on 5/8/2025, and a paystub dated 4/18/2025. These documents satisfy the rule's requirements for acceptable documentation for wage earners."
                    }
                }
            ],
            "rule_result": {
                "Pass": 2,
                "Fail": 0,
                "Insufficient data": 0,
                "Error": 0
            }
        }
    except Exception as e:
        print(e)
        return {"error": str(e)}


@app.post("/income-calc")
async def get_summary():
    try:
        return {
            "status": "success",
            "file": 1,
            "income": [
                {
                    "checks": [
                        {
                            "field": "employee_name",
                            "value": "Samuel Cameron Sotello",
                            "status": "Pass",
                            "commentary": "Employee name extracted from VOE and Paystubs for the year 2025.",
                            "calculation_commentry": "Employee name is directly available in the VOE and Paystubs."
                        },
                        {
                            "field": "date_of_hire",
                            "value": "August 2011",
                            "status": "Pass",
                            "commentary": "Date of hire extracted from VOE for the year 2025.",
                            "calculation_commentry": "Date of hire is directly available in the VOE as 'Most Recent Start Date'."
                        },
                        {
                            "field": "current_year_monthly_salary",
                            "value": "7,993.33",
                            "status": "Pass",
                            "commentary": "Calculated from W-2 wages for the year 2024.",
                            "calculation_commentry": "Annual salary from W-2 (2024) is $95,674.00. Monthly salary = $95,674.00 / 12 = $7,972.83."
                        },
                        {
                            "field": "previous_year_monthly_salary",
                            "value": "7,993.33",
                            "status": "Pass",
                            "commentary": "Calculated from W-2 wages for the year 2023.",
                            "calculation_commentry": "Annual salary from W-2 (2023) is $95,920.00. Monthly salary = $95,920.00 / 12 = $7,993.33."
                        },
                        {
                            "field": "second_previous_year_monthly_salary",
                            "value": "7,972.83",
                            "status": "Pass",
                            "commentary": "Calculated from VOE total pay for the year 2022.",
                            "calculation_commentry": "Annual salary from VOE (2022) is $95,674.00. Monthly salary = $95,674.00 / 12 = $7,972.83."
                        },
                        {
                            "field": "current_year_bonus",
                            "value": "0.00",
                            "status": "Pass",
                            "commentary": "No bonus reported in W-2 or VOE for the year 2024.",
                            "calculation_commentry": "Bonus is not reported in the available documentation for 2024."
                        },
                        {
                            "field": "previous_year_bonus",
                            "value": "0.00",
                            "status": "Pass",
                            "commentary": "No bonus reported in W-2 or VOE for the year 2023.",
                            "calculation_commentry": "Bonus is not reported in the available documentation for 2023."
                        },
                        {
                            "field": "second_previous_year_bonus",
                            "value": "0.00",
                            "status": "Pass",
                            "commentary": "No bonus reported in VOE for the year 2022.",
                            "calculation_commentry": "Bonus is not reported in the available documentation for 2022."
                        },
                        {
                            "field": "current_year_commission",
                            "value": "0.00",
                            "status": "Pass",
                            "commentary": "No commission reported in W-2 or VOE for the year 2024.",
                            "calculation_commentry": "Commission is not reported in the available documentation for 2024."
                        },
                        {
                            "field": "previous_year_commission",
                            "value": "0.00",
                            "status": "Pass",
                            "commentary": "No commission reported in W-2 or VOE for the year 2023.",
                            "calculation_commentry": "Commission is not reported in the available documentation for 2023."
                        },
                        {
                            "field": "second_previous_year_commission",
                            "value": "0.00",
                            "status": "Pass",
                            "commentary": "No commission reported in VOE for the year 2022.",
                            "calculation_commentry": "Commission is not reported in the available documentation for 2022."
                        },
                        {
                            "field": "current_year_overtime",
                            "value": "5,380.00",
                            "status": "Pass",
                            "commentary": "Overtime extracted from VOE for the year 2023.",
                            "calculation_commentry": "Overtime is directly available in the VOE as $5,380.00 for 2023."
                        },
                        {
                            "field": "previous_year_overtime",
                            "value": "9,028.00",
                            "status": "Pass",
                            "commentary": "Overtime extracted from VOE for the year 2022.",
                            "calculation_commentry": "Overtime is directly available in the VOE as $9,028.00 for 2022."
                        },
                        {
                            "field": "second_previous_year_overtime",
                            "value": "0.00",
                            "status": "Pass",
                            "commentary": "No overtime reported in VOE for the year 2021.",
                            "calculation_commentry": "Overtime is not reported in the available documentation for 2021."
                        },
                        {
                            "field": "current_year_other_income",
                            "value": "0.00",
                            "status": "Pass",
                            "commentary": "No other income reported in W-2 or VOE for the year 2024.",
                            "calculation_commentry": "Other income is not reported in the available documentation for 2024."
                        },
                        {
                            "field": "previous_year_other_income",
                            "value": "0.00",
                            "status": "Pass",
                            "commentary": "No other income reported in W-2 or VOE for the year 2023.",
                            "calculation_commentry": "Other income is not reported in the available documentation for 2023."
                        },
                        {
                            "field": "second_previous_year_other_income",
                            "value": "0.00",
                            "status": "Pass",
                            "commentary": "No other income reported in VOE for the year 2022.",
                            "calculation_commentry": "Other income is not reported in the available documentation for 2022."
                        }
                    ]
                }
            ]
        }
    except Exception as e:
        print(f' Error: {e}')


@app.post("/income-insights")
async def income_insights():
    try:
        return {
            "status": "success",
            "file": 1,
            "income_insights": {
                "insight_commentry": "Analysis of the mortgage loan file for Samuel Glynda Sotello Cameron Sotello and Natalie Carrasco Sotello reveals the following insights:\n\n1. **Valid Income Findings:**\n   - Samuel C Sotello's income from Sotello Electric LLC is consistent across W2 forms for 2023 and 2024, with wages around $95,920 and $95,674 respectively. The VOE confirms employment status as active with a consistent hourly rate of $46 and average hours between 40-45 per week.\n   - Natalie Carrasco Sotello's income from Stream Realty Partners, L.P. for 2024 is reported as $19,973.59, with statutory employee status checked, indicating compliance with Fannie Mae guidelines.\n\n2. **Guideline Exceptions or Risks:**\n   - The VOE for Natalie E Carrasco indicates she is not currently on payroll at Skanska USA Inc., which may affect income stability and continuity.\n   - The paystubs for Natalie Eden Sotello and Samuel Cameron Sotello from Pilgrim Mortgage LLC lack detailed earnings and deductions, which may require further verification.\n\n3. **Potential Fraud Indicators:**\n   - Discrepancies in employee addresses between W2 forms and VOE for Samuel C Sotello could indicate potential misrepresentation or errors in documentation.\n   - The social security number for Samuel Cameron Sotello differs between W2 and VOE, which is a red flag for identity verification.\n\n4. **Miscellaneous Observations:**\n   - The VOE for Samuel C Sotello indicates a pay increase in September 2024, which aligns with the reported wages in the W2 forms.\n   - Natalie Carrasco Sotello's paystubs from Stream Realty Personnel Services, LLC show deductions for various benefits, indicating comprehensive employee benefits.\n\nOverall, while the income documentation for Samuel C Sotello appears valid, there are concerns regarding Natalie Carrasco Sotello's employment status and discrepancies in documentation that require further investigation."
            }
        }
    except Exception as e:
        print(f'Error: ${e}')
