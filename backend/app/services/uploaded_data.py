from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.uploaded_data import UploadedDataOut
from datetime import datetime

# async def get_uploaded_data_by_email(db, email: str):
#     cursor = db["uploadedData"].find({"email": email})
#     results = []
#     async for record in cursor:
#         borrower = None
#         if record.get("cleaned_data") and isinstance(record["cleaned_data"], dict):
#             borrower = next(iter(record["cleaned_data"].keys()), None)

#         # Fix updated_at parsing
#         updated_at = record.get("updated_at")
#         if isinstance(updated_at, str):
#             try:
#                 updated_at = datetime.strptime(updated_at, "%Y-%m-%d %I:%M:%S %p")
#             except Exception:
#                 updated_at = None

#         results.append(
#             UploadedDataOut(
#                 loanID=record.get("loanID"),
#                 file_name=record.get("file_name"),
#                 updated_at=updated_at,
#                 borrower=borrower,
#             )
#         )
#     return results

async def get_uploaded_data_by_email(db, email: str):
    cursor = db["uploadedData"].find({"email": email})
    results = []
    async for record in cursor:
        borrowers = []
        if record.get("cleaned_data") and isinstance(record["cleaned_data"], dict):
            borrowers = list(record["cleaned_data"].keys())

        updated_at = record.get("updated_at")
        if isinstance(updated_at, str):
            try:
                updated_at = datetime.strptime(updated_at, "%Y-%m-%d %I:%M:%S %p")
            except Exception:
                updated_at = None

        results.append(
            UploadedDataOut(
                loanID=record.get("loanID"),
                file_name=record.get("file_name"),
                updated_at=updated_at,
                borrower=borrowers,   # 🔹 now a list
            )
        )
    return results

