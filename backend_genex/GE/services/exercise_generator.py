import json
import re
from core.gemini import client
from services.gemini_prompt import build_exercise_generation_prompt

def safe_json_load(text: str) -> dict:
    """
    Parse une chaîne JSON qui contient des backslashes invalides ou des caractères LaTeX.
    """
    text = text.strip()

    # Étape 1 : échappe tous les backslashes invalides pour JSON
    # JSON valide accepte : \", \\, \/, \b, \f, \n, \r, \t, \uXXXX
    text = re.sub(r'\\(?!["\\/bfnrtu])', r'\\\\', text)

    # Étape 2 : essaie de parser en JSON
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Étape 3 : fallback = supprimer tous les backslashes pour éviter le crash
        cleaned = text.replace('\\', '')
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            raise ValueError(
                f"Réponse Gemini non JSON après nettoyage.\nSnippet: {cleaned[:5000]}\nErreur: {e}"
            )

def generate_exercises_with_gemini(
    document_text: str,
    config: dict,
    model: str = "gemini-3-flash-preview"
) -> dict:
    """
    Génère des exercices via Gemini et retourne toujours un dict Python.
    """
    prompt = build_exercise_generation_prompt(document_text, config)

    # Appel Gemini
    response = client.models.generate_content(
        model=model,
        contents=prompt
    )

    if not hasattr(response, "text") or not response.text:
        raise ValueError("Réponse Gemini vide")

    # Utilise la fonction safe_json_load pour parser correctement
    data = safe_json_load(response.text)

    if not isinstance(data, dict):
        raise ValueError(f"Réponse Gemini invalide (pas un dict) : {type(data)}")

    return data
