import { apiClient } from './client';

/**
 * Subject API endpoints
 */
export const subjectApi = {
  /**
   * Get all subjects for the current user
   * GET /subjects/get-subjects
   */
  getAll: async (getToken) => {
    const response = await apiClient.get('/subjects/get-subjects', getToken);
    return response.data?.subjects || [];
  },

  /**
   * Get a specific subject by ID
   * GET /subjects/get-subject/:id
   * @param {string} id - Subject ID
   */
  getById: async (id, getToken) => {
    const response = await apiClient.get(`/subjects/get-subject/${id}`, getToken);
    return response.data?.subject;
  },

  /**
   * Create a new subject
   * POST /subjects/create-subject
   * @param {Object} subject - Subject data
   * @param {string} subject.name - Subject name (required)
   * @param {string} [subject.color] - Hex color
   * @param {string} [subject.icon] - Emoji/icon
   * @param {number} subject.dailyTimeCommitment - Minutes per day (min: 15)
   * @param {Object} subject.deadline - { date: ISO string, type: 'exam'|'assignment' }
   * @param {number} [subject.workloadMultiplier] - 0.5 to 1.5
   * @param {number} [subject.minWorkloadThreshold] - Default: 0.5
   */
  create: async (subject, getToken) => {
    const response = await apiClient.post('/subjects/create-subject', subject, getToken);
    return response.data?.subject;
  },

  /**
   * Update an existing subject
   * PUT /subjects/update-subject/:id
   * @param {string} id - Subject ID
   * @param {Object} updates - Fields to update
   */
  update: async (id, updates, getToken) => {
    const response = await apiClient.put(`/subjects/update-subject/${id}`, updates, getToken);
    return response.data?.subject;
  },

  /**
   * Delete a subject
   * DELETE /subjects/delete-subject/:id
   * @param {string} id - Subject ID
   */
  delete: async (id, getToken) => {
    const response = await apiClient.delete(`/subjects/delete-subject/${id}`, getToken);
    return response.data?.subject;
  },
};

export default subjectApi;
