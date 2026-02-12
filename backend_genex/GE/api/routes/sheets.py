# api/routers/sheets.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session
from typing import List
import os
from pathlib import Path

from core.dependencies import get_db
from auth.auth import get_current_user
from models.models import ExerciseSheet, User, Project
from schemas.schemas import ExerciseSheetRead
from  controllers import crud_project

router = APIRouter()

# Configuration du dossier de stockage des PDFs
GENERATED_PDFS_DIR = Path("generated_pdfs")
GENERATED_PDFS_DIR.mkdir(exist_ok=True)


# =========================================
# ROUTES EXISTANTES (avec schémas Pydantic)
# =========================================

@router.get("/exercise_sheets_by_project_id/{project_id}", response_model=ExerciseSheetRead)
def get_sheet(
    project_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupère la feuille d'exercices d'un projet
    """
    sheet = crud_project.get_exercise_sheet_by_project(db=db, project_id=project_id)
    
    if not sheet:
        raise HTTPException(status_code=404, detail="Feuille d'exercices introuvable")
    
    # Vérifier que l'utilisateur est propriétaire du projet
    project = db.query(Project).filter(Project.id == project_id).first()
    if project and project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    return sheet


@router.get("/all_exercise_sheets/", response_model=List[ExerciseSheetRead])
def get_all_sheets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupère toutes les feuilles d'exercices de l'utilisateur
    """
    # Récupérer uniquement les feuilles dont l'utilisateur est propriétaire
    sheets = db.query(ExerciseSheet)\
        .join(Project)\
        .filter(Project.user_id == current_user.id)\
        .all()
    
    return sheets


# =========================================
# ROUTES DE TÉLÉCHARGEMENT
# =========================================

@router.get("/sheets/{sheet_id}/info")
def get_sheet_info(
    sheet_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupère les informations détaillées d'une feuille d'exercices
    """
    sheet = db.query(ExerciseSheet).filter(ExerciseSheet.id == sheet_id).first()
    
    if not sheet:
        raise HTTPException(status_code=404, detail="Feuille introuvable")
    
    # Vérifier que l'utilisateur est propriétaire
    if sheet.project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    return {
        "id": sheet.id,
        "project_id": sheet.project_id,
        "status": sheet.status,
        "pdf_url_questions": sheet.pdf_url_questions,
        "pdf_url_answers": sheet.pdf_url_answers,
        "qr_code_link": sheet.qr_code_link,
        "created_at": sheet.created_at,
        "exercises_count": len(sheet.exercises) if sheet.exercises else 0,
        "has_questions_pdf": bool(sheet.pdf_url_questions),
        "has_answers_pdf": bool(sheet.pdf_url_answers)
    }


@router.get("/projects/{project_id}/sheets")
def get_project_sheets(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupère toutes les feuilles d'un projet
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Projet introuvable")
    
    if project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    sheets = db.query(ExerciseSheet).filter(ExerciseSheet.project_id == project_id).all()
    
    return {
        "project_id": project_id,
        "project_title": project.title,
        "sheets_count": len(sheets),
        "sheets": [
            {
                "id": sheet.id,
                "status": sheet.status,
                "pdf_url_questions": sheet.pdf_url_questions,
                "pdf_url_answers": sheet.pdf_url_answers,
                "qr_code_link": sheet.qr_code_link,
                "exercises_count": len(sheet.exercises) if sheet.exercises else 0,
                "created_at": sheet.created_at,
                "has_questions_pdf": bool(sheet.pdf_url_questions),
                "has_answers_pdf": bool(sheet.pdf_url_answers)
            }
            for sheet in sheets
        ]
    }


def _get_pdf_filepath(pdf_url: str) -> Path:
    """
    Extrait le nom de fichier depuis l'URL et retourne le chemin complet
    """
    if not pdf_url:
        return None
    
    # Extraire le nom de fichier depuis l'URL
    # Ex: "http://localhost:8000/generated_pdfs/sheet_123_questions.pdf" -> "sheet_123_questions.pdf"
    filename = pdf_url.split("/")[-1]
    filepath = GENERATED_PDFS_DIR / filename
    
    return filepath if filepath.exists() else None


@router.get("/sheets/{sheet_id}/download-questions")
def download_questions(
    sheet_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Télécharge le PDF des questions depuis generated_pdfs
    """
    sheet = db.query(ExerciseSheet).filter(ExerciseSheet.id == sheet_id).first()
    
    if not sheet:
        raise HTTPException(status_code=404, detail="Feuille introuvable")
    
    if sheet.project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    if not sheet.pdf_url_questions:
        raise HTTPException(status_code=404, detail="PDF des questions non disponible")
    
    # Récupérer le fichier depuis generated_pdfs
    filepath = _get_pdf_filepath(sheet.pdf_url_questions)
    
    if not filepath or not filepath.exists():
        raise HTTPException(status_code=404, detail="Fichier PDF introuvable sur le serveur")
    
    # Retourner le fichier pour téléchargement
    return FileResponse(
        path=str(filepath),
        media_type="application/pdf",
        filename=f"questions_{sheet.project.title}_{sheet_id[:8]}.pdf"
    )


@router.get("/sheets/{sheet_id}/download-answers")
def download_answers(
    sheet_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Télécharge le PDF des réponses depuis generated_pdfs
    """
    sheet = db.query(ExerciseSheet).filter(ExerciseSheet.id == sheet_id).first()
    
    if not sheet:
        raise HTTPException(status_code=404, detail="Feuille introuvable")
    
    if sheet.project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    if not sheet.pdf_url_answers:
        raise HTTPException(status_code=404, detail="PDF des réponses non disponible")
    
    # Récupérer le fichier depuis generated_pdfs
    filepath = _get_pdf_filepath(sheet.pdf_url_answers)
    
    if not filepath or not filepath.exists():
        raise HTTPException(status_code=404, detail="Fichier PDF introuvable sur le serveur")
    
    # Retourner le fichier pour téléchargement
    return FileResponse(
        path=filepath,
        media_type="application/pdf",
        filename=f"reponses_{sheet.project.title}_{sheet_id[:8]}.pdf"
    )


@router.get("/sheets/{sheet_id}/preview-questions")
def preview_questions(
    sheet_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Affiche le PDF des questions dans le navigateur (sans téléchargement forcé)
    """
    sheet = db.query(ExerciseSheet).filter(ExerciseSheet.id == sheet_id).first()
    
    if not sheet:
        raise HTTPException(status_code=404, detail="Feuille introuvable")
    
    if sheet.project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    if not sheet.pdf_url_questions:
        raise HTTPException(status_code=404, detail="PDF des questions non disponible")
    
    filepath = _get_pdf_filepath(sheet.pdf_url_questions)
    
    if not filepath or not filepath.exists():
        raise HTTPException(status_code=404, detail="Fichier PDF introuvable sur le serveur")
    
    # Retourner le fichier pour prévisualisation (inline)
    return FileResponse(
        path=filepath,
        media_type="application/pdf",
        headers={"Content-Disposition": "inline"}
    )


@router.get("/sheets/{sheet_id}/preview-answers")
def preview_answers(
    sheet_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Affiche le PDF des réponses dans le navigateur (sans téléchargement forcé)
    """
    sheet = db.query(ExerciseSheet).filter(ExerciseSheet.id == sheet_id).first()
    
    if not sheet:
        raise HTTPException(status_code=404, detail="Feuille introuvable")
    
    if sheet.project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    if not sheet.pdf_url_answers:
        raise HTTPException(status_code=404, detail="PDF des réponses non disponible")
    
    filepath = _get_pdf_filepath(sheet.pdf_url_answers)
    
    if not filepath or not filepath.exists():
        raise HTTPException(status_code=404, detail="Fichier PDF introuvable sur le serveur")
    
    # Retourner le fichier pour prévisualisation (inline)
    return FileResponse(
        path=filepath,
        media_type="application/pdf",
        headers={"Content-Disposition": "inline"}
    )


# =========================================
# ROUTE POUR VÉRIFIER L'EXISTENCE DES FICHIERS
# =========================================

@router.get("/sheets/{sheet_id}/check-files")
def check_files(
    sheet_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Vérifie si les fichiers PDF existent physiquement sur le serveur
    """
    sheet = db.query(ExerciseSheet).filter(ExerciseSheet.id == sheet_id).first()
    
    if not sheet:
        raise HTTPException(status_code=404, detail="Feuille introuvable")
    
    if sheet.project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    questions_path = _get_pdf_filepath(sheet.pdf_url_questions) if sheet.pdf_url_questions else None
    answers_path = _get_pdf_filepath(sheet.pdf_url_answers) if sheet.pdf_url_answers else None
    
    return {
        "sheet_id": sheet_id,
        "questions": {
            "url": sheet.pdf_url_questions,
            "exists": questions_path is not None and questions_path.exists(),
            "path": str(questions_path) if questions_path else None
        },
        "answers": {
            "url": sheet.pdf_url_answers,
            "exists": answers_path is not None and answers_path.exists(),
            "path": str(answers_path) if answers_path else None
        }
    }


# =========================================
# ROUTE POUR SUPPRIMER UNE FEUILLE
# =========================================

@router.delete("/sheets/{sheet_id}")
def delete_sheet(
    sheet_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Supprime une feuille d'exercices et ses fichiers PDF associés
    """
    sheet = db.query(ExerciseSheet).filter(ExerciseSheet.id == sheet_id).first()
    
    if not sheet:
        raise HTTPException(status_code=404, detail="Feuille introuvable")
    
    if sheet.project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    # Supprimer les fichiers PDF physiques
    deleted_files = []
    
    if sheet.pdf_url_questions:
        questions_path = _get_pdf_filepath(sheet.pdf_url_questions)
        if questions_path and questions_path.exists():
            questions_path.unlink()
            deleted_files.append("questions")
    
    if sheet.pdf_url_answers:
        answers_path = _get_pdf_filepath(sheet.pdf_url_answers)
        if answers_path and answers_path.exists():
            answers_path.unlink()
            deleted_files.append("answers")
    
    # Supprimer la feuille de la base de données
    db.delete(sheet)
    db.commit()
    
    return {
        "message": "Feuille supprimée avec succès",
        "deleted_files": deleted_files,
        "sheet_id": sheet_id
    }