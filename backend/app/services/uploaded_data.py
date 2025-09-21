from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class UploadedDataOut(BaseModel):
    loanID: str
    file_name: str
    updated_at: Optional[datetime]
    borrower: List[str]   # ✅ Always a list now


async def get_uploaded_data_by_email(db, email: str):
    cursor = db["uploadedData"].find({"email": email})
    results = []

    async for record in cursor:
        # Collect borrower names as list of keys from cleaned_data
        borrowers = []
        if record.get("cleaned_data") and isinstance(record["cleaned_data"], dict):
            borrowers = list(record["cleaned_data"].keys())

        # Parse updated_at correctly
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
                borrower=borrowers,   # ✅ Send as array, not string
            )
        )

    return results
