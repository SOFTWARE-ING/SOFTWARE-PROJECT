import React, { useState } from 'react'
import { FileText, Upload, Search, Filter, Download, Trash2, Folder, Grid, List, Eye, Share, MoreVertical } from 'lucide-react'

export default function LibraryScreen() {
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  // Mock data for documents
  const [documents] = useState([
    {
      id: 1,
      name: 'Rapport_Mensuel.pdf',
      type: 'pdf',
      size: '2.4 MB',
      date: '2024-01-15',
      category: 'Rapports',
      thumbnail: null
    },
    {
      id: 2,
      name: 'CV_Developpeur.docx',
      type: 'docx',
      size: '1.2 MB',
      date: '2024-01-10',
      category: 'CV',
      thumbnail: null
    },
    {
      id: 3,
      name: 'Manuel_Utilisateur.pdf',
      type: 'pdf',
      size: '5.8 MB',
      date: '2024-01-08',
      category: 'Documentation',
      thumbnail: null
    },
    {
      id: 4,
      name: 'Presentation_Projet.pptx',
      type: 'pptx',
      size: '12.3 MB',
      date: '2024-01-05',
      category: 'Présentations',
      thumbnail: null
    },
    {
      id: 5,
      name: 'Contrat_Service.pdf',
      type: 'pdf',
      size: '890 KB',
      date: '2024-01-03',
      category: 'Contrats',
      thumbnail: null
    },
    {
      id: 6,
      name: 'Analyse_Marche.xlsx',
      type: 'xlsx',
      size: '3.1 MB',
      date: '2024-01-01',
      category: 'Analyses',
      thumbnail: null
    }
  ])

  const categories = ['Tous', 'Rapports', 'CV', 'Documentation', 'Présentations', 'Contrats', 'Analyses']

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    if (sortBy === 'date') return new Date(b.date) - new Date(a.date)
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'size') return parseFloat(b.size) - parseFloat(a.size)
    return 0
  })

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return '📄'
      case 'docx': return '📝'
      case 'pptx': return '📊'
      case 'xlsx': return '📈'
      default: return '📄'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Folder className="h-8 w-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Mes Documents
        </h1>
      </div>

      {/* Barre d'outils */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Recherche */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher des documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Filtres et tri */}
          <div className="flex gap-4 items-center">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="date">Trier par date</option>
              <option value="name">Trier par nom</option>
              <option value="size">Trier par taille</option>
            </select>

            {/* Boutons de vue */}
            <div className="flex border border-slate-300 dark:border-slate-600 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-100 dark:bg-indigo-600 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'} rounded-l-md`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-indigo-100 dark:bg-indigo-600 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'} rounded-r-md`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Bouton upload */}
            <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
              <Upload className="h-4 w-4 mr-2" />
              Importer
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total documents</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{documents.length}</p>
            </div>
            <FileText className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Espace utilisé</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">25.7 MB</p>
            </div>
            <Folder className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Ce mois</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">+12</p>
            </div>
            <Upload className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Téléchargements</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">89</p>
            </div>
            <Download className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Liste des documents */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        {filteredDocuments.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
              Aucun document trouvé
            </p>
            <p className="text-slate-500 dark:text-slate-500">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocuments.map(doc => (
                <div key={doc.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{getFileIcon(doc.type)}</span>
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1 truncate">
                    {doc.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    {doc.category}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{doc.size}</span>
                    <span>{formatDate(doc.date)}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 flex items-center justify-center px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 transition-colors">
                      <Eye className="h-3 w-3 mr-1" />
                      Voir
                    </button>
                    <button className="flex-1 flex items-center justify-center px-2 py-1 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <Download className="h-3 w-3 mr-1" />
                      DL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-600">
            {filteredDocuments.map(doc => (
              <div key={doc.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xl">{getFileIcon(doc.type)}</span>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        {doc.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {doc.category} • {doc.size} • {formatDate(doc.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      <Share className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Affichage de {filteredDocuments.length} document{filteredDocuments.length > 1 ? 's' : ''}
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Précédent
          </button>
          <button className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
            1
          </button>
          <button className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Suivant
          </button>
        </div>
      </div>
    </div>
  )
}