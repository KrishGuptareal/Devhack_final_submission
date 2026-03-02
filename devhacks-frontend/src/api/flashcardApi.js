import { apiClient } from './client';

/**
 * FlashCard API endpoints
 */
export const flashcardApi = {
  /**
   * Get all flashcards with optional filters
   * GET /flashcards/get-flashcards
   * @param {Object} [filters]
   * @param {string} [filters.subjectId] - Filter by subject
   * @param {string} [filters.difficulty] - 'easy', 'medium', 'hard'
   */
  getAll: async (getToken, filters = {}) => {
    let endpoint = '/flashcards/get-flashcards';
    const params = new URLSearchParams();
    
    if (filters.subjectId) params.append('subjectId', filters.subjectId);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    
    const queryString = params.toString();
    if (queryString) endpoint += `?${queryString}`;
    
    const response = await apiClient.get(endpoint, getToken);
    return response.data?.flashCards || [];
  },

  /**
   * Get a specific flashcard by ID
   * GET /flashcards/get-flashcard/:id
   * @param {string} id - Flashcard ID
   */
  getById: async (id, getToken) => {
    const response = await apiClient.get(`/flashcards/get-flashcard/${id}`, getToken);
    return response.data;
  },

  /**
   * Create a new flashcard
   * POST /flashcards/create-flashcard
   * @param {Object} flashcard
   * @param {string} flashcard.subjectId - Subject ID (required)
   * @param {string} flashcard.question - Question text, max 500 chars (required)
   * @param {string} flashcard.answer - Answer text, max 1000 chars (required)
   * @param {string} [flashcard.difficulty] - 'easy', 'medium', 'hard' (default: 'medium')
   */
  create: async (flashcard, getToken) => {
    const response = await apiClient.post('/flashcards/create-flashcard', flashcard, getToken);
    return response.data;
  },

  /**
   * Update a flashcard
   * PUT /flashcards/update-flashcard/:id
   * @param {string} id - Flashcard ID
   * @param {Object} updates - Fields to update (question, answer, difficulty)
   */
  update: async (id, updates, getToken) => {
    const response = await apiClient.put(`/flashcards/update-flashcard/${id}`, updates, getToken);
    return response.data;
  },

  /**
   * Delete a flashcard
   * DELETE /flashcards/delete-flashcard/:id
   * @param {string} id - Flashcard ID
   */
  delete: async (id, getToken) => {
    const response = await apiClient.delete(`/flashcards/delete-flashcard/${id}`, getToken);
    return response.data;
  },
};

export default flashcardApi;
