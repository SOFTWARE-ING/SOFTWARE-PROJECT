from pydantic import BaseModel


class TeacherCreate(BaseModel):
    user_uid: str
    credits: int = 0
    plan: str = "FREE"
    institution: str | None = None

    class Config:
        from_attributes = True
