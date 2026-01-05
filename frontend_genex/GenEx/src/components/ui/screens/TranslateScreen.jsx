import React, { useState } from 'react'
import { FileText, Upload, Languages, Download, Globe, ArrowRight } from 'lucide-react'

export default function TranslateScreen() {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [sourceLanguage, setSourceLanguage] = useState('auto')
  const [targetLanguage, setTargetLanguage] = useState('fr')
  const [options, setOptions] = useState({
    preserveFormatting: true,
    keepImages: true,
    quality: 'high'
  })
  const [isTranslating, setIsTranslating] = useState(false)
  const [translatedFile, setTranslatedFile] = useState(null)

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file)
    }
  }

  const handleOptionChange = (field, value) => {
    setOptions(prev => ({ ...prev, [field]: value }))
  }

  const handleTranslate = async () => {
    setIsTranslating(true)
    // Simulate translation process
    setTimeout(() => {
      setTranslatedFile({
        name: `translated_${uploadedFile.name}`,
        url: '#'
      })
      setIsTranslating(false)
    }, 5000)
  }

  const languages = [
    { code: 'auto', name: 'Détection automatique' },
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ar', name: 'العربية' }
  ]

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <Languages className="h-8 w-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Traducteur PDF
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section Upload et Langues */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Upload className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Document à traduire
              </h2>
            </div>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
              {uploadedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • PDF
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
                    Glissez-déposez un PDF ou cliquez pour sélectionner
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Sélectionner un PDF
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Langues
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Langue source
                </label>
                <select
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-center py-2">
                <ArrowRight className="h-5 w-5 text-slate-400" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Langue cible
                </label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {languages.filter(lang => lang.code !== 'auto').map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section Options */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Options de traduction
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Préserver la mise en forme
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Conserver la structure et les styles du document
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.preserveFormatting}
                    onChange={(e) => handleOptionChange('preserveFormatting', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Conserver les images
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Inclure les images du document original
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.keepImages}
                    onChange={(e) => handleOptionChange('keepImages', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Qualité de traduction
                </label>
                <select
                  value={options.quality}
                  onChange={(e) => handleOptionChange('quality', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="standard">Standard</option>
                  <option value="high">Haute</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section Résultat et Traduction */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Languages className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Traduction
              </h2>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 min-h-75 flex items-center justify-center">
                {translatedFile ? (
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <p className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                      Traduction terminée !
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {translatedFile.name}
                    </p>
                    <a
                      href={translatedFile.url}
                      download={translatedFile.name}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </a>
                  </div>
                ) : (
                  <div className="text-center text-slate-500 dark:text-slate-400">
                    <Languages className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Résultat de la traduction</p>
                    <p className="text-sm">Cliquez sur "Traduire" pour commencer</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleTranslate}
                disabled={isTranslating || !uploadedFile}
                className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {isTranslating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Traduction en cours...
                  </>
                ) : (
                  <>
                    <Languages className="h-5 w-5 mr-2" />
                    Traduire le document
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section Statistiques */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Statistiques de traduction
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">1,247</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Mots traduits</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">98.5%</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Précision</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">12</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Pages</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">2.3s</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Temps moyen</p>
              </div>
            </div>
          </div>

          {/* Section Historique */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Traductions récentes
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Rapport_EN_FR.pdf
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Anglais → Français • Il y a 1 heure
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
                      Manuel_ES_FR.pdf
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Espagnol → Français • Hier
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