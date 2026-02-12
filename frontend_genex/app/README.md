# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.





{
    "user_id": "cf03367d-2d2f-4a04-8e45-1b51c960a39b",
    "document_id": "182cd8b3-58a7-4e9b-b6a1-1c36b5e82803",
    "title": "Nouveau projet pédagogique",
    "config": {
        "generation_mode": "EXERCISES",
        "language": {
            "source": "fr",
            "target": "fr"
        },
        "exercises": {
            "total": 25,
            "difficulty": {
                "mode": "MIXED",
                "global_level": 3,
                "scale": {
                    "min": 1,
                    "max": 5
                },
                "distribution": {
                    "EASY": 30,
                    "MEDIUM": 40,
                    "HARD": 20,
                    "EXPERT": 10
                }
            },
            "types": [
                {
                    "type": "MCQ",
                    "label": "Questions à Choix Multiple",
                    "count": 6,
                    "questions_per_exercise": 5,
                    "difficulty_level": 2,
                    "bloom_taxonomy": [
                        "remember",
                        "understand"
                    ],
                    "options": {
                        "choices_count": 4,
                        "multiple_answers": false,
                        "include_none_of_the_above": true,
                        "include_all_of_the_above": true,
                        "shuffle_options": true,
                        "show_confidence_level": false
                    }
                },
                {
                    "type": "FILL_IN",
                    "label": "Texte à trous",
                    "count": 5,
                    "questions_per_exercise": 3,
                    "difficulty_level": 3,
                    "bloom_taxonomy": [
                        "understand",
                        "apply"
                    ],
                    "options": {
                        "case_sensitive": false,
                        "hints_enabled": true,
                        "allow_partial_words": false,
                        "blanks_per_sentence": 1,
                        "context_before_after": 2
                    }
                },
                {
                    "type": "OPEN",
                    "label": "Questions ouvertes",
                    "count": 4,
                    "questions_per_exercise": 1,
                    "difficulty_level": 4,
                    "bloom_taxonomy": [
                        "apply",
                        "analyze"
                    ],
                    "options": {
                        "expected_length": "MEDIUM",
                        "word_limit": 200,  
                        "require_justification": true,
                        "scoring_rubric": {
                            "criteria": [
                                "pertinence",
                                "clarté",
                                "exhaustivité"
                            ],
                            "max_points": 10
                        }
                    }
                },
                {
                    "type": "REFLECTION",
                    "label": "Questions de réflexion",
                    "count": 3,
                    "questions_per_exercise": 1,
                    "difficulty_level": 4,
                    "bloom_taxonomy": [
                        "analyze",
                        "evaluate"
                    ],
                    "options": {
                        "prompt_type": "critical_thinking",
                        "require_personal_opinion": true,
                        "require_examples": true,
                        "connect_to_real_life": true,
                        "scaffolding": {
                            "provide_guidance_questions": true,
                            "suggest_resources": true
                        }
                    }
                },
                {
                    "type": "CASE_STUDY",
                    "label": "Études de cas",
                    "count": 2,
                    "questions_per_exercise": 1,
                    "difficulty_level": 5,
                    "bloom_taxonomy": [
                        "analyze",
                        "evaluate",
                        "create"
                    ],
                    "options": {
                        "case_length": "MEDIUM",
                        "include_data": true,
                        "include_context": true,
                        "sub_questions": 3,
                        "sub_question_types": [
                            "MCQ",
                            "OPEN",
                            "REFLECTION"
                        ],
                        "require_solution_proposal": true,
                        "evaluation_criteria": [
                            "analyse",
                            "méthodologie",
                            "solution"
                        ]
                    }
                },
                {
                    "type": "COMPETENCE",
                    "label": "Exercices de compétence",
                    "count": 3,
                    "questions_per_exercise": 1,
                    "difficulty_level": 4,
                    "bloom_taxonomy": [
                        "apply",
                        "create"
                    ],
                    "options": {
                        "competence_type": "practical_application",
                        "scenario_based": true,
                        "require_procedure": true,
                        "steps_to_follow": 3,
                        "include_constraints": true,
                        "success_criteria": [
                            "efficacité",
                            "précision",
                            "méthode"
                        ]
                    }
                },
                {
                    "type": "PROBLEM_SOLVING",
                    "label": "Résolution de problèmes",
                    "count": 2,
                    "questions_per_exercise": 1,
                    "difficulty_level": 5,
                    "bloom_taxonomy": [
                        "apply",
                        "analyze",
                        "create"
                    ],
                    "options": {
                        "problem_complexity": "HIGH",
                        "require_multiple_steps": true,
                        "include_diagrams": true,
                        "verification_steps": true,
                        "alternative_solutions": true
                    }
                }
            ],
            "pedagogical_objectives": {
                "knowledge_acquisition": 40,
                "skill_development": 35,
                "critical_thinking": 25,
                "practical_application": 30
            }
        },
        "source_scope": {
            "use_full_document": true,
            "sections": [],
            "content_focus": {
                "theoretical_concepts": true,
                "examples": true,
                "exercises": true,
                "definitions": true,
                "diagrams": true,
                "tables": true
            },
            "content_filtering": {
                "include_recent_content": true,
                "include_key_concepts": true,
                "balance_topics": true,
                "avoid_duplicates": true
            }
        },
        "scaffolding": {
            "provide_hints": true,
            "hint_level": "MODERATE",
            "include_examples": true,
            "step_by_step_guidance": false,
            "formula_sheet": true,
            "glossary_terms": true
        },
        "correction": {
            "generate_answers": true,
            "detail_level": "DETAILED",
            "include_explanations": true,
            "include_rubrics": true,
            "model_solutions": true,
            "common_errors": true,
            "points_distribution": {
                "MCQ": 1,
                "FILL_IN": 2,
                "OPEN": 5,
                "REFLECTION": 8,
                "CASE_STUDY": 15,
                "COMPETENCE": 10,
                "PROBLEM_SOLVING": 12
            },
            "scoring_system": {
                "manual_correct": [],
                "auto_correct": [
                    "OPEN",
                    "REFLECTION",
                    "CASE_STUDY",
                    "COMPETENCE",
                    "PROBLEM_SOLVING",
                    "MCQ",
                    "FILL_IN"
                ],
                "partial_credit": true
            }
        },
        "assessment": {
            "formative": true,
            "summative": false,
            "self_assessment": true,
            "peer_assessment": false,
            "learning_outcomes": [
                "comprendre_les_concepts",
                "appliquer_les_méthodes",
                "analyser_des_situations",
                "évaluer_des_solutions"
            ]
        },
        "output": {
            "shuffle_exercises": false,
            "shuffle_questions": false,
            "numbering": "AUTO",
            "format": "PDF",
            "structure": {
                "cover_page": true,
                "instructions_page": true,
                "table_of_contents": false,
                "appendices": true,
                "answer_sheet_separate": true
            },
            "layout": {
                "font_size": 12,
                "line_spacing": 1.5,
                "margins": "normal",
                "header_footer": true,
                "page_numbers": true
            },
            "delivery": {
                "generate_single_pdf": true,
                "generate_zip_package": true,
                "include_source_material": false,
                "qr_code_for_answers": true
            }
        },
        "metadata": {
            "version": "2.0",
            "subject_area": "Sciences",
            "educational_level": "Licence",
            "estimated_completion_time": "120 minutes",
            "total_points": 150,
            "created_with_template": "advanced_pedagogical"
        }
    }
}
