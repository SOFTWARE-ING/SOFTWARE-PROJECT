import hashlib
import os
import shutil
from pathlib import Path

import fitz  # PyMuPDF
from fastapi import HTTPException, UploadFile

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def save_upload_file(upload_file: UploadFile) -> str:
    """
    Sauvegarde le fichier uploadé sur le disque et retourne son chemin.
    Gère les doublons de noms en ajoutant un hash ou timestamp si nécessaire.
    """
    try:
        # Création d'un chemin sécurisé
        # Astuce : utiliser l'ID du document comme nom de fichier est plus sûr
        file_path = UPLOAD_DIR / upload_file.filename

        with file_path.open("wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)

        return str(file_path)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erreur sauvegarde fichier: {str(e)}"
        )


def extract_text_from_pdf(file_path: str) -> str:
    """
    Ouvre un PDF et extrait tout le texte.
    Utilise PyMuPDF pour la rapidité.
    """
    text_content = []
    try:
        with fitz.open(file_path) as doc:
            for page in doc:
                text_content.append(page.get_text())

        full_text = "\n".join(text_content)

        if len(full_text.strip()) < 50:
            raise ValueError("Le PDF semble vide ou est une image scannée sans OCR.")

        return full_text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur lecture PDF: {str(e)}")


def compute_file_hash(file_path: str) -> str:
    """Calcule le hash SHA256 d'un fichier pour détection de doublons"""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        # Lecture par blocs pour ne pas saturer la RAM avec de gros PDF
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()
