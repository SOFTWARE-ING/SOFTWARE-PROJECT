import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Plus, Edit, Play, Eye, Download, Trash2, Settings, FileText, BookOpen, UserPlus, LogIn, FilePlus, CheckCircle, XCircle, Loader2, FolderPlus } from 'lucide-react'
import { routingService } from '../../api_service/getRouting'

export default function ProjectsScreen() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [sheetData, setSheetData] = useState(null)
  const [loadingSheet, setLoadingSheet] = useState(false)

  // Charger les projets depuis l'API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const data = await routingService.get_all_exercises()
        setProjects(data)
      } catch (err) {
        setError(err.message || "Erreur lors du chargement des projets")
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  // Charger les données de la sheet pour un projet
  const fetchSheetData = async (projectId) => {
    try {
      setLoadingSheet(true)
      // Récupérer la sheet du projet
      const sheet = await routingService.get_exerecise_by_project_id(projectId)

      if (sheet && sheet.project_id) {
        setSheetData(sheet)
      } else {
        setSheetData(null)
      }
    } catch (err) {
      console.error('Erreur lors du chargement de la sheet:', err)
      setSheetData(null)
    } finally {
      setLoadingSheet(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'AI_PROCESSING':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'UPLOADED':
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'ERROR':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'completed':
        return 'Terminé'
      case 'AI_PROCESSING':
      case 'in_progress':
        return 'En cours'
      case 'UPLOADED':
      case 'draft':
        return 'Brouillon'
      case 'ERROR':
        return 'Erreur'
      default:
        return 'Inconnu'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return 'N/A'
    }
  }

  const openProject = async (project) => {
    setSelectedProject(project)
    setShowProjectModal(true)
    // Charger les données de la sheet pour ce projet
    await fetchSheetData(project.project_id)
  }

  // Télécharger le PDF des questions
  const handleDownloadQuestions = async (sheetId) => {
    try {
      await routingService.download_sheet_questions(
        sheetId,
        `Exercices_${selectedProject?.title || 'sheet'}.pdf`
      )
      // console.log('Token présent:', !!localStorage.getItem('access_token'));
      // console.log('Token:', localStorage.getItem('access_token'));
    } catch (err) {
      // console.log('Token présent:', !!localStorage.getItem('access_token'));
      // console.log('Token:', localStorage.getItem('access_token'));
      console.error('Erreur lors du téléchargement:', err)
      alert('Erreur lors du téléchargement des questions')
    }
  }

  // Télécharger le PDF des réponses
  const handleDownloadAnswers = async (sheetId) => {
    try {
      await routingService.download_sheet_answers(
        sheetId,
        `Corrections_${selectedProject?.title || 'sheet'}.pdf`
      )
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err)
      alert('Erreur lors du téléchargement des réponses')
    }
  }

  // Prévisualiser le PDF des questions
  const handlePreviewQuestions = async (sheetId) => {
    try {
      await routingService.preview_sheet_questions(sheetId)
    } catch (err) {
      console.error('Erreur lors de l\'ouverture:', err)
      alert('Impossible d\'ouvrir le PDF des questions')
    }
  }

  // Prévisualiser le PDF des réponses
  const handlePreviewAnswers = async (sheetId) => {
    try {
      await routingService.preview_sheet_answers(sheetId)
    } catch (err) {
      console.error('Erreur lors de l\'ouverture:', err)
      alert('Impossible d\'ouvrir le PDF des réponses')
    }
  }

  // Supprimer une sheet
  const handleDeleteSheet = async (sheetId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette feuille et ses fichiers PDF ?')) {
      return
    }

    try {
      await routingService.delete_sheet(sheetId)
      alert('Feuille supprimée avec succès')

      // Rafraîchir les données
      setShowProjectModal(false)
      window.location.reload() // Ou utilisez une méthode plus élégante pour rafraîchir
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      alert('Erreur lors de la suppression de la feuille')
    }
  }

  // Générer des exercices pour un projet
  const handleGenerateExercises = async (projectId) => {
    try {
      // Appeler l'API pour générer les exercices
      // await routingService.generate_exercises(projectId)

      alert('Fonctionnalité de génération à implémenter')

      // Rafraîchir les données de la sheet
      await fetchSheetData(projectId)
    } catch (err) {
      console.error('Erreur lors de la génération:', err)
      alert('Erreur lors de la génération des exercices')
    }
  }


  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Chargement des projets...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase className="h-8 w-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Mes Projets
          </h1>
        </div>
        <div className="flex gap-3">
          <Link to="/new-project" className="flex justify-center active:scale-95 items-center px-6 py-4 bg-linear-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all">
            <FolderPlus className="h-6 w-6 mr-2" />
            Nouveau Projet
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border-linear-to-r from-purple-500 to-blue-500  p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total projets</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{projects.length}</p>
            </div>
            <Briefcase className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border-linear-to-r from-purple-500 to-blue-500  p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Terminés</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {projects.filter(p => p.status === 'COMPLETED' || p.status === 'completed').length}
              </p>
            </div>
            <FileText className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border-linear-to-r from-purple-500 to-blue-500  p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">En cours</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {projects.filter(p => p.status === 'AI_PROCESSING' || p.status === 'in_progress').length}
              </p>
            </div>
            <Play className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border-linear-to-r from-purple-500 to-blue-500  p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Feuilles</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {projects.filter(p => p.exercises && p.exercises.length > 0).length}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Liste des projets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project.project_id} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {project.project.title || 'Sans titre'}
                </h3>
                {/* <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                  {project.description || 'Aucune description'}
                </p> */}
                <div className="flex items-center gap-2 mb-2">
                  {project.subject && (
                    <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                      {project.generated_at || "Mag"}
                    </span>
                  )}
                  {project.level && (
                    <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                      {project.level}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{project.exercises && project.exercises.length > 0 ? '1 feuille' : '0 feuille'}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Créé le {formatDate(project.generated_at)}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openProject(project)}
                className="flex-1 flex  justify-center active:scale-95 items-center px-2 py-2 cursor-pointer bg-linear-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <Eye className="h-4 w-4 mr-1" />
                Ouvrir
              </button>
              <button className="p-2 text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 py-1 rounded-lg hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleGenerateExercises(project.project_id)}
                className="p-2 text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 py-1 rounded-lg hover:text-green-600 dark:hover:text-green-400 transition-colors"
                title="Générer des exercices"
              >
                <Play className="h-4 w-4" />
              </button>
              <button className="p-2 text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 py-1 rounded-lg hover:text-red-600 dark:hover:text-red-400 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal du projet */}
      {showProjectModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {selectedProject.project.title}
                </h2>
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informations du projet */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                      Informations
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Statut:</strong> <span className={`px-2 py-1 rounded-full text-xs ml-2 ${getStatusColor(selectedProject.status)}`}>{getStatusLabel(selectedProject.status)}</span></p>
                      <p><strong>Créé le:</strong> {formatDate(selectedProject.generated_at)}</p>
                      {sheetData && (
                        <>
                          <p><strong>PDF Questions:</strong> {sheetData.pdf_url_questions ? '✅' : '❌'}</p>
                          <p><strong>PDF Réponses:</strong> {sheetData.pdf_url_answers ? '✅' : '❌'}</p>
                          <p><strong>Exercices:</strong> {sheetData.exercises || 0}</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleGenerateExercises(selectedProject.project_id)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Générer des exercices
                    </button>
                    {sheetData?.id && (
                      <button
                        onClick={() => handleDeleteSheet(sheetData.project_id)}
                        className="w-full flex items-center justify-center px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer la feuille
                      </button>
                    )}
                  </div>
                </div>

                {/* Fichiers PDF */}
                <div className="lg:col-span-2">
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                      Description
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {selectedProject.description || 'Aucune description disponible'}
                    </p>
                  </div>

                  {/* Fichiers PDF */}
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        Fichiers PDF
                      </h3>
                      {loadingSheet && (
                        <Loader2 className="h-4 w-4 text-indigo-600 animate-spin" />
                      )}
                    </div>

                    {loadingSheet ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-slate-400">
                          Chargement...
                        </p>
                      </div>
                    ) : sheetData?.id ? (
                      <div className="space-y-3">
                        {/* PDF des questions */}
                        {sheetData.pdf_url_questions && (
                          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-600 rounded-md">
                            <div className="flex items-center gap-3">
                              <FilePlus className="h-5 w-5 text-red-500" />
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                  Questions.pdf
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Fichier des questions
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handlePreviewQuestions(sheetData.id)}
                                className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                                title="Ouvrir"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDownloadQuestions(sheetData.id)}
                                className="p-2 text-slate-400 hover:text-green-600 dark:hover:text-green-400"
                                title="Télécharger"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* PDF des réponses */}
                        {sheetData.pdf_url_answers && (
                          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-600 rounded-md">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-green-500" />
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                  Réponses.pdf
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Fichier des réponses
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handlePreviewAnswers(sheetData.id)}
                                className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                                title="Ouvrir"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDownloadAnswers(sheetData.id)}
                                className="p-2 text-slate-400 hover:text-green-600 dark:hover:text-green-400"
                                title="Télécharger"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        {!sheetData.pdf_url_questions && !sheetData.pdf_url_answers && (
                          <div className="text-center py-8">
                            <FilePdf className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-400">
                              Aucun fichier PDF disponible
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FilePlus className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-slate-400 mb-2">
                          Aucune feuille d'exercices
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">
                          Générez des exercices pour créer des fichiers PDF
                        </p>
                        <button
                          onClick={() => handleGenerateExercises(selectedProject.project.id)}
                          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors mx-auto"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Générer des exercices
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}