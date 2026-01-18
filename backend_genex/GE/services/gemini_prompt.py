# services/gemini_prompt.py

def build_exercise_generation_prompt(document_text: str, config: dict) -> str:
    """
    Construit un prompt complet pour Gemini, en extrayant toutes les informations
    de la config pour générer un JSON valide avec corrigés pour tous les types d'exercices.
    """
    exercises_cfg = config.get("exercises", {})
    total_exercises = exercises_cfg.get("total", 10)
    exercise_types = exercises_cfg.get("types", [])
    difficulty = exercises_cfg.get("difficulty", {})
    ped_objectives = exercises_cfg.get("pedagogical_objectives", {})

    # Source et filtrage
    source_scope = config.get("source_scope", {})
    content_focus = source_scope.get("content_focus", {})
    content_filtering = source_scope.get("content_filtering", {})

    # Scaffolding
    scaffolding = config.get("scaffolding", {})

    # Correction et barème
    correction = config.get("correction", {})
    scoring_system = correction.get("scoring_system", {})
    points_distribution = correction.get("points_distribution", {})

    # Assessment
    assessment = config.get("assessment", {})

    # Output
    output = config.get("output", {})
    layout = output.get("layout", {})
    structure = output.get("structure", {})
    delivery = output.get("delivery", {})

    # Metadata
    metadata = config.get("metadata", {})

    # Décrire les types d'exercices
    type_descriptions = []
    for ex_type in exercise_types:
        desc = f"- {ex_type.get('type', 'UNKNOWN')} ({ex_type.get('label', '')}): {ex_type.get('count', 0)} exercices"
        if ex_type.get('questions_per_exercise'):
            desc += f", {ex_type['questions_per_exercise']} questions par exercice"
        desc += f", niveau difficulté: {ex_type.get('difficulty_level', 'N/A')}"
        type_descriptions.append(desc)
    types_str = "\n".join(type_descriptions)

    # Construire le prompt
    prompt = f"""
Tu es un expert en création d'exercices pédagogiques et en pédagogie avancée.
Génère **{total_exercises} exercices** à partir du document fourni.

# INSTRUCTIONS IMPORTANTES
1. Retourne **UNIQUEMENT** un JSON valide.
2. Pas de texte avant ou après le JSON.
3. Évite les caractères d'échappement inutiles.
4. Utilise des guillemets doubles pour toutes les clés et valeurs string.
5. Échappe correctement les caractères spéciaux (\\, ", etc.).

# FORMATAGE DU CONTENU (CRUCIAL)
- Utilise le format **Markdown** pour le texte (gras, italique, listes).
- Pour les formules mathématiques, utilise le format **LaTeX** entouré de dollars (ex: $E=mc^2$).
- Sois précis et académique dans le ton.

# GRAPHIQUES
Si une question nécessite un support visuel (courbe de fonction, histogramme), ajoute un champ "graph" dans l'objet question.
Exemple: "graph": { "type": "function", "expression": "x**2 - 4", "x_range": [-5, 5], "title": "Parabole" }

# CONFIGURATION DEMANDÉE
Total d'exercices: {total_exercises}
Types d'exercices demandés:
{types_str}

Niveaux de difficulté globaux: {difficulty.get('global_level', 'N/A')}
Distribution des difficultés: {difficulty.get('distribution', {})}
Objectifs pédagogiques: {ped_objectives}

# SOURCE
Utiliser le document fourni (sections, exemples, diagrammes, définitions, exercices).
Filtrer pour inclure concepts clés, contenu récent, et éviter les doublons.

# SCAFFOLDING
Fournir indices: {scaffolding.get('provide_hints', True)}, niveau: {scaffolding.get('hint_level', 'MODERATE')}
Inclure exemples, fiches de formules, glossaire selon la config.

# CORRECTION
Toutes les questions doivent avoir:
- correct_answer
- explication détaillée
- barème si applicable
Points par type: {points_distribution}
Système de correction automatique: {scoring_system.get('auto_correct', [])}
Ne laisse aucune question sans corrigé.

# ASSESSMENT
Formative: {assessment.get('formative', True)}, Summative: {assessment.get('summative', False)}
Self-assessment: {assessment.get('self_assessment', True)}, Peer-assessment: {assessment.get('peer_assessment', False)}

# OUTPUT
Format: {output.get('format', 'PDF')}, Numérotation: {output.get('numbering', 'AUTO')}
Structure: {structure}
Mise en page: {layout}
Livraison: {delivery}

# FORMAT JSON REQUIS
{{
  "exercises": [
    {{
      "exercise_type": "MCQ",
      "questions": [
        {{
          "question": "Texte de la question",
          "choices": ["Choix 1", "Choix 2", "Choix 3", "Choix 4"],
          "correct_answer": "Choix correct",
          "explanation": "Explication détaillée",
          "difficulty_level": 2,
          "graph": { "type": "function", "expression": "x**2", "x_range": [-10, 10] }
        }}
      ]
    }}
  ],
  "metadata": {{
    "exercises_count": {total_exercises},
    "total_questions": 0,
    "status": "success"
  }}
}}

# DOCUMENT SOURCE
{document_text[:250000]}

# GÉNÈRE MAINTENANT tous les exercices selon la configuration.
Chaque exercice doit avoir **correct_answer** et **explanation**, même pour les questions ouvertes ou de réflexion.
Le JSON doit être parfaitement valide.
"""

    return prompt
