from fastapi import APIRouter, Depends
from app.models.user import UserCreate, UserLogin, Token
from app.services.auth_service import register_user, login_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
async def register(user: UserCreate):
    return await register_user(user)

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    return await login_user(user)
