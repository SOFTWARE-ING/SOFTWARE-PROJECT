import uuid
from datetime import datetime, date
from typing import List
from schemas.schemas import DocumentStatus
from sqlalchemy.orm import Session
from sqlalchemy import func
from controllers.all_controller import create_item, update_item, get_all_items, get_item_by_id, delete_item

from models.models import (
    User, Role, Project, SourceDocument, DocumentSection,
    Translation, ExerciseSheet, Exercise, AIGeneration, UsageStatistic
)

# =========================================
# USERS
# =========================================
def get_user_by_id(db: Session, user_id: str) -> User:
    return db.query(User).filter(User.id == user_id).first()


def get_all_users(db: Session) -> List[User]:
    return db.query(User).all()


def create_user(db: Session, user_schema):
    # Génère un ID si nécessaire
    if not hasattr(user_schema, "id") or not user_schema.id:
        user_schema.id = str(uuid.uuid4())
    return create_item(db=db, model=User, schema=user_schema)


def update_user(db: Session, user_id: str, user_schema):
    user = get_user_by_id(db, user_id)
    if not user:
        raise ValueError("User not found")
    return update_item(db=db, obj=user, schema=user_schema)


def delete_user(db: Session, user_id: str):
    user = get_user_by_id(db, user_id)
    if not user:
        raise ValueError("User not found")
    db.delete(user)
    db.commit()
    return True

# =========================================
# ROLES
# =========================================
def get_role_by_id(db: Session, role_id: str) -> Role:
    return db.query(Role).filter(Role.id == role_id).first()


def get_all_roles(db: Session) -> List[Role]:
    return db.query(Role).all()


def create_role(db: Session, role_schema):
    if not hasattr(role_schema, "id") or not role_schema.id:
        role_schema.id = str(uuid.uuid4())
    return create_item(db=db, model=Role, schema=role_schema)


# =========================================
# PROJECTS
# =========================================
def get_projects_by_user(db: Session, user_id: str) -> List[Project]:
    return db.query(Project).filter(Project.user_id == user_id).all()


def create_project(db: Session, project_schema, user_id: str):
    user = get_user_by_id(db, user_id)
    if not user:
        raise ValueError("User not found")

    credits = user.profile.get("credits", 0) if user.profile else 0
    if credits < 1:
        raise ValueError("Insufficient credits")

    try:
        new_project = create_item(db=db, model=Project, schema=project_schema)
        # Décrément des crédits
        user.profile["credits"] = credits - 1
        db.add(user)
        db.commit()
        db.refresh(new_project)
        return new_project
    except Exception as e:
        db.rollback()
        raise e


def delete_project(db: Session, project_id: str):
    project = get_item_by_id(db=db, model=Project, id=project_id)
    if not project:
        raise ValueError("Project not found")
    db.delete(project)
    db.commit()
    return True


# =========================================
# SOURCE DOCUMENTS
# =========================================
def get_document_by_id(db: Session, doc_id: str) -> SourceDocument:
    return get_item_by_id(db=db, model=SourceDocument, id=doc_id)


def get_documents_by_user(db: Session, user_id: str) -> List[SourceDocument]:
    return db.query(SourceDocument).filter(SourceDocument.user_id == user_id).all()


def get_document_by_hash(db: Session, file_hash: str) -> SourceDocument:
    return db.query(SourceDocument).filter(SourceDocument.file_hash == file_hash).first()


def create_document(db: Session, doc_schema):
    if not hasattr(doc_schema, "id") or not doc_schema.id:
        doc_schema.id = str(uuid.uuid4())
    return create_item(db=db, model=SourceDocument, schema=doc_schema)


def delete_document(db: Session, doc_id: str):
    doc = get_document_by_id(db=db, doc_id=doc_id)
    if not doc:
        raise ValueError("Document not found")
    db.delete(doc)
    db.commit()
    return True


# =========================================
# TRANSLATIONS
# =========================================
def get_translations_by_document(db: Session, document_id: str) -> List[Translation]:
    return db.query(Translation).filter(Translation.document_id == document_id).all()


def create_translation(db: Session, translation_schema):
    # Vérifie que le document existe
    doc = get_document_by_id(db=db, doc_id=translation_schema.document_id)
    if not doc:
        raise ValueError("Document not found")
    if not hasattr(translation_schema, "id") or not translation_schema.id:
        translation_schema.id = str(uuid.uuid4())
    return create_item(db=db, model=Translation, schema=translation_schema)


# =========================================
# EXERCISE SHEETS
# =========================================
def get_exercise_sheet_by_project(db: Session, project_id: str) -> ExerciseSheet:
    return db.query(ExerciseSheet).filter(ExerciseSheet.project_id == project_id).first()


def create_exercise_sheet(db: Session, sheet_schema, project_id: str):
    project = get_item_by_id(db=db, model=Project, id=project_id)
    if not project:
        raise ValueError("Project not found")
    if not hasattr(sheet_schema, "id") or not sheet_schema.id:
        sheet_schema.id = str(uuid.uuid4())
    return create_item(db=db, model=ExerciseSheet, schema=sheet_schema)


# =========================================
# EXERCISES
# =========================================
def get_exercises_by_sheet(db: Session, sheet_id: str) -> List[Exercise]:
    return db.query(Exercise).filter(Exercise.sheet_id == sheet_id).all()


def create_exercise(db: Session, exercise_schema, sheet_id: str):
    sheet = get_exercise_sheet_by_project(db=db, project_id=sheet_id)
    if not sheet:
        raise ValueError("Exercise sheet not found")
    if not hasattr(exercise_schema, "id") or not exercise_schema.id:
        exercise_schema.id = str(uuid.uuid4())
    return create_item(db=db, model=Exercise, schema=exercise_schema)


# =========================================
# AI GENERATIONS
# =========================================
def get_ai_generations_by_project(db: Session, project_id: str) -> List[AIGeneration]:
    return db.query(AIGeneration).filter(AIGeneration.project_id == project_id).all()


def create_ai_generation(db: Session, ai_schema):
    if not hasattr(ai_schema, "id") or not ai_schema.id:
        ai_schema.id = str(uuid.uuid4())
    return create_item(db=db, model=AIGeneration, schema=ai_schema)


# =========================================
# USAGE STATISTICS
# =========================================
def get_usage_stats_by_period(
    db: Session, user_id: str, start_date: date, end_date: date
):
    query = (
        db.query(
            UsageStatistic.action,
            func.count(UsageStatistic.id).label("count"),
            func.sum(UsageStatistic.credits_used).label("total_credits")
        )
        .filter(
            UsageStatistic.user_id == user_id,
            UsageStatistic.action_date >= start_date,
            UsageStatistic.action_date <= end_date
        )
        .group_by(UsageStatistic.action)
    )
    return query.all()


def create_usage_stat(db: Session, stat_schema):
    if not hasattr(stat_schema, "id") or not stat_schema.id:
        stat_schema.id = None  # auto increment
    return create_item(db=db, model=UsageStatistic, schema=stat_schema)


def compute_document_status(doc) -> DocumentStatus:
    if doc.extracted_text is None:
        return DocumentStatus.UPLOADED

    if doc.extracted_text and not doc.projects:
        return DocumentStatus.OCR_DONE

    if doc.projects and any(
        p.ai_generations and g.status == "FAILED"
        for p in doc.projects
        for g in p.ai_generations
    ):
        return DocumentStatus.ERROR

    if doc.projects and any(
        p.ai_generations and g.status == "SUCCESS"
        for p in doc.projects
        for g in p.ai_generations
    ):
        return DocumentStatus.PROCESSED

    return DocumentStatus.AI_PROCESSING
