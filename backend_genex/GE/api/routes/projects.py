# api/routers/projects.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import uuid4
import json
import os
from fastapi import BackgroundTasks
from services.tasks import generate_project_content_background as generate_project_content

from schemas.schemas import ProjectCreate
from core.dependencies import get_db
from auth.auth import get_current_user
from models.models import (
    Project,
    SourceDocument,
    AIGeneration,
    ExerciseSheet,
    Exercise,
    User
)


router = APIRouter()

@router.post("/projects")
def create_project(
    payload: ProjectCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1️⃣ Récupération du document
    document = None
    if payload.document_id:
        document = db.query(SourceDocument).filter_by(
            id=payload.document_id,
            user_id=current_user.id
        ).first()
        if not document:
            raise HTTPException(404, "Document introuvable")

    # ✅ Nettoyage préalable du texte du document
    document_text = ""
    if document and document.extracted_text:
        try:
            # Si c'est des bytes, forcer le décodage
            if isinstance(document.extracted_text, bytes):
                print("⚠️ Document stocké en bytes, conversion en UTF-8...")
                document_text = document.extracted_text.decode('utf-8', errors='replace')
            else:
                document_text = str(document.extracted_text)
            
            print(f"✅ Document chargé : {len(document_text)} caractères")
            
        except Exception as e:
            print(f"❌ Erreur de lecture du document : {e}")
            raise HTTPException(
                status_code=400,
                detail=f"Le document contient des caractères invalides : {str(e)}"
            )

    # 2️⃣ Création projet
    project = Project(                                                          
        id=str(uuid4()),
        user_id=current_user.id,
        document_id=document.id if document else None,
        title=payload.title,
        config=payload.config
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    print(f"✅ Projet créé : {project.id} - {project.title}")
    
    
    # 🚀 Lancement asynchrone
    background_tasks.add_task(
        generate_project_content,
        project.id
    )

    return {
        "project_id": project.id,
        "status": "processing"
    }
    
