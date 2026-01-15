from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from controllers import all_controller
from core.dependencies import get_db
from models.models import DocumentSource
from schemas.doncuments import DocumentCreate, DocumentRead

router = APIRouter()


# +++++++++++++++++++++++++
# +++++CREATE_ROUTERS++++++
# +++++++++++++++++++++++++


@router.post(
    "/create/", response_model=DocumentRead, status_code=status.HTTP_201_CREATED
)
def create_document(document: DocumentCreate, db: Session = Depends(get_db)):
    return all_controller.create_item(db=db, model=DocumentSource, schema=document)


# +++++++++++++++++++++++++
# +++++UPDATES_ROUTERS+++++
# +++++++++++++++++++++++++


@router.put("/update/{document_id}", response_model=DocumentRead)
def update_document(
    document_id: str, document: DocumentCreate, db: Session = Depends(get_db)
):
    doc = db.query(DocumentSource).filter(DocumentSource.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    return all_controller.update_item(db=db, obj=doc, schema=document)


# +++++++++++++++++++++++++
# ++++GETTERS_ROUTERS++++++
# +++++++++++++++++++++++++


@router.get("/get_all/", response_model=List[DocumentRead])
def list_documents(db: Session = Depends(get_db)):
    return all_controller.get_all_items(db=db, model=DocumentSource)


@router.get("/get_by_id/{document_id}", response_model=DocumentRead)
def get_document(document_id: str, db: Session = Depends(get_db)):
    document = all_controller.get_item_by_id(
        db=db, model=DocumentSource, id=document_id
    )
    if not document:
        raise HTTPException(
            status_code=404, detail="This document do not exist in the database"
        )
    return document


# +++++++++++++++++++++++++
# ++++DELETE_ROUTERS+++++++
# +++++++++++++++++++++++++


@router.delete("/delete/{document_id}")
def delete_document(document_id: str, db: Session = Depends(get_db)):

    doc = all_controller.create_item(db=db, model=DocumentSource, id=document_id)

    if not doc:
        raise HTTPException(status_code=404, detail=" Request failed ")

    db.delete(doc)
    db.commit()
    return {"success": True}
