from datetime import datetime

from sqlalchemy import (JSON, TIMESTAMP, BigInteger, Column, Enum, ForeignKey,
                        Integer, String, Text)
from sqlalchemy.orm import relationship

from db.base import Base

# =============================================================================
# UTILISATEURS
# =============================================================================


class User(Base):
    __tablename__ = "utilisateurs"

    uid = Column(String(36), primary_key=True, index=True)
    email = Column(String(191), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    date_creation = Column(TIMESTAMP, default=datetime.utcnow)
    type_utilisateur = Column(
        Enum("ENSEIGNANT", "ETUDIANT", name="user_type_enum"), nullable=False
    )

    enseignant = relationship(
        "Teacher",
        back_populates="utilisateur",
        uselist=False,
        cascade="all, delete-orphan",
    )

    statistiques = relationship(
        "StatistiqueUtilisation",
        back_populates="utilisateur",
        cascade="all, delete-orphan",
    )


# =============================================================================
# ENSEIGNANTS
# =============================================================================


class Teacher(Base):
    __tablename__ = "enseignants"

    user_uid = Column(
        String(36), ForeignKey("utilisateurs.uid", ondelete="CASCADE"), primary_key=True
    )

    credits = Column(Integer, default=0)
    plan = Column(Enum("FREE", "PRO", name="plan_enum"), default="FREE")
    institution = Column(String(100))

    utilisateur = relationship("User", back_populates="enseignant")
    projets = relationship(
        "Project", back_populates="enseignant", cascade="all, delete-orphan"
    )


# =============================================================================
# DOCUMENTS SOURCE
# =============================================================================


class DocumentSource(Base):
    __tablename__ = "documents_source"

    id = Column(String(36), primary_key=True)
    nom_fichier = Column(String(255), nullable=False)
    url_stockage = Column(String(500), nullable=False)
    texte_extrait = Column(Text)
    langue_origine = Column(String(10), default="fr")
    date_upload = Column(TIMESTAMP, default=datetime.utcnow)

    traductions = relationship(
        "Traduction", back_populates="document", cascade="all, delete-orphan"
    )

    projets = relationship("Project", back_populates="document")


# =============================================================================
# TRADUCTIONS
# =============================================================================


class Traduction(Base):
    __tablename__ = "traductions"

    id = Column(String(36), primary_key=True)
    document_id = Column(
        String(36),
        ForeignKey("documents_source.id", ondelete="CASCADE"),
        nullable=False,
    )
    langue_cible = Column(String(10), nullable=False)
    url_pdf_traduit = Column(String(500), nullable=False)
    date_traduction = Column(TIMESTAMP, default=datetime.utcnow)

    document = relationship("DocumentSource", back_populates="traductions")


# =============================================================================
# PROJETS
# =============================================================================


class Project(Base):
    __tablename__ = "projets"

    id = Column(String(36), primary_key=True)
    enseignant_uid = Column(
        String(36),
        ForeignKey("enseignants.user_uid", ondelete="CASCADE"),
        nullable=False,
    )
    document_id = Column(
        String(36), ForeignKey("documents_source.id", ondelete="SET NULL")
    )

    titre = Column(String(255), nullable=False)
    config = Column(JSON)
    date_creation = Column(TIMESTAMP, default=datetime.utcnow)

    enseignant = relationship("Teacher", back_populates="projets")
    document = relationship("DocumentSource", back_populates="projets")

    feuille = relationship(
        "FeuilleExercice",
        back_populates="projet",
        uselist=False,
        cascade="all, delete-orphan",
    )


# =============================================================================
# FEUILLES D'EXERCICE
# =============================================================================


class FeuilleExercice(Base):
    __tablename__ = "feuilles_exercice"

    id = Column(String(36), primary_key=True)
    projet_id = Column(
        String(36),
        ForeignKey("projets.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    url_pdf_sujet = Column(String(500))
    url_pdf_correction = Column(String(500))
    qr_code_link = Column(String(255))

    statut = Column(
        Enum("BROUILLON", "GENERE", "PUBLIE", name="feuille_status_enum"),
        default="BROUILLON",
    )

    date_generation = Column(TIMESTAMP, default=datetime.utcnow)

    projet = relationship("Project", back_populates="feuille")
    exercices = relationship(
        "Exercice", back_populates="feuille", cascade="all, delete-orphan"
    )


# =============================================================================
# EXERCICES
# =============================================================================


class Exercice(Base):
    __tablename__ = "exercices"

    id = Column(String(36), primary_key=True)
    feuille_id = Column(
        String(36),
        ForeignKey("feuilles_exercice.id", ondelete="CASCADE"),
        nullable=False,
    )

    type_exercice = Column(
        Enum(
            "QCM",
            "CASE_A_COCHER",
            "OUVERTE",
            "TROUS",
            "VRAI_FAUX",
            "TABLEAU_CROISE",
            "SCHEMA",
            name="exercise_type_enum",
        ),
        nullable=False,
    )

    enonce = Column(Text, nullable=False)
    reponse_correcte = Column(Text)
    metadata_exo = Column(JSON)
    ordre_affichage = Column(Integer, default=0)

    feuille = relationship("FeuilleExercice", back_populates="exercices")


# =============================================================================
# STATISTIQUES UTILISATION
# =============================================================================


class StatistiqueUtilisation(Base):
    __tablename__ = "statistiques_utilisation"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_uid = Column(
        String(36), ForeignKey("utilisateurs.uid", ondelete="CASCADE"), nullable=False
    )

    action = Column(
        Enum("GENERATION_EXO", "TRADUCTION_PDF", "EXPORT_PDF", name="action_stat_enum"),
        nullable=False,
    )

    consommation_credits = Column(Integer, default=1)
    date_action = Column(TIMESTAMP, default=datetime.utcnow)

    utilisateur = relationship("User", back_populates="statistiques")
