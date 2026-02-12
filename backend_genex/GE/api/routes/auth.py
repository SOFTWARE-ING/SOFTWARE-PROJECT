from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import BaseModel

from core.security import (
    verify_password,
    create_access_token,
    blacklist_token
)
from core.dependencies import get_db
from core.oauth2 import oauth2_scheme
from models.models import User


router = APIRouter()


class LoginSchema(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: UUID
    email: str

    class Config:
        from_attributes = True


# ---------------- LOGIN ----------------

@router.post("/auth/login")
def login(login_data: LoginSchema, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == login_data.email).first()

    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants invalides"
        )

    token = create_access_token({"sub": str(user.id)})

    return {
        "user": UserResponse.model_validate(user),
        "access_token": token,
        "token_type": "bearer"
    }


# ---------------- LOGOUT ----------------

@router.post("/auth/logout")
def logout(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    if blacklist_token(token, db):
        return {
            "message": "Déconnexion réussie",
            "success": True
        }

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Token invalide ou expiré"
    )
