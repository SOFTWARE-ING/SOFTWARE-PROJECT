import json
import os

import google.generativeai as genai
from fastapi import HTTPException

# Configuration (Idéalement chargée depuis app/core/config.py)
GENAI_API_KEY = os.getenv("GEMINI_API_KEY", "")
genai.configure(api_key=GENAI_API_KEY)


def generate_exercise_content(text_source: str, config: dict) -> dict:
    """
    Appelle Gemini pour générer des exercices basés sur le texte source.
    Args:
        text_source: Le contenu extrait du PDF.
        config: Dictionnaire { 'type': 'QCM', 'difficulty': 'Moyen', 'count': 5 }
    Returns:
        JSON structuré des questions.
    """
    model = genai.GenerativeModel("gemini-2.5-flash-preview-09-2025")

    # Construction du Prompt Système
    prompt = f"""
    Tu es un expert pédagogique. Analyse le texte suivant et génère {config.get('count', 5)} exercices.
    Type demandé : {config.get('type', 'QCM')}
    Difficulté : {config.get('difficulty', 'Moyen')}
    
    Format de sortie STRICTEMENT JSON :
    {{
      "exercises": [
        {{
          "question": "L'énoncé de la question...",
          "options": ["Choix A", "Choix B", "Choix C"] (si QCM),
          "correct_answer": "La bonne réponse",
          "explanation": "Pourquoi c'est la bonne réponse"
        }}
      ]
    }}
    
    Texte Source :
    {text_source[:10000]} # On tronque pour éviter de dépasser les tokens si le texte est énorme
    """

    try:
        response = model.generate_content(prompt)

        # Nettoyage basique si le modèle renvoie des balises Markdown ```json ... ```
        clean_text = response.text.replace("```json", "").replace("```", "").strip()

        return json.loads(clean_text)

    except Exception as e:
        print(f"Erreur IA: {e}")
        # Fallback ou erreur explicite
        raise HTTPException(status_code=502, detail="Erreur lors de la génération IA")
