
-- DROP DATABASE IF EXISTS genex_db;
-- =============================================================================
-- Database: genex_db
-- Description: Schema for GenEx exercise generation & document translation SaaS
-- Target: MariaDB 10.4+
-- =============================================================================

CREATE DATABASE IF NOT EXISTS genex_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE genex_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ==========================
-- ROLES
-- ==========================
CREATE TABLE roles (
    id VARCHAR(36) PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL, -- e.g., STUDENT, TEACHER, ADMIN
    description VARCHAR(255)
) ENGINE=InnoDB;

-- ==========================
-- USERS
-- ==========================
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    profile JSON, -- optional metadata (preferences, plan, etc.)
    CONSTRAINT fk_user_role
        FOREIGN KEY (role_id) REFERENCES roles(id)
        ON DELETE RESTRICT,
    INDEX idx_email (email)
) ENGINE=InnoDB;

-- ==========================
-- SOURCE DOCUMENTS
-- ==========================
CREATE TABLE source_documents (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL, -- owner
    filename VARCHAR(255) NOT NULL,
    file_type ENUM('PDF', 'DOCX', 'TXT') NOT NULL,
    storage_url VARCHAR(500) NOT NULL,
    extracted_text LONGTEXT,
    original_language VARCHAR(10) DEFAULT 'en',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_doc_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================
-- DOCUMENT SECTIONS
-- ==========================
CREATE TABLE document_sections (
    id VARCHAR(36) PRIMARY KEY,
    document_id VARCHAR(36) NOT NULL,
    title VARCHAR(255),
    page_start INT,
    page_end INT,
    text LONGTEXT,
    CONSTRAINT fk_section_document
        FOREIGN KEY (document_id) REFERENCES source_documents(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_document_sections ON document_sections(document_id);

-- ==========================
-- TRANSLATIONS
-- ==========================
CREATE TABLE translations (
    id VARCHAR(36) PRIMARY KEY,
    document_id VARCHAR(36) NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    translated_pdf_url VARCHAR(500) NOT NULL,
    translated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_translation_document
        FOREIGN KEY (document_id) REFERENCES source_documents(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================
-- PROJECTS (generation projects)
-- ==========================
CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL, -- owner
    document_id VARCHAR(36),
    title VARCHAR(255) NOT NULL,
    config JSON NOT NULL,
    -- JSON exemple :
    -- {
    --   "total_exercises": 10,
    --   "types_count": {"MCQ":3, "FILL_IN":7},
    --   "questions_per_exercise": {"MCQ":5, "FILL_IN":3},
    --   "difficulty_global": 2,
    --   "difficulty_per_exercise": {"MCQ":2, "FILL_IN":3}
    -- }
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_project_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_project_document
        FOREIGN KEY (document_id) REFERENCES source_documents(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ==========================
-- AI GENERATIONS (raw AI outputs)
-- ==========================
CREATE TABLE ai_generations (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    model_name VARCHAR(50) NOT NULL,
    prompt LONGTEXT NOT NULL,
    raw_response LONGTEXT,
    tokens_used INT DEFAULT 0,
    status ENUM('SUCCESS', 'FAILED') DEFAULT 'SUCCESS',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_generation_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_ai_generations_project ON ai_generations(project_id);

-- ==========================
-- EXERCISE SHEETS (final PDFs)
-- ==========================
CREATE TABLE exercise_sheets (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL UNIQUE,
    pdf_url_questions VARCHAR(500),
    pdf_url_answers VARCHAR(500),
    qr_code_link VARCHAR(255),
    status ENUM('DRAFT', 'GENERATED', 'PUBLISHED') DEFAULT 'DRAFT',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sheet_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================
-- EXERCISES (details of each generated exercise)
-- ==========================
CREATE TABLE exercises (
    id VARCHAR(36) PRIMARY KEY,
    sheet_id VARCHAR(36) NOT NULL,
    exercise_type ENUM(
        'MCQ',
        'CHECKBOX',
        'OPEN',
        'FILL_IN',
        'TRUE_FALSE',
        'CROSS_TABLE',
        'DIAGRAM'
    ) NOT NULL,
    question_text TEXT NOT NULL,
    correct_answer TEXT,
    exercise_metadata JSON, -- difficulty, number of questions, etc.
    source_reference JSON, -- reference to document/section
    version INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    CONSTRAINT fk_exercise_sheet
        FOREIGN KEY (sheet_id) REFERENCES exercise_sheets(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_exercises_sheet ON exercises(sheet_id);

-- ==========================
-- USAGE STATISTICS
-- ==========================
CREATE TABLE usage_statistics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    action ENUM('EXERCISE_GENERATION', 'PDF_TRANSLATION', 'PDF_EXPORT') NOT NULL,
    credits_used INT DEFAULT 1,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_statistics_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_statistics_date ON usage_statistics(action_date);

SET FOREIGN_KEY_CHECKS = 1;


-- =========================================
-- ROLES
-- =========================================
INSERT INTO roles (id, role_name, description)
VALUES
  (UUID(), 'ADMIN', 'Administrator role'),
  (UUID(), 'USER', 'Regular user role'),
  (UUID(), 'EDITOR', 'Can edit documents'),
  (UUID(), 'TEACHER', 'Can create projects'),
  (UUID(), 'GUEST', 'Read-only access');

-- =========================================
-- USERS
-- =========================================
INSERT INTO users (id, email, password_hash, role_id, created_at, profile)
VALUES
  (UUID(), 'alice@test.com', 'hashedpassword1', (SELECT id FROM roles WHERE role_name='USER'), NOW(), '{"first_name":"Alice","last_name":"Smith"}'),
  (UUID(), 'bob@test.com', 'hashedpassword2', (SELECT id FROM roles WHERE role_name='ADMIN'), NOW(), '{"first_name":"Bob","last_name":"Admin"}'),
  (UUID(), 'charlie@test.com', 'hashedpassword3', (SELECT id FROM roles WHERE role_name='EDITOR'), NOW(), '{"first_name":"Charlie","last_name":"Brown"}'),
  (UUID(), 'david@test.com', 'hashedpassword4', (SELECT id FROM roles WHERE role_name='TEACHER'), NOW(), '{"first_name":"David","last_name":"Green"}'),
  (UUID(), 'eve@test.com', 'hashedpassword5', (SELECT id FROM roles WHERE role_name='GUEST'), NOW(), '{"first_name":"Eve","last_name":"White"}');

-- =========================================
-- SOURCE DOCUMENTS
-- =========================================
INSERT INTO source_documents (id, user_id, filename, file_type, storage_url, extracted_text, original_language, uploaded_at)
VALUES
  (UUID(), (SELECT id FROM users WHERE email='alice@test.com'), 'doc1.pdf', 'pdf', '/files/doc1.pdf', 'Text from doc1', 'en', NOW()),
  (UUID(), (SELECT id FROM users WHERE email='bob@test.com'), 'doc2.pdf', 'pdf', '/files/doc2.pdf', 'Text from doc2', 'fr', NOW()),
  (UUID(), (SELECT id FROM users WHERE email='charlie@test.com'), 'doc3.txt', 'txt', '/files/doc3.txt', 'Text from doc3', 'en', NOW()),
  (UUID(), (SELECT id FROM users WHERE email='david@test.com'), 'doc4.pdf', 'pdf', '/files/doc4.pdf', 'Text from doc4', 'en', NOW()),
  (UUID(), (SELECT id FROM users WHERE email='eve@test.com'), 'doc5.docx', 'docx', '/files/doc5.docx', 'Text from doc5', 'fr', NOW());

-- =========================================
-- PROJECTS
-- =========================================
INSERT INTO projects (id, user_id, document_id, title, config, created_at)
VALUES
  (UUID(), (SELECT id FROM users WHERE email='alice@test.com'), (SELECT id FROM source_documents WHERE filename='doc1.pdf'), 'Project A', '{"total_exercises":5,"types":{"QCM":2,"TROUS":3}}', NOW()),
  (UUID(), (SELECT id FROM users WHERE email='bob@test.com'), (SELECT id FROM source_documents WHERE filename='doc2.pdf'), 'Project B', '{"total_exercises":4,"types":{"QCM":1,"TROUS":3}}', NOW()),
  (UUID(), (SELECT id FROM users WHERE email='charlie@test.com'), (SELECT id FROM source_documents WHERE filename='doc3.txt'), 'Project C', '{"total_exercises":6,"types":{"QCM":3,"OUVERTE":3}}', NOW()),
  (UUID(), (SELECT id FROM users WHERE email='david@test.com'), (SELECT id FROM source_documents WHERE filename='doc4.pdf'), 'Project D', '{"total_exercises":5,"types":{"QCM":2,"VRAI_FAUX":3}}', NOW()),
  (UUID(), (SELECT id FROM users WHERE email='eve@test.com'), (SELECT id FROM source_documents WHERE filename='doc5.docx'), 'Project E', '{"total_exercises":3,"types":{"TROUS":3}}', NOW());

-- =========================================
-- EXERCISE SHEETS
-- =========================================
INSERT INTO exercise_sheets (id, project_id, pdf_url_questions, pdf_url_answers, qr_code_link, status, generated_at)
VALUES
  (UUID(), (SELECT id FROM projects WHERE title='Project A'), '/files/projectA_questions.pdf', '/files/projectA_answers.pdf', 'http://qrcodeA', 'DRAFT', NOW()),
  (UUID(), (SELECT id FROM projects WHERE title='Project B'), '/files/projectB_questions.pdf', '/files/projectB_answers.pdf', 'http://qrcodeB', 'DRAFT', NOW()),
  (UUID(), (SELECT id FROM projects WHERE title='Project C'), '/files/projectC_questions.pdf', '/files/projectC_answers.pdf', 'http://qrcodeC', 'DRAFT', NOW()),
  (UUID(), (SELECT id FROM projects WHERE title='Project D'), '/files/projectD_questions.pdf', '/files/projectD_answers.pdf', 'http://qrcodeD', 'DRAFT', NOW()),
  (UUID(), (SELECT id FROM projects WHERE title='Project E'), '/files/projectE_questions.pdf', '/files/projectE_answers.pdf', 'http://qrcodeE', 'DRAFT', NOW());

-- =========================================
-- EXERCISES
-- =========================================
INSERT INTO exercises (id, sheet_id, exercise_type, question_text, correct_answer, exercise_metadata, display_order, is_active)
VALUES
  (UUID(), (SELECT id FROM exercise_sheets WHERE project_id=(SELECT id FROM projects WHERE title='Project A')), 'MCQ', 'What is 2+2?', '4', '{"difficulty":"easy"}', 1, true),
  (UUID(), (SELECT id FROM exercise_sheets WHERE project_id=(SELECT id FROM projects WHERE title='Project A')), 'FILL_IN', 'The capital of France is ___', 'Paris', '{"difficulty":"medium"}', 2, true),
  (UUID(), (SELECT id FROM exercise_sheets WHERE project_id=(SELECT id FROM projects WHERE title='Project B')), 'MCQ', 'Choose the correct color', 'Red', '{"difficulty":"easy"}', 1, true),
  (UUID(), (SELECT id FROM exercise_sheets WHERE project_id=(SELECT id FROM projects WHERE title='Project C')), 'OPEN', 'Explain gravity', 'Gravity is ...', '{"difficulty":"hard"}', 1, true),
  (UUID(), (SELECT id FROM exercise_sheets WHERE project_id=(SELECT id FROM projects WHERE title='Project D')), 'TRUE_FALSE', 'The sun rises in the west', 'False', '{"difficulty":"easy"}', 1, true);

-- =========================================
-- AI GENERATIONS
-- =========================================
INSERT INTO ai_generations (id, project_id, model_name, prompt, raw_response, tokens_used, status, generated_at)
VALUES
  (UUID(), (SELECT id FROM projects WHERE title='Project A'), 'GPT-Test', 'Generate a QCM exercise', 'QCM generated', 10, 'SUCCESS', NOW()),
  (UUID(), (SELECT id FROM projects WHERE title='Project B'), 'GPT-Test', 'Generate a TROUS exercise', 'TROUS generated', 15, 'SUCCESS', NOW()),
  (UUID(), (SELECT id FROM projects WHERE title='Project C'), 'GPT-Test', 'Generate a OUVERTE exercise', 'OUVERTE generated', 12, 'SUCCESS', NOW()),
  (UUID(), (SELECT id FROM projects WHERE title='Project D'), 'GPT-Test', 'Generate a VRAI_FAUX exercise', 'VRAI_FAUX generated', 8, 'SUCCESS', NOW()),
  (UUID(), (SELECT id FROM projects WHERE title='Project E'), 'GPT-Test', 'Generate a TROUS exercise', 'TROUS generated', 9, 'SUCCESS', NOW());

-- =========================================
-- USAGE STATISTICS
-- =========================================
INSERT INTO usage_statistics (id, user_id, action, credits_used, action_date)
VALUES
  (1, (SELECT id FROM users WHERE email='alice@test.com'), 'EXERCISE_GENERATION', 1, NOW()),
  (2, (SELECT id FROM users WHERE email='bob@test.com'), 'PDF_TRANSLATION', 2, NOW()),
  (3, (SELECT id FROM users WHERE email='charlie@test.com'), 'PDF_EXPORT', 1, NOW()),
  (4, (SELECT id FROM users WHERE email='david@test.com'), 'EXERCISE_GENERATION', 1, NOW()),
  (5, (SELECT id FROM users WHERE email='eve@test.com'), 'PDF_TRANSLATION', 1, NOW());

-- =========================================
-- TRANSLATIONS
-- =========================================
INSERT INTO translations (id, document_id, target_language, translated_pdf_url, translated_at)
VALUES
  (UUID(), (SELECT id FROM source_documents WHERE filename='doc1.pdf'), 'fr', '/files/doc1_fr.pdf', NOW()),
  (UUID(), (SELECT id FROM source_documents WHERE filename='doc2.pdf'), 'en', '/files/doc2_en.pdf', NOW()),
  (UUID(), (SELECT id FROM source_documents WHERE filename='doc3.txt'), 'fr', '/files/doc3_fr.pdf', NOW()),
  (UUID(), (SELECT id FROM source_documents WHERE filename='doc4.pdf'), 'en', '/files/doc4_en.pdf', NOW()),
  (UUID(), (SELECT id FROM source_documents WHERE filename='doc5.docx'), 'fr', '/files/doc5_fr.pdf', NOW());

ALTER TABLE `source_documents` ADD COLUMN `status` VARCHAR(50) DEFAULT 'PENDING'

ALTER TABLE `source_documents` 
	CHANGE `file_type` `file_type` varchar(255) NOT NULL ;
DESCRIBE source_documents;

ALTER TABLE projects
MODIFY COLUMN config JSON NOT NULL,
ADD CONSTRAINT chk_projects_config_json
CHECK (JSON_VALID(config));
DESCRIBE projects;

ALTER TABLE ai_generations MODIFY COLUMN status ENUM('SUCCESS','FAILED','ERROR') NOT NULL;
ALTER TABLE exercise_sheets MODIFY COLUMN status ENUM('SUCCESS','FAILED','ERROR') NOT NULL;
DESCRIBE ai_generations;
DESCRIBE exercise_sheets;
ALTER TABLE exercises MODIFY COLUMN exercise_type VARCHAR(255);

