from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date, datetime

from core.dependencies import get_db
from controllers import crud_project
from models.models import User
from schemas.schemas import (
    ExerciseSheetBase, UserCreate, UserRead,
    RoleCreate, RoleRead,
    SourceDocumentCreate, SourceDocumentRead,
    TranslationCreate, TranslationRead,
    ProjectCreate, ProjectRead,
    ExerciseSheetCreate, ExerciseSheetRead,
    ExerciseCreate, ExerciseRead,
    AIGenerationCreate, AIGenerationRead,
    UsageStatisticCreate, UsageStatisticRead, UsageStatisticAggregate,
    GeminiRequest
)
from services.gemini_serv import ask_gemini

router = APIRouter()


# =========================================
# USERS
# =========================================
@router.post("/add_users/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    return crud_project.create_user(db=db, user_schema=user)


@router.get("/get_users/", response_model=List[UserRead])
def list_users(db: Session = Depends(get_db)):
    return crud_project.get_all_users(db=db)


@router.get("/getuser_by_id/{user_id}", response_model=UserRead)
def get_user(user_id: str, db: Session = Depends(get_db)):
    u = crud_project.get_user_by_id(db=db, user_id=user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return u


@router.put("/update_users/{user_id}", response_model=UserRead)
def update_user(user_id: str, user: UserCreate, db: Session = Depends(get_db)):
    return crud_project.update_user(db=db, user_id=user_id, user_schema=user)


@router.delete("/delete_users/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db)):
    crud_project.delete_user(db=db, user_id=user_id)
    return {"success": True}


# =========================================
# ROLES
# =========================================
@router.post("/add_roles/", response_model=RoleRead, status_code=status.HTTP_201_CREATED)
def create_role(role: RoleCreate, db: Session = Depends(get_db)):
    return crud_project.create_role(db=db, role_schema=role)


@router.get("/get_roles/", response_model=List[RoleRead])
def list_roles(db: Session = Depends(get_db)):
    return crud_project.get_all_roles(db=db)


# =========================================
# SOURCE DOCUMENTS
# =========================================
@router.post("/add_documents/", response_model=SourceDocumentRead, status_code=status.HTTP_201_CREATED)
def create_document(document: SourceDocumentCreate, db: Session = Depends(get_db)):
    return crud_project.create_document(db=db, doc_schema=document)


@router.get("/get_documents/", response_model=List[SourceDocumentRead])
def list_documents(db: Session = Depends(get_db)):
    return crud_project.get_documents_by_user(db=db, user_id=None)  # optionnel : filtrer par user_id


@router.get("/get_documents_by_id/{document_id}", response_model=SourceDocumentRead)
def get_document(document_id: str, db: Session = Depends(get_db)):
    doc = crud_project.get_document_by_id(db=db, doc_id=document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.put("/update_documents/{document_id}", response_model=SourceDocumentRead)
def update_document(document_id: str, document: SourceDocumentCreate, db: Session = Depends(get_db)):
    return crud_project.update_item(db=db, obj_id=document_id, model_name="document", schema=document)


@router.delete("/delete_documents/{document_id}")
def delete_document(document_id: str, db: Session = Depends(get_db)):
    crud_project.delete_document(db=db, doc_id=document_id)
    return {"success": True}


# =========================================
# TRANSLATIONS
# =========================================
@router.post("/add_translations/", response_model=TranslationRead, status_code=status.HTTP_201_CREATED)
def create_translation(translation: TranslationCreate, db: Session = Depends(get_db)):
    return crud_project.create_translation(db=db, translation_schema=translation)


@router.get("/get_translations_by_document_id/{document_id}", response_model=List[TranslationRead])
def get_translations(document_id: str, db: Session = Depends(get_db)):
    return crud_project.get_translations_by_document(db=db, document_id=document_id)


# =========================================
# PROJECTS
# =========================================
# @router.post("/add_projects/", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
# def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
#     return crud_project.create_project(db=db, project_schema=project, user_id=project.user_id)


# @router.get("/get_projects/", response_model=List[ProjectRead])
# def list_projects(db: Session = Depends(get_db)):
#     return crud_project.get_projects_by_user(db=db, user_id=None)  # optionnel : filtrer par user_id


# @router.get("/get_projects_by_id/{project_id}", response_model=ProjectRead)
# def get_project(project_id: str, db: Session = Depends(get_db)):
#     project = crud_project.get_item_by_id(db=db, model_name="project", id=project_id)
#     if not project:
#         raise HTTPException(status_code=404, detail="Project not found")
#     return project


@router.delete("/delete_projects/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db)):
    crud_project.delete_project(db=db, project_id=project_id)
    return {"success": True}


# =========================================
# EXERCISE SHEETS
# =========================================
@router.post("/add_exercise_sheets", response_model=ExerciseSheetRead)
def create_sheet(sheet: ExerciseSheetCreate, db: Session = Depends(get_db)):
    return crud_project.create_exercise_sheet(db=db, sheet_schema=sheet, project_id=sheet.project_id)


@router.get("/exercise_sheets_by_project_id/{project_id}", response_model=ExerciseSheetBase)
def get_sheet(project_id: str, db: Session = Depends(get_db)):
    sheet = crud_project.get_exercise_sheet_by_project(db=db, project_id=project_id)
    if not sheet:
        raise HTTPException(status_code=404, detail="Exercise sheet not found for this project")
    return sheet

@router.get("/all_exercise_sheets/", response_model=List[ExerciseSheetRead])
def get_all_sheets(db: Session = Depends(get_db)):
    return crud_project.get_all_exercise_sheets(db=db)


# =========================================
# EXERCISES
# =========================================
@router.post("/add_exercises", response_model=ExerciseRead)
def create_exercise(exercise: ExerciseCreate, db: Session = Depends(get_db)):
    return crud_project.create_exercise(db=db, exercise_schema=exercise, sheet_id=exercise.sheet_id)


@router.get("/get_exercises_by_sheet_id/{sheet_id}", response_model=List[ExerciseRead])
def list_exercises(sheet_id: str, db: Session = Depends(get_db)):
    return crud_project.get_exercises_by_sheet(db=db, sheet_id=sheet_id)


# =========================================
# AI GENERATIONS
# =========================================
@router.post("/add_ai_generations", response_model=AIGenerationRead)
def create_ai_gen(ai_gen: AIGenerationCreate, db: Session = Depends(get_db)):
    return crud_project.create_ai_generation(db=db, ai_schema=ai_gen)


@router.get("/get_ai_generations_by_project_id/{project_id}", response_model=List[AIGenerationRead])
def list_ai_gen(project_id: str, db: Session = Depends(get_db)):
    return crud_project.get_ai_generations_by_project(db=db, project_id=project_id)


# =========================================
# USAGE STATISTICS
# =========================================
@router.post("/add_usage_stats/", response_model=UsageStatisticRead)
def create_usage_stat(stat: UsageStatisticCreate, db: Session = Depends(get_db)):
    return crud_project.create_usage_stat(db=db, stat_schema=stat)


@router.get("/get_usage_stats_by_user_id/{user_id}", response_model=List[UsageStatisticAggregate])
def list_usage_stats(user_id: str, start_date: str = None, end_date: str = None, db: Session = Depends(get_db)):
    # Convert strings to date
    s = datetime.strptime(start_date, "%Y-%m-%d").date() if start_date else date.min
    e = datetime.strptime(end_date, "%Y-%m-%d").date() if end_date else date.today()
    return crud_project.get_usage_stats_by_period(db=db, user_id=user_id, start_date=s, end_date=e)


# =========================================
# IA INTEGRATION
# =========================================
@router.post("/ask")
def ask_ai(data: GeminiRequest):
    return {"response": ask_gemini(data.prompt)}
