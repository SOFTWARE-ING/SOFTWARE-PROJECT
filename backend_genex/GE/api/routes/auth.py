# api/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
# from fastapi.security import OAuth2PasswordRequestForm

from core.security import verify_password, create_access_token
from core.dependencies import get_db
from models.models import  User

router = APIRouter()

class LoginSchema(BaseModel):
    email: str
    password: str
    

@router.post("/auth/login")
def login(
    login_data: LoginSchema,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == login_data.email).first()

    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants invalides"
        )

    token = create_access_token({"sub": user.id})

    return {
        "access_token": token,
        "token_type": "bearer"
    }
