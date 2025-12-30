import { create } from 'zustand';

/**
 * Toast store for managing notifications
 */
export const useToastStore = create((set, get) => ({
  toasts: [],

  /**
   * Add a new toast
   * @param {Object} toast
   * @param {string} toast.message
   * @param {'success' | 'error' | 'warning' | 'info'} [toast.type='info']
   * @param {number} [toast.duration=5000]
   */
  addToast: (toast) => {
    const id = Date.now();
    const newToast = {
      id,
      message: toast.message,
      type: toast.type || 'info',
      duration: toast.duration || 5000
    };

    set(state => ({ toasts: [...state.toasts, newToast] }));

    // Auto remove after duration
    setTimeout(() => {
      get().removeToast(id);
    }, newToast.duration);
  },

  /**
   * Remove a toast by id
   * @param {number} id
   */
  removeToast: (id) => {
    set(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    }));
  }
}));

/**
 * Hook for using toasts
 */
export const useToast = () => {
  const { addToast, removeToast } = useToastStore();

  const toast = {
    success: (message, duration) => addToast({ message, type: 'success', duration }),
    error: (message, duration) => addToast({ message, type: 'error', duration }),
    warning: (message, duration) => addToast({ message, type: 'warning', duration }),
    info: (message, duration) => addToast({ message, type: 'info', duration })
  };

  return { toast, removeToast };
};