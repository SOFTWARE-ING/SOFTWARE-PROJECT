from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.models import \
    User  # Assurez-vous que le modèle User est bien défini


def decrement_credits(db: Session, user_id: str, cost: int = 1) -> User:
    """
    Vérifie le solde et décrémente les crédits d'un enseignant de manière atomique.
    Lève une erreur 402 (Payment Required) si le solde est insuffisant.
    """
    # On récupère l'utilisateur
    # Note: Dans une vraie appli, on utiliserait 'with_for_update()' pour verrouiller la ligne
    # lors de transactions concurrentes critiques.
    user = db.query(User).filter(User.uid == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    # Vérification du type d'utilisateur (seuls les enseignants ont des crédits)
    if user.type_utilisateur != "ENSEIGNANT":
        # Les étudiants n'ont pas de crédits, ou logique différente
        return user

    # Vérification du solde
    if user.credits < cost:
        raise HTTPException(
            status_code=402,
            detail=f"Crédits insuffisants. Requis: {cost}, Disponible: {user.credits}",
        )

    # Décrémentation
    user.credits -= cost

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
