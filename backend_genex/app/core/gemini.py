from dotenv import load_dotenv
import os
from google import genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY manquant")

client = genai.Client(api_key=GEMINI_API_KEY)


def list_models() -> list[str]:
    return [model.name for model in client.models.list()]
