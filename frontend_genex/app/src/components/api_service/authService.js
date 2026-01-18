const API_BASE_URL = "http://127.0.0.1:8000/api/genex";

export const authService = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });



      // Vérifie si le backend répond correctement
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || "Échec de la connexion. Vérifiez vos identifiants."
        );
      }
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      // 🟡 Si CORS ou réseau
      if (error instanceof TypeError) {
        throw new Error(
          "Impossible de joindre le serveur. Vérifie que FastAPI tourne et que CORS est activé."
        );
      }
      throw error;
    }
  },
};
