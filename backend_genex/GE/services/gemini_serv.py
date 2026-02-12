from core.gemini import client
from google.genai.errors import APIError, ServerError
import time

# Modèles Gemini disponibles :
# models/gemini-2.5-flash
# models/gemini-2.5-pro
# models/gemini-2.0-flash
# models/gemini-2.0-flash-001
# models/gemini-2.0-flash-exp-image-generation
# models/gemini-2.0-flash-lite-001
# models/gemini-2.0-flash-lite
# models/gemini-exp-1206
# models/gemini-2.5-flash-preview-tts
# models/gemini-2.5-pro-preview-tts
# models/gemma-3-1b-it
# models/gemma-3-4b-it
# models/gemma-3-12b-it
# models/gemma-3-27b-it
# models/gemma-3n-e4b-it
# models/gemma-3n-e2b-it
# models/gemini-flash-latest
# models/gemini-flash-lite-latest
# models/gemini-pro-latest
# models/gemini-2.5-flash-lite
# models/gemini-2.5-flash-image
# models/gemini-2.5-flash-preview-09-2025
# models/gemini-2.5-flash-lite-preview-09-2025
# models/gemini-3-pro-preview
# models/gemini-3-flash-preview
# models/gemini-3-pro-image-preview
# models/nano-banana-pro-preview
# models/gemini-robotics-er-1.5-preview
# models/gemini-2.5-computer-use-preview-10-2025
# models/deep-research-pro-preview-12-2025
# models/embedding-001
# models/text-embedding-004
# models/gemini-embedding-001
# models/aqa
# models/imagen-4.0-generate-preview-06-06
# models/imagen-4.0-ultra-generate-preview-06-06
# models/imagen-4.0-generate-001
# models/imagen-4.0-ultra-generate-001
# models/imagen-4.0-fast-generate-001
# models/veo-2.0-generate-001
# models/veo-3.0-generate-001
# models/veo-3.0-fast-generate-001
# models/veo-3.1-generate-preview
# models/veo-3.1-fast-generate-preview
# models/gemini-2.5-flash-native-audio-latest
# models/gemini-2.5-flash-native-audio-preview-09-2025
# models/gemini-2.5-flash-native-audio-preview-12-2025

def ask_gemini(
    promt: str,
    model: str = "gemini-flash-lite-latest",
    temperature: float = 0.7,
    max_output_tokens: int = 8192,
    top_p: float = 0.95,
    top_k: int = 40,
    max_retries: int = 3
) -> str:
    """
    Point d'entrée UNIQUE vers Gemini
    """
    for attempt in range(1, max_retries + 1):
        try:
            response = client.models.generate_content(
                model=model,
                contents=promt,
                config={
                    "temperature": temperature,
                    "max_output_tokens": max_output_tokens,
                    "top_p": top_p,
                    "top_k": top_k,
                }
            )

            if response is None:
                raise ValueError("Réponse Gemini vide")

            # Extraction robuste du texte
            if hasattr(response, "text") and response.text:
                return response.text.strip()

            if hasattr(response, "candidates") and response.candidates:
                parts = response.candidates[0].content.parts
                if parts and hasattr(parts[0], "text"):
                    return parts[0].text.strip()

            raise ValueError("Aucun texte retourné par Gemini")

        except ServerError as e:
            if e.status_code == 503 and attempt < max_retries:
                wait = 10 * attempt
                print(f"⚠️ Gemini surchargé (503). Retry dans {wait}s...")
                time.sleep(wait)
                continue
            raise

        except APIError as e:
            raise ValueError(f"Erreur API Gemini : {e}")

    raise ValueError("Échec Gemini après plusieurs tentatives")
