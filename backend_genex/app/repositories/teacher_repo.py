from sqlalchemy.orm import Session

from models.models import Teacher
from schemas.teacher import TeacherCreate


def create_teacher(db: Session, teacher: TeacherCreate):
    db_teacher = Teacher(
        user_uid=teacher.user_uid,
        credits=teacher.credits,
        plan=teacher.plan,
        institution=teacher.institution,
    )
    db.add(db_teacher)
    db.commit()
    db.refresh(db_teacher)
    return db_teacher
