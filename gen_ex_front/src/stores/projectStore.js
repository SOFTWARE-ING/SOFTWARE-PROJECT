import { create } from 'zustand';

/**
 * @typedef {Object} Project
 * @property {string} id - Unique identifier for the project
 * @property {string} title - Title of the project
 * @property {string} source_file_url - URL of the source PDF file
 * @property {string} created_at - Creation timestamp
 * @property {string} status - Status of the project (e.g., 'processing', 'completed')
 */

/**
 * Zustand store for managing projects
 */
export const useProjectStore = create((set) => ({
  /** @type {Project[]} */
  projects: [],

  /** @type {boolean} */
  loading: false,

  /** @type {string|null} */
  error: null,

  /**
   * Fetch all projects (mock API call)
   */
  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockProjects = [
        {
          id: '1',
          title: 'Math Exercises',
          source_file_url: 'https://example.com/math.pdf',
          created_at: new Date().toISOString(),
          status: 'completed'
        },
        {
          id: '2',
          title: 'History Quiz',
          source_file_url: 'https://example.com/history.pdf',
          created_at: new Date().toISOString(),
          status: 'processing'
        }
      ];
      set({ projects: mockProjects, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  /**
   * Create a new project
   * @param {Omit<Project, 'id' | 'created_at'>} projectData
   */
  createProject: async (projectData) => {
    set({ loading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newProject = {
        ...projectData,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };
      set(state => ({ projects: [...state.projects, newProject], loading: false }));
      return newProject;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * Update project status
   * @param {string} projectId
   * @param {string} status
   */
  updateProjectStatus: (projectId, status) => {
    set(state => ({
      projects: state.projects.map(project =>
        project.id === projectId ? { ...project, status } : project
      )
    }));
  }
}));