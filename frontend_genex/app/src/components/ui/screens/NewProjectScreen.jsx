import React, { useEffect, useState } from 'react'
import { Plus, FileText, Settings, Eye, ArrowRight, Sliders, CheckCircle2, BookOpen, Calculator, Trash2 } from 'lucide-react'
import { routingService } from '../../api_service/getRouting'
import { useAuth } from '../../Context_api'
// import { data } from 'react-router-dom'


const EXERCISE_TYPES = [
  { id: 'MCQ', label: 'Questions à Choix Multiple' },
  { id: 'FILL_IN', label: 'Texte à trous' },
  { id: 'OPEN', label: 'Questions ouvertes' },
  { id: 'REFLECTION', label: 'Questions de réflexion' },
  { id: 'CASE_STUDY', label: 'Études de cas' },
  { id: 'COMPETENCE', label: 'Exercices de compétence' },
  { id: 'PROBLEM_SOLVING', label: 'Résolution de problèmes' }
]

const EXERCISE_TEMPLATES = {
  MCQ: {
    bloom_taxonomy: ["remember", "understand"],
    options: { choices_count: 4, multiple_answers: false, include_none_of_the_above: true, include_all_of_the_above: true, shuffle_options: true, show_confidence_level: false }
  },
  FILL_IN: {
    bloom_taxonomy: ["understand", "apply"],
    options: { case_sensitive: false, hints_enabled: true, allow_partial_words: false, blanks_per_sentence: 1, context_before_after: 2 }
  },
  OPEN: {
    bloom_taxonomy: ["apply", "analyze"],
    options: { expected_length: "MEDIUM", word_limit: 200, require_justification: true, scoring_rubric: { criteria: ["pertinence", "clarté", "exhaustivité"], max_points: 10 } }
  },
  REFLECTION: {
    bloom_taxonomy: ["analyze", "evaluate"],
    options: { prompt_type: "critical_thinking", require_personal_opinion: true, require_examples: true, connect_to_real_life: true, scaffolding: { provide_guidance_questions: true, suggest_resources: true } }
  },
  CASE_STUDY: {
    bloom_taxonomy: ["analyze", "evaluate", "create"],
    options: { case_length: "MEDIUM", include_data: true, include_context: true, sub_questions: 3, sub_question_types: ["MCQ", "OPEN", "REFLECTION"], require_solution_proposal: true, evaluation_criteria: ["analyse", "méthodologie", "solution"] }
  },
  COMPETENCE: {
    bloom_taxonomy: ["apply", "create"],
    options: { competence_type: "practical_application", scenario_based: true, require_procedure: true, steps_to_follow: 3, include_constraints: true, success_criteria: ["efficacité", "précision", "méthode"] }
  },
  PROBLEM_SOLVING: {
    bloom_taxonomy: ["apply", "analyze", "create"],
    options: { problem_complexity: "HIGH", require_multiple_steps: true, include_diagrams: true, verification_steps: true, alternative_solutions: true }
  }
}

export default function NewProjectScreen() {

  const [currentStep, setCurrentStep] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getUser } = useAuth();
  const user = getUser()
  const [ititle, isetTitle] = useState('')

  const [sourceLanguage, setSourceLanguage] = useState('')
  const [targetLanguage, setTargetLanguage] = useState('')
  const [numberOfExercises, setNumberOfExercises] = useState(20)
  const [difficultyLevel, setDifficultyLevel] = useState(3)
  const [numberOfExercisesType, setNumberOfExercisesType] = useState(5)
  const [questionsPerExercise, setQuestionsPerExercise] = useState(1)
  const [selectedTypeToAdd, setSelectedTypeToAdd] = useState('MCQ')



  const [projectData, setProjectData] = useState({
    user_id: user?.id || null,
    document_id: documents.length > 0 ? documents[0].id : null,
    title: ititle,
    config: {
      generation_mode: "EXERCISES",
      language: {
        source: sourceLanguage || "fr",
        target: targetLanguage || "fr"
      },
      exercises: {
        total: numberOfExercises,
        difficulty: difficultyLevel,
        types: [],
      },
      correction: {
        generate_answers: true,
      },
    }
  })

  // Update projectData when title changes
  useEffect(() => {
    setProjectData(prev => ({
      ...prev,
      title: ititle
    }))
  }, [ititle])

  // Update projectData when selected document changes
  useEffect(() => {
    if (selectedDoc) {
      setProjectData(prev => ({
        ...prev,
        document_id: selectedDoc
      }))
    }
  }, [selectedDoc])

  // Effet pour mettre à jour user_id quand l'utilisateur est disponible
  useEffect(() => {
    if (user?.id) {
      setProjectData(prev => ({
        ...prev,
        user_id: user.id
      }))
    }
  }, [user])

  // Effet pour initialiser les langues par défaut
  useEffect(() => {
    if (!sourceLanguage) {
      setSourceLanguage('fr')
    }
    if (!targetLanguage) {
      setTargetLanguage('fr')
    }
  }, [])

  // Update projectData when languages change
  useEffect(() => {
    setProjectData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        language: {
          source: sourceLanguage || "fr",
          target: targetLanguage || "fr"
        }
      }
    }))
  }, [sourceLanguage, targetLanguage])

  // Update projectData when number of exercises changes
  useEffect(() => {
    setProjectData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        exercises: {
          ...prev.config.exercises,
          total: numberOfExercises,
          difficulty: difficultyLevel,
        }
      }
    }))
  }, [numberOfExercises, difficultyLevel])

  const handleAddExerciseType = () => {
    if (!selectedTypeToAdd) {
      alert('Veuillez sélectionner un type d\'exercice')
      return
    }

    const typeObj = EXERCISE_TYPES.find(t => t.id === selectedTypeToAdd)

    // Check if type already exists
    const existingTypeIndex = projectData.config.exercises.types.findIndex(
      t => t.type === selectedTypeToAdd
    )

    if (existingTypeIndex !== -1) {
      // Update existing type
      setProjectData(prev => ({
        ...prev,
        config: {
          ...prev.config,
          exercises: {
            ...prev.config.exercises,
            types: prev.config.exercises.types.map((t, i) =>
              i === existingTypeIndex ? {
                ...t,
                count: t.count + numberOfExercisesType
              } : t
            )
          }
        }
      }))
    } else {
      // Add new type
      const newType = {
        type: selectedTypeToAdd,
        label: typeObj?.label || selectedTypeToAdd,
        count: numberOfExercisesType,
        questions_per_exercise: questionsPerExercise,
        difficulty_level: difficultyLevel,
      }

      setProjectData(prev => ({
        ...prev,
        config: {
          ...prev.config,
          exercises: {
            ...prev.config.exercises,
            types: [...prev.config.exercises.types, newType],
          },
        },
      }))
    }

    // Reset form
    setNumberOfExercisesType(5)
    setQuestionsPerExercise(1)
  }

  const handleExerciseTypeChange = (index, field, value) => {
    setProjectData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        exercises: {
          ...prev.config.exercises,
          types: prev.config.exercises.types.map((t, i) =>
            i === index ? { ...t, [field]: value } : t
          ),
        },
      },
    }))
  }


  const handleRemoveExerciseType = (index) => {
    setProjectData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        exercises: {
          ...prev.config.exercises,
          types: prev.config.exercises.types.filter((_, i) => i !== index)
        }
      }
    }))
  }

  // Function to update nested state
  const updateState = (path, value) => {
    const keys = path.split('.')
    setProjectData(prev => {
      const newData = { ...prev }
      let current = newData

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value
      return newData
    })
  }

  // const handleCreateProject = async () => {
  //   // Validation
  //   if (!projectData.title.trim()) {
  //     alert('Le titre est obligatoire')
  //     return
  //   }

  //   if (!projectData.document_id) {
  //     alert('Veuillez sélectionner un document')
  //     return
  //   }

  //   if (projectData.config.exercises.types.length === 0) {
  //     alert('Veuillez ajouter au moins un type d\'exercice')
  //     return
  //   }




  //   setIsCreating(true)
  //   console.log("Payload to send:", JSON.stringify(projectData, null, 2))

  //   // Simulate project creation
  //   setTimeout(() => {
  //     setIsCreating(false)
  //     alert('Document généré avec succès ! Payload logged to console.')
  //   }, 2000)
  // }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const steps = [
    { id: 1, title: 'Général', icon: FileText },
    { id: 2, title: 'Exercices', icon: BookOpen },
    { id: 3, title: 'Avancé', icon: Sliders },
    { id: 4, title: 'Aperçu', icon: Eye }
  ]



  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true)
        const data = await routingService.get_documents()
        setDocuments(data)
        // Set default selection if documents exist
        if (data.length > 0) {
          setSelectedDoc(data[0].id)
        }
      } catch (err) {
        setError(err.message || "Erreur lors du chargement")
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()

  }, [])

  const createProject = async (projectData) => {
    try {
      const response = await routingService.create_project(projectData);
      return response; // Retourne la réponse complète
    } catch (error) {
      console.error("Erreur création projet:", error);
      throw error; // Propager l'erreur
    }
  };

  const handleCreateProject = async () => {
  // Validation
  if (!projectData.title.trim()) {
    alert('Le titre est obligatoire');
    return;
  }

  if (!projectData.document_id) {
    alert('Veuillez sélectionner un document');
    return;
  }

  if (projectData.config.exercises.types.length === 0) {
    alert('Veuillez ajouter au moins un type d\'exercice');
    return;
  }

  setIsCreating(true);
  
  try {
    console.log("📤 Envoi du payload:", projectData);
    
    // Appeler l'API avec les données brutes (pas JSON.stringify)
    const response = await createProject(projectData);
    
    console.log("✅ Réponse de l'API:", response);
    alert('Document généré avec succès !');
    
  } catch (error) {
    console.error("❌ Erreur lors de la création:", error);
    
    // Messages d'erreur spécifiques selon le code
    if (error.message.includes("401")) {
      alert('Erreur 401: Non autorisé. Vérifiez votre authentification.');
    } else if (error.message.includes("Network")) {
      alert('Erreur réseau. Vérifiez la connexion et le serveur FastAPI.');
    } else {
      alert(`Erreur: ${error.message}`);
    }
    
  } finally {
    setIsCreating(false);
  }
};

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <Plus className="h-8 w-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Nouveau Projet
        </h1>
      </div>

      {/* Indicateur de progression */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${currentStep >= step.id
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                <step.icon className="h-5 w-5" />
              </div>
              <span className={`text-sm font-medium hidden sm:block ${currentStep >= step.id
                ? 'text-indigo-600'
                : 'text-slate-600 dark:text-slate-400'
                }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-slate-400 mx-2 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Étape 1: Informations générales */}
      {currentStep === 1 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
            Informations générales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Titre du projet (Matière/Cours) <span className='text-red-600'>*</span>
              </label>
              <input
                type="text"
                value={ititle}
                placeholder='Nom du cours ou de la matière...'
                onChange={(e) => isetTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Document ID */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Document Selection <span className='text-red-600'>*</span>
              </label>
              {loading ? (
                <div className="text-sm text-slate-500">Chargement des documents...</div>
              ) : error ? (
                <div className="text-sm text-red-500">{error}</div>
              ) : (
                <select
                  value={selectedDoc}
                  onChange={(e) => setSelectedDoc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">-- Sélectionner un document --</option>
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.filename}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* User ID (read-only) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                ID Utilisateur
              </label>
              <input
                type="text"
                value={user?.id || ""}
                readOnly
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>

            {/* Source Language */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Langue Source
              </label>
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>

            {/* Target Language */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Langue Cible
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>

            {/* Subject Area */}
            {/* <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Domaine/Matière
              </label>
              <input
                type="text"
                value={projectData.config.metadata.subject_area}
                onChange={(e) => updateState('config.metadata.subject_area', e.target.value)}
                placeholder="Mathématiques, Histoire, etc."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div> */}

            {/* Educational Level */}
            {/* <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Niveau Éducatif
              </label>
              <input
                type="text"
                value={projectData.config.metadata.educational_level}
                onChange={(e) => updateState('config.metadata.educational_level', e.target.value)}
                placeholder="Lycée, Université, etc."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div> */}
          </div>
        </div>
      )}

      {/* Étape 2: Configuration Exercices */}
      {currentStep === 2 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
            Configuration des exercices
          </h2>

          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-4">
                Paramètres globaux
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nombre total d'exercices
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={numberOfExercises}
                      onChange={(e) => setNumberOfExercises(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <div className={`text-xs font-medium whitespace-nowrap ${numberOfExercises >= 15 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      <Calculator className="inline h-3 w-3 mr-1" />
                      Actuel: {numberOfExercises}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Niveau de difficulté global (1-3)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    value={difficultyLevel}
                    onChange={(e) => setDifficultyLevel(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>Facile</span>
                    <span>Moyen</span>
                    <span>Difficile</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-4">
                Types d'exercices
              </h3>

              <div className="flex gap-4 mb-6 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Ajouter un type d'exercice
                  </label>
                  <select
                    value={selectedTypeToAdd}
                    onChange={(e) => setSelectedTypeToAdd(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Sélectionner un type</option>
                    {EXERCISE_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nombre d'exercices de ce type
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={numberOfExercisesType}
                    onChange={(e) => setNumberOfExercisesType(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Questions par exercice
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={questionsPerExercise}
                    onChange={(e) => setQuestionsPerExercise(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={handleAddExerciseType}
                  disabled={!selectedTypeToAdd}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ajouter
                </button>
              </div>

              <div className="space-y-4">
                {projectData.config.exercises.types.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                    Aucun exercice configuré. Ajoutez-en un ci-dessus.
                  </p>
                ) : (
                  <>
                    {projectData.config.exercises.types.map((exercise, index) => (
                      <div key={`${exercise.type}-${index}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white dark:bg-slate-600 rounded-md border border-slate-200 dark:border-slate-500">
                        <div className="mb-2 sm:mb-0 flex-1">
                          <span className="font-medium text-slate-900 dark:text-slate-100 block">
                            {exercise.label}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-300">
                            {exercise.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                          <div className="flex flex-col">
                            <label className="text-xs text-slate-500 dark:text-slate-300 mb-1">Quantité</label>
                            <input
                              type="number"
                              min="1"
                              max="50"
                              value={exercise.count}
                              onChange={(e) => handleExerciseTypeChange(index, 'count', parseInt(e.target.value) || 1)}
                              className="w-20 px-2 py-1 border border-slate-300 dark:border-slate-500 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-center"
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="text-xs text-slate-500 dark:text-slate-300 mb-1">Questions/Ex</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={exercise.questions_per_exercise}
                              onChange={(e) => handleExerciseTypeChange(index, 'questions_per_exercise', parseInt(e.target.value) || 1)}
                              className="w-20 px-2 py-1 border border-slate-300 dark:border-slate-500 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-center"
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="text-xs text-slate-500 dark:text-slate-300 mb-1">Difficulté (1-5)</label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={exercise.difficulty_level}
                              onChange={(e) => handleExerciseTypeChange(index, 'difficulty_level', parseInt(e.target.value) || 1)}
                              className="w-20 px-2 py-1 border border-slate-300 dark:border-slate-500 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-center"
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveExerciseType(index)}
                            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        Total des exercices: {projectData.config.exercises.types.reduce((sum, ex) => sum + ex.count, 0)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Étape 3: Paramètres Avancés */}
      {currentStep === 3 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
            Paramètres avancés
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scaffolding */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4" /> Échafaudage (Scaffolding)
              </h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  {/* <input
                    type="checkbox"
                    onChange={(e) => updateState('config.scaffolding.provide_hints', e.target.checked)}
                    className="mr-3 h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  /> */}
                  <span className="text-sm text-slate-700 dark:text-slate-300">Fournir des indices</span>
                </label>
                <label className="flex items-center">
                  {/* <input
                    type="checkbox"
                    checked={projectData.config.scaffolding.include_examples}
                    onChange={(e) => updateState('config.scaffolding.include_examples', e.target.checked)}
                    className="mr-3 h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  /> */}
                  <span className="text-sm text-slate-700 dark:text-slate-300">Inclure des exemples</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    onChange={(e) => updateState('config.scaffolding.formula_sheet', e.target.checked)}
                    className="mr-3 h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Feuille de formules</span>
                </label>
              </div>
            </div>

            {/* Correction */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Correction
              </h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  {/* <input
                    type="checkbox"
                    // checked={projectData.config.correction.generate_answers}
                    onChange={(e) => updateState('config.correction.generate_answers', e.target.checked)}
                    className="mr-3 h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  /> */}
                  <span className="text-sm text-slate-700 dark:text-slate-300">Générer les réponses</span>
                </label>
                <label className="flex items-center">
                  {/* <input
                    type="checkbox"
                    // checked={projectData.config.correction.include_explanations}
                    onChange={(e) => updateState('config.correction.include_explanations', e.target.checked)}
                    className="mr-3 h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  /> */}
                  <span className="text-sm text-slate-700 dark:text-slate-300">Inclure des explications</span>
                </label>
                <label className="flex items-center">
                  {/* <input
                    type="checkbox"
                    // checked={projectData.config.correction.include_rubrics}
                    onChange={(e) => updateState('config.correction.include_rubrics', e.target.checked)}
                    className="mr-3 h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  /> */}
                  <span className="text-sm text-slate-700 dark:text-slate-300">Inclure des grilles d'évaluation</span>
                </label>
              </div>
            </div>

            {/* Output */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 md:col-span-2">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4" /> Sortie (Output)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Format
                  </label>
                  {/* <select
                    value={projectData.config.output.format}
                    onChange={(e) => updateState('config.output.format', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="PDF">PDF</option>
                  </select> */}
                </div>
                <div className="space-y-2">
                  <label className="flex items-center">
                    {/* <input
                      type="checkbox"
                      // checked={projectData.config.output.structure.cover_page}
                      onChange={(e) => updateState('config.output.structure.cover_page', e.target.checked)}
                      className="mr-3 h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    /> */}
                    <span className="text-sm text-slate-700 dark:text-slate-300">Page de couverture</span>
                  </label>
                  <label className="flex items-center">
                    {/* <input
                      type="checkbox"
                      // checked={projectData.config.output.structure.answer_sheet_separate}
                      onChange={(e) => updateState('config.output.structure.answer_sheet_separate', e.target.checked)}
                      className="mr-3 h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    /> */}
                    <span className="text-sm text-slate-700 dark:text-slate-300">Feuille de réponses séparée</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Étape 4: Aperçu */}
      {currentStep === 4 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
            Aperçu et Confirmation
          </h2>

          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                Résumé du projet
              </h3>
              <div className="text-sm text-slate-600 dark:text-slate-400 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p><strong>Titre:</strong> {projectData.title}</p>
                  <p><strong>Matière:</strong> { 'Non spécifié'}</p>
                  <p><strong>Niveau:</strong> {'Non spécifié'}</p>
                  <p><strong>Document ID:</strong> {projectData.document_id || 'Non sélectionné'}</p>
                </div>
                <div>
                  <p><strong>Total Exercices:</strong> {projectData.config.exercises.total}</p>
                  <p><strong>Difficulté globale:</strong> {projectData.config.exercises.difficulty}/3</p>
                  <p><strong>Types d'exercices:</strong> {projectData.config.exercises.types.length}</p>
                  {/* <p><strong>Format:</strong> {projectData.config.output.format}</p> */}
                </div>
              </div>
            </div>

            {/* Types d'exercices détaillés */}
            {projectData.config.exercises.types.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                  Détail des types d'exercices
                </h3>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {projectData.config.exercises.types.map((ex, index) => (
                    <div key={index} className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-600 last:border-0">
                      <span>{ex.label} ({ex.type})</span>
                      <span className="font-medium">{ex.count} exercices × {ex.questions_per_exercise} questions</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
              <h3 className="text-slate-100 text-sm font-mono mb-2">Payload JSON</h3>
              <pre className="text-xs text-green-400 font-mono">
                {JSON.stringify(projectData, null, 2)}
              </pre>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">
                Prêt à envoyer
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Vérifiez les données ci-dessus. Si tout est correct, cliquez sur "Générer le document" pour envoyer la configuration à l'API.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Boutons de navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Précédent
        </button>

        <div className="flex gap-4">
          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              disabled={!projectData.title.trim() || !projectData.document_id}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={handleCreateProject}
              disabled={isCreating || projectData.config.exercises.types.length === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création...
                </>
              ) : (
                'Générer le document'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}