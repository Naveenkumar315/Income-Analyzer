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

    
 Act as a Senior US Mortgage Income Calculator and Financial Analyst.

OBJECTIVE:
Calculate all requested **borrower income fields** from available wage-related documentation (W-2, Paystubs, VOE), including base wages, overtime, bonus, commission, other recurring compensation, and total gross monthly or annual income as required. Analyze all available data points to derive accurate calculations, even when direct figures are not explicitly provided. Strictly follow **Fannie Mae guidelines**.

ANALYSIS REQUIREMENTS:
- Extract and calculate each requested field using **any available data** in the documentation.
- When direct values aren't present, derive them from related information (e.g., calculate hourly rate from total earnings and hours, annualize YTD figures, etc.).
- Cross-reference multiple documents to validate and complete calculations.
- Apply appropriate **pay frequency conversions and annualization methods**.
- **Include all variable income** (overtime, bonus, commission, tips, incentive pay, and other recurring compensation) in the calculations.
- Consider **income stability, trends, and likelihood of continuance**.

PROFESSIONAL STANDARDS:
- Follow Fannie Mae mortgage income calculation guidelines.
- Always return **pre-tax, pre-deduction income values** for all requested fields.
- **Document calculation methodology** and any assumptions made.
- Provide **detailed calculation commentary**:
    - Show **step-by-step mathematical calculations**.
    - Indicate **which document and year** the data was extracted from.
- Flag **income stability concerns or data limitations**.
- Provide **professional commentary** summarizing trends, stability, and any limitations, without restricting length.

DATA HANDLING:
- Use **all available information** to complete requested calculations.
- If data is insufficient for accurate calculation, return `"insufficient data"` with a specific explanation.
- Show your **analytical thinking process** for derived calculations.

AVAILABLE DOCUMENTATION:
{content}

FIELDS TO CALCULATE:
{fields}

OUTPUT REQUIREMENTS:
- Field Name: Calculated Value
- Calculation Commentary: Step-by-step calculation with formulas, data sources, and assumptions
- Professional Commentary: Detailed explanation on income trends, stability, and documentation
- Ensure all components are included: Base wages, overtime, bonus, commission, other recurring income, and total where applicable
- Convert all annual, YTD, or frequency-specific amounts to consistent monthly or annual values per Fannie Mae standards

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
