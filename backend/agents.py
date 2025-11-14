from prompts import rule_verification_prompt, loan_insights_prompt, bank_statemnt_prompt, ic_fixed_salary, ic_var_income
from output_structure import ic_fixed_parser, ic_var_parser, rule_parser, insight_parser, bank_parser
from langchain_openai import AzureChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain


from tools import calculator
from dotenv import load_dotenv
import os

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


async def Ic_fixed_income(content):

    prompt = ChatPromptTemplate.from_messages([
    ("human", '{ic_prompt}\n \n {format_instruction}')
])
    
    chain = prompt | llm | ic_fixed_parser

    result = await chain.ainvoke({
        "ic_prompt": ic_fixed_salary(content),
        "format_instruction": ic_fixed_parser.get_format_instructions()
    })

    json_output = result.model_dump_json(indent=2)

    return json_output





