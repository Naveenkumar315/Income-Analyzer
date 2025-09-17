# app/db.py
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.db_url)
db = client[settings.db_name]
