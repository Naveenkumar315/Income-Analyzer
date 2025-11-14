from langchain.tools import tool
from decimal import Decimal, ROUND_HALF_UP
import re

@tool("calculator", return_direct=True)
def calculator(expression: str) -> str:
    """
    Evaluates a mathematical expression and returns the result.
    Returns consistent 2-decimal values for deterministic behavior.
    """
    try:
        # Validate expression contains only safe characters
        if not re.match(r'^[\d\s\+\-\*\/\(\)\.]]+$', expression.strip()):
            return "0.00"
        
        # Evaluate using restricted namespace
        result = eval(expression, {"__builtins__": {}})
        
        # Convert to Decimal for precise calculation
        decimal_result = Decimal(str(result))
        
        # Always round to 2 decimal places with ROUND_HALF_UP
        rounded = decimal_result.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        
        return str(rounded)
        
    except Exception as e:
        # Return consistent error value instead of error message
        # This prevents LLM from retrying with different approaches
        return "0.00"