import { getService } from "./getService";

const get_document_by_id = async (document_id) => {
    const url = `get_documents_by_id/${document_id}`;
    return await getService.fetchData(url);
};

const get_documents = async () => {
    const url = `get_documents/`;
    return await getService.fetchData(url);
}

const get_exerecise_by_project_id = async (project_id) => {
    const url = `exercise_sheets_by_project_id/${project_id}`;
    return await getService.fetchData(url);         
}

const get_all_exercises = async () => {
    const url = `all_exercise_sheets/`;
    return await getService.fetchData(url);
}

const create_project = async (projectData) => {
    const url = `create/projects/`;
    return await getService.postData(url, projectData);
};

const upload_document = async (file) => {
    const url = `documents/upload/`;
    return await getService.postFile(url, file);
};

// =========================================
// NOUVELLES FONCTIONS POUR LES SHEETS
// =========================================

// Récupérer les infos d'une sheet
const get_sheet_info = async (sheet_id) => {
    const url = `sheets/${sheet_id}/info/`;
    return await getService.fetchData(url);
};

// Récupérer toutes les sheets d'un projet
const get_project_sheets = async (project_id) => {
    const url = `projects/${project_id}/sheets/`;
    return await getService.fetchData(url);
};

// Vérifier si les fichiers existent
const check_sheet_files = async (sheet_id) => {
    const url = `sheets/${sheet_id}/check-files/`;
    return await getService.fetchData(url);
};

// Télécharger le PDF des questions
const download_sheet_questions = async (sheet_id, filename = "Exercices.pdf" ) => {
    const url = `sheets/${sheet_id}/download-questions`;
    return await getService.downloadFile(url, filename);
};

// Télécharger le PDF des réponses
const download_sheet_answers = async (sheet_id, filename = 'Corrections.pdf') => {
    const url = `sheets/${sheet_id}/download-answers`;
    return await getService.downloadFile(url, filename);
};

// Prévisualiser le PDF des questions (ouvre dans un nouvel onglet)
const preview_sheet_questions = async (sheet_id) => {
    const url = `sheets/${sheet_id}/preview-questions/`;
    return await getService.getFileUrl(url);
};

// Prévisualiser le PDF des réponses (ouvre dans un nouvel onglet)
const preview_sheet_answers = async (sheet_id) => {
    const url = `sheets/${sheet_id}/preview-answers/`;
    return await getService.getFileUrl(url);
};

// Supprimer une sheet
const delete_sheet = async (sheet_id) => {
    const url = `sheets/${sheet_id}/`;
    return await getService.deleteData(url);
};

// Fonction générique de téléchargement (legacy)
const download_file = async (fileId) => {
    const response = await fetch(`/api/files/${fileId}/download/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement')
    }
    
    return response.blob()
}

export const routingService = {
    get_document_by_id,
    create_project,
    get_documents,
    upload_document,
    get_all_exercises,
    get_exerecise_by_project_id,
    download_file,
    
    // Nouvelles fonctions pour les sheets
    get_sheet_info,
    get_project_sheets,
    check_sheet_files,
    download_sheet_questions,
    download_sheet_answers,
    preview_sheet_questions,
    preview_sheet_answers,
    delete_sheet,
};