import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Plus, Edit, Play, Eye, Download, Trash2, Settings, FileText, BookOpen, UserPlus, LogIn } from 'lucide-react'

export default function ProjectsScreen() {
  const [projects] = useState([
    {
      id: 1,
      name: 'Exercices Mathématiques Niveau 1',
      description: 'Ensemble d\'exercices de mathématiques pour CE1',
      subject: 'Mathématiques',
      level: 'CE1',
      status: 'completed',
      exercisesCount: 12,
      createdAt: '2024-01-15',
      lastModified: '2024-01-16'
    },
    {
      id: 2,
      name: 'Grammaire Française CM2',
      description: 'Exercices de grammaire et conjugaison',
      subject: 'Français',
      level: 'CM2',
      status: 'in_progress',
      exercisesCount: 8,
      createdAt: '2024-01-10',
      lastModified: '2024-01-14'
    },
    {
      id: 3,
      name: 'Histoire de France 6ème',
      description: 'QCM et exercices sur l\'histoire de France',
      subject: 'Histoire',
      level: '6ème',
      status: 'draft',
      exercisesCount: 0,
      createdAt: '2024-01-08',
      lastModified: '2024-01-08'
    }
  ])

  const [selectedProject, setSelectedProject] = useState(null)
  const [showProjectModal, setShowProjectModal] = useState(false)

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Terminé'
      case 'in_progress': return 'En cours'
      case 'draft': return 'Brouillon'
      default: return 'Inconnu'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const openProject = (project) => {
    setSelectedProject(project)
    setShowProjectModal(true)
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
          <Link to="/register" className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
            <UserPlus className="h-4 w-4 mr-2" />
            Sign Up
          </Link>
          <Link to="/login" className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Link>
          <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Projet
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total projets</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{projects.length}</p>
            </div>
            <Briefcase className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Terminés</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {projects.filter(p => p.status === 'completed').length}
              </p>
            </div>
            <FileText className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">En cours</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {projects.filter(p => p.status === 'in_progress').length}
              </p>
            </div>
            <Play className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Exercices générés</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {projects.reduce((sum, p) => sum + p.exercisesCount, 0)}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Liste des projets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {project.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {project.description}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                    {project.subject}
                  </span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                    {project.level}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{project.exercisesCount} exercices</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Créé le {formatDate(project.createdAt)} • Modifié le {formatDate(project.lastModified)}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openProject(project)}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
              >
                <Eye className="h-4 w-4 mr-1" />
                Ouvrir
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <Edit className="h-4 w-4" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <Download className="h-4 w-4" />
              </button>
              <button className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal du projet */}
      {showProjectModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {selectedProject.name}
                </h2>
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                      <p><strong>Matière:</strong> {selectedProject.subject}</p>
                      <p><strong>Niveau:</strong> {selectedProject.level}</p>
                      <p><strong>Statut:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedProject.status)}`}>{getStatusLabel(selectedProject.status)}</span></p>
                      <p><strong>Exercices:</strong> {selectedProject.exercisesCount}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                      <Play className="h-4 w-4 mr-2" />
                      Générer des exercices
                    </button>
                    <button className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurer
                    </button>
                    <button className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <Eye className="h-4 w-4 mr-2" />
                      Aperçu
                    </button>
                    <button className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </button>
                  </div>
                </div>

                {/* Contenu du projet */}
                <div className="lg:col-span-2">
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                      Description
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {selectedProject.description}
                    </p>
                  </div>

                  {/* Liste des exercices */}
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                      Exercices générés ({selectedProject.exercisesCount})
                    </h3>

                    {selectedProject.exercisesCount > 0 ? (
                      <div className="space-y-3">
                        {Array.from({ length: Math.min(selectedProject.exercisesCount, 5) }, (_, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-slate-600 rounded-md">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-slate-400" />
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                  Exercice {i + 1}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  QCM • Niveau moyen
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-slate-400 hover:text-green-600 dark:hover:text-green-400">
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {selectedProject.exercisesCount > 5 && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                            ... et {selectedProject.exercisesCount - 5} autres exercices
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-slate-400 mb-2">
                          Aucun exercice généré
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-500">
                          Cliquez sur "Générer des exercices" pour commencer
                        </p>
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