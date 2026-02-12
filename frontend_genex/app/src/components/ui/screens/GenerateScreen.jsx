import React, { useState, useRef, useCallback } from 'react';
import {
  FileText, Upload, X, CheckCircle, Cloud, Database, Clock,
  Download, Share2, Eye, Wand2, Sparkles
} from 'lucide-react';
import { routingService } from '../../api_service/getRouting';

export default function PDFUploadOptimized() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const supportedFormats = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png'];

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const simulateUpload = (fileId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      if (progress >= 100) {
        clearInterval(interval);
        setUploadedFiles(prev =>
          prev.map(f => f.id === fileId ? { ...f, status: 'uploaded', progress: 100 } : f)
        );
      }
    }, 100);
  };


  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      return supportedFormats.includes(ext);
    });

    if (validFiles.length !== files.length) {
      alert(`Formats acceptés: ${supportedFormats.join(', ')}`);
    }

    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach(file => simulateUpload(file.id));
  };


  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }, []);

  
  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

 const handleProcess = async () => {
  if (uploadedFiles.length === 0) {
    alert('Veuillez ajouter des fichiers');
    return;
  }
  
  setIsProcessing(true);
  
  try {
    // Uploader tous les fichiers
    for (const uploadedFile of uploadedFiles) {
      const response = await routingService.upload_document(uploadedFile.file);
      console.log('Fichier uploadé avec succès:', response);
    }
    
    alert(`✅ ${uploadedFiles.length} fichier(s) traité(s) avec succès !`);
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    alert(`❌ Erreur: ${error.message}`);
  } finally {
    setIsProcessing(false);
  }
};

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-slate-950">
      {/* Main Content */}

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Upload Zone - 2 columns */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      Upload de documents
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Glissez-déposez vos fichiers
                    </p>
                  </div>
                  {uploadedFiles.length > 0 && (
                    <button
                      onClick={() => setUploadedFiles([])}
                      className="px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 inline mr-1" />
                      Effacer tout
                    </button>
                  )}
                </div>
              </div>

              <div
                className={`p-8 ${dragActive ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div
                  className={`border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10'
                      : 'border-slate-300 dark:border-slate-600 hover:border-indigo-300'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-linear-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                    <Cloud className="w-10 h-10 text-indigo-500" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {dragActive ? 'Déposez vos fichiers ici' : 'Cliquez ou glissez vos fichiers'}
                  </h3>
                  
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    {supportedFormats.join(', ')}
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={supportedFormats.join(',')}
                    onChange={(e) => {
                      handleFiles(Array.from(e.target.files));
                      e.target.value = null;
                    }}
                    className="hidden"
                  />
                  
                  <button className="px-6 py-3 bg-linear-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all">
                    <Upload className="w-5 h-5 inline mr-2" />
                    Parcourir
                  </button>
                </div>
              </div>

              {/* File List */}
              {uploadedFiles.length > 0 && (
                <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    Fichiers ({uploadedFiles.length})
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {uploadedFiles.map(file => {
                      const progress = uploadProgress[file.id] || 0;
                      return (
                        <div
                          key={file.id}
                          className="group bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-indigo-300 transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="relative">
                                <div className="w-12 h-12 rounded-lg bg-linear-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                                  <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                {file.status === 'uploaded' && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 dark:text-slate-100 truncate mb-1">
                                  {file.name}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Database className="w-3 h-3" />
                                    {formatSize(file.size)}
                                  </span>
                                </div>
                                {file.status === 'uploading' && (
                                  <div className="mt-2">
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className="text-slate-600 dark:text-slate-300">Upload...</span>
                                      <span className="font-medium text-indigo-600">{progress}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all"
                                        style={{ width: `${progress}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => removeFile(file.id)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Action Button */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-linear-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Prêt à traiter
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Optimisez vos documents en un clic: extraction & Analyse
                </p>
              </div>

              <button
                onClick={handleProcess}
                disabled={isProcessing || uploadedFiles.length === 0}
                className="w-full px-6 py-4 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span className="font-semibold">Traitement...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Wand2 className="w-5 h-5" />
                    <span className="font-semibold">Transformer</span>
                  </div>
                )}
              </button>

              {uploadedFiles.length > 0 && !isProcessing && (
                <p className="text-xs text-center text-slate-500 mt-3">
                  {uploadedFiles.length} fichier(s) prêt(s)
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
                Statistiques
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-linear-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                  <span className="text-sm text-blue-700 dark:text-blue-300">Fichiers</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {uploadedFiles.length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-linear-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                  <span className="text-sm text-green-700 dark:text-green-300">Taille totale</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatSize(uploadedFiles.reduce((sum, f) => sum + f.size, 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-linear-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                  <span className="text-sm text-purple-700 dark:text-purple-300">Succès</span>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {uploadedFiles.filter(f => f.status === 'uploaded').length}/{uploadedFiles.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Info */}
            {/* <div className="bg-linear-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
              <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Sécurité & Confidentialité
              </h3>
              <div className="space-y-2 text-sm text-indigo-700 dark:text-indigo-300">
                <p>✓ Chiffrement AES-256</p>
                <p>✓ Fichiers supprimés après 24h</p>
                <p>✓ Conforme RGPD</p>
                <p>✓ Traitement sécurisé</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}


// import React, { useState, useRef, useCallback } from "react";
// import { Upload, FileText, X, CheckCircle, Cloud } from "lucide-react";

// const SUPPORTED = [".pdf", ".doc", ".docx", ".txt", ".jpg", ".png"]; 

// export default function MinimalUploadPage() {
//   const [files, setFiles] = useState([]);
//   const [drag, setDrag] = useState(false);
//   const inputRef = useRef(null);

//   const handleFiles = useCallback((list) => {
//     const valid = Array.from(list).filter(f =>
//       SUPPORTED.includes("." + f.name.split(".").pop().toLowerCase())
//     );

//     const mapped = valid.map(f => ({
//       id: crypto.randomUUID(),
//       name: f.name,
//       size: f.size,
//       status: "uploaded",
//     }));

//     setFiles(prev => [...prev, ...mapped]);
//   }, []);

//   const onDrop = (e) => {
//     e.preventDefault();
//     setDrag(false);
//     handleFiles(e.dataTransfer.files);
//   };

//   const formatSize = (b) => (b / 1024 / 1024).toFixed(2) + " MB";

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
//       <div className="w-full max-w-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
        
//         {/* Header */}
//         <div className="p-6 border-b border-slate-200 dark:border-slate-700">
//           <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
//             Secure Document Upload
//           </h1>
//           <p className="text-sm text-slate-500 dark:text-slate-400">
//             Upload rapide et sécurisé (drag & drop ou sélection)
//           </p>
        
//         </div>

//         {/* Drop zone */}
//         <div
//           onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
//           onDragLeave={() => setDrag(false)}
//           onDrop={onDrop}
//           onClick={() => inputRef.current.click()}
//           className={`m-6 p-10 rounded-xl border-2 border-dashed cursor-pointer transition-all
//             ${drag ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-slate-300 dark:border-slate-600"}`}
//         >
//           <input
//             ref={inputRef}
//             type="file"
//             multiple
//             accept={SUPPORTED.join(",")}
//             className="hidden"
//             onChange={(e) => handleFiles(e.target.files)}
//           />

//           <div className="text-center">
//             <Cloud className="w-12 h-12 mx-auto text-indigo-500 mb-4" />
//             <p className="font-semibold text-slate-800 dark:text-slate-200">
//               Glissez vos documents ici
//             </p>
//             <p className="text-sm text-slate-500">
//               ou cliquez pour sélectionner
//             </p>
//           </div>
//         </div>

//         {/* File list */}
//         {files.length > 0 && (
//           <div className="px-6 pb-6 space-y-3">
//             {files.map(f => (
//               <div
//                 key={f.id}
//                 className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
//               >
//                 <div className="flex items-center gap-3">
//                   <FileText className="w-5 h-5 text-indigo-500" />
//                   <div>
//                     <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
//                       {f.name}
//                     </p>
//                     <p className="text-xs text-slate-500">{formatSize(f.size)}</p>
//                   </div>
//                 </div>
//                 <CheckCircle className="w-5 h-5 text-green-500" />
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Footer */}
//         <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 text-center">
//           Chiffrement • RGPD • Suppression automatique 24h
//         </div>
//       </div>
//     </div>
//   );
// }
