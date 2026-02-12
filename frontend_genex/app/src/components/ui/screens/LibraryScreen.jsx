import React, { useState, useEffect } from 'react'
import { FileText, Upload, Search, Filter, Download, Trash2, Folder, Grid, List, Eye, Share, MoreVertical, Loader2 } from 'lucide-react'
import { routingService } from '../../api_service/getRouting'

export default function LibraryScreen() {
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedDoc, setSelectedDoc] = useState(null)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await routingService.get_documents()
        
        // Traitement des données pour ajouter les propriétés frontend
        const processedDocs = data.map(doc => {
          // Générer une taille aléatoire pour la démo (en octets)
          const sizeInBytes = Math.floor(Math.random() * (1024 * 1024 * 10)) + 1024 // 1KB à 10MB
          
          // Générer une date aléatoire pour la démo (des 30 derniers jours)
          const randomDaysAgo = Math.floor(Math.random() * 30)
          const uploadDate = new Date()
          uploadDate.setDate(uploadDate.getDate() - randomDaysAgo)
          
          // Déterminer la catégorie basée sur le type de fichier
          const fileType = doc.file_type || ''
          let category = ''
          
          if (['PDF', 'DOCX', 'TXT'].includes(fileType)) {
            category = 'Documents'
          } else if (['PNG', 'JPG', 'JPEG', 'GIF'].includes(fileType.toUpperCase())) {
            category = 'Images'
          } else if (['MP4', 'AVI', 'MOV'].includes(fileType.toUpperCase())) {
            category = 'Vidéos'
          } else {
            category = 'Autres'
          }
          
          return {
            ...doc,
            size: sizeInBytes, // Taille générée côté frontend
            uploaded_at: doc.uploaded_at || uploadDate.toISOString(),
            date: doc.uploaded_at || uploadDate.toISOString(),
            category: category, // Catégorie déterminée côté frontend
            created_at: doc.created_at || uploadDate.toISOString()
          }
        })
        
        setDocuments(processedDocs)
        
        // Set default selection if documents exist
        if (processedDocs.length > 0) {
          setSelectedDoc(processedDocs[0].id)
        }
      } catch (err) {
        setError(err.message || "Erreur lors du chargement des documents")
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  // Extract unique categories from processed documents
  const categories = ['Tous', ...new Set(documents.map(doc => doc.category).filter(Boolean))]

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.extracted_text?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.uploaded_at || a.created_at || 0)
      const dateB = new Date(b.uploaded_at || b.created_at || 0)
      return dateB - dateA
    }
    if (sortBy === 'name') return (a.filename || '').localeCompare(b.filename || '')
    if (sortBy === 'size') return (b.size || 0) - (a.size || 0)
    return 0
  })

  const getFileIcon = (fileType) => {
    const type = (fileType || '').toLowerCase()
    switch (type) {
      case 'pdf': return '📄'
      case 'doc':
      case 'docx': return '📝'
      case 'ppt':
      case 'pptx': return '📊'
      case 'xls':
      case 'xlsx': return '📈'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️'
      case 'txt': return '📃'
      case 'mp4':
      case 'avi':
      case 'mov': return '🎬'
      default: return '📄'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    
    // Format selon la proximité dans le temps
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return "Aujourd'hui"
    } else if (diffDays === 1) {
      return "Hier"
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }
  }

  const formatSize = (sizeInBytes) => {
    if (!sizeInBytes && sizeInBytes !== 0) return 'N/A'
    
    if (typeof sizeInBytes === 'string') {
      // Si c'est déjà formaté, retourner tel quel
      return sizeInBytes
    }
    
    const size = Number(sizeInBytes)
    
    if (size < 1024) {
      return `${size} B`
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`
    } else if (size < 1024 * 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`
    } else {
      return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`
    }
  }

  const calculateTotalSize = () => {
    const totalBytes = documents.reduce((sum, doc) => {
      const size = Number(doc.size) || 0
      return sum + size
    }, 0)
    
    return formatSize(totalBytes)
  }

  const handleDelete = async (docId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return
    
    try {
      // Appel API pour supprimer (à implémenter selon votre service)
      // await routingService.delete_document(docId)
      setDocuments(prev => prev.filter(doc => doc.id !== docId))
      
      // Si le document sélectionné est supprimé, sélectionner le premier disponible
      if (selectedDoc === docId && documents.length > 1) {
        const remainingDocs = documents.filter(doc => doc.id !== docId)
        if (remainingDocs.length > 0) {
          setSelectedDoc(remainingDocs[0].id)
        } else {
          setSelectedDoc(null)
        }
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Erreur lors de la suppression')
    }
  }

  const handleUpload = async () => {
    // Implémentation fictive pour le bouton upload
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.docx,.txt,.png,.jpg,.jpeg,.gif'
    
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      
      // Simuler un upload avec un nouveau document
      const newDoc = {
        id: `temp-${Date.now()}`,
        filename: file.name,
        file_type: file.name.split('.').pop().toUpperCase(),
        size: file.size,
        category: file.type.startsWith('image/') ? 'Images' : 
                 file.type.includes('pdf') ? 'Documents' : 'Autres',
        uploaded_at: new Date().toISOString(),
        status: 'UPLOADED',
        extracted_text: ''
      }
      
      setDocuments(prev => [newDoc, ...prev])
      setSelectedDoc(newDoc.id)
    }
    
    input.click()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PROCESSED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'UPLOADED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'AI_PROCESSING': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'OCR_DONE': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'ERROR': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Chargement des documents...
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Folder className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Bibliothèque de Documents
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {documents.length} document{documents.length !== 1 ? 's' : ''} • {calculateTotalSize()} utilisés
            </p>
          </div>
        </div>
      </div>

      {/* Barre d'outils */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Recherche */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou contenu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Filtres et tri */}
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              {categories.map(cat => (
                <option key={cat} value={cat === 'Tous' ? 'all' : cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="date">Date récente</option>
              <option value="name">Nom A-Z</option>
              <option value="size">Taille décroissante</option>
            </select>

            {/* Boutons de vue */}
            <div className="flex border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'} transition-colors`}
                title="Vue grille"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'} transition-colors`}
                title="Vue liste"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Bouton upload */}
            <button 
              onClick={handleUpload}
              className="flex items-center px-4 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all hover:from-indigo-700 hover:to-purple-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importer
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Total documents</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{documents.length}</p>
            </div>
            <FileText className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <div className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 dark:text-green-300 mb-1">Espace utilisé</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">{calculateTotalSize()}</p>
            </div>
            <Folder className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <div className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-1">Catégories</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{categories.length - 1}</p>
            </div>
            <Filter className="h-10 w-10 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        
        <div className="bg-linear-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl border border-amber-200 dark:border-amber-800 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-1">Filtrés</p>
              <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{filteredDocuments.length}</p>
            </div>
            <Search className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>

      {/* Liste des documents */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        {filteredDocuments.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-20 w-20 text-slate-400 mx-auto mb-4" />
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-2">
              Aucun document trouvé
            </p>
            <p className="text-slate-500 dark:text-slate-500 mb-4">
              {documents.length === 0 ? "Importez votre premier document" : "Essayez de modifier vos critères de recherche"}
            </p>
            <button
              onClick={handleUpload}
              className="flex items-center px-4 py-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all mx-auto"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importer un document
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocuments.map(doc => (
                <div 
                  key={doc.id} 
                  className="group border border-slate-200 dark:border-slate-600 rounded-xl p-4 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500 transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{getFileIcon(doc.file_type)}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(doc.status)}`}>
                        {doc.status || 'UPLOADED'}
                      </span>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 truncate" title={doc.filename}>
                    {doc.filename}
                  </h3>
                  
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    {doc.category || 'Non catégorisé'} • {doc.file_type}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <span>{formatSize(doc.size)}</span>
                    <span>{formatDate(doc.uploaded_at)}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedDoc(doc.id)}
                      className="flex-1 flex items-center justify-center px-2 py-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-xs font-medium hover:shadow-md transition-all hover:from-indigo-700 hover:to-purple-700"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Voir
                    </button>
                    <button 
                      className="flex-1 flex items-center justify-center px-2 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                      title="Télécharger"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      DL
                    </button>
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="px-2 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg text-xs hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:border-red-400"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-600">
            {filteredDocuments.map(doc => (
              <div 
                key={doc.id} 
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span className="text-2xl">{getFileIcon(doc.file_type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {doc.filename}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(doc.status)}`}>
                          {doc.status || 'UPLOADED'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {doc.category || 'Non catégorisé'} • {doc.file_type} • {formatSize(doc.size)} • {formatDate(doc.uploaded_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedDoc(doc.id)}
                      className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                      title="Voir"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all" 
                      title="Partager"
                    >
                      <Share className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all" 
                      title="Télécharger"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredDocuments.length > 0 && (
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Affichage de <span className="font-semibold">{filteredDocuments.length}</span> document{filteredDocuments.length > 1 ? 's' : ''}
            </p>
            {selectedDoc && (
              <p className="text-sm text-indigo-600 dark:text-indigo-400">
                • Document sélectionné: {documents.find(d => d.id === selectedDoc)?.filename}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Précédent
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              1
            </button>
            <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  )
}