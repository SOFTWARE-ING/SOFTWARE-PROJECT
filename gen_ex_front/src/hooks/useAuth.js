import { create } from 'zustand';

/**
 * Auth store
 */
export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  /**
   * Login user (mock)
   * @param {string} email
   * @param {string} password
   */
  login: async (email) => {
    set({ loading: true });
    // Mock login
    await new Promise(resolve => setTimeout(resolve, 1000));
    set({
      user: { id: '1', email, name: 'John Doe' },
      isAuthenticated: true,
      loading: false
    });
  },

  /**
   * Logout user
   */
  logout: () => {
    set({ user: null, isAuthenticated: false });
  }
}));

/**
 * Custom hook for authentication
 */
export const useAuth = () => {
  const { user, isAuthenticated, loading, login, logout } = useAuthStore();

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };
};