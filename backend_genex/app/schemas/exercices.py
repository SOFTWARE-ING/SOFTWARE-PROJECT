from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel


class ExcerciceRead(BaseModel):
    feuille_id: str
    type_exercice: str
    enonce: str
    reponse_correcte: Optional[str] = None
    metadata_exo: Optional[Dict[str, Any]] = None
    ordre_affichage: int

    class Config:
        orm_mode = True
