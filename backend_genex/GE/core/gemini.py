from dotenv import load_dotenv
import os
from google import genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY manquant")

client = genai.Client(api_key=GEMINI_API_KEY)


def list_models() -> list[str]:
    print("Modèles Gemini disponibles :")
    for model in client.models.list():
        print(model.name)
    return [model.name for model in client.models.list()]
# ./core/gemini.py

# from dotenv import load_dotenv
# import os
# from google import genai

# load_dotenv()

# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# if not GEMINI_API_KEY:
#     raise RuntimeError("GEMINI_API_KEY manquant")

# client = genai.Client(api_key=GEMINI_API_KEY)


# def list_gemini_models() -> list[dict]:
#     """
#     Retourne la liste des modèles Gemini disponibles avec name et description
#     """
#     models_info = []
#     print("Modèles Gemini disponibles :")
#     for model in client.models.list():
#         info = {"name": model.name, "description": getattr(model, "description", "")}
#         models_info.append(info)
#         print(f"{info['name']}: {info['description']}")
#     return models_info


# if __name__ == "__main__":
#     # Ça s'exécutera seulement si tu lances python ./core/gemini.py
#     list_gemini_models()
