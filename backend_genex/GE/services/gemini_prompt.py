# services/gemini_prompt.py
def build_exercise_generation_prompt(document_text: str, config: dict) -> str:
    """
    Prompt optimisé pour générer des exercices de qualité avec JSON strict
    """
    exercises_cfg = config.get("exercises", {})
    total_exercises = exercises_cfg.get("total", 5)
    exercise_types = exercises_cfg.get("types", [])
    
    # Description des types
    type_descriptions = []
    for ex_type in exercise_types:
        type_name = ex_type.get('type', 'UNKNOWN')
        count = ex_type.get('count', 0)
        q_per_ex = ex_type.get('questions_per_exercise', 1)
        
        desc = f"- {type_name} : {count} exercice(s)"
        if q_per_ex > 1:
            desc += f" avec {q_per_ex} questions chacun"
        
        type_descriptions.append(desc)
    
    types_str = "\n".join(type_descriptions) if type_descriptions else "Non spécifié"
    
    # Document source sécurisé
    safe_document = document_text[:40000]
    
    # Échapper les caractères problématiques dans le document
    safe_document = safe_document.replace('\\', '\\\\')
    safe_document = safe_document.replace('"', '\\"')
    safe_document = safe_document.replace('\n', '\\n')
    safe_document = safe_document.replace('\r', '\\r')
    safe_document = safe_document.replace('\t', '\\t')

    prompt = f"""Tu es un expert en pédagogie universitaire.

MISSION : Génère EXACTEMENT {total_exercises} exercices au format JSON STRICT basés sur le document fourni.

# RÈGLES JSON CRITIQUES
1. Réponds UNIQUEMENT avec du JSON pur (PAS de texte avant/après, PAS de balises ```json```)
2. Échappe TOUS les guillemets doubles dans les textes : \\"
3. Échappe TOUS les backslashes : \\\\ pour \\, \\\\n pour saut de ligne
4. Pas de virgules en fin de tableau ou d'objet
5. Tous les champs de texte doivent être en français

# FORMULES MATHÉMATIQUES
- Pour LaTeX, DOUBLE les backslashes : \\\\frac{{1}}{{2}}, \\\\int, \\\\sum
- Inline math : $x^2 + y = 5$
- Display math : $$\\\\int_0^\\\\infty e^{{-x}} \\\\, dx = 1$$

# FORMAT JSON EXACT
{{
  "exercises": [
    {{
      "exercise_type": "MCQ",
      "questions": [
        {{
          "question": "Texte de la question...",
          "choices": ["Choix A", "Choix B", "Choix C", "Choix D"],
          "correct_answer": "Choix B",
          "explanation": "Explication détaillée...",
          "difficulty_level": 2
        }}
      ]
    }}
  ],
  "metadata": {{
    "exercises_count": {total_exercises},
    "status": "success"
  }}
}}

# CONFIGURATION
Total exercices : {total_exercises}
Types d'exercices :
{types_str}

# DOCUMENT SOURCE
{safe_document}

# INSTRUCTIONS FINALES
- Génère EXACTEMENT {total_exercises} exercices
- Chaque exercice doit avoir au moins 1 question
- Utilise le contenu du document
- Les textes doivent être en français correct
- Les formules mathématiques en LaTeX avec backslashes doublés
- Réponds UNIQUEMENT avec le JSON (pas d'autre texte)
"""
    return prompt