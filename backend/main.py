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
            "file": 3,
            "income": [
                {
                    "checks": [
                        {
                            "field": "employee_name",
                            "value": "WEN BIN NI",
                            "status": "Pass",
                            "commentary": "The employee name was extracted from the W-2 form for the year 2023.",
                            "calculation_commentry": "The employee name 'WEN BIN NI' is directly available in the W-2 documentation under the 'Employee Name' field."
                        },
                        {
                            "field": "date_of_hire",
                            "value": "insufficient data",
                            "status": "Fail",
                            "commentary": "The date of hire is not available in the provided documentation for the year 2023.",
                            "calculation_commentry": "The provided documents, including W-2 and paystubs, do not contain any information regarding the date of hire. Therefore, it is not possible to calculate or derive this field."
                        }
                    ]
                },
                {
                    "checks": [
                        {
                            "field": "current_year_ytd_earnings",
                            "value": "180000",
                            "status": "Pass",
                            "commentary": "The current year YTD earnings for 2023 are derived from the W-2 form provided for Wen Bin Ni.",
                            "calculation_commentry": "The W-2 form for the year 2023 shows 'Wages Tips Other Comp' as $180,000. This is the total earnings for the year 2023."
                        },
                        {
                            "field": "previous_year_ytd_earnings",
                            "value": "insufficient data",
                            "status": "Fail",
                            "commentary": "There is no documentation available for the year 2022 to calculate the previous year's YTD earnings.",
                            "calculation_commentry": "The provided documentation only includes a W-2 for 2023 and no other documents for 2022. Therefore, it is not possible to calculate the previous year's YTD earnings."
                        },
                        {
                            "field": "second_previous_year_ytd_earnings",
                            "value": "insufficient data",
                            "status": "Fail",
                            "commentary": "There is no documentation available for the year 2021 to calculate the second previous year's YTD earnings.",
                            "calculation_commentry": "The provided documentation only includes a W-2 for 2023 and no other documents for 2021. Therefore, it is not possible to calculate the second previous year's YTD earnings."
                        }
                    ]
                },
                {
                    "checks": [
                        {
                            "field": "current_year_bonus",
                            "value": "0",
                            "status": "Pass",
                            "commentary": "For the year 2023, no bonus information is available in the provided W-2 form.",
                            "calculation_commentry": "The W-2 form for 2023 does not list any bonuses separately. Therefore, the current year bonus is assumed to be $0."
                        },
                        {
                            "field": "previous_year_bonus",
                            "value": "insufficient data",
                            "status": "Fail",
                            "commentary": "No documentation is available for the year 2022 to determine the previous year's bonus.",
                            "calculation_commentry": "There is no W-2 or any other documentation provided for the year 2022. Hence, it is not possible to calculate the previous year's bonus."
                        },
                        {
                            "field": "second_previous_year_bonus",
                            "value": "insufficient data",
                            "status": "Fail",
                            "commentary": "No documentation is available for the year 2021 to determine the second previous year's bonus.",
                            "calculation_commentry": "There is no W-2 or any other documentation provided for the year 2021. Hence, it is not possible to calculate the second previous year's bonus."
                        }
                    ]
                },
                {
                    "checks": [
                        {
                            "field": "current_year_commission",
                            "value": "insufficient data",
                            "status": "Fail",
                            "commentary": "The year 2023 data does not provide specific commission details.",
                            "calculation_commentry": "The W-2 form for 2023 does not specify any commission earnings separately. Without explicit commission data, it is not possible to calculate the current year commission."
                        },
                        {
                            "field": "previous_year_commission",
                            "value": "insufficient data",
                            "status": "Fail",
                            "commentary": "No data available for the year 2022 to determine commission.",
                            "calculation_commentry": "There is no documentation provided for the year 2022, hence commission earnings for the previous year cannot be calculated."
                        },
                        {
                            "field": "second_previous_year_commission",
                            "value": "insufficient data",
                            "status": "Fail",
                            "commentary": "No data available for the year 2021 to determine commission.",
                            "calculation_commentry": "There is no documentation provided for the year 2021, hence commission earnings for the second previous year cannot be calculated."
                        }
                    ]
                },
                {
                    "error": "Invalid JSON response"
                },
                {
                    "checks": [
                        {
                            "field": "current_year_other_income",
                            "value": "0",
                            "status": "Pass",
                            "commentary": "Based on the 2023 W-2 form for Wen Bin Ni, there is no indication of other income such as bonuses, commissions, or additional earnings beyond the regular wages. The W-2 form only lists 'Wages, Tips, Other Comp' as $180,000, which is considered the base salary. No additional income sources are mentioned.",
                            "calculation_commentry": "The W-2 form for 2023 lists 'Wages, Tips, Other Comp' as $180,000. There are no other income sources or additional earnings mentioned in the provided documentation. Therefore, the current year other income is calculated as $0."
                        }
                    ]
                },
                {
                    "checks": [
                        {
                            "field": "current_year_hourly_rate",
                            "value": "insufficient data",
                            "status": "Fail",
                            "commentary": "The available documentation for 2023 does not provide sufficient data to calculate an hourly rate.",
                            "calculation_commentry": "The W-2 form for 2023 provides an annual salary of $180,000 but does not include information on hours worked or pay frequency, which are necessary to calculate an hourly rate."
                        },
                        {
                            "field": "previous_year_hourly_rate",
                            "value": "insufficient data",
                            "status": "Fail",
                            "commentary": "No documentation is available for the previous year to calculate an hourly rate.",
                            "calculation_commentry": "There is no data provided for the year 2022, hence it is impossible to calculate the hourly rate for that year."
                        },
                        {
                            "field": "second_previous_year_hourly_rate",
                            "value": "insufficient data",
                            "status": "Fail",
                            "commentary": "No documentation is available for the second previous year to calculate an hourly rate.",
                            "calculation_commentry": "There is no data provided for the year 2021, hence it is impossible to calculate the hourly rate for that year."
                        }
                    ]
                },
                {
                    "checks": [
                        {
                            "field": "current_year_monthly_salary",
                            "value": "15000",
                            "status": "Pass",
                            "commentary": "The current year (2023) gross monthly salary is calculated from the W-2 form.",
                            "calculation_commentry": "Annual salary from W-2 for 2023 is $180,000. To find the monthly salary: $180,000 / 12 = $15,000."
                        },
                        {
                            "field": "previous_year_monthly_salary",
                            "value": "insufficient data",
                            "status": "Fail",
                            "commentary": "There is no available data for the previous year (2022) to calculate the monthly salary.",
                            "calculation_commentry": "No W-2, paystubs, or VOE data available for 2022 to derive the monthly salary."
                        },
                        {
                            "field": "second_previous_year_monthly_salary",
                            "value": "insufficient data",
                            "status": "Fail",
                            "commentary": "There is no available data for the second previous year (2021) to calculate the monthly salary.",
                            "calculation_commentry": "No W-2, paystubs, or VOE data available for 2021 to derive the monthly salary."
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
