import uvicorn
import argparse
from typing import List, Literal
from dotenv import load_dotenv
from decimal import Decimal, ROUND_HALF_UP
import re
import json

from mcp.server.fastmcp import FastMCP
from langchain_openai import AzureChatOpenAI
from langgraph.prebuilt import create_react_agent
from langchain.output_parsers import PydanticOutputParser
from langchain.tools import tool

from pydantic import BaseModel
import os

from agents import Ic_fixed_income

# ======================================
#  Environment Setup
# ======================================
load_dotenv(dotenv_path=".env_1")

# Loading the environment variables
azure_deployement = os.environ['AZURE_OPENAI_DEPLOYMENT']
az_api_version = os.environ['AZURE_API_VERSION']

# Initiating the LLM
llm = AzureChatOpenAI(
    azure_deployment=azure_deployement,
    api_version=az_api_version,
    temperature=0,
    max_retries=2,
    seed=42
)

# MCP Server Init
mcp = FastMCP(
    name="Mortgage Income Calculation & Rule Verifier",
    json_response=True,
)

# Agent (no external tools yet)
mcp.tool()(Ic_fixed_income)


# ✅ NEW: Helper function for value normalization
def normalize_monetary_value(value_str: str) -> str:
    """Normalize monetary values to consistent 2-decimal format."""
    try:
        clean_value = re.sub(r'[,$]', '', str(value_str).strip())
        decimal_value = Decimal(clean_value)
        return str(decimal_value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))
    except:
        return "0.00"


@tool
def math_tool(expression: str) -> str:
    """Safely evaluate a math expression for underwriting calculations."""
    try:
        # ✅ MODIFIED: Added validation
        if not re.match(r'^[\d\s\+\-\*\/\(\)\.]]+$', expression.strip()):
            return "0.00"
        
        result = eval(expression, {"__builtins__": {}})
        
        # ✅ MODIFIED: Use Decimal for precision
        decimal_result = Decimal(str(result))
        rounded = decimal_result.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        return str(rounded)
    except Exception as e:
        return "0.00"  # ✅ MODIFIED: Return "0.00" instead of error message

agent = create_react_agent(llm, tools=[math_tool])

bank_agent = create_react_agent(llm, tools=[math_tool])

# ======================================
#  Models
# ======================================

class ICField(BaseModel):
    field: str
    value: str
    status: Literal['Pass', 'Fail']
    calculation_commentry: str
    commentary: str


class ICFields(BaseModel):
    checks: List[ICField]


class RuleCheckResult(BaseModel):
    rule: str
    status: Literal['Pass', 'Fail', 'Insufficient data']
    commentary: str


class IC_insights(BaseModel):
    insight_commentry: str


class IC_Bank_Field(BaseModel):
    field: str
    calculation_commentry: str
    commentary: str
    value: str


class IC_bank_Fields(BaseModel):
    insight_commentry: List[IC_Bank_Field]


class IC_self_Field(BaseModel):
    """
    Output Structure for the Wage earner income calculation
    """
    borrower_type: str
    status: Literal['Pass', 'Fail']
    Documents_used: List
    calculation_commentry: str
    commentary: str
    formulas_applied: str
    final_math_formula: str


# Parsers
ic_parser = PydanticOutputParser(pydantic_object=ICFields)
rule_parser = PydanticOutputParser(pydantic_object=RuleCheckResult)
insight_parser = PydanticOutputParser(pydantic_object=IC_insights)
bank_parser = PydanticOutputParser(pydantic_object=IC_bank_Fields)
IC_self_parser = PydanticOutputParser(pydantic_object=IC_self_Field)


# ======================================
#  Prompt Templates
# ======================================

@mcp.prompt()
def rule_verification_prompt(rules, content) -> str:
    """
    Prompt template for mortgage loan rule verification.
    """
    prompt = f"""
    Act as a Senior Mortgage Loan Rule Verifier.

    Given the extracted loan information and rules to evaluate,
    verify whether the rules are satisfied.
    
    IMPORTANT: Process data consistently for deterministic results.

    ---
    Rules:
    {rules}
    ---

    Loan details:
    {content}
    ---

    """
    return prompt


@mcp.prompt()
def loan_insights_prompt(content) -> str:

    prompt = f"""

ROLE:
You are a Senior Mortgage Analyst with 15+ years of experience in residential loan underwriting and quality control. Your expertise includes Fannie Mae/Freddie Mac guidelines, fraud detection, document verification, and risk assessment. Analyze the provided loan documentation and deliver a focused, detailed findings report.

---

CRITICAL INSTRUCTION:
Produce a DETAILED REPORT with specific findings from the actual documents provided. Do NOT summarize the process. Do NOT calculate income. Focus on: document authenticity, consistency across documents, compliance with guidelines, employment verification, deposit patterns, and fraud indicators. Report specific findings with exact numbers, dates, names, and observations.

---

ANALYSIS PROTOCOL

PHASE 1: DOCUMENT INVENTORY
List each document with key details:
- W-2s: tax year, employer name, EIN, Box 1 amount, employee name, document quality
- Paystubs: pay date, employer, gross pay, YTD, net pay, deductions, pay frequency, document format
- VOE: date, method, employer, position, hire date, salary, verifier name/title
- Bank statements: institution, period covered, account type, number of statements

PHASE 2: CONSISTENCY CHECK
Compare across all documents:
- Employer name spelling and format
- EIN numbers
- Employee name variations
- Addresses
- Date alignments

PHASE 3: EMPLOYMENT VERIFICATION
- VOE timeliness vs. note date
- VOE completeness per B3-3.2
- Employment history continuity
- Verifier credibility

PHASE 4: DEPOSIT RECONCILIATION
- Identify payroll deposits in bank statements
- Match deposits to paystub net amounts
- Note missing or mismatched deposits
- Flag unusual deposits

PHASE 5: FRAUD DETECTION
Check for:
- Document alteration signs
- Employer verification issues
- Income reasonableness
- Deposit irregularities
- Collusion indicators

PHASE 6: GUIDELINE COMPLIANCE
Verify against Fannie Mae B3-3.1, B3-3.2, B3-4.2

---
Loan Details:

{content}

---


OUTPUT FORMAT

================================================================================
LOAN FILE ANALYSIS REPORT
================================================================================

BORROWER: [Name]
DOCUMENTS ANALYZED: [List]

================================================================================

SECTION 1: VALID INCOME FINDINGS

For each validated income source:

EMPLOYER: [Name]

Documentation Present:
- W-2 2023: Box 1 Wages [amount], EIN [number], authentic appearance
- W-2 2022: Box 1 Wages [amount], EIN [number], authentic appearance
- Paystub [date]: Gross [amount], YTD [amount], Net [amount], professional format
- VOE [date]: Position [title], Hire date [date], Salary [amount], verified by [name/title]

Deposit Verification:
- Bank statements show [frequency] deposits matching paystubs
- Example: [Date] deposit [amount] matches paystub net [amount]
- All expected deposits present: Yes/No

Consistency: Employer name, EIN, employee name consistent across documents: Yes/No

Compliance: Meets B3-3.1, B3-3.2, B3-4.2 requirements: Yes/No with brief explanation

Authenticity: Documents appear genuine with no manipulation indicators: Yes/No

================================================================================

SECTION 2: GUIDELINE EXCEPTIONS OR RISKS

For each issue:

ISSUE: [Clear description]
DOCUMENTS: [Affected documents]
GUIDELINE: [Fannie Mae section]
RISK LEVEL: High/Medium/Low
IMPACT: [Explanation]
ACTION REQUIRED: [Specific steps]

Example:
ISSUE: VOE dated 45 business days before note date, exceeds 10-day requirement
GUIDELINE: B3-3.2
RISK LEVEL: Medium
ACTION REQUIRED: Obtain new verbal VOE within 10 days of closing

================================================================================

SECTION 3: POTENTIAL FRAUD INDICATORS

For each red flag:

CATEGORY: [Document Manipulation/Identity/Income/Employment/Deposits/Collusion]
FINDING: [Specific observation with document reference]
SEVERITY: Critical/Significant/Minor
EVIDENCE: [What was found or missing]
RECOMMENDATION: [Action needed]

Example:
CATEGORY: Deposit Irregularity
FINDING: Paystub dated 11/15/2024 net pay 3,247 dollars - no matching deposit in bank statement within 10 days
SEVERITY: Critical
RECOMMENDATION: Suspend file, require third-party employment verification

================================================================================

SECTION 4: MISCELLANEOUS OBSERVATIONS

- Document quality concerns
- Positive factors (long tenure, stable employer, clean history)
- Minor inconsistencies requiring clarification
- Processing recommendations

================================================================================

SUMMARY ASSESSMENT

OVERALL RISK: Low/Medium/High
RECOMMENDATION: Clear to Close/Conditions Required/Suspended/Declined
KEY ACTIONS: [List 3-5 critical next steps]

================================================================================

"""
    return prompt


@mcp.prompt()
def bank_statemnt_prompt(content) -> str:

    promt = f"""

ROLE:  
You are a Senior Bank Analyst with expertise in Fannie Mae underwriting guidelines. Your task is to analyze the provided bank statement and generate a structured, professional report.

---

OBJECTIVE  
Review the bank statement to assess:
    - Income stability: Verify deposits match verified income sources such as paystubs, W-2s, or employer deposits.  
    - Recurring deposits: Check that monthly deposits are consistent and sufficient.  
    - Withdrawals and spending patterns: Identify unusual or large withdrawals.  
    - NSF/Overdraft occurrences: Identify repeated instances that could indicate financial instability.  
    - Average monthly balance: Highlight months with abnormally low balances.  
    - Fannie Mae compliance: Ensure all account activity aligns with qualifying income requirements.

---

content of the bank statement:
{content}

---

FIELDS TO CALCULATE  
1. Average Monthly Deposit – Calculate the mean of all monthly deposits; verify recurring deposits according to Fannie Mae guidelines.  
2. Average Monthly Withdrawal – Calculate the mean of all monthly withdrawals; flag unusual or irregular transactions.  
3. Average Monthly NSF & Overdraft – Calculate the mean of monthly NSF or overdraft occurrences; highlight repeated issues affecting qualifying income.  
4. Average Monthly Balance – Calculate the average ending monthly balance; flag months with abnormally low balances.

---

OUTPUT STRUCTURE

1. CALCULATION COMMENTARY  
For each metric:  
Step 1: Identify data sources including month, year, and transaction details.  
Step 2: Apply the calculation method (state explicitly, e.g., average of monthly deposits).  
Step 3: Show mathematical computation using actual numbers from the statement.  
Step 4: Present the final derived figure.  
Step 5: Include Fannie Mae guideline check:
  - Are deposits recurring and matching verified income?  
  - Are withdrawals reasonable and not affecting qualifying income?  
  - Are NSF or overdraft occurrences minimal or repeated?  

2. PROFESSIONAL COMMENTARY  
For each transaction, provide:  
Date  
Transaction Description / Entity  
Deposit or Withdrawal Amount  
Transaction Type (Deposit, Withdrawal, NSF/Overdraft, Fee)  
Analyst Remark:
  - Deposit consistency with verified income  
  - Reasonableness of withdrawals  
  - Relevance of NSF/Overdraft to qualifying income  
  - Alignment with Fannie Mae rules for recurring income and account behavior  

---

INSTRUCTIONS  
Maintain a professional analyst tone.  
Use only the values present in the bank statement; do not make assumptions.  
Separate calculation commentary and professional commentary clearly.  
Conclude with a summary assessing:
- Income stability  
- Account health  
- Any Fannie Mae compliance concerns

---
"""
    return promt


@mcp.prompt()
def ic_calculation_prompt(fields, content) -> str:
    """
    Professional prompt template for mortgage income calculation.
    """
    return f"""
You are a senior U.S. mortgage underwriter. Perform qualifying income calculations for each income component using strict underwriting discipline.

Use `math_tool` for ALL calculations.

CRITICAL: Always round to exactly 2 decimal places. Process fields in the order given.

Rules:
- Must Use `math_tool` for all the math related calculation

- Base Income calculation: Use only one applicable method below (prefer VOE to calculate) (calculate using math tool):
  - Hourly = hourly rate × avg weekly hours × 52 ÷ 12
  - Annual salary ÷ 12
  - Monthly = gross monthly amount
  - Twice monthly = Twice monthly amount × 2
  - Biweekly = (Biweekly amount × 26) ÷ 12
  - Weekly = (Weekly amount × 52) ÷ 12
  
- Variable Income calculation (bonus, overtime, commission, other) (prefer VOE to calculate) (calculate using math tool):
  - ≥12 months required (24 preferred for commission)
  - If Stable/increasing → average YTD + prior year(s)
  - If Declining → use lower current figure
  
- Qualifying Income Formula (calculate using math tool):
  Total Monthly Income = Base + Bonus + Overtime + Commission + Other 

AVAILABLE DOCUMENTATION: 
{content} 

---

FIELDS TO CALCULATE:
 {fields}
 ---

FIELD NAME: [Income Component]

CALCULATION COMMENTARY:(Strictly Use math tool for calculation)
    - Step 1: Identify data sources, and mention the value used from the document with year.
    - Step 2: Apply the chosen income method (state explicitly which one)
    - Step 3: Show math with actual numbers
    - Step 4: Final derived qualifying figure (exactly 2 decimals)

PROFESSIONAL COMMENTARY:
    - Mention the raw value used from the document.
    - Mention the document type with the year.
    - Reason for choosing the document and value.

VALUE: $[Derived monthly amount from calculation commentary - must be 2 decimals]

Additional Rules to be followed:
- All calculations must use the math tool.
- VALUE must equal the final figure from Calculation Commentary.
- Always use 2 decimal places for all monetary values.

    """


@mcp.prompt()
def reo_calc_prompt(content: str) -> str:

    REO_Calculation_Prompt = f"""
            You are a financial underwriting assistant specialized in REO (Real Estate Owned) income analysis 
            for mortgage underwriting.

            You will be provided with borrower REO details and documents dynamically in the following variable:
            {content}

            ---
            REO field below:
                1. Rents Received
                2. Total Expenses
                3. Insurance
                4. Mortgage Interest
                5. HOA Dues
                6. Fair Rental Days
                7. PITIA (for subject property) or existing PITIA (for non-subject property)
                8. Qualifying Income

            --- REQUIRED OUTPUT SCHEMA (pure JSON) ---
            
            "field": "<name of the field>",
            "value": "<calculated or extracted value as string>",
            "status": "<Pass or Fail>",
            "calculation_commentry": "<short reasoning or formula used — MUST include SOURCE and TYPE (Updated | Minimum | Average)>",
            "commentary": "<plain English explanation>"
            
            Only output JSON. No extra text, no code fences, no markdown.
            ---

            --- DOCUMENTS / PLACES TO SEARCH (deep search) ---
            When parsing content, search thoroughly (and in this order of preference) for values in:
            • Schedule E / Tax Returns (2023, 2022) — labelled "Schedule E", "Tax Return", "Form 1040 Schedule E"
            • Lease Agreement (signed lease, rent roll, or lease summary)
            • Bank Statements (rents deposited)
            • Mortgage statement or escrow statement (for PITIA / mortgage interest / taxes / insurance)
            • Insurance invoice / certificate (for insurance premium)
            • HOA invoice / ledger (for HOA dues)
            • Any property management statements or spreadsheets
            • Other borrower-supplied documents mentioned in content

            If a field appears in multiple documents, apply the selection rules below and **explicitly record which document** you used.

            --- SELECTION RULES (must be followed exactly) ---
            1. Prefer **Schedule E (Tax Return)** if available — compute:
            • 2023 Average (Schedule E) if 2023 Schedule E present.
            • 2023 + 2022 Average (Schedule E) if both 2023 and 2022 present.
            When Schedule E is used, mark TYPE = "Average" (and indicate which years).
            2. If Schedule E is NOT available, prefer a **Lease Agreement** value (rent stated on lease) — mark TYPE = "Updated" if the lease is current and signed.
            3. If neither Schedule E nor Lease is available, extract **actual deposits from Bank Statement** (sum rents received) — when using bank deposits, mark TYPE = "Updated" if deposits are within the most recent 12 months.
            4. If multiple different numeric values exist across docs:
            • For underwriting conservative approach, compute and present the **Minimum** and **Average** as appropriate, but choose one primary value to return for the requested `field` using this priority: Schedule E Average → Lease (Updated) → Bank (Updated) → Other.
            • In `calculation_commentry` always include: SOURCE = "<document name>", TYPE = "<Updated | Minimum | Average>", and the reason you chose that type.
            5. For PITIA choose the mortgage/escrow statement value for principal+interest+taxes+insurance+HOA. If only mortgage interest is present, compute PITIA only if PITI components are available; otherwise set status="Fail" and explain missing component in `calculation_commentry`.
            6. For Fair Rental Days, prefer the lease, otherwise use occupancy notes on Schedule E or property management statements. If not available, set status="Fail".

            --- FORMULAS (apply exactly) ---
            • Adjusted Rental Income = Rents Received - Total Expenses + Insurance + Mortgage Interest + HOA Dues  
            • Months In Service (Tax Year YYYY) = ROUND(Fair Rental Days / (365/12), 2)  
            • Adjusted Monthly Rental Income (Tax Year YYYY) = IF(Months In Service(YYYY)=0, 0, Adjusted Rental Income / Months In Service(YYYY))  
            • Monthly Qualifying Rental Income (Or Loss) = Adjusted Monthly Rental Income (2023 preferred) - PITIA  
            • If you have both 2023 and 2022 data, compute 2023 average, 2-year average (2023+2022) and record these computations in `calculation_commentry` (with SOURCE and TYPE).

            --- Rounding & Failure rules ---
            • Round all numeric outputs to 2 decimal places. Return numbers as strings.
            • If a required numeric input is missing or inconsistent and prevents computation, set `"status": "Fail"` and in `calculation_commentry` list the missing docs/fields and attempted sources (e.g., "SOURCE: Mortgage Statement missing PITI component; attempted Schedule E — not present").
            • Always include the **exact document name** used (e.g., "Schedule E 2023 - Form 1040 pg 2", "Lease Agreement signed 2024-03-01", "Bank Statement Jan-Dec 2024 - Rent Deposits").

            --- EXAMPLE (must follow pattern) ---
            [
            
                "field": "Rents Received",
                "value": "15000.00",
                "status": "Pass",
                "calculation_commentry": "SOURCE: Schedule E 2023 (Form 1040 Schedule E); TYPE: Average (2023); Computed as Schedule E total rental income for 2023 = 15000.00.",
                "commentary": "Total rents per Schedule E for tax year 2023; used Schedule E average as primary source."
            ,
            
                "field": "PITIA (for subject property) or existing PITIA (for non-subject property)",
                "value": "700.00",
                "status": "Pass",
                "calculation_commentry": "SOURCE: Mortgage Escrow Statement 2024-06; TYPE: Updated; PITIA computed as Principal+Interest+Taxes+Insurance+HOA = 450 + 150 + 60 + 20 + 20 = 700.00.",
                "commentary": "Monthly mortgage and escrow obligations for the subject property from the most recent statement."
            ,
            
                "field": "Qualifying Income",
                "value": "1190.48",
                "status": "Pass",
                "calculation_commentry": "SOURCE: Combined (Schedule E 2023 for Adjusted Monthly Rental Income; Mortgage Escrow Statement 2024-06 for PITIA); TYPE: Average(2023) for income and Updated for PITIA; Adjusted Monthly Rental Income (2023) = 1250.48; Qualifying Income = 1250.48 - 60.00 = 1190.48.",
                "commentary": "Final monthly qualifying rental income (Adjusted monthly income minus PITIA)."
            
            ]

            --- PROCESSING INSTRUCTIONS FOR field requests ---
            When field is one of the 8 listed fields:
            • If field is one of the basic inputs (Rents Received, Total Expenses, Insurance, Mortgage Interest, HOA Dues, Fair Rental Days, PITIA), extract or compute that field following the DOCUMENT SEARCH and SELECTION RULES above and return JSON for that single field.
            • If field == "Qualifying Income", compute all dependent intermediate fields (Adjusted Rental Income, Months In Service (2023), Adjusted Monthly Rental Income (2023), PITIA) using the rules above and return the final qualifying income JSON. In `calculation_commentry` include the chain of computations, each source, and TYPE labels.

            --- Strict: Output only the JSON described above. Nothing else. ---
            """
    
    return REO_Calculation_Prompt


@mcp.prompt()
def self_employment_prompt(content) -> str:

    prompt = f"""

[INPUT SECTION]

Below is the borrower's loan file content. Review it carefully and extract all relevant financial information to determine qualifying income.

<<BORROWER DOCUMENT CONTENT START>>
{content}
<<BORROWER DOCUMENT CONTENT END>>

----------------------------------------------------
ROLE AND OBJECTIVE
----------------------------------------------------
You are an expert mortgage underwriter specializing in self-employed income analysis.  
Your goal is to calculate the borrower's qualifying monthly income using the provided documentation (tax returns, P&L, K-1s, financial statements, etc.).  
You must identify each income source, apply correct formulas, include or exclude add-backs appropriately, and present the final qualifying income clearly.

----------------------------------------------------
INSTRUCTIONS
----------------------------------------------------
1. Identify the borrower's self-employment type (Sole Proprietorship, Partnership, S-Corp, or Corporation).  
2. Extract relevant fields such as:
   - Net Profit / Ordinary Business Income
   - Depreciation, Depletion, Amortization
   - Nonrecurring or One-Time Income
   - W-2 wages (if applicable)
   - Ownership percentage
   - YTD P&L or tax return figures
3. Apply category-specific formulas as defined below.
4. If multiple years are provided, compute a two-year average unless income is declining.
5. Show intermediate steps and the final monthly qualifying income.

----------------------------------------------------
CATEGORY-WISE CALCULATION LOGIC
----------------------------------------------------

>> SOLE PROPRIETORSHIP (Schedule C)
Data Source: IRS Form 1040 Schedule C – Line 31 (Net Profit)

Formula:
Qualifying Income = [(Net Profit + Non-cash Add-backs) − Nonrecurring Income] ÷ 12

Add-backs may include:
- Depreciation (Line 13)
- Depletion (Line 12)
- Business Use of Home (Line 30)
- Amortization or Non-cash Expenses

Two-Year Average:
Avg Income = [(Year 1 Adj Net Income + Year 2 Adj Net Income) ÷ 24]
If most recent year is lower → use lower year only.

----------------------------------------------------

>> PARTNERSHIP / S-CORPORATION (Form 1065 / 1120S)
Data Source: Schedule K-1 (Lines 1, 2, 4), Form 8825 if applicable

Formula:
Qualifying Income = [(Ordinary Business Income + Guaranteed Payments + Depreciation + Depletion + Amortization) − Nonrecurring Items] ÷ 12

If Borrower Owns ≥ 25% of Business:
- Include share of income proportional to ownership %
- Add W-2 wages if borrower is salaried
- Subtract distributions greater than available cash flow

Two-Year Average:
Avg Monthly = (Adj Income Yr1 + Adj Income Yr2) ÷ 24

----------------------------------------------------

>> CORPORATION (Form 1120)
Data Source: Form 1120 – Line 28 (Taxable Income before NOL)

Formula:
Qualifying Income = [(Taxable Income + Officer Compensation + Depreciation + Depletion + Amortization) − Nonrecurring Income] ÷ 12

If Borrower Owns ≥ 25%:
- Add salary paid to borrower (W-2)
- Confirm positive business cash flow (review balance sheet)
- Use two-year average if stable/increasing

Formula Example:
= [(Taxable Income (L28) + Depreciation (L20) + Officer Comp (L12)) ÷ 12]

----------------------------------------------------

>> PARTNERSHIP INCOME FROM K-1 (<25% OWNERSHIP)
Data Source: Schedule K-1

Formula:
Qualifying Income = (K-1 Ordinary Business Income × Ownership %) ÷ 12
No add-backs unless borrower can prove access to funds.

----------------------------------------------------

>> PROFIT & LOSS (P&L) STATEMENT VALIDATION
When P&L and bank statements are available:

Monthly Income = (YTD Net Income + Add-backs) ÷ Number of Months Covered

Add-backs include:
- Depreciation
- Depletion
- Amortization
- Nonrecurring expenses

If trend is consistent → average with prior year tax returns.

----------------------------------------------------

COMMON ADD-BACKS AND ADJUSTMENTS
| Category | Add Back/Subtract | Example |
|-----------|------------------|----------|
| Depreciation | + | Net Income + Depreciation |
| Depletion | + | Net Income + Depletion |
| Amortization | + | Net Income + Amortization |
| Nonrecurring Income | − | Adj Income − One-Time Gain |
| Meals/Entertainment (50% Deductible) | + | Adj Income + (Disallowed Portion) |

----------------------------------------------------

FINAL QUALIFYING INCOME FORMULA
Final Monthly Qualifying Income = [(Adj Net Income Year1 + Adj Net Income Year2) ÷ 24]
If Year 2 < Year 1 → use Year 2 adjusted monthly only.

----------------------------------------------------
OUTPUT FORMAT
----------------------------------------------------

  "borrower_type": "Self-Employed",
  Documents_used: k-1, schedule c
  CALCULATION COMMENTARY:
            - Step 1: VOE 10/21/2017
            - Step 2: The Depreciation for 2019 is 122.00 and for 2018 is 22.00.
            - Step 3: The value over the two years is (122.00 + 22.00) / 24.

    PROFESSIONAL COMMENTARY:
            - Mention the raw value used from the document.
            - Mention the document type with the year.
            - Reason for choosing the document and value.
  "formulas_applied": [
    "(Net Profit + Depreciation + Amortization - Nonrecurring Income) / 12",
    "(Adj Yr1 + Adj Yr2) / 24"
  ],
  "final_math_formula": "(12+34+2-34)/12"

---

final_math_formula should be full mathematical expression

If the content is not enough return status as fail and add comment is commentry and return all the fields as `0`.

"""

    return prompt


# ======================================
#  Tools
# ======================================

@mcp.tool()
async def rule_verification(rules: str, content: str):
    """
    Verify mortgage loan rules against extracted loan details.
    """
    try:
        # ✅ NEW: Sort content for consistency
        try:
            content_dict = json.loads(content) if isinstance(content, str) else content
            sorted_content = json.dumps(content_dict, sort_keys=True, indent=2)
        except:
            sorted_content = content
        
        # ✅ NEW: Normalize rules text
        normalized_rules = rules.strip()
        
        user_prompt = rule_verification_prompt(normalized_rules, sorted_content)
        user_prompt += f"\n\n{rule_parser.get_format_instructions()}"
        user_prompt += "\n\nIMPORTANT: Process all data in the exact order presented. Be deterministic and consistent in your evaluation."

        prompt = {
            "messages": [
                {"role": "user", "content": user_prompt}
            ]
        }

        raw_output = await agent.ainvoke(prompt)
        output = raw_output['messages'][-1].content

        return rule_parser.parse(output).dict()

    except Exception as e:
        # ✅ MODIFIED: Return structured error
        return {"rule": rules, "status": "Fail", "commentary": f"Error: {str(e)}"}


@mcp.tool()
async def income_calculator(fields: List[str], content: str):
    """
    Income calculation tool for mortgage loan files.
    """

    try:
        # ✅ NEW: Sort fields and content for consistency
        sorted_fields = sorted(fields) if isinstance(fields, list) else fields
        
        try:
            content_dict = json.loads(content) if isinstance(content, str) else content
            sorted_content = json.dumps(content_dict, sort_keys=True, indent=2)
        except:
            sorted_content = content
        
        ic_prompt = ic_calculation_prompt(sorted_fields, sorted_content)
        ic_prompt += f"\n\n{ic_parser.get_format_instructions()}"
        ic_prompt += f"\n\nIMPORTANT: Process fields in this exact order: {sorted_fields}. Be deterministic and consistent."
        
        prompt = {
            "messages": [
                {"role": "user", "content": ic_prompt}
            ]
        }

        raw_output = await agent.ainvoke(prompt)
        output = raw_output['messages'][-1].content

        result = ic_parser.parse(output).dict()
        
        # ✅ NEW: Normalize all monetary values
        if 'checks' in result:
            for check in result['checks']:
                if 'value' in check:
                    check['value'] = normalize_monetary_value(check['value'])

        return result

    except Exception as e:
        # ✅ MODIFIED: Return structured error instead of string
        return {"error": f"Calculation failed: {str(e)}", "checks": []}


@mcp.tool()
async def income_insights(content: str):

    try:
        insight_prompt = loan_insights_prompt(content)
        insight_prompt += f"\n\n{insight_parser.get_format_instructions()}"
        prompt = {
            "messages": [
                {"role": "user", "content": insight_prompt}
            ]
        }

        raw_output = await agent.ainvoke(prompt)
        output = raw_output['messages'][-1].content

        return insight_parser.parse(output).dict()

    except Exception as e:
        # ✅ MODIFIED: Return structured error
        return {"insight_commentry": f"Error: {str(e)}"}


@mcp.tool()
async def bank_statement_insights(content: str):

    try:
        insight_prompt = bank_statemnt_prompt(content)
        insight_prompt += f"\n\n{bank_parser.get_format_instructions()}"
        prompt = {
            "messages": [
                {"role": "user", "content": insight_prompt}
            ]
        }

        raw_output = await agent.ainvoke(prompt)
        output = raw_output['messages'][-1].content

        return bank_parser.parse(output).dict()

    except Exception as e:
        # ✅ MODIFIED: Return structured error
        return {"insight_commentry": []}


@mcp.tool()
async def IC_self_income(content):

    try:
        # ✅ NEW: Sort content for consistency
        try:
            content_dict = json.loads(content) if isinstance(content, str) else content
            sorted_content = json.dumps(content_dict, sort_keys=True, indent=2)
        except:
            sorted_content = content
        
        self_emp_prompt = self_employment_prompt(sorted_content)
        self_emp_prompt += f"\n\n{IC_self_parser.get_format_instructions()}"
        self_emp_prompt += "\n\nIMPORTANT: Be deterministic and consistent in your calculations. Always use the same methodology."
        
        prompt = {
            "messages": [
                {"role": "user", "content": self_emp_prompt}
            ]
        }

        raw_output = await agent.ainvoke(prompt)
        output = raw_output['messages'][-1].content

        data = IC_self_parser.parse(output).dict()

        # ✅ MODIFIED: Calculate and normalize value
        if data.get('final_math_formula'):
            calculated_value = math_tool(data['final_math_formula'])
            data['value'] = normalize_monetary_value(calculated_value)
        else:
            data['value'] = "0.00"

        return data

    except Exception as e:
        # ✅ MODIFIED: Return structured error with all required fields
        return {
            "borrower_type": "Self-Employed",
            "status": "Fail",
            "Documents_used": [],
            "calculation_commentry": f"Error: {str(e)}",
            "commentary": "Calculation failed",
            "formulas_applied": "",
            "final_math_formula": "",
            "value": "0.00"
        }


@mcp.tool()
async def reo_calculation(content: str):
    """
    Income calculation tool for mortgage loan files.
    """

    try:
        # ✅ NEW: Sort content for consistency
        try:
            content_dict = json.loads(content) if isinstance(content, str) else content
            sorted_content = json.dumps(content_dict, sort_keys=True)
        except:
            sorted_content = content
        
        reo_prompt = reo_calc_prompt(sorted_content)
        reo_prompt += f"\n\n{ic_parser.get_format_instructions()}"
        prompt = {
            "messages": [
                {"role": "user", "content": reo_prompt}
            ]
        }

        raw_output = await agent.ainvoke(prompt)
        output = raw_output['messages'][-1].content

        result = ic_parser.parse(output).dict()
        
        # ✅ NEW: Normalize all monetary values
        if 'checks' in result:
            for check in result['checks']:
                if 'value' in check:
                    check['value'] = normalize_monetary_value(check['value'])

        return result

    except Exception as e:
        # ✅ MODIFIED: Return structured error instead of string
        return {"error": f"REO calculation failed: {str(e)}", "checks": []}


# ======================================
#  Entrypoint
# ======================================

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Run MCP Mortgage Income & Rule Verifier server")
    parser.add_argument("--host", type=str,
                        default="0.0.0.0", help="Host to bind")
    parser.add_argument("--port", type=int, default=8000,
                        help="Port to listen on")
    args = parser.parse_args()

    uvicorn.run(mcp.streamable_http_app, host=args.host, port=args.port)