from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.uploaded_data import UploadedDataOut


async def get_uploaded_data_by_email(db: AsyncIOMotorDatabase, email: str):
    record = await db["uploadedData"].find_one({"email": email})
    if not record:
        return None

    # Extract first key from cleaned_data
    borrower = None
    if record.get("cleaned_data") and isinstance(record["cleaned_data"], dict):
        borrower = next(iter(record["cleaned_data"].keys()), None)

    return UploadedDataOut(
        loanID=record.get("loanID"),
        file_name=record.get("file_name"),
        updated_at=record.get("updated_at"),
        borrower=borrower
    )
