from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel


class ProjectBase(BaseModel):
    titre: str
    enseignant_uid: Optional[str] = None
    document_id: Optional[str] = None
    config: Dict[str, Any] = {}


class ProjectCreate(ProjectBase):
    pass


class ProjectRead(ProjectBase):
    id: str
    date_creation: datetime

    class Config:
        orm_mode = True
