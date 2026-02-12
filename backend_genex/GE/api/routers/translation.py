from fastapi import APIRouter, File, UploadFile, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pathlib import Path
import uuid
from datetime import datetime
import asyncio
from typing import Optional
import json
import logging

# Imports pour la traduction
from deep_translator import GoogleTranslator
import PyPDF2
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import simpleSplit
from io import BytesIO

# Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Configuration
TRANSLATION_DIR = Path("translations")
TRANSLATION_DIR.mkdir(exist_ok=True)
UPLOAD_DIR = TRANSLATION_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR = TRANSLATION_DIR / "outputs"
OUTPUT_DIR.mkdir(exist_ok=True)

# Stockage temporaire des tâches
translation_tasks = {}


def extract_text_from_pdf(pdf_path: Path) -> tuple[str, int]:
    """
    Extrait le texte d'un PDF
    Retourne (texte, nombre_de_pages)
    """
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            num_pages = len(pdf_reader.pages)
            text = ""
            
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n\n"
            
            return text, num_pages
    except Exception as e:
        logger.error(f"Erreur extraction PDF: {str(e)}")
        raise Exception(f"Erreur lors de l'extraction du texte: {str(e)}")


def translate_text(text: str, source_lang: str, target_lang: str, quality: str = "high") -> tuple[str, str]:
    """
    Traduit du texte avec Google Translator
    Retourne (texte_traduit, langue_detectee)
    """
    try:
        logger.info(f"Traduction: {source_lang} -> {target_lang}, {len(text)} caractères")
        
        # Si la langue source est 'auto', on la détecte
        if source_lang == 'auto':
            translator = GoogleTranslator(source='auto', target=target_lang)
            source_lang = 'auto'
        else:
            translator = GoogleTranslator(source=source_lang, target=target_lang)
        
        # Pour de longs textes, on divise en chunks
        max_chunk_size = 4500
        
        if len(text) <= max_chunk_size:
            translated_text = translator.translate(text)
            detected_lang = source_lang
        else:
            paragraphs = text.split('\n\n')
            translated_paragraphs = []
            detected_lang = source_lang
            
            for para in paragraphs:
                if not para.strip():
                    translated_paragraphs.append('')
                    continue
                    
                if len(para) > max_chunk_size:
                    sentences = para.split('. ')
                    current_chunk = ""
                    
                    for sentence in sentences:
                        if len(current_chunk) + len(sentence) < max_chunk_size:
                            current_chunk += sentence + ". "
                        else:
                            if current_chunk:
                                translated_paragraphs.append(translator.translate(current_chunk))
                            current_chunk = sentence + ". "
                    
                    if current_chunk:
                        translated_paragraphs.append(translator.translate(current_chunk))
                else:
                    translated_paragraphs.append(translator.translate(para))
            
            translated_text = '\n\n'.join(translated_paragraphs)
        
        logger.info(f"Traduction terminée: {len(translated_text)} caractères")
        return translated_text, detected_lang
        
    except Exception as e:
        logger.error(f"Erreur traduction: {str(e)}")
        raise Exception(f"Erreur lors de la traduction: {str(e)}")


def create_pdf_from_text(text: str, output_path: Path, preserve_formatting: bool = True):
    """
    Crée un PDF à partir du texte traduit
    """
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.lib.enums import TA_JUSTIFY
        
        logger.info(f"Création PDF: {output_path}")
        
        # Créer le document
        doc = SimpleDocTemplate(
            str(output_path),
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18,
        )
        
        # Styles
        styles = getSampleStyleSheet()
        style_normal = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=11,
            leading=14,
            alignment=TA_JUSTIFY,
            spaceAfter=12,
        )
        
        # Contenu
        story = []
        
        # Ajouter les paragraphes
        paragraphs = text.split('\n\n')
        for para in paragraphs:
            if para.strip():
                # Échapper les caractères spéciaux XML/HTML
                para_escaped = para.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                p = Paragraph(para_escaped.replace('\n', '<br/>'), style_normal)
                story.append(p)
                story.append(Spacer(1, 0.2*inch))
        
        # Construire le PDF
        doc.build(story)
        logger.info(f"PDF créé avec succès: {output_path}")
        
    except Exception as e:
        logger.error(f"Erreur création PDF: {str(e)}")
        raise Exception(f"Erreur lors de la création du PDF: {str(e)}")


async def process_translation(
    task_id: str,
    input_path: Path,
    output_path: Path,
    source_lang: str,
    target_lang: str,
    options: dict
):
    """
    Traite la traduction en arrière-plan
    """
    try:
        logger.info(f"Début traduction task_id={task_id}")
        translation_tasks[task_id]['status'] = 'processing'
        translation_tasks[task_id]['progress'] = 10
        
        # Extraire le texte
        text, num_pages = extract_text_from_pdf(input_path)
        word_count = len(text.split())
        
        logger.info(f"Extraction terminée: {num_pages} pages, {word_count} mots")
        
        translation_tasks[task_id]['progress'] = 30
        translation_tasks[task_id]['word_count'] = word_count
        translation_tasks[task_id]['pages'] = num_pages
        
        # Traduire
        start_time = datetime.now()
        translated_text, detected_lang = translate_text(
            text,
            source_lang,
            target_lang,
            options.get('quality', 'high')
        )
        processing_time = (datetime.now() - start_time).total_seconds()
        
        translation_tasks[task_id]['progress'] = 70
        translation_tasks[task_id]['detected_language'] = detected_lang
        translation_tasks[task_id]['processing_time'] = round(processing_time, 2)
        
        # Créer le PDF traduit
        create_pdf_from_text(
            translated_text,
            output_path,
            options.get('preserve_formatting', True)
        )
        
        translation_tasks[task_id]['progress'] = 100
        translation_tasks[task_id]['status'] = 'completed'
        translation_tasks[task_id]['output_path'] = str(output_path)
        
        logger.info(f"Traduction terminée task_id={task_id}")
        
    except Exception as e:
        logger.error(f"Erreur traduction task_id={task_id}: {str(e)}")
        translation_tasks[task_id]['status'] = 'error'
        translation_tasks[task_id]['error'] = str(e)


@router.post("/translate/pdf")
async def translate_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    source_language: str = Form("auto"),
    target_language: str = Form("fr"),
    preserve_formatting: bool = Form(True),
    keep_images: bool = Form(True),
    quality: str = Form("high")
):
    """
    Upload et traduit un PDF
    """
    logger.info(f"Nouvelle requête traduction: {file.filename}")
    
    # Validation du fichier
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Le fichier doit être un PDF")
    
    # Générer un ID unique pour cette tâche
    task_id = str(uuid.uuid4())
    
    # Sauvegarder le fichier uploadé
    input_filename = f"{task_id}_{file.filename}"
    input_path = UPLOAD_DIR / input_filename
    
    with open(input_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    logger.info(f"Fichier uploadé: {input_path}")
    
    # Préparer le nom du fichier de sortie
    output_filename = f"translated_{task_id}_{file.filename}"
    output_path = OUTPUT_DIR / output_filename
    
    # Initialiser la tâche
    translation_tasks[task_id] = {
        'status': 'pending',
        'progress': 0,
        'input_path': str(input_path),
        'output_path': None,
        'original_filename': file.filename,
        'translated_filename': output_filename,
        'created_at': datetime.now().isoformat(),
        'word_count': 0,
        'pages': 0,
        'detected_language': None,
        'processing_time': 0
    }
    
    # Options
    options = {
        'preserve_formatting': preserve_formatting,
        'keep_images': keep_images,
        'quality': quality
    }
    
    # Lancer la traduction en arrière-plan
    background_tasks.add_task(
        process_translation,
        task_id,
        input_path,
        output_path,
        source_language,
        target_language,
        options
    )
    
    logger.info(f"Traduction lancée en arrière-plan: task_id={task_id}")
    
    return {
        "task_id": task_id,
        "status": "processing",
        "message": "La traduction a démarré",
        "original_filename": file.filename,
        "translated_filename": output_filename
    }


@router.get("/translate/status/{task_id}")
async def get_translation_status(task_id: str):
    """
    Récupère le statut d'une traduction
    """
    if task_id not in translation_tasks:
        raise HTTPException(status_code=404, detail="Tâche de traduction introuvable")
    
    task = translation_tasks[task_id]
    
    response = {
        "task_id": task_id,
        "status": task['status'],
        "progress": task['progress'],
        "word_count": task.get('word_count', 0),
        "pages": task.get('pages', 0),
        "detected_language": task.get('detected_language'),
        "processing_time": task.get('processing_time', 0)
    }
    
    if task['status'] == 'completed':
        response['download_url'] = f"/api/genex/translate/download/{task_id}"
        response['translated_filename'] = task['translated_filename']
    
    if task['status'] == 'error':
        response['error'] = task.get('error', 'Erreur inconnue')
    
    logger.info(f"Status check task_id={task_id}: {task['status']} ({task['progress']}%)")
    
    return response


@router.get("/translate/download/{task_id}")
async def download_translated_pdf(task_id: str):
    """
    Télécharge le PDF traduit
    """
    logger.info(f"Tentative téléchargement task_id={task_id}")
    
    if task_id not in translation_tasks:
        raise HTTPException(status_code=404, detail="Tâche de traduction introuvable")
    
    task = translation_tasks[task_id]
    
    if task['status'] != 'completed':
        logger.warning(f"Téléchargement refusé - Status: {task['status']}, Progress: {task['progress']}%")
        raise HTTPException(
            status_code=400,
            detail=f"La traduction n'est pas terminée (status: {task['status']}, progress: {task['progress']}%)"
        )
    
    output_path = Path(task['output_path'])
    
    if not output_path.exists():
        logger.error(f"Fichier introuvable: {output_path}")
        raise HTTPException(status_code=404, detail="Fichier traduit introuvable")
    
    logger.info(f"Téléchargement OK: {output_path}")
    
    return FileResponse(
        path=str(output_path),
        media_type="application/pdf",
        filename=task['translated_filename']
    )


@router.delete("/translate/{task_id}")
async def delete_translation(task_id: str):
    """
    Supprime une traduction et ses fichiers
    """
    if task_id not in translation_tasks:
        raise HTTPException(status_code=404, detail="Tâche de traduction introuvable")
    
    task = translation_tasks[task_id]
    
    # Supprimer les fichiers
    input_path = Path(task['input_path'])
    if input_path.exists():
        input_path.unlink()
    
    if task['output_path']:
        output_path = Path(task['output_path'])
        if output_path.exists():
            output_path.unlink()
    
    # Supprimer la tâche
    del translation_tasks[task_id]
    
    return {"message": "Traduction supprimée avec succès"}