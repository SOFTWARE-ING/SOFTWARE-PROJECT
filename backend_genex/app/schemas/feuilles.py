from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class FeuilleRead(BaseModel):
    id: str
    projet_id: str
    url_pdf_sujet: Optional[str] = None
    url_pdf_correction: Optional[str] = None
    qr_code_link: Optional[str] = None
    status: str
    date_generation: datetime

    class Config:
        orm_mode = True
