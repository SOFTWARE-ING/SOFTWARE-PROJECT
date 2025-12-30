import { useExerciseStore } from '../stores/exerciseStore';

/**
 * Custom hook for exercise operations
 */
export const useExercises = () => {
  const {
    exercises,
    loading,
    error,
    generateExercises,
    updateQuestion,
    addQuestion,
    removeQuestion
  } = useExerciseStore();

  /**
   * Generate exercises for a project
   * @param {string} projectId
   * @param {Object} config
   */
  const createExercises = async (projectId, config) => {
    try {
      await generateExercises(projectId, config);
    } catch (err) {
      console.error('Failed to generate exercises:', err);
      throw err;
    }
  };

  /**
   * Update a specific question
   * @param {string} exerciseId
   * @param {string} questionId
   * @param {Object} updates
   */
  const modifyQuestion = (exerciseId, questionId, updates) => {
    updateQuestion(exerciseId, questionId, updates);
  };

  /**
   * Add a new question to an exercise
   * @param {string} exerciseId
   * @param {Object} question
   */
  const insertQuestion = (exerciseId, question) => {
    addQuestion(exerciseId, question);
  };

  /**
   * Remove a question from an exercise
   * @param {string} exerciseId
   * @param {string} questionId
   */
  const deleteQuestion = (exerciseId, questionId) => {
    removeQuestion(exerciseId, questionId);
  };

  return {
    exercises,
    loading,
    error,
    createExercises,
    modifyQuestion,
    insertQuestion,
    deleteQuestion
  };
};