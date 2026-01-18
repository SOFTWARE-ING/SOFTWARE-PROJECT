from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel
from enum import Enum

# from pydantic import ConfigDict

class DocumentStatus(str, Enum):
    UPLOADED = "UPLOADED"
    OCR_DONE = "OCR_DONE"
    AI_PROCESSING = "AI_PROCESSING"
    PROCESSED = "PROCESSED"
    ERROR = "ERROR"


# --------------------------
# LIGHT VERSIONS
# --------------------------
class UserReadLight(BaseModel):
    id: str
    email: str

class ProjectReadLight(BaseModel):
    id: str
    title: str

class SourceDocumentReadLight(BaseModel):
    id: str
    filename: str
    file_type: str
    storage_url: str

class TranslationReadLight(BaseModel):
    id: str
    target_language: str
    translated_pdf_url: str

class ExerciseSheetReadLight(BaseModel):
    id: str

class ExerciseReadLight(BaseModel):
    id: str
    question_text: str

class UsageStatisticReadLight(BaseModel):
    id: int
    action: str

class AIGenerationReadLight(BaseModel):
    id: str
    model_name: str
    prompt: str

# ==========================
# ROLE
# ==========================
class RoleBase(BaseModel):
    id: str
    role_name: str
    description: Optional[str] = None
    class Config:
        from_attributes = True

class RoleCreate(BaseModel):
    role_name: str
    description: Optional[str] = None

class RoleRead(RoleBase):
    users: Optional[List[UserReadLight]] = []

# ==========================
# USER
# ==========================




class UserBase(BaseModel):
    id: str
    email: str
    role_id: str
    created_at: Optional[datetime] = None
    profile: Optional[Dict] = None
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: str
    password: str
    role_id: str
    profile: Optional[Dict] = None

class UserRead(UserBase):
    role: Optional[RoleRead] = None
    source_documents: Optional[List[SourceDocumentReadLight]] = []
    projects: Optional[List[ProjectReadLight]] = []
    usage_statistics: Optional[List[UsageStatisticReadLight]] = []
    
class UserUpdate(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    role_id: Optional[str] = None
    profile: Optional[Dict] = None

# ==========================
# SOURCE DOCUMENT
# ==========================
class FileType(str, Enum):
    PDF = "PDF"
    DOCX = "DOCX"
    TXT = "TXT"

class SourceDocumentBase(BaseModel):
    id: str
    user_id: str
    filename: str
    file_type: FileType
    storage_url: str
    extracted_text: Optional[str] = None
    original_language: Optional[str] = "en"
    uploaded_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class SourceDocumentCreate(BaseModel):
    user_id: str
    filename: str
    file_type: str
    storage_url: str
    extracted_text: Optional[str] = None
    original_language: Optional[str] = "en"

class SourceDocumentRead(SourceDocumentBase):
    status: DocumentStatus
    owner: Optional[UserReadLight] = None
    sections: Optional[List["DocumentSectionRead"]] = []
    translations: Optional[List["TranslationReadLight"]] = []
    projects: Optional[List[ProjectReadLight]] = []

# ==========================
# DOCUMENT SECTION
# ==========================
class DocumentSectionBase(BaseModel):
    id: str
    document_id: str
    title: Optional[str] = None
    page_start: Optional[int] = None
    page_end: Optional[int] = None
    text: Optional[str] = None
    class Config:
        from_attributes = True

class DocumentSectionCreate(BaseModel):
    document_id: str
    title: Optional[str] = None
    page_start: Optional[int] = None
    page_end: Optional[int] = None
    text: Optional[str] = None

class DocumentSectionRead(DocumentSectionBase):
    document: Optional[SourceDocumentReadLight] = None

# ==========================
# TRANSLATION
# ==========================
class TranslationBase(BaseModel):
    id: str
    document_id: str
    target_language: str
    translated_pdf_url: str
    translated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class TranslationCreate(BaseModel):
    document_id: str
    target_language: str
    translated_pdf_url: str

class TranslationRead(TranslationBase):
    document: Optional[SourceDocumentReadLight] = None

# ==========================
# PROJECT
# ==========================
class ProjectBase(BaseModel):
    id: str
    user_id: str
    document_id: Optional[str] = None
    title: str
    config: Dict
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class ProjectCreate(BaseModel):
    user_id: str
    document_id: Optional[str] = None
    title: str
    config: Dict

class ProjectRead(ProjectBase):
    owner: Optional[UserReadLight] = None
    document: Optional[SourceDocumentReadLight] = None
    ai_generations: Optional[List[AIGenerationReadLight]] = []
    exercise_sheet: Optional[ExerciseSheetReadLight] = None

# ==========================
# AI GENERATION
# ==========================
class AIGenerationBase(BaseModel):
    id: str
    project_id: str
    model_name: str
    prompt: str
    raw_response: Optional[str] = None
    tokens_used: Optional[int] = 0
    status: Optional[str] = "SUCCESS"
    generated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class AIGenerationCreate(BaseModel):
    project_id: str
    model_name: str
    prompt: str

class AIGenerationRead(AIGenerationBase):
    project: Optional[ProjectReadLight] = None

# ==========================
# EXERCISE SHEET
# ==========================
class ExerciseSheetBase(BaseModel):
    id: str
    project_id: str
    pdf_url_questions: Optional[str] = None
    pdf_url_answers: Optional[str] = None
    qr_code_link: Optional[str] = None
    status: Optional[str] = "DRAFT"
    generated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class ExerciseSheetCreate(BaseModel):
    project_id: str
    pdf_url_questions: Optional[str] = None
    pdf_url_answers: Optional[str] = None
    qr_code_link: Optional[str] = None
    status: Optional[str] = "DRAFT"

class ExerciseSheetRead(ExerciseSheetBase):
    project: Optional[ProjectReadLight] = None
    exercises: Optional[List[ExerciseReadLight]] = []

# ==========================
# EXERCISE
# ==========================
class ExerciseBase(BaseModel):
    id: str
    sheet_id: str
    exercise_type: str
    question_text: str
    correct_answer: Optional[str] = None
    exercise_metadata: Optional[Dict] = None
    source_reference: Optional[Dict] = None
    version: Optional[int] = 1
    is_active: Optional[bool] = True
    display_order: Optional[int] = 0
    class Config:
        from_attributes = True

class ExerciseCreate(BaseModel):
    sheet_id: str
    exercise_type: str
    question_text: str
    correct_answer: Optional[str] = None
    exercise_metadata: Optional[Dict] = None
    source_reference: Optional[Dict] = None

class ExerciseRead(ExerciseBase):
    sheet: Optional[ExerciseSheetReadLight] = None

# ==========================
# USAGE STATISTICS
# ==========================
class UsageAction(str, Enum):
    EXERCISE_GENERATION = "EXERCISE_GENERATION"
    PDF_TRANSLATION = "PDF_TRANSLATION"
    PDF_EXPORT = "PDF_EXPORT"

class UsageStatisticBase(BaseModel):
    id: int
    user_id: str
    action: UsageAction
    credits_used: Optional[int] = 1
    action_date: Optional[datetime] = None
    class Config:
        from_attributes = True

class UsageStatisticCreate(BaseModel):
    user_id: str
    action: UsageAction
    credits_used: Optional[int] = 1

class UsageStatisticRead(UsageStatisticBase):
    user: Optional[UserReadLight] = None

# ==========================
# GEMINI
# ==========================
class GeminiRequest(BaseModel):
    prompt: str

# --------------------------
# Forward refs
# --------------------------
RoleRead.update_forward_refs()
UserRead.update_forward_refs()
SourceDocumentRead.update_forward_refs()
DocumentSectionRead.update_forward_refs()
TranslationRead.update_forward_refs()
ProjectRead.update_forward_refs()
AIGenerationRead.update_forward_refs()
ExerciseSheetRead.update_forward_refs()
ExerciseRead.update_forward_refs()
UsageStatisticRead.update_forward_refs()
