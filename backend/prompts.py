from typing import List



def rule_verification_prompt(rules, content) -> str:
    """
    Prompt template for mortgage loan rule verification.
    """
    prompt = f"""
    Act as a Senior Mortgage Loan Rule Verifier.

    Given the extracted loan information and rules to evaluate,
    verify whether the rules are satisfied.

    ---
    Rules:
    {rules}
    ---

    Loan details:
    {content}
    ---

    """
    return prompt


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


def ic_fixed_salary(content) -> str:

    prompt = f"""

    You're an senior US Mortgage underwriter. Calculate the base salary from the content given below.

    Given the data of paystub and VOE, use the latest data. 

    content:
        {content}

    ---

    Base income calculation guideliness:
        Base income calculation if the latest data is VOE:
            - If Base Salary  is given return it as (monthly salary × 1).
            - If not rate of pay amount is given return( rate of pay × avg weekly hours × 52 ÷ 12).

        Base income calculation If latest data is paystub:
            Calculate depedns upon the pay frequency:
                - Hourly = hourly rate × 40 × 52 ÷ 12
                - Biweekly = (Total earnings for current period × 26) ÷ 12
                - Weekly = (Total earnings for current period × 52) ÷ 12
                - Annual salary = Total earnings for current period÷ 12
                - Monthly = Total earnings for current period
                - Twice monthly = Total earnings for current period × 2

    fields to be find: Base monthly fixed income.

    ---

    Output guideliness:

    CALCULATION COMMENTARY:(Strictly Use math tool for calculation)
        - Step 1: Identify data sources, and mention the value used from the document with year.
        - Step 2: Apply the chosen income method (state explicitly which one)
        - Step 3: Show math with actual numbers

    PROFESSIONAL COMMENTARY:
        - Mention the raw value used from the document.
        - Mention the document type with the year.
        - Reason for choosing the document and value.

    ---

"""
    return prompt


def ic_var_income(field, content) -> str:
    
    prompt = f"""

You're an senior US Mortgage underwriter. Calculate the base salary from the content given below.

    Given the data VOE latest data. 

    VOE content:
        {content}

    ---

    Guideliness to calculate variable income (Strictly Use `math_tool` for calculation):
        - ≥12 months required (24 preferred for commission)
        - If Stable/increasing → average YTD + prior year(s)
        - If Declining → use lower current figure
    ---

    fields:
    {field}

    ---

    CALCULATION COMMENTARY:(Strictly Use `math_tool` for calculation)
        - Step 1: Identify data sources, and mention the value used from the document with year.
        - Step 2: Apply the chosen income method (state explicitly which one)
        - Step 3: Show math with actual numbers
        - Step 4: Final derived qualifying figure 

    PROFESSIONAL COMMENTARY:
        - Mention the raw value used from the document.
        - Mention the document type with the year.
        - Reason for choosing the document and value.

"""
    
    return prompt
    