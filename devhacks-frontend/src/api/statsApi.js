import { apiClient } from './client';

/**
 * Stats API endpoints - Calculates statistics from tasks and sessions
 */
export const statsApi = {
  /**
   * Get user statistics (tasks completed, focus time, XP points)
   * This calculates from tasks and sessions data
   * Note: If backend has dedicated stats endpoint, use that instead
   */
  getUserStats: async (getToken) => {
    try {
      // For now, we'll calculate from tasks
      // If backend has /users/stats endpoint, use that
      const response = await apiClient.get('/users/me', getToken);
      const user = response.data?.user;

      // Calculate from user data if available, otherwise return defaults
      return {
        tasksCompleted: user?.stats?.tasksCompleted || 0,
        focusTimeHours: user?.stats?.focusTimeHours || 0,
        xpPoints: user?.stats?.xpPoints || user?.xpPoints || 0,
        level: user?.stats?.level || user?.level || 1,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Return defaults on error
      return {
        tasksCompleted: 0,
        focusTimeHours: 0,
        xpPoints: 0,
        level: 1,
      };
    }
  },

  /**
   * Get weekly progress statistics
   * Calculates completion rates for each day of the week
   */
  getWeeklyStats: async (getToken) => {
    try {
      // Fetch all tasks for the week
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      // Get today's tasks - API might need date range support
      // For now, we'll calculate from today's tasks
      const response = await apiClient.get('/tasks/today?status=all', getToken);
      const tasks = response.data?.tasks || [];

      // Calculate daily completion rates
      // This is a simplified version - ideally backend would provide this
      const weeklyData = [];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);

        // Filter tasks for this day
        const dayTasks = tasks.filter(task => {
          const taskDate = new Date(task.scheduledDate);
          return taskDate.toDateString() === date.toDateString();
        });

        const completed = dayTasks.filter(t => t.status === 'completed').length;
        const total = dayTasks.length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        weeklyData.push({
          day: days[i],
          value: progress,
          date: date.toISOString(),
        });
      }

      return weeklyData;
    } catch (error) {
      console.error('Error fetching weekly stats:', error);
      // Return default empty week
      return [
        { day: 'Mon', value: 0 },
        { day: 'Tue', value: 0 },
        { day: 'Wed', value: 0 },
        { day: 'Thu', value: 0 },
        { day: 'Fri', value: 0 },
        { day: 'Sat', value: 0 },
        { day: 'Sun', value: 0 },
      ];
    }
  },


};

export default statsApi;
