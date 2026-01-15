from datetime import datetime

from pydantic import BaseModel


class UserBase(BaseModel):
    uid: str
    email: str
    password_hash: str
    date_creation: datetime
    type_utilisateur: str


class config:
    orm_mode = True
