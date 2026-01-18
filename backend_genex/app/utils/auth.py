from datetime import datetime, date, timedelta
from typing import Annotated
from fastapi import Depends, HTTPException, APIRouter #surligne en jaune
from sqlalchemy.orm import Session #surligne en jaune
from starlette import status #surligne en jaune
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm  #surligne en jaune
from jose import JWTError, jwt