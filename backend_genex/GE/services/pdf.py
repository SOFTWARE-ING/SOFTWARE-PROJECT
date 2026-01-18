import os
from fpdf import FPDF

# =========================
# CONFIGURATION
# =========================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "generated_pdfs")

# 🔧 CORRECTION DU CHEMIN (assets/fonts)
FONT_DIR = os.path.join(BASE_DIR, "..", "assets")
FONT_PATH = os.path.join(FONT_DIR, "DejaVuSans.ttf")

if not os.path.exists(FONT_DIR):
    raise FileNotFoundError("❌ /assets introuvable")

os.makedirs(OUTPUT_DIR, exist_ok=True)

if not os.path.exists(FONT_PATH):
    raise FileNotFoundError("❌ DejaVuSans.ttf introuvable dans /assets")

# =========================
# PDF CLASS
# =========================

class PDF(FPDF):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # ✅ AJOUT OBLIGATOIRE : charger les polices AVANT header/footer
        self.add_font("DejaVu", "", FONT_PATH, uni=True)
        self.add_font("DejaVu", "B", FONT_PATH, uni=True)
        self.add_font("DejaVu", "I", FONT_PATH, uni=True)

    def header(self):
        self.set_font("DejaVu", "B", 14)
        self.cell(0, 10, "Projet pédagogique", ln=True, align="C")
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("DejaVu", "", 10)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")


def init_pdf(title: str) -> PDF:
    pdf = PDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    pdf.set_font("DejaVu", "B", 16)
    pdf.multi_cell(0, 10, title, align="C")
    pdf.ln(5)

    return pdf

# =========================
# PDF EXERCICES
# =========================

def generate_exo_pdf(ai_response, filename="exo.pdf") -> str:
    filepath = os.path.join(OUTPUT_DIR, filename)
    pdf = init_pdf("Exercices générés")

    ex_count = 1
    for ex in ai_response.get("exercises", []):
        ex_type = ex.get("exercise_type", "Inconnu")

        for q_idx, q in enumerate(ex.get("questions", []), start=1):
            pdf.set_font("DejaVu", "B", 13)
            pdf.multi_cell(
                0, 8,
                f"Exercice {ex_count} - Question {q_idx} ({ex_type})"
            )

            pdf.set_font("DejaVu", "", 12)
            pdf.multi_cell(0, 7, q.get("question", ""))

            # ✅ AJOUT : Affichage du graphique s'il existe
            graph_path = q.get("graph_path")
            if graph_path and os.path.exists(graph_path):
                pdf.image(graph_path, w=100, x=55) # Largeur 100mm, centré (approx)

            if ex_type.upper() == "MCQ":
                for choice in q.get("choices", []):
                    pdf.multi_cell(0, 6, f"• {choice}")

            pdf.ln(4)

        ex_count += 1

    pdf.output(filepath)
    return filepath

# =========================
# PDF CORRIGÉS
# =========================

def generate_correct_pdf(ai_response, filename="correct.pdf") -> str:
    filepath = os.path.join(OUTPUT_DIR, filename)
    pdf = init_pdf("Corrigés des exercices")

    ex_count = 1
    for ex in ai_response.get("exercises", []):
        ex_type = ex.get("exercise_type", "Inconnu")

        for q_idx, q in enumerate(ex.get("questions", []), start=1):
            pdf.set_font("DejaVu", "B", 13)
            pdf.multi_cell(
                0, 8,
                f"Exercice {ex_count} - Question {q_idx} ({ex_type})"
            )

            pdf.set_font("DejaVu", "", 12)
            pdf.multi_cell(0, 7, q.get("question", ""))

            # ✅ AJOUT : Affichage du graphique dans le corrigé aussi
            graph_path = q.get("graph_path")
            if graph_path and os.path.exists(graph_path):
                pdf.image(graph_path, w=100, x=55)

            pdf.set_font("DejaVu", "I", 12)
            pdf.multi_cell(
                0, 7,
                f"Réponse : {q.get('correct_answer', 'Non fournie')}\n"
                f"Explication : {q.get('explanation', 'Aucune explication')}"
            )

            pdf.ln(4)

        ex_count += 1

    pdf.output(filepath)
    return filepath

# =========================
# POINT D’ENTRÉE UNIQUE
# =========================

def generate_all_pdfs(ai_response) -> dict:
    """
    À appeler UNE SEULE FOIS après génération Gemini
    """
    return {
        "exo_pdf": generate_exo_pdf(ai_response),
        "correct_pdf": generate_correct_pdf(ai_response)
    }
