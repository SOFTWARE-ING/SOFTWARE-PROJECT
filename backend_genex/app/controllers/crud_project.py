import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from controllers.all_controller import (  # Vos fonctions génériques
    create_item, get_all_items)
from models import models


# 1. Requête filtrée (Indispensable pour la sécurité des données)
def get_projects_by_owner(db: Session, owner_id: str):
    """Récupère uniquement les projets appartenant à l'utilisateur connecté"""
    return (
        db.query(models.Project).filter(models.Project.enseignant_uid == owner_id).all()
    )


# 2. Opération métier complexe (Transaction)
def create_project_with_credits_check(db: Session, project_schema, user_id: str):
    """
    Crée un projet ET décrémente les crédits en une seule transaction.
    Si l'utilisateur n'a pas de crédits, on annule tout.
    """
    # Vérification
    enseignant = (
        db.query(models.Teacher).filter(models.Teacher.user_uid == user_id).first()
    )
    if not enseignant or enseignant.credits < 1:
        raise ValueError("Crédits insuffisants")

    try:
        # Création du projet (utilise votre fonction générique)
        new_project = create_item(db=db, model=models.Project, schema=project_schema)

        # Décrémentation
        enseignant.credits -= 1
        db.add(enseignant)

        db.commit()  # Valide les deux changements en même temps
        return new_project
    except Exception as e:
        db.rollback()  # Annule tout en cas d'erreur
        raise e


# --- DOCUMENTS ---


def get_document_by_hash(db: Session, file_hash: str):
    """
    Vérifie si un document avec ce contenu exact existe déjà en base.
    Nécessite d'avoir ajouté une colonne 'file_hash' au modèle Document.
    """
    # Suppose que le modèle Document a un champ 'file_hash' ou on compare sur le nom+taille
    # Pour l'instant, basons-nous sur l'hypothèse d'un champ hash ajouté
    return (
        db.query(models.DocumentSource)
        .filter(models.DocumentSource.file_hash == file_hash)
        .first()
    )


# --- STATISTIQUES ---


def get_stats_by_period(
    db: Session, user_id: str, start_date: datetime.date, end_date: datetime.date
):
    """
    Agrège les statistiques d'utilisation pour le dashboard.
    Retourne le nombre total d'actions et le coût total en crédits sur la période.
    """
    query = (
        db.query(
            models.StatistiqueUtilisation.action,
            func.count(models.StatistiqueUtilisation.id).label("count"),
            func.sum(models.StatistiqueUtilisation.consommation_credits).label(
                "total_credits"
            ),
        )
        .filter(
            models.StatistiqueUtilisation.user_uid == user_id,
            models.StatistiqueUtilisation.date_action >= start_date,
            models.StatistiqueUtilisation.date_action <= end_date,
        )
        .group_by(models.StatistiqueUtilisation.action)
    )

    return query.all()
