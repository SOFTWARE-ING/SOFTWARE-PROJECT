from datetime import datetime, timedelta
import os
from jose import jwt, JWTError, ExpiredSignatureError
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from models.models import BlacklistedToken

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ---------------- PASSWORD ----------------

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# ---------------- TOKEN ----------------

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str, db: Session):
    try:
        if is_token_blacklisted(token, db):
            return None

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload

    except (ExpiredSignatureError, JWTError):
        return None


# ---------------- BLACKLIST ----------------

def blacklist_token(token: str, db: Session):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        exp_timestamp = payload.get("exp")

        if not exp_timestamp:
            return False

        expires_at = datetime.utcfromtimestamp(exp_timestamp)

        existing = db.query(BlacklistedToken).filter(
            BlacklistedToken.token == token
        ).first()

        if not existing:
            blacklisted_token = BlacklistedToken(
                token=token,
                expires_at=expires_at
            )
            db.add(blacklisted_token)
            db.commit()

        cleanup_expired_tokens(db)
        return True

    except Exception as e:
        db.rollback()
        print(f"Erreur blacklist token: {e}")
        return False


def is_token_blacklisted(token: str, db: Session):
    blacklisted = db.query(BlacklistedToken).filter(
        BlacklistedToken.token == token
    ).first()

    if blacklisted and blacklisted.expires_at < datetime.utcnow():
        db.delete(blacklisted)
        db.commit()
        return False

    return blacklisted is not None


def cleanup_expired_tokens(db: Session):
    db.query(BlacklistedToken).filter(
        BlacklistedToken.expires_at < datetime.utcnow()
    ).delete()
    db.commit()
