# services/deepseek_serv.py
import json
import os
from openai import OpenAI
from typing import Optional

# Configuration
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")

def ask_deepseek(prompt: str, max_output_tokens: int = 2048, temperature: float = 0.7) -> str:
    """
    Interface compatible avec ask_gemini - utilise max_output_tokens
    """
    print(f"🤖 DeepSeek appelé avec max_output_tokens={max_output_tokens}")
    
    # Mode mock si pas de clé API
    if not DEEPSEEK_API_KEY:
        print("🔧 Mode mock activé (pas de clé API DeepSeek)")
        return generate_mock_response()
    
    try:
        client = OpenAI(
            api_key=DEEPSEEK_API_KEY,
            base_url="https://api.deepseek.com"
        )
        
        print(f"📤 Envoi requête à DeepSeek...")
        print(f"📝 Prompt ({len(prompt)} caractères): {prompt[:200]}...")
        
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {
                    "role": "system", 
                    "content": """Tu es un expert en pédagogie universitaire. 
                    Génère des exercices éducatifs au format JSON strict.
                    Réponds UNIQUEMENT avec un objet JSON valide.
                    Format requis: {"exercises": [{"exercise_type": "...", "questions": [...]}]}"""
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            max_tokens=max_output_tokens,  # OpenAI utilise max_tokens
            temperature=temperature,
            
            response_format={"type": "json_object"}
        )
        
        result = response.choices[0].message.content
        print(f"✅ Réponse DeepSeek reçue ({len(result)} caractères)")
        print(f"📄 Début réponse: {result[:200]}...")
        return result
        
    except Exception as e:
        print(f"❌ Erreur DeepSeek API: {e}")
        # Retourner mock en cas d'erreur
        return generate_mock_response()

def generate_mock_response() -> str:
    """Génère une réponse mock de qualité pour le développement"""
    print("🤖 Génération de réponse mock...")
    
    mock_data = {
        "exercises": [
            {
                "exercise_type": "MCQ",
                "questions": [
                    {
                        "question": "Quelle est la définition principale du Cloud Computing?",
                        "choices": [
                            "Stockage local de données sur un disque dur",
                            "Accès à distance à des ressources informatiques via internet",
                            "Programmation sur serveur physique personnel", 
                            "Réseau local d'entreprise privé"
                        ],
                        "correct_answer": "Accès à distance à des ressources informatiques via internet",
                        "explanation": "Le Cloud Computing permet d'accéder à des ressources informatiques (serveurs, stockage, bases de données, applications) via internet, sans avoir à gérer l'infrastructure physique.",
                        "difficulty_level": 2
                    },
                    {
                        "question": "Quel modèle de service cloud offre le plus haut niveau de contrôle à l'utilisateur?",
                        "choices": [
                            "SaaS (Software as a Service)",
                            "PaaS (Platform as a Service)",
                            "IaaS (Infrastructure as a Service)", 
                            "FaaS (Function as a Service)"
                        ],
                        "correct_answer": "IaaS (Infrastructure as a Service)",
                        "explanation": "IaaS offre le plus de contrôle car l'utilisateur gère le système d'exploitation, les applications, les données, le runtime, etc., tandis que le fournisseur gère seulement l'infrastructure physique.",
                        "difficulty_level": 3
                    }
                ]
            },
            {
                "exercise_type": "FILL_IN",
                "questions": [
                    {
                        "question": "Le modèle ______ comme Service (PaaS) fournit une plateforme complète pour développer, tester et déployer des applications.",
                        "correct_answer": "Platform",
                        "explanation": "PaaS (Platform as a Service) offre un environnement de développement complet dans le cloud.",
                        "difficulty_level": 2
                    }
                ]
            },
            {
                "exercise_type": "OPEN",
                "questions": [
                    {
                        "question": "Expliquez brièvement la différence entre Cloud public et Cloud privé.",
                        "correct_answer": "Cloud public: partagé, économique. Cloud privé: dédié, sécurisé.",
                        "explanation": "Public pour le coût réduit, privé pour la sécurité et le contrôle.",
                        "difficulty_level": 3
                    }
                ]
            }
        ],
        "metadata": {
            "exercises_count": 3,
            "status": "success"
        }
    }
    
    return json.dumps(mock_data, ensure_ascii=False, indent=2)