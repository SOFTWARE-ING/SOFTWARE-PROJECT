import React, { useState } from 'react'
import { FileText, Upload, Settings, Download, Sparkles, Wand2 } from 'lucide-react'

export default function GenerateScreen() {
  const [inputType, setInputType] = useState('text')
  const [inputText, setInputText] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [options, setOptions] = useState({
    format: 'pdf',
    quality: 'high',
    language: 'fr',
    template: 'default'
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedFile, setGeneratedFile] = useState(null)

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleOptionChange = (field, value) => {
    setOptions(prev => ({ ...prev, [field]: value }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    // Simulate generation process
    setTimeout(() => {
      setGeneratedFile({
        name: 'generated_document.pdf',
        url: '#'
      })
      setIsGenerating(false)
    }, 3000)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <Wand2 className="h-8 w-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Générateur IA de PDF
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section Input */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Source du document
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Type d'entrée
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="inputType"
                      value="text"
                      checked={inputType === 'text'}
                      onChange={(e) => setInputType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-slate-700 dark:text-slate-300">Texte</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="inputType"
                      value="file"
                      checked={inputType === 'file'}
                      onChange={(e) => setInputType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-slate-700 dark:text-slate-300">Fichier</span>
                  </label>
                </div>
              </div>

              {inputType === 'text' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Contenu du document
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Entrez votre texte ici..."
                    rows={8}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Télécharger un fichier
                  </label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
                    {uploadedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="h-8 w-8 text-indigo-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {uploadedFile.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={() => setUploadedFile(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-slate-400 mb-2">
                          Glissez-déposez un fichier ou cliquez pour sélectionner
                        </p>
                        <input
                          type="file"
                          accept=".txt,.doc,.docx,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer transition-colors"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Sélectionner un fichier
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section Options */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Options de génération
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Format de sortie
                </label>
                <select
                  value={options.format}
                  onChange={(e) => handleOptionChange('format', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="docx">Word (.docx)</option>
                  <option value="txt">Texte (.txt)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Qualité
                </label>
                <select
                  value={options.quality}
                  onChange={(e) => handleOptionChange('quality', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Langue
                </label>
                <select
                  value={options.language}
                  onChange={(e) => handleOptionChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Modèle
                </label>
                <select
                  value={options.template}
                  onChange={(e) => handleOptionChange('template', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="default">Par défaut</option>
                  <option value="professional">Professionnel</option>
                  <option value="academic">Académique</option>
                  <option value="creative">Créatif</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section Aperçu et Génération */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Aperçu et Génération
              </h2>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 min-h-75 flex items-center justify-center">
                {generatedFile ? (
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <p className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                      Document généré avec succès !
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {generatedFile.name}
                    </p>
                    <a
                      href={generatedFile.url}
                      download={generatedFile.name}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </a>
                  </div>
                ) : (
                  <div className="text-center text-slate-500 dark:text-slate-400">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Aperçu du document généré</p>
                    <p className="text-sm">Cliquez sur "Générer" pour créer votre PDF</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || (!inputText && !uploadedFile)}
                className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Générer le document
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section Historique */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Documents récents
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Rapport_Mensuel.pdf
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Généré il y a 2 heures
                    </p>
                  </div>
                </div>
                <button className="text-indigo-600 hover:text-indigo-700">
                  <Download className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      CV_Professionnel.pdf
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Généré hier
                    </p>
                  </div>
                </div>
                <button className="text-indigo-600 hover:text-indigo-700">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}