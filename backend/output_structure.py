from pydantic import BaseModel
from typing import Literal, List
from langchain.output_parsers import PydanticOutputParser


class IC_var_Field(BaseModel):
    field: str
    value: str
    status: Literal['Pass', 'Fail']
    calculation_commentry: str
    commentary: str

class IC_fix_Field(BaseModel):
    field: str
    final_math_formula: str
    status: Literal['Pass', 'Fail']
    calculation_commentry: str
    commentary: str


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


# Parsers

ic_var_parser = PydanticOutputParser(pydantic_object=IC_var_Field)
ic_fixed_parser = PydanticOutputParser(pydantic_object=IC_fix_Field)
rule_parser = PydanticOutputParser(pydantic_object=RuleCheckResult)
insight_parser = PydanticOutputParser(pydantic_object=IC_insights)
bank_parser = PydanticOutputParser(pydantic_object=IC_bank_Fields)

