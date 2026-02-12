"""
Service de génération de PDF avec WeasyPrint (HTML → PDF)
Version professionnelle avec support mathématique amélioré
"""
import os
import re
from pathlib import Path
from typing import List, Dict, Optional
from uuid import uuid4
from weasyprint import HTML
from jinja2 import Template
from datetime import datetime

# Configuration des répertoires
BASE_DIR = Path(__file__).parent.parent
OUTPUT_DIR = BASE_DIR / "generated_pdfs"
TEMPLATES_DIR = BASE_DIR / "templates"
FONTS_DIR = BASE_DIR / "fonts"

# Créer les dossiers s'ils n'existent pas
OUTPUT_DIR.mkdir(exist_ok=True)
TEMPLATES_DIR.mkdir(exist_ok=True)
FONTS_DIR.mkdir(exist_ok=True)


class PDFGenerationError(Exception):
    """Erreur lors de la génération PDF"""
    pass


# Template HTML pour les exercices
EXERCISE_TEMPLATE = """
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>{{ title }}</title>
    <style>
        /* Police pour les formules mathématiques */
        @font-face {
            font-family: 'MathFont';
            src: local('Cambria Math'), local('DejaVu Math TeX Gyre'), local('Latin Modern Math'), local('STIX Two Math');
            unicode-range: U+00-7F, U+A0, U+2000-206F, U+2200-22FF, U+2A00-2AFF;
        }
        
        @page {
            size: A4;
            margin: 1.8cm 1.5cm 2cm 1.5cm;
            
            @top-left {
                content: "Feuille d'exercices";
                font-size: 9pt;
                color: #3498db;
                font-weight: bold;
                vertical-align: bottom;
                padding-bottom: 3px;
                border-bottom: 1px solid #ecf0f1;
                width: 30%;
            }
            
            @top-right {
                content: "GenEX-APP";
                font-size: 9pt;
                color: #2c3e50;
                font-weight: bold;
                vertical-align: bottom;
                padding-bottom: 3px;
                border-bottom: 1px solid #ecf0f1;
                width: 30%;
                text-align: right;
            }
            
            @top-center {
                content: "{{ short_title|default(title) }}";
                font-size: 11pt;
                color: #2c3e50;
                font-weight: bold;
                vertical-align: bottom;
                padding-bottom: 3px;
                border-bottom: 1px solid #ecf0f1;
                width: 40%;
            }
            
            @bottom-center {
                content: "Page " counter(page) " sur " counter(pages);
                font-size: 8pt;
                color: #95a5a6;
                padding-top: 8px;
                border-top: 1px solid #ecf0f1;
            }
            
            @bottom-left {
                content: "{{ generation_date }}";
                font-size: 8pt;
                color: #95a5a6;
                font-style: italic;
                padding-top: 8px;
            }
            
            @bottom-right {
                content: "{{ sheet_id|truncate(10, true, '') }}";
                font-size: 8pt;
                color: #95a5a6;
                font-style: italic;
                padding-top: 8px;
            }
        }
        
        body {
            font-family: 'Segoe UI', 'DejaVu Sans', 'Roboto', Arial, sans-serif;
            font-size: 10.5pt;
            line-height: 1.5;
            color: #2c3e50;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
        }
        
        .document-title {
            text-align: center;
            color: #2c3e50;
            font-size: 20pt;
            margin: 10px 0 5px 0;
            padding-bottom: 12px;
            position: relative;
        }
        
        .document-title:after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 30%;
            right: 30%;
            height: 2px;
            background: linear-gradient(to right, transparent, #3498db, transparent);
        }
        
        .document-subtitle {
            text-align: center;
            color: #7f8c8d;
            font-size: 11pt;
            margin-bottom: 20px;
            font-weight: normal;
        }
        
        .document-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            padding: 10px 15px;
            background: #f8f9fa;
            border-radius: 6px;
            border-left: 3px solid #3498db;
            font-size: 9pt;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
            min-width: 120px;
        }
        
        .info-label {
            font-weight: bold;
            color: #3498db;
            font-size: 8pt;
            margin-bottom: 1px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        
        .exercises-container {
            column-count: 1;
            column-gap: 25px;
        }
        
        @media print {
            .exercises-container {
                column-count: 1;
            }
        }
        
        .exercise {
            break-inside: avoid;
            margin-bottom: 25px;
            padding: 18px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            border: 1px solid #e0e6ed;
            position: relative;
            min-height: 180px;
        }
        
        .exercise.compact {
            margin-bottom: 20px;
            padding: 15px;
            min-height: 160px;
        }
        
        .exercise-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
        }
        
        .exercise-number {
            font-weight: bold;
            color: #3498db;
            font-size: 11pt;
            background: #e3f2fd;
            padding: 3px 8px;
            border-radius: 4px;
            min-width: 28px;
            text-align: center;
            display: inline-block;
        }
        
        .exercise-type {
            display: inline-block;
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 9pt;
            font-weight: bold;
            letter-spacing: 0.3px;
            text-transform: uppercase;
            margin-left: 8px;
        }
        
        .question {
            margin: 12px 0;
            padding: 15px;
            background: #f8fafc;
            border-left: 3px solid #3498db;
            border-radius: 5px;
            font-size: 11pt;
            line-height: 1.6;
        }
        
        .question.compact {
            padding: 12px;
            margin: 10px 0;
            font-size: 10.5pt;
        }
        
        .choices {
            list-style: none;
            padding-left: 0;
            margin: 15px 0 10px 0;
        }
        
        .choices li {
            padding: 8px 12px 8px 32px;
            margin: 5px 0;
            background: white;
            border: 1px solid #e0e6ed;
            border-radius: 4px;
            position: relative;
            font-size: 10.5pt;
            line-height: 1.4;
        }
        
        .choices li:before {
            content: "□";
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #3498db;
            font-weight: bold;
            font-size: 11pt;
        }
        
        .answer-space {
            min-height: 60px;
            border: 1px dashed #d1d9e6;
            border-radius: 5px;
            margin: 12px 0;
            padding: 12px;
            background: linear-gradient(45deg, #fafbfc 25%, transparent 25%, transparent 50%, #fafbfc 50%, #fafbfc 75%, transparent 75%, transparent);
            background-size: 20px 20px;
            position: relative;
        }
        
        .answer-space.compact {
            min-height: 50px;
            padding: 10px;
            margin: 10px 0;
        }
        
        .answer-space:before {
            content: "Réponse";
            position: absolute;
            top: -8px;
            left: 10px;
            background: white;
            padding: 0 8px;
            color: #95a5a6;
            font-size: 9pt;
            font-style: italic;
        }
        
        .answer-section {
            background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
            padding: 15px;
            margin: 15px 0 10px 0;
            border-left: 3px solid #4caf50;
            border-radius: 6px;
            position: relative;
        }
        
        .answer-label {
            font-weight: bold;
            color: #2e7d32;
            margin-bottom: 8px;
            font-size: 10.5pt;
            display: flex;
            align-items: center;
        }
        
        .answer-label:before {
            content: "✓";
            margin-right: 6px;
            font-size: 11pt;
        }
        
        .explanation {
            background: linear-gradient(135deg, #fff3cd, #ffeaa7);
            padding: 12px;
            margin-top: 10px;
            border-left: 3px solid #ffc107;
            border-radius: 6px;
            font-size: 10pt;
        }
        
        .explanation-label {
            font-weight: bold;
            color: #856404;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            font-size: 10pt;
        }
        
        .explanation-label:before {
            content: "💡";
            margin-right: 6px;
            font-size: 10pt;
        }
        
        .difficulty {
            display: inline-block;
            padding: 2px 8px;
            background: linear-gradient(135deg, #e0e0e0, #bdbdbd);
            border-radius: 10px;
            font-size: 8pt;
            font-weight: bold;
            color: #2c3e50;
            letter-spacing: 0.3px;
            margin-left: 5px;
        }
        
        .difficulty-level-1 { 
            background: linear-gradient(135deg, #a5d6a7, #66bb6a); 
            color: white; 
        }
        .difficulty-level-2 { 
            background: linear-gradient(135deg, #ffcc80, #ffa726); 
            color: white; 
        }
        .difficulty-level-3 { 
            background: linear-gradient(135deg, #ef9a9a, #f44336); 
            color: white; 
        }
        
        .math-container {
            display: inline-block;
            font-family: 'MathFont', 'Cambria Math', 'DejaVu Serif', 'Times New Roman', serif;
            font-style: normal;
            background: #f8f9fa;
            padding: 1px 6px;
            border-radius: 3px;
            border: 1px solid #e0e0e0;
            margin: 0 2px;
            vertical-align: middle;
        }
        
        .math-sup {
            font-size: 0.8em;
            vertical-align: super;
            line-height: 0;
        }
        
        .math-sub {
            font-size: 0.8em;
            vertical-align: sub;
            line-height: 0;
        }
        
        .math-frac {
            display: inline-block;
            text-align: center;
            vertical-align: middle;
            margin: 0 2px;
        }
        
        .math-frac-num {
            display: block;
            border-bottom: 1px solid #333;
            padding-bottom: 1px;
        }
        
        .math-frac-den {
            display: block;
            padding-top: 1px;
        }
        
        .points {
            font-size: 9pt;
            color: #7f8c8d;
            font-weight: bold;
            margin-left: 8px;
            background: #f5f7fa;
            padding: 1px 6px;
            border-radius: 3px;
        }
        
        .correction-badge {
            background: linear-gradient(135deg, #4caf50, #2e7d32);
            color: white;
            padding: 2px 10px;
            border-radius: 3px;
            font-size: 9pt;
            font-weight: bold;
            position: absolute;
            top: -8px;
            right: 15px;
            box-shadow: 0 1px 3px rgba(46, 125, 50, 0.3);
            z-index: 1;
        }
        
        .page-break-avoid {
            page-break-inside: avoid;
        }
        
        .compact-mode .exercise {
            margin-bottom: 15px;
            padding: 12px;
        }
        
        .compact-mode .question {
            padding: 10px;
            margin: 8px 0;
        }
        
        .compact-mode .answer-space {
            min-height: 40px;
            padding: 8px;
        }
        
        .footer-note {
            text-align: center;
            font-size: 8pt;
            color: #95a5a6;
            margin-top: 30px;
            padding-top: 12px;
            border-top: 1px solid #ecf0f1;
            font-style: italic;
            clear: both;
        }
        
        /* Styles pour optimiser la densité */
        .dense-layout .exercise {
            margin-bottom: 15px;
            padding: 14px;
        }
        
        .dense-layout .question {
            padding: 12px;
            margin: 10px 0;
            font-size: 10.5pt;
        }
        
        .dense-layout .answer-space {
            min-height: 50px;
            padding: 10px;
            margin: 10px 0;
        }
    </style>
</head>
<body class="{{ 'dense-layout' if exercises|length >= 8 else '' }}">
    <h1 class="document-title">{{ title }}</h1>
    {% if not include_answers %}
    <div class="document-subtitle">Feuille d'exercices pédagogiques</div>
    {% else %}
    <div class="document-subtitle">Corrigé détaillé</div>
    {% endif %}
    
    <div class="document-info">
        <div class="info-item">
            <span class="info-label">Exercices</span>
            <span>{{ exercises|length }} au total</span>
        </div>
        <div class="info-item">
            <span class="info-label">Généré le</span>
            <span>{{ generation_date }}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Référence</span>
            <span>{{ sheet_id[:8] }}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Format</span>
            <span>{% if include_answers %}Corrigé{% else %}Élève{% endif %}</span>
        </div>
    </div>
    
    <div class="exercises-container">
    {% for exercise in exercises %}
    <div class="exercise page-break-avoid">
        {% if include_answers %}
        <div class="correction-badge">CORRIGÉ</div>
        {% endif %}
        
        <div class="exercise-header">
            <div>
                <span class="exercise-number">{{ loop.index }}</span>
                <span class="exercise-type">{{ exercise.type_display }}</span>
                {% if exercise.difficulty %}
                <span class="difficulty difficulty-level-{{ exercise.difficulty }}">
                    Niv.{{ exercise.difficulty }}
                </span>
                {% endif %}
            </div>
            {% if exercise.points %}
            <span class="points">{{ exercise.points }} pts</span>
            {% endif %}
        </div>
        
        <div class="question {{ 'compact' if exercises|length >= 8 else '' }}">
            {{ exercise.question_html|safe }}
        </div>
        
        {% if exercise.choices %}
        <ul class="choices">
            {% for choice in exercise.choices %}
            <li>{{ choice|safe }}</li>
            {% endfor %}
        </ul>
        {% endif %}
        
        {% if not include_answers and exercise.exercise_type in ['OPEN', 'SHORT_ANSWER', 'FILL_IN', 'TRUE_FALSE'] %}
        <div class="answer-space {{ 'compact' if exercises|length >= 8 else '' }}"></div>
        {% endif %}
        
        {% if include_answers %}
        <div class="answer-section">
            <div class="answer-label">Réponse</div>
            <div>{{ exercise.correct_answer|safe }}</div>
        </div>
        
        {% if exercise.explanation %}
        <div class="explanation">
            <div class="explanation-label">Explication</div>
            <div>{{ exercise.explanation|safe }}</div>
        </div>
        {% endif %}
        {% endif %}
    </div>
    {% endfor %}
    </div>
    
    <div class="footer-note">
        Document généré par GenEX-APP • 
        {% if not include_answers %}
        Réponses à rédiger sur cette feuille
        {% else %}
        Corrigé pédagogique à usage interne
        {% endif %}
    </div>
</body>
</html>
"""


class MathFormatter:
    """Classe pour formater les expressions mathématiques"""
    
    @staticmethod
    def format_superscript(text: str) -> str:
        """Convertit les exposants"""
        sup_map = {
            '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
            '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
            '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
            'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ',
            'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ',
            'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ',
            'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ',
            'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ'
        }
        
        def replace_sup(match):
            content = match.group(1)
            result = []
            for char in content:
                result.append(sup_map.get(char, char))
            return f'<span class="math-sup">{"".join(result)}</span>'
        
        return re.sub(r'\^\{?([^}]+)\}?', replace_sup, text)
    
    @staticmethod
    def format_subscript(text: str) -> str:
        """Convertit les indices"""
        sub_map = {
            '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
            '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
            '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
            'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
            'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
            'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
            'v': 'ᵥ', 'x': 'ₓ'
        }
        
        def replace_sub(match):
            content = match.group(1)
            result = []
            for char in content:
                result.append(sub_map.get(char, char))
            return f'<span class="math-sub">{"".join(result)}</span>'
        
        return re.sub(r'_\{?([^}]+)\}?', replace_sub, text)
    
    @staticmethod
    def format_fraction(text: str) -> str:
        """Convertit les fractions simples \frac{a}{b}"""
        def replace_frac(match):
            num = match.group(1).strip()
            den = match.group(2).strip()
            return f'<span class="math-frac"><span class="math-frac-num">{num}</span><span class="math-frac-den">{den}</span></span>'
        
        text = re.sub(r'\\frac\{([^}]+)\}\{([^}]+)\}', replace_frac, text)
        text = re.sub(r'(\d+)/(\d+)', r'\\frac{\1}{\2}', text)
        return re.sub(r'\\frac\{([^}]+)\}\{([^}]+)\}', replace_frac, text)
    
    @staticmethod
    def format_sqrt(text: str) -> str:
        """Convertit les racines carrées"""
        def replace_sqrt(match):
            content = match.group(1).strip()
            return f'√({content})'
        return re.sub(r'\\sqrt\{([^}]+)\}', replace_sqrt, text)
    
    @staticmethod
    def format_greek(text: str) -> str:
        """Convertit les lettres grecques"""
        greek_map = {
            'alpha': 'α', 'beta': 'β', 'gamma': 'γ', 'delta': 'δ',
            'epsilon': 'ε', 'zeta': 'ζ', 'eta': 'η', 'theta': 'θ',
            'iota': 'ι', 'kappa': 'κ', 'lambda': 'λ', 'mu': 'μ',
            'nu': 'ν', 'xi': 'ξ', 'pi': 'π', 'rho': 'ρ',
            'sigma': 'σ', 'tau': 'τ', 'phi': 'φ', 'chi': 'χ',
            'psi': 'ψ', 'omega': 'ω',
            'Alpha': 'Α', 'Beta': 'Β', 'Gamma': 'Γ', 'Delta': 'Δ',
            'Epsilon': 'Ε', 'Zeta': 'Ζ', 'Eta': 'Η', 'Theta': 'Θ',
            'Iota': 'Ι', 'Kappa': 'Κ', 'Lambda': 'Λ', 'Mu': 'Μ',
            'Nu': 'Ν', 'Xi': 'Ξ', 'Pi': 'Π', 'Rho': 'Ρ',
            'Sigma': 'Σ', 'Tau': 'Τ', 'Phi': 'Φ', 'Chi': 'Χ',
            'Psi': 'Ψ', 'Omega': 'Ω'
        }
        
        for greek, symbol in greek_map.items():
            pattern = r'\\' + greek + r'\b'
            text = re.sub(pattern, symbol, text)
        
        return text
    
    @staticmethod
    def format_math_expression(text: str) -> str:
        """Formate une expression mathématique complète"""
        if not text or '$' not in text:
            return text
        
        # Extraire les expressions mathématiques
        parts = []
        last_end = 0
        
        for match in re.finditer(r'\$([^$]+)\$', text):
            # Texte avant l'expression
            if match.start() > last_end:
                parts.append(text[last_end:match.start()])
            
            # Expression mathématique
            math_expr = match.group(1)
            
            # Appliquer les transformations dans l'ordre
            math_expr = MathFormatter.format_greek(math_expr)
            math_expr = MathFormatter.format_fraction(math_expr)
            math_expr = MathFormatter.format_sqrt(math_expr)
            math_expr = MathFormatter.format_superscript(math_expr)
            math_expr = MathFormatter.format_subscript(math_expr)
            
            # Nettoyer les backslashes restants
            math_expr = math_expr.replace('\\', '')
            
            parts.append(f'<span class="math-container">{math_expr}</span>')
            last_end = match.end()
        
        # Texte après la dernière expression
        if last_end < len(text):
            parts.append(text[last_end:])
        
        return ''.join(parts)


def format_question_text(text: str) -> str:
    """
    Formate le texte de la question pour HTML avec support mathématique avancé
    """
    if not text:
        return ""
    
    # Traiter les expressions mathématiques d'abord
    text = MathFormatter.format_math_expression(text)
    
    # Remplacer les retours à la ligne
    text = text.replace('\n', '<br>')
    
    # Mettre en gras les termes importants entre **...**
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    
    # Italique entre *...*
    text = re.sub(r'\*(.*?)\*', r'<em>\1</em>', text)
    
    # Nettoyer les $ restants
    text = text.replace('$', '')
    
    return text


def generate_exercise_html(exercises: List[Dict], title: str, sheet_id: str, include_answers: bool = False) -> str:
    """
    Génère le HTML complet pour les exercices avec densité optimisée
    """
    # Traduction des types
    type_labels = {
        "MCQ": "QCM",
        "OPEN": "Question ouverte",
        "TRUE_FALSE": "Vrai / Faux",
        "FILL_IN": "Texte à trous",
        "MATCHING": "Appariement",
        "SHORT_ANSWER": "Réponse courte"
    }
    
    # Date de génération
    generation_date = datetime.now().strftime("%d/%m/%Y %H:%M")
    
    # Titre court pour l'en-tête
    short_title = title
    if len(title) > 30:
        short_title = title[:27] + "..."
    
    # Préparer les données pour le template
    exercises_data = []
    for ex in exercises:
        exercise_type = ex.get("exercise_type", "OPEN")
        metadata = ex.get("exercise_metadata", {})
        
        difficulty = metadata.get("difficulty_level")
        if difficulty and isinstance(difficulty, str):
            difficulty = difficulty.replace('BEGINNER', '1').replace('INTERMEDIATE', '2').replace('ADVANCED', '3')
            difficulty = ''.join(filter(str.isdigit, difficulty)) or '1'
        
        # Formater les choix s'ils existent
        choices = metadata.get("choices")
        if choices:
            choices = [format_question_text(str(choice)) for choice in choices]
        
        exercises_data.append({
            "exercise_type": exercise_type,
            "type_display": type_labels.get(exercise_type, exercise_type),
            "question_html": format_question_text(ex.get("question_text", "")),
            "choices": choices,
            "correct_answer": format_question_text(ex.get("correct_answer", "")),
            "explanation": format_question_text(metadata.get("explanation", "")),
            "difficulty": difficulty,
            "points": metadata.get("points")
        })
    
    # Rendre le template
    template = Template(EXERCISE_TEMPLATE)
    html = template.render(
        title=title,
        short_title=short_title,
        exercises=exercises_data,
        sheet_id=sheet_id,
        generation_date=generation_date,
        include_answers=include_answers
    )
    
    return html


def generate_pdf_from_html(html_content: str, output_path: Path) -> Path:
    """
    Génère un PDF à partir de HTML avec WeasyPrint
    """
    try:
        # Générer le PDF avec des options optimisées
        HTML(
            string=html_content,
            base_url=str(BASE_DIR)
        ).write_pdf(
            output_path,
            presentational_hints=True,
            optimize_size=('fonts', 'images'),
            compress=True
        )
        
        if not output_path.exists():
            raise PDFGenerationError("Le PDF n'a pas été créé")
        
        print(f"✅ PDF généré: {output_path}")
        return output_path
        
    except Exception as e:
        raise PDFGenerationError(f"Erreur génération PDF: {str(e)}")


def generate_exercise_pdfs(sheet_id: str, exercises: List[Dict], title: str) -> tuple[str, str]:
    """
    Génère les PDFs de questions et de réponses avec optimisation
    
    Args:
        sheet_id: ID de la feuille d'exercices
        exercises: Liste des exercices
        title: Titre du document
    
    Returns:
        Tuple (url_questions, url_answers)
    """
    try:
        print(f"📄 Génération de PDF pour {len(exercises)} exercices...")
        
        # 1. Générer le PDF des questions
        questions_html = generate_exercise_html(exercises, title, sheet_id, include_answers=False)
        questions_pdf = OUTPUT_DIR / f"exercices_{sheet_id}.pdf"
        generate_pdf_from_html(questions_html, questions_pdf)
        
        # 2. Générer le PDF des réponses
        answers_html = generate_exercise_html(exercises, f"{title} - Corrigé", sheet_id, include_answers=True)
        answers_pdf = OUTPUT_DIR / f"corrige_{sheet_id}.pdf"
        generate_pdf_from_html(answers_html, answers_pdf)
        
        # 3. Retourner les URLs relatives
        questions_url = f"/generated_pdfs/{questions_pdf.name}"
        answers_url = f"/generated_pdfs/{answers_pdf.name}"
        
        print(f"✅ PDFs générés avec succès!")
        print(f"   • Exercices: {questions_pdf.name}")
        print(f"   • Corrigé: {answers_pdf.name}")
        
        return questions_url, answers_url
        
    except Exception as e:
        print(f"❌ Erreur génération PDFs: {e}")
        raise PDFGenerationError(f"Échec génération PDFs: {str(e)}")


def generate_academic_pdf():
    """
    Génère un PDF académique avec des exercices variés
    """
    academic_exercises = [
        {
            "exercise_type": "MCQ",
            "question_text": "La solution de l'équation $x^2 - 5x + 6 = 0$ est:",
            "correct_answer": "$x = 2$ ou $x = 3$",
            "exercise_metadata": {
                "choices": [
                    "$x = 1, x = 6$",
                    "$x = 2, x = 3$", 
                    "$x = -2, x = -3$",
                    "$x = 0, x = 5$"
                ],
                "explanation": "L'équation se factorise en $(x-2)(x-3)=0$, donc les solutions sont $x=2$ et $x=3$.",
                "difficulty_level": "BEGINNER",
                "points": 3
            }
        },
        {
            "exercise_type": "OPEN",
            "question_text": "Calculez la dérivée de la fonction $f(x) = 3x^4 - 2x^2 + 5$.",
            "correct_answer": "$f'(x) = 12x^3 - 4x$",
            "exercise_metadata": {
                "explanation": "En appliquant la règle de dérivation des polynômes: $(x^n)' = nx^{n-1}$.<br>Donc $f'(x) = 4\\times3x^{3} - 2\\times2x^{1} + 0 = 12x^3 - 4x$.",
                "difficulty_level": "BEGINNER",
                "points": 4
            }
        },
        {
            "exercise_type": "FILL_IN",
            "question_text": "La formule de l'aire d'un cercle de rayon $r$ est $A = \\pi r^2$. Pour $r = 3$, l'aire vaut _____.",
            "correct_answer": "$9\\pi$",
            "exercise_metadata": {
                "explanation": "En remplaçant $r$ par 3: $A = \\pi \\times 3^2 = \\pi \\times 9 = 9\\pi$.",
                "difficulty_level": "BEGINNER",
                "points": 2
            }
        },
        {
            "exercise_type": "TRUE_FALSE",
            "question_text": "La somme des angles d'un triangle est toujours égale à $180^\\circ$.",
            "correct_answer": "Vrai",
            "exercise_metadata": {
                "explanation": "C'est une propriété fondamentale de la géométrie euclidienne. Dans un triangle, $\\alpha + \\beta + \\gamma = 180^\\circ$.",
                "difficulty_level": "BEGINNER",
                "points": 2
            }
        },
        {
            "exercise_type": "OPEN",
            "question_text": "Résoudre le système d'équations: $\\begin{cases} 2x + y = 5 \\\\ x - y = 1 \\end{cases}$",
            "correct_answer": "$x = 2$, $y = 1$",
            "exercise_metadata": {
                "explanation": "En additionnant les deux équations: $3x = 6$ donc $x = 2$.<br>En substituant dans la deuxième: $2 - y = 1$ donc $y = 1$.",
                "difficulty_level": "INTERMEDIATE",
                "points": 5
            }
        },
        {
            "exercise_type": "MCQ",
            "question_text": "Quelle est la limite de $\\frac{\\sin(x)}{x}$ lorsque $x$ tend vers 0?",
            "correct_answer": "1",
            "exercise_metadata": {
                "choices": ["0", "1", "$\\infty$", "Elle n'existe pas"],
                "explanation": "C'est une limite fondamentale: $\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1$.",
                "difficulty_level": "INTERMEDIATE",
                "points": 3
            }
        },
        {
            "exercise_type": "SHORT_ANSWER",
            "question_text": "Donnez la forme développée de $(x + 2)(x - 3)$.",
            "correct_answer": "$x^2 - x - 6$",
            "exercise_metadata": {
                "explanation": "En utilisant la double distributivité: $(x+2)(x-3) = x^2 - 3x + 2x - 6 = x^2 - x - 6$.",
                "difficulty_level": "BEGINNER",
                "points": 3
            }
        },
        {
            "exercise_type": "OPEN",
            "question_text": "Calculez l'intégrale $\\int_0^1 (2x + 3) dx$.",
            "correct_answer": "4",
            "exercise_metadata": {
                "explanation": "Une primitive de $2x+3$ est $x^2 + 3x$.<br>Donc $\\int_0^1 (2x+3)dx = [x^2 + 3x]_0^1 = (1+3) - (0+0) = 4$.",
                "difficulty_level": "INTERMEDIATE",
                "points": 4
            }
        }
    ]
    
    try:
        sheet_id = "acad_" + datetime.now().strftime("%Y%m%d_%H%M")
        urls = generate_exercise_pdfs(
            sheet_id, 
            academic_exercises, 
            "Exercices de Mathématiques - Niveau Académique"
        )
        print(f"\n✅ Génération académique réussie!")
        print(f"📊 Statistiques: 8 exercices, 4 types différents")
        print(f"📁 Fichiers générés dans: {OUTPUT_DIR}")
        return True
    except Exception as e:
        print(f"\n❌ Génération échouée: {e}")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("GENEX-APP - Générateur de PDF académiques")
    print("=" * 60)
    print("\n🧪 Génération d'un document académique de test...\n")
    generate_academic_pdf()