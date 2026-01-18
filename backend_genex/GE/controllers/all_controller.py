import uuid
from typing import List, Type, Any
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.ext.declarative import DeclarativeMeta

# +++++++++++++++++++++++++
# ++++CREATE FUNCTION+++++
# +++++++++++++++++++++++++
def create_item(*, db: Session, model, schema, use_uuid: bool = True):
    data = schema.model_dump(exclude_unset=True)

    if use_uuid and hasattr(model, "id"):
        data["id"] = str(uuid.uuid4())

    obj = model(**data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


# +++++++++++++++++++++++++
# ++++UPDATE FUNCTION+++++
# +++++++++++++++++++++++++
def update_item(*, db: Session, obj: Any, schema: BaseModel):
    """
    Update an existing SQLAlchemy object from a Pydantic schema.
    Only updates fields present in the schema (exclude unset).
    """
    update_data = schema.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(obj, key):
            setattr(obj, key, value)

    db.commit()
    db.refresh(obj)
    return obj


# +++++++++++++++++++++++++
# ++++READ FUNCTIONS+++++
# +++++++++++++++++++++++++
def count_items(*, db: Session, model: Type[DeclarativeMeta]) -> int:
    return db.query(model).count()


def get_all_items(*, db: Session, model: Type[DeclarativeMeta]) -> List[Any]:
    return db.query(model).all()


def get_item_by_id(*, db: Session, model: Type[DeclarativeMeta], id: str) -> Any:
    return db.query(model).filter(model.id == id).first()


# +++++++++++++++++++++++++
# ++++DELETE FUNCTION+++++
# +++++++++++++++++++++++++
def delete_item(*, db: Session, model: Type[DeclarativeMeta], id: str) -> Any:
    obj = db.query(model).filter(model.id == id).first()
    if obj:
        db.delete(obj)
        db.commit()
    return obj
