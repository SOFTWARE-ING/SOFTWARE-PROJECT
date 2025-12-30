-- =============================================================================
-- Nom de la base de données : genex_db
-- Description : Schéma physique complet et données de test (Seed)
-- Cible : MariaDB 10.4+
-- =============================================================================

CREATE DATABASE IF NOT EXISTS genex_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE genex_db;

-- Désactiver temporairement les vérifications de clés étrangères pour la création
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. Table UTILISATEURS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS utilisateurs (
    uid VARCHAR(36) PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type_utilisateur ENUM('ENSEIGNANT', 'ETUDIANT') NOT NULL,
    INDEX idx_email (email)
) ENGINE=Aria;

-- -----------------------------------------------------------------------------
-- 2. Table ENSEIGNANTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS enseignants (
    user_uid VARCHAR(36) PRIMARY KEY,
    credits INT DEFAULT 0,
    plan ENUM('FREE', 'PRO') DEFAULT 'FREE',
    institution VARCHAR(100),
    CONSTRAINT fk_enseignant_user FOREIGN KEY (user_uid) 
        REFERENCES utilisateurs(uid) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 3. Table DOCUMENTS_SOURCE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents_source (
    id VARCHAR(36) PRIMARY KEY,
    nom_fichier VARCHAR(255) NOT NULL,
    url_stockage VARCHAR(500) NOT NULL,
    texte_extrait LONGTEXT,
    langue_origine VARCHAR(10) DEFAULT 'fr',
    date_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 4. Table TRADUCTIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS traductions (
    id VARCHAR(36) PRIMARY KEY,
    document_id VARCHAR(36) NOT NULL,
    langue_cible VARCHAR(10) NOT NULL,
    url_pdf_traduit VARCHAR(500) NOT NULL,
    date_traduction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_trad_doc FOREIGN KEY (document_id) 
        REFERENCES documents_source(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 5. Table PROJETS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS projets (
    id VARCHAR(36) PRIMARY KEY,
    enseignant_uid VARCHAR(36) NOT NULL,
    document_id VARCHAR(36),
    titre VARCHAR(255) NOT NULL,
    config LONGTEXT CHECK (JSON_VALID(config)),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_projet_enseignant FOREIGN KEY (enseignant_uid) 
        REFERENCES enseignants(user_uid) ON DELETE CASCADE,
    CONSTRAINT fk_projet_doc FOREIGN KEY (document_id) 
        REFERENCES documents_source(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 6. Table FEUILLES_EXERCICE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS feuilles_exercice (
    id VARCHAR(36) PRIMARY KEY,
    projet_id VARCHAR(36) NOT NULL UNIQUE,
    url_pdf_sujet VARCHAR(500),
    url_pdf_correction VARCHAR(500),
    qr_code_link VARCHAR(255),
    statut ENUM('BROUILLON', 'GENERE', 'PUBLIE') DEFAULT 'BROUILLON',
    date_generation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feuille_projet FOREIGN KEY (projet_id) 
        REFERENCES projets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 7. Table EXERCICES
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS exercices (
    id VARCHAR(36) PRIMARY KEY,
    feuille_id VARCHAR(36) NOT NULL,
    type_exercice ENUM('QCM', 'CASE_A_COCHER', 'OUVERTE', 'TROUS', 'VRAI_FAUX', 'TABLEAU_CROISE', 'SCHEMA') NOT NULL,
    enonce TEXT NOT NULL,
    reponse_correcte TEXT,
    metadata_exo LONGTEXT CHECK (JSON_VALID(metadata_exo)),
    ordre_affichage INT DEFAULT 0,
    CONSTRAINT fk_exercice_feuille FOREIGN KEY (feuille_id) 
        REFERENCES feuilles_exercice(id) ON DELETE CASCADE,
    INDEX idx_feuille (feuille_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 8. Table STATISTIQUES_UTILISATION
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS statistiques_utilisation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_uid VARCHAR(36) NOT NULL,
    action ENUM('GENERATION_EXO', 'TRADUCTION_PDF', 'EXPORT_PDF') NOT NULL,
    consommation_credits INT DEFAULT 1,
    date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stats_user FOREIGN KEY (user_uid) 
        REFERENCES utilisateurs(uid) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- INSERTION DES DONNÉES DE TEST (SEED DATA)
-- =============================================================================

-- 1. Utilisateurs (12 entrées)

INSERT INTO utilisateurs (uid, email, password_hash, type_utilisateur) VALUES
('u1', 'jean.dupont@email.com', 'hash1', 'ENSEIGNANT'),
('u2', 'marie.curie@email.com', 'hash2', 'ENSEIGNANT'),
('u3', 'thomas.pesquet@email.com', 'hash3', 'ENSEIGNANT'),
('u4', 'alice.vial@email.com', 'hash4', 'ENSEIGNANT'),
('u5', 'bob.leponge@email.com', 'hash5', 'ETUDIANT'),
('u6', 'clara.noel@email.com', 'hash6', 'ENSEIGNANT'),
('u7', 'david.good@email.com', 'hash7', 'ENSEIGNANT'),
('u8', 'emma.watson@email.com', 'hash8', 'ENSEIGNANT'),
('u9', 'fabrice.luchini@email.com', 'hash9', 'ENSEIGNANT'),
('u10', 'gaelle.pietri@email.com', 'hash10', 'ENSEIGNANT'),
('u11', 'hugo.boss@email.com', 'hash11', 'ENSEIGNANT'),
('u12', 'igor.bogda@email.com', 'hash12', 'ETUDIANT');

-- 2. Enseignants (10 entrées)

INSERT INTO enseignants (user_uid, credits, plan, institution) VALUES
('u1', 50, 'PRO', 'Lycée Condorcet'),
('u2', 120, 'PRO', 'Université Paris-Saclay'),
('u3', 30, 'FREE', 'ESA Academy'),
('u4', 10, 'FREE', 'Collège Rimbaud'),
('u6', 200, 'PRO', 'Sorbonne'),
('u7', 0, 'FREE', 'Lycée Pasteur'),
('u8', 45, 'FREE', 'Oxford Edu'),
('u9', 150, 'PRO', 'Académie Française'),
('u10', 80, 'PRO', 'ENS Lyon'),
('u11', 12, 'FREE', 'Mode School');

-- 3. Documents Source (10 entrées)

INSERT INTO documents_source (id, nom_fichier, url_stockage, texte_extrait, langue_origine) VALUES
('doc1', 'cours_physique_atome.pdf', 's3://bucket/doc1.pdf', 'Contenu sur les atomes...', 'fr'),
('doc2', 'history_of_art.pdf', 's3://bucket/doc2.pdf', 'Art history details...', 'en'),
('doc3', 'biologie_cellulaire.pdf', 's3://bucket/doc3.pdf', 'Les cellules eucaryotes...', 'fr'),
('doc4', 'maths_fractions.pdf', 's3://bucket/doc4.pdf', 'Apprendre les fractions...', 'fr'),
('doc5', 'spanish_grammar.pdf', 's3://bucket/doc5.pdf', 'Gramatica española...', 'es'),
('doc6', 'informatique_reseau.pdf', 's3://bucket/doc6.pdf', 'Modèle OSI et protocoles...', 'fr'),
('doc7', 'geographie_climats.pdf', 's3://bucket/doc7.pdf', 'Zones climatiques mondiales...', 'fr'),
('doc8', 'chimie_molecules.pdf', 's3://bucket/doc8.pdf', 'Liaisons covalentes...', 'fr'),
('doc9', 'philosophie_kant.pdf', 's3://bucket/doc9.pdf', 'Critique de la raison pure...', 'fr'),
('doc10', 'economie_marche.pdf', 's3://bucket/doc10.pdf', 'Offre et demande...', 'fr');

-- 4. Traductions (10 entrées)

INSERT INTO traductions (id, document_id, langue_cible, url_pdf_traduit) VALUES
('t1', 'doc1', 'en', 's3://bucket/t1_en.pdf'),
('t2', 'doc1', 'es', 's3://bucket/t2_es.pdf'),
('t3', 'doc2', 'fr', 's3://bucket/t3_fr.pdf'),
('t4', 'doc3', 'en', 's3://bucket/t4_en.pdf'),
('t5', 'doc6', 'en', 's3://bucket/t5_en.pdf'),
('t6', 'doc7', 'de', 's3://bucket/t6_de.pdf'),
('t7', 'doc8', 'it', 's3://bucket/t7_it.pdf'),
('t8', 'doc10', 'en', 's3://bucket/t8_en.pdf'),
('t9', 'doc4', 'ar', 's3://bucket/t9_ar.pdf'),
('t10', 'doc5', 'fr', 's3://bucket/t10_fr.pdf');

-- 5. Projets (10 entrées)

INSERT INTO projets (id, enseignant_uid, document_id, titre, config) VALUES
('p1', 'u1', 'doc1', 'Examen Physique Atome', '{"diff": "intermediaire", "count": 5}'),
('p2', 'u2', 'doc3', 'Quizz Biologie', '{"diff": "facile", "count": 10}'),
('p3', 'u3', 'doc6', 'DS Réseaux', '{"diff": "expert", "count": 3}'),
('p4', 'u1', 'doc4', 'Soutien Maths', '{"diff": "facile", "count": 8}'),
('p5', 'u6', 'doc10', 'Analyse Éco', '{"diff": "intermediaire", "count": 12}'),
('p6', 'u8', 'doc2', 'Art History Test', '{"diff": "expert", "count": 5}'),
('p7', 'u10', 'doc8', 'TP Chimie', '{"diff": "intermediaire", "count": 4}'),
('p8', 'u9', 'doc9', 'Dissertation Philo', '{"diff": "expert", "count": 1}'),
('p9', 'u4', 'doc7', 'Géo Monde', '{"diff": "facile", "count": 6}'),
('p10', 'u7', 'doc4', 'Révision Fractions', '{"diff": "facile", "count": 10}');

-- 6. Feuilles d'Exercice (10 entrées)

INSERT INTO feuilles_exercice (id, projet_id, url_pdf_sujet, statut) VALUES
('f1', 'p1', 's3://pdf/sujet1.pdf', 'PUBLIE'),
('f2', 'p2', 's3://pdf/sujet2.pdf', 'GENERE'),
('f3', 'p3', 's3://pdf/sujet3.pdf', 'BROUILLON'),
('f4', 'p4', 's3://pdf/sujet4.pdf', 'PUBLIE'),
('f5', 'p5', 's3://pdf/sujet5.pdf', 'GENERE'),
('f6', 'p6', 's3://pdf/sujet6.pdf', 'PUBLIE'),
('f7', 'p7', 's3://pdf/sujet7.pdf', 'BROUILLON'),
('f8', 'p8', 's3://pdf/sujet8.pdf', 'GENERE'),
('f9', 'p9', 's3://pdf/sujet9.pdf', 'PUBLIE'),
('f10', 'p10', 's3://pdf/sujet10.pdf', 'GENERE');

-- 7. Exercices (10 entrées variées)

INSERT INTO exercices (id, feuille_id, type_exercice, enonce, reponse_correcte, metadata_exo) VALUES
('e1', 'f1', 'QCM', 'Quelle est la charge du proton ?', 'Positive', '{"options": ["Nulle", "Négative", "Positive"]}'),
('e2', 'f1', 'VRAI_FAUX', 'L''atome est majoritairement composé de vide.', 'Vrai', '{"label": "Confirmer l''énoncé"}'),
('e3', 'f2', 'TROUS', 'La cellule est l''unité [structurelle] du vivant.', 'structurelle', '{}'),
('e4', 'f4', 'OUVERTE', 'Expliquez la règle de trois.', NULL, '{}'),
('e5', 'f5', 'TABLEAU_CROISE', 'Associez les pays à leurs monnaies.', 'Europe-Euro, USA-Dollar', '{"rows": ["France", "USA"], "cols": ["Euro", "Dollar"]}'),
('e6', 'f6', 'SCHEMA', 'Légendez le tableau ci-dessous.', 'Point A: Renaissance', '{"hotspots": [1, 2, 3]}'),
('e7', 'f2', 'CASE_A_COCHER', 'Cochez les organites cellulaires.', 'Noyau, Mitochondrie', '{"options": ["Noyau", "Mitochondrie", "Pneu"]}'),
('e8', 'f9', 'QCM', 'Quel est le plus grand océan ?', 'Pacifique', '{"options": ["Atlantique", "Pacifique", "Indien"]}'),
('e9', 'f10', 'VRAI_FAUX', '1/2 est supérieur à 1/4.', 'Vrai', '{}'),
('e10', 'f1', 'OUVERTE', 'Décrivez l''expérience de Rutherford.', NULL, '{}');

-- 8. Statistiques (10 entrées)

INSERT INTO statistiques_utilisation (user_uid, action, consommation_credits) VALUES
('u1', 'GENERATION_EXO', 5),
('u1', 'TRADUCTION_PDF', 2),
('u2', 'GENERATION_EXO', 10),
('u3', 'EXPORT_PDF', 1),
('u6', 'GENERATION_EXO', 12),
('u8', 'TRADUCTION_PDF', 2),
('u10', 'GENERATION_EXO', 4),
('u9', 'EXPORT_PDF', 1),
('u4', 'GENERATION_EXO', 8),
('u1', 'EXPORT_PDF', 1);

SET FOREIGN_KEY_CHECKS = 1;