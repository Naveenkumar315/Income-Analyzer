from fastapi import APIRouter, Depends, HTTPException
from app.models.uploaded_data import EmailRequest, UploadedDataOut
from app.services.uploaded_data import get_uploaded_data_by_email
from app.db import get_db

router = APIRouter(prefix="/uploaded-data", tags=["Uploaded Data"])


@router.post("/by-email", response_model=UploadedDataOut)
async def fetch_uploaded_data(request: EmailRequest, db=Depends(get_db)):
    result = await get_uploaded_data_by_email(db, request.email)
    if not result:
        raise HTTPException(status_code=404, detail="No record found for this email")
    return result
