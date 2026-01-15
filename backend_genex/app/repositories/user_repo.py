from sqlalchemy.orm import Session

from models.models import User


def get_all_users(db: Session):
    query = db.query(User)
    return query.all()


def get_user_by_id(db: Session, id: str):
    query = db.query(User)
    query = query.filter(User.uid == id).first()
    return query
