from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from sqlalchemy.orm import Session
from uuid import uuid4
from auth.auth import get_current_user
from services import ocr_service
from core.dependencies import get_db
from services.gemini_serv import ask_gemini
from models.models import SourceDocument as Document, User
import os

router = APIRouter()


def build_gemini_prompt(raw_text: str) -> str:
    """
    Prompt clair pour forcer Gemini à nettoyer et restructurer le texte OCR
    """
    return f"""
Tu es un moteur d’analyse documentaire.

Objectif :
- Nettoyer un texte issu d’OCR
- Supprimer les doublons
- Supprimer les en-têtes et pieds de page
- Corriger l’ordre logique
- Fusionner les paragraphes répétés
- Ne pas résumer
- Ne pas inventer de contenu

Contraintes :
- Conserver exactement le sens original
- Conserver toutes les informations utiles
- Sortir uniquement le texte nettoyé
- Pas de markdown, pas de titres ajoutés

Texte OCR brut :
\"\"\"
{raw_text}
\"\"\"
"""


@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),  # ✅ typo corrigée
    db: Session = Depends(get_db)
):
    # 1️⃣ Sauvegarde fichier
    os.makedirs("storage/docs", exist_ok=True)
    file_path = f"storage/docs/{uuid4()}_{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # 2️⃣ OCR réel
    raw_text = ocr_service.OCRService().extract_text(file_path)
    
    # Nettoyage via Gemini
    prompt = build_gemini_prompt(raw_text)
    extracted_text = ask_gemini(prompt)
    
    try:
        extracted_text = ask_gemini(prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur IA: {str(e)}")

    if not extracted_text or len(extracted_text.strip()) < 5:
        raise HTTPException(status_code=500, detail="Échec traitement IA du texte OCR")


    # 3️⃣ Enregistrement DB
    document = Document(
        user_id=current_user.id,        # ← associer à l'utilisateur
        filename=file.filename,
        storage_url=file_path,
        extracted_text=extracted_text,
        status="PROCESSED"
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    return {
        "document_id": document.id,
        "text_preview": extracted_text[:20000000000],
        "status": document.status
    }
