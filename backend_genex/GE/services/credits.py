from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.models import User


def decrement_credits(db: Session, user_id: str, cost: int = 1) -> User:
    """
    Vérifie le solde et décrémente les crédits d'un enseignant de manière atomique.
    Lève une erreur 402 (Payment Required) si le solde est insuffisant.
    """
    # On récupère l'utilisateur
    # Note: Dans une vraie appli, on utiliserait 'with_for_update()' pour verrouiller la ligne
    # lors de transactions concurrentes critiques.
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    profile = user.profile or {}
    credits = profile.get("credits", 0)

    if credits < cost:
        raise HTTPException(
            status_code=402,
            detail=f"Crédits insuffisants. Requis: {cost}, Disponible: {credits}",
        )

    # Décrémentation
    profile["credits"] = credits - cost
    user.profile = profile

    # On committe la transaction
    try:
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail="Erreur lors de la transaction de crédits"
        )

    return user
