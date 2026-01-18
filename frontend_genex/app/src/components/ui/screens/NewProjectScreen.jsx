import React, { useState } from 'react'
import { Plus, FileText, Settings, Eye, Download, ArrowRight } from 'lucide-react'

export default function NewProjectScreen() {
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    subject: '',
    level: '',
    language: 'fr'
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [isCreating, setIsCreating] = useState(false)

  const handleInputChange = (field, value) => {
    setProjectData(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateProject = async () => {
    setIsCreating(true)
    // Simulate project creation
    setTimeout(() => {
      setIsCreating(false)
      // Redirect to projects or show success
      alert('Projet créé avec succès !')
    }, 2000)
  }

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const steps = [
    { id: 1, title: 'Informations générales', icon: FileText },
    { id: 2, title: 'Configuration', icon: Settings },
    { id: 3, title: 'Aperçu', icon: Eye }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <Plus className="h-8 w-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Nouveau Projet
        </h1>
      </div>

      {/* Indicateur de progression */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= step.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}>
                <step.icon className="h-5 w-5" />
              </div>
              <span className={`text-sm font-medium ${
                currentStep >= step.id
                  ? 'text-indigo-600'
                  : 'text-slate-600 dark:text-slate-400'
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-slate-400 mx-2" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Étape 1: Informations générales */}
      {currentStep === 1 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
            Informations générales du projet
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nom du projet *
              </label>
              <input
                type="text"
                value={projectData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Exercices Mathématiques Niveau 1"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={projectData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Décrivez brièvement votre projet..."
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Matière
                </label>
                <select
                  value={projectData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Sélectionner une matière</option>
                  <option value="maths">Mathématiques</option>
                  <option value="francais">Français</option>
                  <option value="histoire">Histoire</option>
                  <option value="geographie">Géographie</option>
                  <option value="sciences">Sciences</option>
                  <option value="anglais">Anglais</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Niveau
                </label>
                <select
                  value={projectData.level}
                  onChange={(e) => handleInputChange('level', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Sélectionner un niveau</option>
                  <option value="cp">CP</option>
                  <option value="ce1">CE1</option>
                  <option value="ce2">CE2</option>
                  <option value="cm1">CM1</option>
                  <option value="cm2">CM2</option>
                  <option value="6eme">6ème</option>
                  <option value="5eme">5ème</option>
                  <option value="4eme">4ème</option>
                  <option value="3eme">3ème</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Langue principale
              </label>
              <select
                value={projectData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Étape 2: Configuration */}
      {currentStep === 2 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
            Configuration des exercices
          </h2>

          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-4">
                Paramètres de génération
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nombre total d'exercices
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    defaultValue="10"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Difficulté générale
                  </label>
                  <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="facile">Facile</option>
                    <option value="moyen">Moyen</option>
                    <option value="difficile">Difficile</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-4">
                Types d'exercices
              </h3>

              <div className="space-y-4">
                {[
                  { type: 'qcm', label: 'QCM (Questions à choix multiples)', defaultCount: 5 },
                  { type: 'vrai_faux', label: 'Vrai/Faux', defaultCount: 3 },
                  { type: 'trous', label: 'Texte à trous', defaultCount: 2 },
                  { type: 'reponse_courte', label: 'Réponses courtes', defaultCount: 2 },
                  { type: 'probleme', label: 'Problèmes/Résolutions', defaultCount: 1 }
                ].map(exercise => (
                  <div key={exercise.type} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {exercise.label}
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      defaultValue={exercise.defaultCount}
                      className="w-20 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-4">
                Options supplémentaires
              </h3>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mr-3"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Inclure les corrections détaillées
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mr-3"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Générer des indices pour les exercices difficiles
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-3"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Adapter la difficulté selon le niveau
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Étape 3: Aperçu */}
      {currentStep === 3 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
            Aperçu du projet
          </h2>

          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                Résumé du projet
              </h3>
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <p><strong>Nom:</strong> {projectData.name || 'Non défini'}</p>
                <p><strong>Matière:</strong> {projectData.subject || 'Non définie'}</p>
                <p><strong>Niveau:</strong> {projectData.level || 'Non défini'}</p>
                <p><strong>Langue:</strong> {projectData.language === 'fr' ? 'Français' : projectData.language === 'en' ? 'English' : 'Español'}</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                Configuration des exercices
              </h3>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <p>• 10 exercices au total</p>
                <p>• 5 QCM, 3 Vrai/Faux, 2 Textes à trous</p>
                <p>• Corrections détaillées incluses</p>
                <p>• Difficulté: Moyenne</p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">
                Prêt à créer !
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Votre projet est configuré et prêt à être créé. Cliquez sur "Créer le projet" pour commencer la génération des exercices.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Boutons de navigation */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Précédent
        </button>

        <div className="flex gap-4">
          {currentStep < 3 ? (
            <button
              onClick={nextStep}
              disabled={!projectData.name.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={handleCreateProject}
              disabled={isCreating}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création en cours...
                </>
              ) : (
                'Créer le projet'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}