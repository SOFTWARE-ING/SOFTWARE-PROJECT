import {API_BASE_URL} from "./url.js";

export const getService = {

  fetchData: async (endpoint) => {
    const token = localStorage.getItem('access_token');
    
    const headers = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Non autorisé. Veuillez vous reconnecter.");
        }
        if (response.status === 404) {
          throw new Error("Ressource introuvable.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `Erreur ${response.status}: ${response.statusText}`
        );
      }
      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(
          "Impossible de joindre le serveur. Vérifie que FastAPI tourne et que CORS est activé."
        );
      }
      throw error;
    }
  },

  postData: async (endpoint, payload) => {
    const token = localStorage.getItem('access_token');

    const headers = { 
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Non autorisé. Veuillez vous reconnecter.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `Erreur ${response.status}: ${response.statusText}`
        );
      }
      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(
          "Impossible de joindre le serveur. Vérifie que FastAPI tourne et que CORS est activé."
        );
      }
      throw error;
    }
  },

  postFile: async (endpoint, file) => {
    const token = localStorage.getItem('access_token');
    
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: "POST",
        headers: headers,
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Non autorisé. Veuillez vous reconnecter.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `Erreur ${response.status}: ${response.statusText}`
        );
      }
      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(
          "Impossible de joindre le serveur. Vérifie que FastAPI tourne et que CORS est activé."
        );
      }
      throw error;
    }
  },

  // =========================================
  // MÉTHODES POUR LE TÉLÉCHARGEMENT DE FICHIERS
  // =========================================

  // Télécharger un fichier PDF
  downloadFile: async (endpoint, filename = 'download.pdf') => {
    const token = localStorage.getItem('access_token');
    
    // Vérifier si le token existe
    if (!token) {
      throw new Error("Non autorisé. Veuillez vous connecter pour télécharger des fichiers.");
    }
    
    const headers = {
      "Authorization": `Bearer ${token}`,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expirée. Veuillez vous reconnecter.");
        }
        if (response.status === 404) {
          throw new Error("Fichier introuvable.");
        }
        
        // Tenter de récupérer le message d'erreur JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail || `Erreur ${response.status}: ${response.statusText}`
          );
        }
        
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      // Récupérer le blob
      const blob = await response.blob();
      
      // Vérifier que le blob n'est pas vide
      if (blob.size === 0) {
        throw new Error("Le fichier téléchargé est vide.");
      }
      
      // Créer un lien de téléchargement temporaire
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Nettoyer
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      return { success: true, message: 'Fichier téléchargé avec succès' };
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(
          "Impossible de joindre le serveur. Vérifie que FastAPI tourne et que CORS est activé."
        );
      }
      throw error;
    }
  },

  // Obtenir l'URL d'un fichier pour prévisualisation
  getFileUrl: async (endpoint) => {
    const token = localStorage.getItem('access_token');
    
    // Vérifier si le token existe
    if (!token) {
      throw new Error("Non autorisé. Veuillez vous connecter pour prévisualiser des fichiers.");
    }
    
    const headers = {
      "Authorization": `Bearer ${token}`,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expirée. Veuillez vous reconnecter.");
        }
        if (response.status === 404) {
          throw new Error("Fichier introuvable.");
        }
        
        // Tenter de récupérer le message d'erreur JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail || `Erreur ${response.status}: ${response.statusText}`
          );
        }
        
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      // Récupérer le blob
      const blob = await response.blob();
      
      // Vérifier que le blob n'est pas vide
      if (blob.size === 0) {
        throw new Error("Le fichier est vide.");
      }
      
      // Créer une URL temporaire
      const url = window.URL.createObjectURL(blob);
      
      // Ouvrir dans un nouvel onglet
      const newWindow = window.open(url, '_blank');
      
      if (!newWindow) {
        throw new Error("Impossible d'ouvrir le fichier. Vérifiez que les popups ne sont pas bloqués.");
      }
      
      // Nettoyer après un délai pour permettre l'ouverture
      setTimeout(() => window.URL.revokeObjectURL(url), 60000); // 1 minute
      
      return { success: true, message: 'Fichier ouvert' };
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(
          "Impossible de joindre le serveur. Vérifie que FastAPI tourne et que CORS est activé."
        );
      }
      throw error;
    }
  },

  // Supprimer une ressource
  deleteData: async (endpoint) => {
    const token = localStorage.getItem('access_token');
    
    const headers = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: "DELETE",
        headers: headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Non autorisé. Veuillez vous reconnecter.");
        }
        if (response.status === 404) {
          throw new Error("Ressource introuvable.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `Erreur ${response.status}: ${response.statusText}`
        );
      }
      
      // Certaines API DELETE retournent du contenu, d'autres non
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return data;
      }
      
      return { success: true, message: 'Suppression réussie' };
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(
          "Impossible de joindre le serveur. Vérifie que FastAPI tourne et que CORS est activé."
        );
      }
      throw error;
    }
  },

};