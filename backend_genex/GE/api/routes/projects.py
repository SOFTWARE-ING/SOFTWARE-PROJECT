from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import uuid4
import json
import os

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
from services.exercise_generator import generate_exercises_with_gemini
from services.pdf import generate_all_pdfs

router = APIRouter()

@router.post("/projects")
def create_project(
    payload: ProjectCreate,
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

    # 2️⃣ Création projet
    project = Project(
        id=str(uuid4()),
        user_id=current_user.id,
        document_id=document.id if document else None,
        title=payload.title,
        config=payload.config  # payload.config est déjà un dict
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    # 3️⃣ Génération IA
    try:
        ai_result = generate_exercises_with_gemini(
            document_text=document.extracted_text if document else "",
            config=payload.config
        )
        # Crée le dossier s’il n’existe pas
        
        output_dir = "generated_pdfs"
        os.makedirs(output_dir, exist_ok=True)

        exo_path = os.path.join(output_dir, "exo.pdf")
        correct_path = os.path.join(output_dir, "correct.pdf")

        # Génération des PDFs
        pdf_paths = generate_all_pdfs(ai_result)
        exo_path = pdf_paths["exo_pdf"]
        correct_path = pdf_paths["correct_pdf"]

    except ValueError as e:
        raise HTTPException(500, f"Erreur lors de la génération d'exercices : {e}")

    # 4️⃣ Log IA
    ai_gen = AIGeneration(
        id=str(uuid4()),
        project_id=project.id,
        model_name="gemini-3-flash-preview",
        prompt="AUTO",
        raw_response=json.dumps(ai_result, ensure_ascii=False),
        status="SUCCESS"
    )
    db.add(ai_gen)

    # 5️⃣ Création sheet
    sheet = ExerciseSheet(
        id=str(uuid4()),
        project_id=project.id,
        status="GENERATED"
    )
    db.add(sheet)
    db.commit()

    # 6️⃣ Insertion exercices
    order_index = 1
    exercises = ai_result.get("exercises", [])
    if not isinstance(exercises, list):
        raise HTTPException(500, "Format d'exercices inattendu de Gemini")

    for block in exercises:
        questions = block.get("questions", [])
        if not isinstance(questions, list):
            continue

        for q in questions:
            ex = Exercise(
                id=str(uuid4()),
                sheet_id=sheet.id,
                exercise_type=block.get("exercise_type", "unknown"),
                question_text=q.get("question", ""),
                correct_answer=q.get("correct_answer"),
                exercise_metadata={
                    "choices": q.get("choices"),
                    "explanation": q.get("explanation")
                },
                display_order=order_index
            )
            order_index += 1
            db.add(ex)

    db.commit()

    return {
        "project_id": project.id,
        "sheet_id": sheet.id,
        "status": "GENERATED",
        "exercises_count": order_index - 1
    }
