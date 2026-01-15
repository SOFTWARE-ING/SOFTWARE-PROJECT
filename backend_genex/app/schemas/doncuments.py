from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class DocumentBase(BaseModel):
    nom_fichier: str
    url_stockage: str
    langue_origine: str | None = None
    texte_extrait: Optional[str] = None


class DocumentCreate(DocumentBase):
    pass


class DocumentRead(DocumentBase):
    id: str
    date_upload: datetime

    class Config:
        orm_mode = True
