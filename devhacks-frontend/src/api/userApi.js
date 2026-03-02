import { apiClient } from './client';

/**
 * User API endpoints
 */
export const userApi = {
  /**
   * Sync/Login user - Creates or syncs user in backend from Clerk token
   * GET /users/login
   */
  login: async (getToken) => {
    const response = await apiClient.get('/users/login', getToken);
    return response.data?.user;
  },

  /**
   * Get current user profile
   * GET /users/me
   */
  getCurrentUser: async (getToken) => {
    const response = await apiClient.get('/users/me', getToken);
    return response.data?.user;
  },

  /**
   * Update current user profile/preferences
   * PATCH /users/me
   * @param {Object} updates - Fields to update (onboardingCompleted, preferences)
   */
  updateUser: async (updates, getToken) => {
    const response = await apiClient.patch('/users/me', updates, getToken);
    return response.data?.user;
  },
};

export default userApi;
