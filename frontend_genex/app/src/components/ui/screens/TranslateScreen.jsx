import React, { useState } from 'react'
import { FileText, Upload, Languages, Download, Globe, ArrowRight, AlertCircle, CheckCircle, Loader2, X } from 'lucide-react'
import { translationService } from '../../api_service/translationService'

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
  const [error, setError] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [translationStats, setTranslationStats] = useState(null)
  const [recentTranslations, setRecentTranslations] = useState([])

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
    { code: 'ar', name: 'العربية' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'pl', name: 'Polski' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'ko', name: '한국어' }
  ]

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Veuillez sélectionner un fichier PDF')
        return
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB max
        setError('Le fichier est trop volumineux (max 50MB)')
        return
      }
      setUploadedFile(file)
      setError(null)
      setTranslatedFile(null)
      setTranslationStats(null)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file)
      setError(null)
      setTranslatedFile(null)
      setTranslationStats(null)
    } else {
      setError('Veuillez déposer un fichier PDF')
    }
  }

  const handleOptionChange = (field, value) => {
    setOptions(prev => ({ ...prev, [field]: value }))
  }

  const handleTranslate = async () => {
    if (!uploadedFile) {
      setError('Veuillez sélectionner un fichier')
      return
    }

    if (sourceLanguage === targetLanguage && sourceLanguage !== 'auto') {
      setError('Les langues source et cible doivent être différentes')
      return
    }

    setIsTranslating(true)
    setError(null)
    setUploadProgress(0)

    try {
      const result = await translationService.translatePDF(
        uploadedFile,
        sourceLanguage,
        targetLanguage,
        options,
        (progress) => setUploadProgress(progress)
      )

      setTranslatedFile(result.file)
      setTranslationStats(result.stats)

      // Ajouter aux traductions récentes (stockage local)
      const newTranslation = {
        id: Date.now(),
        originalName: uploadedFile.name,
        translatedName: result.file.name,
        sourceLanguage: result.stats.source_language,
        targetLanguage: targetLanguage,
        timestamp: new Date().toISOString(),
        fileUrl: result.file.url,
        taskId: result.task_id
      }

      const updated = [newTranslation, ...recentTranslations.slice(0, 4)]
      setRecentTranslations(updated)
      localStorage.setItem('recentTranslations', JSON.stringify(updated))

    } catch (err) {
      console.error('Erreur de traduction:', err)
      setError(err.message || 'Erreur lors de la traduction du document')
    } finally {
      setIsTranslating(false)
      setUploadProgress(0)
    }
  }

  const handleDownloadTranslated = async () => {
    if (!translatedFile) return

    try {
      await translationService.downloadTranslatedFile(translatedFile.taskId, translatedFile.name)
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err)
      setError('Erreur lors du téléchargement')
    }
  }

  const handleDownloadRecent = async (translation) => {
    try {
      await translationService.downloadTranslatedFile(translation.taskId, translation.translatedName)
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err)
      setError('Erreur lors du téléchargement')
    }
  }

  const resetForm = () => {
    setUploadedFile(null)
    setTranslatedFile(null)
    setError(null)
    setTranslationStats(null)
  }

  // Charger les traductions récentes au montage
  React.useEffect(() => {
    const saved = localStorage.getItem('recentTranslations')
    if (saved) {
      try {
        setRecentTranslations(JSON.parse(saved))
      } catch (e) {
        // localStorage.removeItem('recentTranslations')
        console.error('Erreur lors du chargement des traductions récentes', e)

      }
    }
  }, [])

  const getLanguageName = (code) => {
    return languages.find(l => l.code === code)?.name || code
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Languages className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Traducteur PDF
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Traduisez vos documents PDF en quelques secondes
            </p>
          </div>
        </div>
      </div>

      {/* Message d'erreur global */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section Upload et Configuration */}
        <div className="space-y-6">
          {/* Upload */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Upload className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Document à traduire
              </h2>
            </div>

            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors"
            >
              {uploadedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-12 w-12 text-red-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • PDF
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={resetForm}
                    className="text-sm text-red-500 hover:text-red-700 underline"
                  >
                    Changer de fichier
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Glissez-déposez un PDF ou cliquez pour sélectionner
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    Taille maximale : 50 MB
                  </p>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="inline-flex justify-center active:scale-95 items-center px-6 py-3 bg-linear-to-r from-indigo-500 to-purple-500 cursor-pointer text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Sélectionner un PDF
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Langues */}
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
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-center py-2">
                <ArrowRight className="h-6 w-6 text-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Langue cible
                </label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
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

          {/* Options */}
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
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="standard">Standard (Rapide)</option>
                  <option value="high">Haute (Recommandé)</option>
                  <option value="premium">Premium (Meilleure qualité)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section Résultat */}
        <div className="space-y-6">
          {/* Traduction */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Languages className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Résultat
              </h2>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-8 min-h-75 flex items-center justify-center">
                {isTranslating ? (
                  <div className="text-center">
                    <Loader2 className="h-16 w-16 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                      Traduction en cours...
                    </p>
                    {uploadProgress > 0 && (
                      <div className="w-full max-w-xs mx-auto">
                        <div className="bg-slate-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                          {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                ) : translatedFile ? (
                  <div className="text-center w-full">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <p className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                      Traduction terminée !
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                      {translatedFile.name}
                    </p>
                    <button
                      onClick={handleDownloadTranslated}
                      className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors active:scale-95"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Télécharger le PDF traduit
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-slate-500 dark:text-slate-400">
                    <Languages className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Aucune traduction</p>
                    <p className="text-sm">Uploadez un fichier et cliquez sur "Traduire"</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleTranslate}
                disabled={isTranslating || !uploadedFile}
                className="w-full flex items-center justify-center px-6 py-3 bg-linear-to-r from-indigo-500 to-purple-500 text-white cursor-pointer rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
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

          {/* Statistiques */}
          {translationStats && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Statistiques de traduction
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <p className="text-2xl font-bold text-indigo-600">{translationStats.word_count || 0}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Mots traduits</p>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{translationStats.pages || 0}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Pages</p>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {getLanguageName(translationStats.source_language)}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Langue source</p>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {translationStats.processing_time ? `${translationStats.processing_time}s` : 'N/A'}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Temps</p>
                </div>
              </div>
            </div>
          )}

          {/* Historique */}
          {recentTranslations.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Traductions récentes
              </h3>
              <div className="space-y-3 max-h-100 overflow-y-auto pr-1">
                {recentTranslations.map((translation) => (
                  <div
                    key={translation.id}
                    className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors group"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate max-w-62.5 lg:max-w-75"
                          title={translation.translatedName}>
                          {translation.translatedName}
                        </p>
                        <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <span className="truncate max-w-25">{getLanguageName(translation.sourceLanguage)}</span>
                          <span className="shrink-0">→</span>
                          <span className="truncate max-w-25">{getLanguageName(translation.targetLanguage)}</span>
                          <span className="shrink-0 mx-1">•</span>
                          <span className="shrink-0 whitespace-nowrap">
                            {new Date(translation.timestamp).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadRecent(translation)}
                      className="text-indigo-600 hover:text-indigo-700 p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors shrink-0 ml-2 opacity-70 hover:opacity-100"
                      title="Télécharger"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {recentTranslations.length === 0 && (
                  <div className="text-center py-8 px-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Aucune traduction récente
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}