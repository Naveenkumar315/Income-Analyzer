from langchain.tools import tool

@tool("calculator", return_direct=True)
def calculator(expression: str) -> str:
    """Evaluates a mathematical expression and returns the result."""
    try:
        result = eval(expression, {"__builtins__": {}}) 
        return str(result)
    except Exception as e:
        return f"Error: {e}"
