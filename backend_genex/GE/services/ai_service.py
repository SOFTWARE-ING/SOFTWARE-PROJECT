# services/ai_service.py
import json
from services.gemini_serv import ask_gemini
from services.deepseek_serv import ask_deepseek

def call_gemini_or_deepseek(prompt: str, config: dict) -> dict:
    # Choisir entre Gemini et DeepSeek selon config ou aléatoire
    use_gemini = config.get("use_gemini", True)

    if use_gemini:
        print("🤖 Utilisation de Gemini pour la génération...")
        response = ask_gemini(prompt)
    else:
        print("🤖 Utilisation de DeepSeek pour la génération...")
        response = ask_deepseek(prompt)

    return response




def generate_exercises(prompt: str, config: dict) -> dict:
    response = call_gemini_or_deepseek(prompt, config)

    if isinstance(response, str):
        try:
            response = json.loads(response)
        except json.JSONDecodeError as e:
            raise ValueError(f"Réponse IA non-JSON: {e}") from e

    if not isinstance(response, dict):
        raise ValueError("Format IA invalide (dict attendu)")

    if "exercises" not in response:
        raise ValueError("Format IA invalide (clé 'exercises' manquante)")

    return response
