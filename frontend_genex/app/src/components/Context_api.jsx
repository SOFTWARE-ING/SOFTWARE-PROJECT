import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    access_token: null,
    token_type: null,
    user: null,
    isLoading: true
  });

  // Charger l'état d'authentification depuis localStorage au démarrage
  useEffect(() => {
    const loadAuthData = () => {
      try {
        const token = localStorage.getItem("access_token");
        const tokenType = localStorage.getItem("token_type");
        const userData = localStorage.getItem("user_data");
        
        setAuth({
          access_token: token,
          token_type: tokenType,
          user: userData ? JSON.parse(userData) : null,
          isLoading: false
        });
      } catch (error) {
        console.error("Error loading auth data:", error);
        setAuth({
          access_token: null,
          token_type: null,
          user: null,
          isLoading: false
        });
      }
    };

    loadAuthData();
  }, []);

  const login = (response) => {
    try {
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("token_type", response.token_type);
      
      // Stocker les données utilisateur si fournies
      if (response.user) {
        localStorage.setItem("user_data", JSON.stringify(response.user));
      }
      
      setAuth({
        access_token: response.access_token,
        token_type: response.token_type,
        user: response.user || null,
        isLoading: false
      });
    } catch (error) {
      console.error("Error saving auth data:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("user_data");
    
    setAuth({
      access_token: null,
      token_type: null,
      user: null,
      isLoading: false
    });
  };

  const updateUser = (userData) => {
    try {
      localStorage.setItem("user_data", JSON.stringify(userData));
      setAuth(prev => ({
        ...prev,
        user: userData
      }));
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  const updateUserField = (field, value) => {
    try {
      const updatedUser = {
        ...auth.user,
        [field]: value
      };
      
      localStorage.setItem("user_data", JSON.stringify(updatedUser));
      setAuth(prev => ({
        ...prev,
        user: updatedUser
      }));
    } catch (error) {
      console.error("Error updating user field:", error);
    }
  };

  const isAuthenticated = () => {
    return !!auth.access_token;
  };

  const getUser = () => {
    return auth.user;
  };

  return (
    <AuthContext.Provider value={{ 
      auth, 
      login, 
      logout, 
      updateUser,
      updateUserField,
      isAuthenticated,
      getUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;