from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from uuid import uuid4
from services import orc_service
from core.dependencies import get_db
from models.models import SourceDocument as Document
import os

router = APIRouter()


@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 1. Sauvegarde fichier
    os.makedirs("storage/docs", exist_ok=True)  
    file_path = f"storage/docs/{uuid4()}_{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # 2. OCR réel
    extracted_text = orc_service.OCRService().extract_text(file_path)

    # 3. Enregistrement DB
    document = Document(
        filename=file.filename,
        storage_url=file_path,
        extracted_text=extracted_text,
        status="OCR_DONE"
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    return {
        "document_id": document.id,
        "text_preview": extracted_text[:500]
    }
