# main.py
from fastapi import FastAPI
from app.routes import user  # example route file

app = FastAPI()

# include routes
app.include_router(user.router)


@app.get("/")
def read_root():
    return {"Hello": "World"}

