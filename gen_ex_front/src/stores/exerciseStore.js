import { create } from 'zustand';

/**
 * @typedef {Object} Question
 * @property {string} id - Unique identifier for the question
 * @property {string} prompt - The question text
 * @property {string[]} options - Array of options for multiple choice
 * @property {string} correct_answer - The correct answer
 * @property {string} explanation - Explanation for the answer
 */

/**
 * @typedef {Object} Exercise
 * @property {string} id - Unique identifier for the exercise
 * @property {string} type - Type of exercise (qcm, fill-in-the-blank, open-ended)
 * @property {string} difficulty - Difficulty level (easy, medium, hard)
 * @property {Question[]} questions - Array of questions
 */

/**
 * Zustand store for managing exercises
 */
export const useExerciseStore = create((set) => ({
  /** @type {Exercise[]} */
  exercises: [],

  /** @type {boolean} */
  loading: false,

  /** @type {string|null} */
  error: null,

  /**
   * Generate exercises from PDF (mock API call)
   * @param {string} projectId
   * @param {Object} config - Configuration for exercise generation
   * @param {string} config.difficulty
   * @param {string} config.language
   * @param {string} config.type
   */
  generateExercises: async (projectId, config) => {
    set({ loading: true, error: null });
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      const mockExercises = [
        {
          id: '1',
          type: config.type,
          difficulty: config.difficulty,
          questions: [
            {
              id: 'q1',
              prompt: 'What is 2 + 2?',
              options: ['3', '4', '5', '6'],
              correct_answer: '4',
              explanation: 'Basic arithmetic: 2 + 2 equals 4.'
            },
            {
              id: 'q2',
              prompt: 'Solve for x: 3x = 9',
              options: ['2', '3', '4', '5'],
              correct_answer: '3',
              explanation: 'Divide both sides by 3: x = 9/3 = 3.'
            }
          ]
        }
      ];
      set({ exercises: mockExercises, loading: false });
      return mockExercises;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * Update a question in an exercise
   * @param {string} exerciseId
   * @param {string} questionId
   * @param {Partial<Question>} updates
   */
  updateQuestion: (exerciseId, questionId, updates) => {
    set(state => ({
      exercises: state.exercises.map(exercise =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              questions: exercise.questions.map(question =>
                question.id === questionId ? { ...question, ...updates } : question
              )
            }
          : exercise
      )
    }));
  },

  /**
   * Add a new question to an exercise
   * @param {string} exerciseId
   * @param {Question} question
   */
  addQuestion: (exerciseId, question) => {
    set(state => ({
      exercises: state.exercises.map(exercise =>
        exercise.id === exerciseId
          ? { ...exercise, questions: [...exercise.questions, question] }
          : exercise
      )
    }));
  },

  /**
   * Remove a question from an exercise
   * @param {string} exerciseId
   * @param {string} questionId
   */
  removeQuestion: (exerciseId, questionId) => {
    set(state => ({
      exercises: state.exercises.map(exercise =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              questions: exercise.questions.filter(q => q.id !== questionId)
            }
          : exercise
      )
    }));
  }
}));