import uvicorn
import argparse
from typing import List, Literal
from dotenv import load_dotenv

from mcp.server.fastmcp import FastMCP
from langchain_openai import AzureChatOpenAI
from langgraph.prebuilt import create_react_agent
from langchain.output_parsers import PydanticOutputParser

from pydantic import BaseModel


# ======================================
#  Environment Setup
# ======================================
load_dotenv(dotenv_path=".env_1")

llm = AzureChatOpenAI(
    azure_deployment="extraction-model",
    api_version="2024-02-01",
    temperature=0,
    max_retries=2,
)

# MCP Server Init
mcp = FastMCP(
    name="Mortgage Income Calculation & Rule Verifier",
    json_response=True,
    stateless_http=True,
)

# Agent (no external tools yet)
agent = create_react_agent(llm, tools=[])


# ======================================
#  Models
# ======================================

class ICField(BaseModel):
    field: str
    value: str
    status: Literal['Pass', 'Fail']
    commentary: str
    calculation_commentry: str


class ICFields(BaseModel):
    checks: List[ICField]


class RuleCheckResult(BaseModel):
    rule: str
    status: Literal['Pass', 'Fail', 'Insufficient data']
    commentary: str


class IC_insights(BaseModel):
    insight_commentry: str


# Parsers
ic_parser = PydanticOutputParser(pydantic_object=ICFields)
rule_parser = PydanticOutputParser(pydantic_object=RuleCheckResult)
insight_parser = PydanticOutputParser(pydantic_object=IC_insights)


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

You are a Senior Mortgage Analyst. You will be provided with extracted content from a single mortgage loan file.  

Your responsibilities:  
1. Understand and analyze the borrower’s income documentation and related financial details.  
2. Apply Fannie Mae guidelines to evaluate income calculation, eligibility, and documentation compliance.  
3. Identify and report:  
   - Inconsistencies or discrepancies in reported income.  
   - Potential red flags or fraud indicators (e.g., inflated income, mismatched employer details, unverifiable income sources).  
   - Miscalculations or incorrect use of income types (e.g., bonus, commission, overtime, other income).  
   - Any gaps, missing documents, or unusual trends in income stability and continuity.  
4. Provide clear, actionable insights and categorize them as:  
   - Valid Income Findings (aligned with guidelines).  
   - Guideline Exceptions or Risks.  
   - Potential Fraud Indicators.  
   - Miscellaneous Observations (anything noteworthy but not fraudulent).  

Loan Information:
{content}

Deliver your analysis in a structured, professional, and concise format suitable for underwriting review.

"""
    return prompt


@mcp.prompt()
def ic_calculation_prompt(fields, content) -> str:
    """
    Professional prompt template for mortgage income calculation.
    """
    return f"""

You are a senior U.S. mortgage underwriter. Using the most current Fannie Mae Selling Guide B3-3.1, perform qualifying income calculations for each income component provided in the borrower documentation. Apply strict underwriting discipline, trend analysis, mathematical precision, and ensure all commentary and math work transparently reference source materials.
 
CALCULATION METHODOLOGY
1. BASE/MONTHLY INCOME CALCULATION
- Salaried (annual): Annual salary ÷ 12
- Paid monthly: Use gross monthly amount
- Paid twice monthly: One paycheck × 2
- Paid biweekly: (One paycheck × 26) ÷ 12
- Paid weekly: (One paycheck × 52) ÷ 12
- Hourly: Hourly rate × average weekly hours × 52 ÷ 12
 
Verification Rule: Always cross-check YTD paystub and W-2(s). Use LOWER verified figure unless permanent, fully documented raise (with effective date and written VOE) supports higher amount.
 
2. BONUS, OVERTIME, COMMISSION, AND OTHER INCOME (VARIABLE)
- 12-month history minimum (24 months preferred for commission)
- All variable income must be reasonably likely to continue for 3+ years
- Must be supported by YTD paystubs, 2 years W-2s, and written VOE (and tax returns if self-employed)
- If Stable/Increasing: Average YTD and prior year(s)
- If Declining: Use current lower amount
- If Irregular: Use most conservative interpretation
 
3. QUALIFYING INCOME FORMULA
Total Qualifying Monthly Income = Base Monthly Income + Monthly Bonus + Monthly Overtime + Monthly Commission + Monthly Other Income
 
INPUT REQUIREMENTS (DYNAMIC)
AVAILABLE DOCUMENTATION:
{content}
 
FIELDS TO CALCULATE:
{fields}
 
REQUIRED OUTPUT STRUCTURE
For each income component provided, output the following:
 
FIELD NAME: [Income Component]
VALUE: $[Amount] (verified and cross-checked)
 
PROFESSIONAL COMMENTARY:
- Documentation years and specific pages referenced
- Income trend analysis (stable/increasing/declining)
- Continuation probability assessment
- Underwriting concerns or strengths
- Clear statement of Fannie Mae B3-3.1 compliance
 
CALCULATION COMMENTARY:
- Step 1: Data sources identified
- Step 2: Mathematical formula applied
- Step 3: Calculation execution with numbers shown
- Step 4: Cross-verification between all documentation types and periods
- Step 5: Final result and logic for using this figure
 
ADDITIONAL REQUIREMENTS
- Do not summarize or add extra narrative outside the component structure
- Follow conservative principles where ambiguity exists
- Output order must match fields input order
- Every output section must be filled; do not omit commentary
- Do not hallucinate data—use only provided facts
    """


# ======================================
#  Tools
# ======================================

@mcp.tool()
async def rule_verification(rules: str, content: str):
    """
    Verify mortgage loan rules against extracted loan details.
    """
    try:
        user_prompt = rule_verification_prompt(rules, content)
        user_prompt += f"\n\n{rule_parser.get_format_instructions()}"

        prompt = {
            "messages": [
                {"role": "user", "content": user_prompt}
            ]
        }

        raw_output = await agent.ainvoke(prompt)
        output = raw_output['messages'][-1].content
        return rule_parser.parse(output).dict()
    except Exception as e:
        return f'Error: {e}'


@mcp.tool()
async def income_calculator(fields: List[str], content: str):
    """
    Income calculation tool for mortgage loan files.
    """

    try:
        ic_prompt = ic_calculation_prompt(fields, content)
        ic_prompt += f"\n\n{ic_parser.get_format_instructions()}"
        prompt = {
            "messages": [
                {"role": "user", "content": ic_prompt}
            ]
        }

        raw_output = await agent.ainvoke(prompt)
        output = raw_output['messages'][-1].content

        return ic_parser.parse(output).dict()

    except Exception as e:
        return f'Error: {e}'


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
        return f'Error: {e}'


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
