import uuid
from typing import List, Type

from pydantic import BaseModel
from sqlalchemy.orm import Session

# +++++++++++++++++++++++++
# ++++CREATE_FUNCTIONS+++++
# +++++++++++++++++++++++++


def create_item(*, db: Session, model: Type, schema: BaseModel, use_uuid: bool = True):
    data = schema.model_dump()

    if use_uuid and "id" in model.__table__.columns:
        data["id"] = str(uuid.uuid4())

    obj = model(**data)

    db.add(obj)
    db.commit()
    db.refresh(obj)

    return obj


# +++++++++++++++++++++++++
# +++UPDATES_FUNCTIONS+++++
# +++++++++++++++++++++++++


def update_item(
    *,
    db: Session,
    obj,  # instance existante
    schema: BaseModel  # schema avec les champs à mettre à jour
):
    update_data = schema.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(obj, key, value)

    db.commit()
    db.refresh(obj)
    return obj


def count_items(*, db: Session, model: Type) -> int:
    return db.query(model).count()


def get_all_items(*, db: Session, model: Type) -> List:
    return db.query(model).all()


def get_item_by_id(*, db: Session, model: Type, id: str):
    return db.query(model).filter(model.id == id).first()


def delete_item(*, db: Session, model: Type, id: str):
    obj = db.query(model).filter(model.id == id).first()
    db.delete(obj)
    db.commit()
    return obj
