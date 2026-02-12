import os
from openai import OpenAI

# Configuration
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_BASE_URL = "https://api.deepseek.com"

if not DEEPSEEK_API_KEY:
    raise ValueError("La clé API DeepSeek n'est pas définie dans les variables d'environnement.")


# Client OpenAI compatible Deepseek

client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL)

def get_deepseek_client():
    """Retourne le client Deepseek configuré"""
    return client

def get_default_model():
    """Retourne le modèle pa défaut"""
    return "deepseek-chat" # Ou "deepseek-coder" pour du code