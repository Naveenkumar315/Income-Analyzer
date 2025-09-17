from fastapi import FastAPI
from app.routes import auth

app = FastAPI(title="Income Analyzer API", version="1.0.0")

app.include_router(auth.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Income Analyzer API"}
