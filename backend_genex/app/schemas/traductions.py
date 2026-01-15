from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel


class TraductionBase(BaseModel):
    document_id: str
    langue_cible: str
    url_pdf_traduit: Optional[str] = None


class TraductionCreate(TraductionBase):
    """
    Utilisé pour créer une traduction.
    """

    pass


class TraductionRead(TraductionBase):
    """
    Utilisé pour créer une traduction.
    """

    id: str
    date_traduction: datetime

    class Config:
        orm_mode = True
