from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth

app = FastAPI(title="Income Analyzer API", version="1.0.0")

app.include_router(auth.router)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # which origins are allowed
    allow_credentials=True,
    allow_methods=["*"],              # allow all HTTP methods
    allow_headers=["*"],              # allow all headers
)


@app.get("/")
async def root():
    return {"message": "Welcome to the Income Analyzer API"}

# @app.on_event("startup")
# async def show_routes():
#     print("🔎 Registered routes:")
#     for route in app.routes:
#         print(route.path)

