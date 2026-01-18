import json
import re
from fastapi import HTTPException
from services.gemini_serv import ask_gemini


def generate_exercise_content(text_source: str, config: dict) -> dict:
    """
    Génère des exercices pédagogiques structurés via Gemini.
    """

    count = config.get("count", 5)
    ex_type = config.get("type", "QCM")
    difficulty = config.get("difficulty", "Moyen")

    prompt = f"""
TU ES UNE IA QUI DOIT RENVOYER UNIQUEMENT DU JSON VALIDE.
AUCUN TEXTE AVANT OU APRÈS. AUCUNE EXPLICATION.

Génère {count} exercices pédagogiques.
Type : {ex_type}
Difficulté : {difficulty}

FORMAT STRICT :
{{
  "exercises": [
    {{
      "question": "string",
      "options": ["string", "string", "string"],
      "correct_answer": "string",
      "explanation": "string"
    }}
  ]
}}

TEXTE SOURCE :
{text_source[:80000]}
"""

    try:
        raw_response = ask_gemini(prompt)
        raw_response = raw_response.strip()

        # Sécurisation : extraction du JSON
        match = re.search(r"\{.*\}", raw_response, re.DOTALL)
        if not match:
            raise ValueError("JSON non détecté dans la réponse IA")

        return json.loads(match.group())

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=502,
            detail="Réponse IA invalide (JSON mal formé)"
        )

    except Exception as e:
        print(f"[AI SERVICE ERROR] {e}")
        raise HTTPException(
            status_code=502,
            detail="Erreur lors de la génération IA"
        )
