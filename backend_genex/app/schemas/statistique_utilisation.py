from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class StatistiqueUtilisationBase(BaseModel):
    user_uid: str
    action: Literal["GENERATION_EXERCICE", "TRADUCTION_PDF", "EXPORT_PDF"]
    consommation_credits: int = 1


class StatistiqueUtilisationCreate(StatistiqueUtilisationBase):
    """
    Utilisé quand on crée une statistique d'utilisation.(Log d'usage)
    """

    pass


class StatistiqueUtilisationRead(StatistiqueUtilisationBase):
    """
    Utilisé lorsque l'api retourne une statistique d'utilisation au frontend.
    """

    id: int
    derniere_activite: datetime

    class Config:
        orm_mode = True
