import { API_BASE_URL } from "./url.js";

export const translationService = {
  /**
   * Traduit un fichier PDF
   */
  translatePDF: async (file, sourceLanguage, targetLanguage, options) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('source_language', sourceLanguage);
      formData.append('target_language', targetLanguage);
      formData.append('preserve_formatting', options.preserveFormatting);
      formData.append('keep_images', options.keepImages);
      formData.append('quality', options.quality);

      const response = await fetch(`${API_BASE_URL}/translate/pdf`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `Erreur ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      
      // Le backend retourne maintenant toutes les infos directement
      return {
        task_id: data.task_id,
        file: {
          name: data.translated_filename,
          url: data.download_url,
          taskId: data.task_id
        },
        stats: {
          word_count: data.word_count || 0,
          pages: data.pages || 0,
          source_language: data.detected_language || sourceLanguage,
          processing_time: data.processing_time || 0
        }
      };
    } catch (error) {
      console.error('Erreur translatePDF:', error);
      if (error instanceof TypeError) {
        throw new Error(
          "Impossible de joindre le serveur. Vérifiez que le serveur est actif."
        );
      }
      throw error;
    }
  },

  /**
   * Télécharge le fichier traduit
   */
  downloadTranslatedFile: async (taskId, filename) => {
    try {
      const response = await fetch(`${API_BASE_URL}/translate/download/${taskId}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement du fichier");
      }

      const blob = await response.blob();
      
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
      
      return { success: true };
    } catch (error) {
      console.error('Erreur downloadTranslatedFile:', error);
      if (error instanceof TypeError) {
        throw new Error("Impossible de joindre le serveur.");
      }
      throw error;
    }
  },

  /**
   * Vérifie le statut d'une traduction
   */
  checkTranslationStatus: async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/translate/status/${taskId}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la vérification du statut");
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur checkTranslationStatus:', error);
      if (error instanceof TypeError) {
        throw new Error("Impossible de joindre le serveur.");
      }
      throw error;
    }
  }
};