import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { taskApi } from '../api';

/**
 * Hook for managing tasks data
 */
export function useTasks() {
  const { getToken, isSignedIn } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Fetch today's tasks
  const fetchTodayTasks = useCallback(async (status = 'all') => {
    if (!isSignedIn) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await taskApi.getTodayTasks(getToken, status);
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken, isSignedIn]);

  // Generate daily tasks
  const generateDailyTasks = useCallback(async (force = false) => {
    if (!isSignedIn) return;
    
    setGenerating(true);
    setError(null);
    
    try {
      const data = await taskApi.generateDailyTasks(getToken, force);
      setTasks(data);
      return data;
    } catch (err) {
      console.error('Error generating tasks:', err);
      setError(err.message);
      throw err;
    } finally {
      setGenerating(false);
    }
  }, [getToken, isSignedIn]);

  // Create a custom task
  const createTask = useCallback(async (taskData) => {
    if (!isSignedIn) return;
    
    try {
      const newTask = await taskApi.create(taskData, getToken);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.message);
      throw err;
    }
  }, [getToken, isSignedIn]);

  // Update a task
  const updateTask = useCallback(async (taskId, updates) => {
    if (!isSignedIn) return;
    
    try {
      const updatedTask = await taskApi.update(taskId, updates, getToken);
      setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
      return updatedTask;
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err.message);
      throw err;
    }
  }, [getToken, isSignedIn]);

  // Delete a task
  const deleteTask = useCallback(async (taskId) => {
    if (!isSignedIn) return;
    
    try {
      await taskApi.delete(taskId, getToken);
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err.message);
      throw err;
    }
  }, [getToken, isSignedIn]);

  // Update task status
  const updateTaskStatus = useCallback(async (taskId, status) => {
    if (!isSignedIn) return;
    
    try {
      const updatedTask = await taskApi.updateStatus(taskId, status, getToken);
      setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
      return updatedTask;
    } catch (err) {
      console.error('Error updating task status:', err);
      setError(err.message);
      throw err;
    }
  }, [getToken, isSignedIn]);

  // Update task completion percentage
  const updateTaskCompletion = useCallback(async (taskId, percentage) => {
    if (!isSignedIn) return;
    
    try {
      const updatedTask = await taskApi.updateCompletion(taskId, percentage, getToken);
      setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
      return updatedTask;
    } catch (err) {
      console.error('Error updating task completion:', err);
      setError(err.message);
      throw err;
    }
  }, [getToken, isSignedIn]);

  // Get task by ID
  const getTaskById = useCallback((taskId) => {
    return tasks.find(t => t._id === taskId);
  }, [tasks]);

  // Fetch tasks on mount
  useEffect(() => {
    if (isSignedIn) {
      fetchTodayTasks();
    }
  }, [isSignedIn, fetchTodayTasks]);

  return {
    tasks,
    loading,
    error,
    generating,
    fetchTodayTasks,
    generateDailyTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskCompletion,
    getTaskById,
  };
}

export default useTasks;
