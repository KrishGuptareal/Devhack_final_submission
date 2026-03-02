import { apiClient } from './client';

/**
 * Session API endpoints
 */
export const sessionApi = {
  /**
   * Start a new study session
   * POST /sessions/start
   * @param {Object} sessionData
   * @param {string} sessionData.subjectId - Subject ID (required)
   * @param {string} [sessionData.taskId] - Associated task ID (optional)
   * @param {string} sessionData.mode - 'focus' or 'free' (required)
   */
  start: async (sessionData, getToken) => {
    const response = await apiClient.post('/sessions/start', sessionData, getToken);
    return response.data?.session;
  },

  /**
   * End an active session
   * POST /sessions/:sessionId/end
   * @param {string} sessionId - Session ID
   * @param {string} [notes] - Session notes
   */
  end: async (sessionId, notes = '', getToken) => {
    const response = await apiClient.post(`/sessions/${sessionId}/end`, { notes }, getToken);
    return response.data;
  },

  /**
   * Get active session (if any)
   * GET /sessions/active
   */
  getActive: async (getToken) => {
    const response = await apiClient.get('/sessions/active', getToken);
    return response.data?.session;
  },

  /**
   * Upload a study material file to session (max 1 file)
   * POST /sessions/:sessionId/upload
   * @param {string} sessionId - Session ID
   * @param {File} file - File to upload
   */
  uploadFile: async (sessionId, file, getToken) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.postFormData(`/sessions/${sessionId}/upload`, formData, getToken);
    return response.data?.fileUrl;
  },

  /**
   * Get session files
   * GET /sessions/:sessionId/files
   * @param {string} sessionId - Session ID
   */
  getFiles: async (sessionId, getToken) => {
    const response = await apiClient.get(`/sessions/${sessionId}/files`, getToken);
    return response.data?.files || [];
  },

  /**
   * Delete a file from session
   * DELETE /sessions/:sessionId/file
   * @param {string} sessionId - Session ID
   * @param {string} fileUrl - URL of file to delete
   */
  deleteFile: async (sessionId, fileUrl, getToken) => {
    const response = await apiClient.deleteWithBody(`/sessions/${sessionId}/file`, { fileUrl }, getToken);
    return response.data;
  },
};

export default sessionApi;
