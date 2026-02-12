# api/routers/task.py (VERSION FINALE - WeasyPrint)
import json
from uuid import uuid4
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from core.dependencies import get_db
from db.session import SessionLocal
from services.ai_service import generate_exercises
from services.gemini_prompt import build_exercise_generation_prompt
from services.pdf_service_weasyprint import generate_exercise_pdfs, PDFGenerationError  # ✅ NOUVELLE VERSION
from models.models import Project, AIGeneration, ExerciseSheet, Exercise, User
from auth.auth import get_current_user

router = APIRouter()

def generate_project_content_background(project_id: str):
    """Tâche de génération exécutée en background"""
    db: Session = SessionLocal()
    try:
        project = db.query(Project).filter_by(id=project_id).first()
        if not project:
            raise ValueError(f"Projet {project_id} introuvable")

        # 🔒 Récupération et nettoyage du texte du document
        if not project.document:
            raise ValueError("Projet sans document associé")

        document_text = project.document.extracted_text
        if isinstance(document_text, tuple):
            document_text = document_text[0]
        if not isinstance(document_text, str):
            document_text = str(document_text)
        document_text = document_text.replace("\x00", "")

        # 📝 Construction du prompt
        prompt = build_exercise_generation_prompt(document_text, config=project.config)

        # 📦 Config en dict
        config_dict = project.config
        if isinstance(config_dict, str):
            config_dict = json.loads(config_dict)

        # 1️⃣ Appel IA
        try:
            ai_result = generate_exercises(prompt=prompt, config=config_dict)
            status = "SUCCESS"
        except Exception as e:
            ai_result = {"exercises": []}
            status = "FAILED"
            print("❌ Erreur IA :", e)

        # 2️⃣ Stockage génération AI
        generation = AIGeneration(
            id=str(uuid4()),
            project_id=project.id,
            model_name="Gemini/DeepSeek",
            prompt=prompt,
            raw_response=json.dumps(ai_result),  # stockage en JSON
            status=status
        )
        db.add(generation)
        db.commit()

        # 3️⃣ Création feuille d'exercices
        sheet = ExerciseSheet(
            id=str(uuid4()),
            project_id=project.id,
            status="DRAFT",
            pdf_url_questions=None,
            pdf_url_answers=None,
            qr_code_link=None
        )
        db.add(sheet)
        db.commit()  # commit pour générer ID sheet

        # 4️⃣ Sauvegarde des exercices
        display_order = 0
        exercises_for_pdf = []  # 🆕 Liste pour stocker les exercices
        
        for ex in ai_result.get("exercises", []):
            exercise_type = ex.get("exercise_type") or ex.get("type") or "OPEN"
            questions = ex.get("questions")

            if isinstance(questions, list) and questions:
                for q in questions:
                    exercise = Exercise(
                        id=str(uuid4()),
                        sheet_id=sheet.id,
                        exercise_type=exercise_type,
                        question_text=q.get("question", ""),
                        correct_answer=q.get("correct_answer", ""),
                        exercise_metadata={
                            "explanation": q.get("explanation"),
                            "difficulty_level": q.get("difficulty_level"),
                            "choices": q.get("choices"),  # 🆕 Pour MCQ
                            **(q.get("metadata") or {})
                        },
                        source_reference=q.get("source_reference", {}),
                        display_order=display_order
                    )
                    db.add(exercise)
                    exercises_for_pdf.append({
                        "exercise_type": exercise_type,
                        "question_text": q.get("question", ""),
                        "correct_answer": q.get("correct_answer", ""),
                        "exercise_metadata": {
                            "explanation": q.get("explanation"),
                            "difficulty_level": q.get("difficulty_level"),
                            "choices": q.get("choices")
                        }
                    })
                    display_order += 1
            else:
                exercise = Exercise(
                    id=str(uuid4()),
                    sheet_id=sheet.id,
                    exercise_type=exercise_type,
                    question_text=ex.get("question_text", ""),
                    correct_answer=ex.get("correct_answer", ""),
                    exercise_metadata=ex.get("metadata", {}),
                    source_reference=ex.get("source_reference", {}),
                    display_order=display_order
                )
                db.add(exercise)
                exercises_for_pdf.append({
                    "exercise_type": exercise_type,
                    "question_text": ex.get("question_text", ""),
                    "correct_answer": ex.get("correct_answer", ""),
                    "exercise_metadata": ex.get("metadata", {})
                })
                display_order += 1

        db.commit()
        
        # 5️⃣ 🆕 GÉNÉRATION DES PDFs
        if exercises_for_pdf:
            try:
                print(f"📄 Génération des PDFs pour {len(exercises_for_pdf)} exercices...")
                pdf_urls = generate_exercise_pdfs(
                    sheet_id=sheet.id,
                    exercises=exercises_for_pdf,
                    title=project.title or "Feuille d'exercices"
                )
                
                # Mise à jour de la feuille avec les URLs
                sheet.pdf_url_questions = pdf_urls[0]
                sheet.pdf_url_answers = pdf_urls[1]
                sheet.status = "COMPLETED"  # ✅ Statut court
                db.commit()
                
                print(f"✅ PDFs générés:\n  - Questions: {pdf_urls[0]}\n  - Réponses: {pdf_urls[1]}")
                
            except PDFGenerationError as e:
                print(f"❌ Erreur génération PDF: {e}")
                sheet.status = "FAILED"  # ✅ Statut court au lieu de PDF_FAILED
                db.commit()
            except Exception as e:
                print(f"❌ Erreur inattendue PDF: {e}")
                sheet.status = "FAILED"
                db.commit()
        
        print(f"✅ Génération projet {project.id} terminée")

    except Exception as e:
        print("❌ Erreur génération background :", e)
        db.rollback()
    finally:
        db.close()


@router.post("/projects")
def create_project(payload: dict, background_tasks: BackgroundTasks, current_user: User = Depends(get_current_user)):
    """Création projet + génération en background"""
    db: Session = SessionLocal()
    try:
        # 1️⃣ Création projet
        project = Project(
            id=str(uuid4()),
            user_id=current_user.id,
            document_id=payload.get("document_id"),
            title=payload.get("title", "Nouveau projet"),
            config=payload.get("config", {})
        )
        db.add(project)
        db.commit()
        db.refresh(project)
        print(f"✅ Projet créé : {project.id} - {project.title}")

        # 2️⃣ Lancer la génération en background
        background_tasks.add_task(generate_project_content_background, project.id)

        return {"project_id": project.id, "status": "processing"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()


# 🆕 Endpoint pour regénérer les PDFs manuellement
@router.post("/sheets/{sheet_id}/regenerate-pdfs")
def regenerate_pdfs(
    sheet_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Regénère les PDFs pour une feuille existante"""
    
    # Récupérer la feuille
    sheet = db.query(ExerciseSheet).filter_by(id=sheet_id).first()
    if not sheet:
        raise HTTPException(404, "Feuille introuvable")
    
    # Vérifier que l'utilisateur est propriétaire
    if sheet.project.user_id != current_user.id:
        raise HTTPException(403, "Accès refusé")
    
    # Récupérer les exercices
    exercises = db.query(Exercise).filter_by(sheet_id=sheet_id).order_by(Exercise.display_order).all()
    
    if not exercises:
        raise HTTPException(400, "Aucun exercice à générer")
    
    # Convertir en format pour PDF
    exercises_data = [
        {
            "exercise_type": ex.exercise_type,
            "question_text": ex.question_text,
            "correct_answer": ex.correct_answer,
            "exercise_metadata": ex.exercise_metadata
        }
        for ex in exercises
    ]
    
    # Générer les PDFs
    try:
        pdf_urls = generate_exercise_pdfs(
            sheet_id=sheet.id,
            exercises=exercises_data,
            title=sheet.project.title or "Feuille d'exercices"
        )
        
        # Mettre à jour la feuille
        sheet.pdf_url_questions = pdf_urls[0]
        sheet.pdf_url_answers = pdf_urls[1]
        sheet.status = "COMPLETED"
        db.commit()
        
        return {
            "status": "success",
            "pdf_url_questions": pdf_urls[0],
            "pdf_url_answers": pdf_urls[1]
        }
        
    except PDFGenerationError as e:
        raise HTTPException(500, f"Erreur génération PDF: {str(e)}")