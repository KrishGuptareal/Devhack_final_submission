import { apiClient } from './client';

/**
 * Task API endpoints
 */
export const taskApi = {
  /**
   * Generate daily tasks for all active subjects
   * POST /tasks/generate
   * @param {boolean} [force=false] - Force regenerate even if tasks exist
   */
  generateDailyTasks: async (getToken, force = false) => {
    const endpoint = force ? '/tasks/generate?force=true' : '/tasks/generate';
    const response = await apiClient.post(endpoint, {}, getToken);
    return response.data?.tasks || [];
  },

  /**
   * Get today's tasks
   * GET /tasks/today
   * @param {string} [status] - Filter by status: 'all', 'pending', 'in_progress', 'completed', 'skipped'
   */
  getTodayTasks: async (getToken, status = 'all') => {
    const endpoint = status !== 'all' ? `/tasks/today?status=${status}` : '/tasks/today';
    const response = await apiClient.get(endpoint, getToken);
    return response.data?.tasks || [];
  },

  /**
   * Get a specific task by ID
   * GET /tasks/:taskId
   * @param {string} taskId - Task ID
   */
  getById: async (taskId, getToken) => {
    const response = await apiClient.get(`/tasks/${taskId}`, getToken);
    return response.data?.task;
  },

  /**
   * Create a custom task
   * POST /tasks/
   * @param {Object} task - Task data
   * @param {string} task.title - Task title (required)
   * @param {string} [task.description] - Task description
   * @param {number} task.estimatedMinutes - Estimated duration (required)
   * @param {string} task.scheduledDate - ISO date string (required)
   * @param {string} task.subjectId - Subject ID (required)
   */
  create: async (task, getToken) => {
    const response = await apiClient.post('/tasks/', task, getToken);
    return response.data?.task;
  },

  /**
   * Update a task
   * PUT /tasks/:taskId
   * @param {string} taskId - Task ID
   * @param {Object} updates - Fields to update
   */
  update: async (taskId, updates, getToken) => {
    const response = await apiClient.put(`/tasks/${taskId}`, updates, getToken);
    return response.data?.task;
  },

  /**
   * Delete a task
   * DELETE /tasks/:taskId
   * @param {string} taskId - Task ID
   */
  delete: async (taskId, getToken) => {
    const response = await apiClient.delete(`/tasks/${taskId}`, getToken);
    return response.data?.task;
  },

  /**
   * Update task status
   * PATCH /tasks/:taskId/status
   * @param {string} taskId - Task ID
   * @param {string} status - 'pending', 'in_progress', 'completed', 'skipped'
   */
  updateStatus: async (taskId, status, getToken) => {
    const response = await apiClient.patch(`/tasks/${taskId}/status`, { status }, getToken);
    return response.data?.task;
  },

  /**
   * Update task completion percentage
   * PATCH /tasks/:taskId/completion
   * @param {string} taskId - Task ID
   * @param {number} completionPercentage - 0 to 100
   */
  updateCompletion: async (taskId, completionPercentage, getToken) => {
    const response = await apiClient.patch(`/tasks/${taskId}/completion`, { completionPercentage }, getToken);
    return response.data?.task;
  },

  /**
   * Get tasks by date range (for calendar)
   * GET /tasks/today with date range support
   * Note: This may need backend support for date range queries
   * @param {string} startDate - ISO date string
   * @param {string} endDate - ISO date string
   */
  getTasksByDateRange: async (startDate, endDate, getToken) => {
    // If backend supports date range, use it
    // Otherwise, fetch today's tasks and filter client-side
    try {
      const response = await apiClient.get(`/tasks/today?status=all`, getToken);
      const tasks = response.data?.tasks || [];
      
      // Filter by date range client-side
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include entire end date
      
      return tasks.filter(task => {
        if (!task.scheduledDate) return false;
        const taskDate = new Date(task.scheduledDate);
        return taskDate >= start && taskDate <= end;
      });
    } catch (error) {
      console.error('Error fetching tasks by date range:', error);
      return [];
    }
  },
};

export default taskApi;
