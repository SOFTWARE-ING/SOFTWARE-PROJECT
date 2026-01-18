from datetime import datetime
import uuid
from sqlalchemy import (
    JSON, TIMESTAMP, BigInteger, Column, Enum, ForeignKey,
    Integer, String, Text
)
from sqlalchemy.orm import relationship
from db.base import Base

# ==========================
# ROLES
# ==========================
class Role(Base):
    __tablename__ = "roles"

    id = Column(String(36), primary_key=True)
    role_name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255))

    users = relationship("User", back_populates="role")


# ==========================
# USERS
# ==========================
class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True)
    email = Column(String(191), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role_id = Column(String(36), ForeignKey("roles.id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    profile = Column(JSON)

    role = relationship("Role", back_populates="users")
    source_documents = relationship(
        "SourceDocument", back_populates="owner", cascade="all, delete-orphan"
    )
    projects = relationship(
        "Project", back_populates="owner", cascade="all, delete-orphan"
    )
    usage_statistics = relationship(
        "UsageStatistic", back_populates="user", cascade="all, delete-orphan"
    )


# ==========================
# SOURCE DOCUMENTS
# ==========================
class SourceDocument(Base):
    __tablename__ = "source_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_type = Column(Enum("PDF", "DOCX", "TXT", name="file_type_enum"), nullable=False)
    storage_url = Column(String(500), nullable=False)
    extracted_text = Column(Text)
    original_language = Column(String(10), default="en")
    uploaded_at = Column(TIMESTAMP, default=datetime.utcnow)
    status = Column(String, default="PENDING")  # ou nullable=False


    owner = relationship("User", back_populates="source_documents")
    sections = relationship(
        "DocumentSection", back_populates="document", cascade="all, delete-orphan"
    )
    translations = relationship(
        "Translation", back_populates="document", cascade="all, delete-orphan"
    )
    projects = relationship("Project", back_populates="document")


# ==========================
# DOCUMENT SECTIONS
# ==========================
class DocumentSection(Base):
    __tablename__ = "document_sections"

    id = Column(String(36), primary_key=True)
    document_id = Column(String(36), ForeignKey("source_documents.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255))
    page_start = Column(Integer)
    page_end = Column(Integer)
    text = Column(Text)

    document = relationship("SourceDocument", back_populates="sections")


# ==========================
# TRANSLATIONS
# ==========================
class Translation(Base):
    __tablename__ = "translations"

    id = Column(String(36), primary_key=True)
    document_id = Column(String(36), ForeignKey("source_documents.id", ondelete="CASCADE"), nullable=False)
    target_language = Column(String(10), nullable=False)
    translated_pdf_url = Column(String(500), nullable=False)
    translated_at = Column(TIMESTAMP, default=datetime.utcnow)

    document = relationship("SourceDocument", back_populates="translations")


# ==========================
# PROJECTS
# ==========================
class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(String(36), ForeignKey("source_documents.id", ondelete="SET NULL"))
    title = Column(String(255), nullable=False)
    config = Column(JSON, nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    owner = relationship("User", back_populates="projects")
    document = relationship("SourceDocument", back_populates="projects")
    ai_generations = relationship(
        "AIGeneration", back_populates="project", cascade="all, delete-orphan"
    )
    exercise_sheet = relationship(
        "ExerciseSheet", back_populates="project", uselist=False, cascade="all, delete-orphan"
    )


# ==========================
# AI GENERATIONS
# ==========================
class AIGeneration(Base):
    __tablename__ = "ai_generations"

    id = Column(String(36), primary_key=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    model_name = Column(String(50), nullable=False)
    prompt = Column(Text, nullable=False)
    raw_response = Column(Text)
    tokens_used = Column(Integer, default=0)
    status = Column(Enum("SUCCESS", "FAILED", name="generation_status_enum"), default="SUCCESS")
    generated_at = Column(TIMESTAMP, default=datetime.utcnow)

    project = relationship("Project", back_populates="ai_generations")


# ==========================
# EXERCISE SHEETS
# ==========================
class ExerciseSheet(Base):
    __tablename__ = "exercise_sheets"

    id = Column(String(36), primary_key=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, unique=True)
    pdf_url_questions = Column(String(500))
    pdf_url_answers = Column(String(500))
    qr_code_link = Column(String(255))
    status = Column(Enum("DRAFT", "GENERATED", "PUBLISHED", name="sheet_status_enum"), default="DRAFT")
    generated_at = Column(TIMESTAMP, default=datetime.utcnow)

    project = relationship("Project", back_populates="exercise_sheet")
    exercises = relationship(
        "Exercise", back_populates="sheet", cascade="all, delete-orphan"
    )


# ==========================
# EXERCISES
# ==========================
class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(String(36), primary_key=True)
    sheet_id = Column(String(36), ForeignKey("exercise_sheets.id", ondelete="CASCADE"), nullable=False)
    exercise_type = Column(
        Enum(
            "MCQ", "CHECKBOX", "OPEN", "FILL_IN", "TRUE_FALSE", "CROSS_TABLE", "DIAGRAM",
            name="exercise_type_enum"
        ),
        nullable=False
    )
    question_text = Column(Text, nullable=False)
    correct_answer = Column(Text)
    exercise_metadata = Column(JSON())  # difficulty, questions count, etc.
    source_reference = Column(JSON)  # reference to document/section
    version = Column(Integer, default=1)
    is_active = Column(Integer, default=1)
    display_order = Column(Integer, default=0)

    sheet = relationship("ExerciseSheet", back_populates="exercises")


# ==========================
# USAGE STATISTICS
# ==========================
class UsageStatistic(Base):
    __tablename__ = "usage_statistics"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    action = Column(Enum("EXERCISE_GENERATION", "PDF_TRANSLATION", "PDF_EXPORT", name="usage_action_enum"), nullable=False)
    credits_used = Column(Integer, default=1)
    action_date = Column(TIMESTAMP, default=datetime.utcnow)

    user = relationship("User", back_populates="usage_statistics")
