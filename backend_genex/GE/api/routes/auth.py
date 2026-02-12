from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session
from uuid import UUID
from core.security import (
    verify_password, 
    create_access_token, 
    decode_access_token,
    blacklist_token
)
from core.dependencies import get_db
from models.models import User

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

class LoginSchema(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: UUID
    email: str
    
    class Config:
        from_attributes = True

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

    token = create_access_token({"sub": str(user.id)})

    return {
        "user": UserResponse.from_orm(user),
        "access_token": token,
        "token_type": "bearer"
    }

@router.post("/auth/logout")
def logout(
    token: str = Depends(oauth2_scheme)
):
    # Blackliste le token
    if blacklist_token(token):
        return {"message": "Déconnexion réussie", "success": True}
    
    return {"message": "Token invalide ou expiré", "success": False}