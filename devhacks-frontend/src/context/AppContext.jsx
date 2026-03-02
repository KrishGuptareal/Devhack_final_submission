import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "@clerk/clerk-react";
import { userApi, subjectApi, taskApi, sessionApi } from "../api";

// Create context
const AppContext = createContext(null);

/**
 * App Provider - Global state management for the application
 */
export function AppProvider({ children }) {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  // User state
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // Subjects state
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  // Session state
  const [activeSession, setActiveSession] = useState(null);

  // Error state
  const [error, setError] = useState(null);

  // ==================== USER ====================

  const syncUser = useCallback(async () => {
    if (!isSignedIn || !isLoaded) return;

    setUserLoading(true);
    try {
      const userData = await userApi.login(getToken);
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error("Error syncing user:", err);
      setError(err.message);
    } finally {
      setUserLoading(false);
    }
  }, [getToken, isSignedIn, isLoaded]);

  const updateUser = useCallback(
    async (updates) => {
      if (!isSignedIn) return;

      try {
        const updatedUser = await userApi.updateUser(updates, getToken);
        setUser(updatedUser);
        return updatedUser;
      } catch (err) {
        console.error("Error updating user:", err);
        throw err;
      }
    },
    [getToken, isSignedIn],
  );

  // ==================== SUBJECTS ====================

  const fetchSubjects = useCallback(async () => {
    if (!isSignedIn) return;

    setSubjectsLoading(true);
    try {
      const data = await subjectApi.getAll(getToken);
      setSubjects(data);
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setError(err.message);
    } finally {
      setSubjectsLoading(false);
    }
  }, [getToken, isSignedIn]);

  const createSubject = useCallback(
    async (subjectData) => {
      if (!isSignedIn) return;

      try {
        const newSubject = await subjectApi.create(subjectData, getToken);
        setSubjects((prev) => [...prev, newSubject]);
        return newSubject;
      } catch (err) {
        console.error("Error creating subject:", err);
        throw err;
      }
    },
    [getToken, isSignedIn],
  );

  const updateSubject = useCallback(
    async (id, updates) => {
      if (!isSignedIn) return;

      try {
        const updatedSubject = await subjectApi.update(id, updates, getToken);
        setSubjects((prev) =>
          prev.map((s) => (s._id === id ? updatedSubject : s)),
        );
        return updatedSubject;
      } catch (err) {
        console.error("Error updating subject:", err);
        throw err;
      }
    },
    [getToken, isSignedIn],
  );

  const deleteSubject = useCallback(
    async (id) => {
      if (!isSignedIn) return;

      try {
        await subjectApi.delete(id, getToken);
        setSubjects((prev) => prev.filter((s) => s._id !== id));
      } catch (err) {
        console.error("Error deleting subject:", err);
        throw err;
      }
    },
    [getToken, isSignedIn],
  );

  const getSubjectById = useCallback(
    (id) => {
      return subjects.find((s) => s._id === id);
    },
    [subjects],
  );

  // ==================== TASKS ====================

  const fetchTodayTasks = useCallback(
    async (status = "all") => {
      if (!isSignedIn) return;

      setTasksLoading(true);
      try {
        const data = await taskApi.getTodayTasks(getToken, status);
        setTasks(data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError(err.message);
      } finally {
        setTasksLoading(false);
      }
    },
    [getToken, isSignedIn],
  );

  const generateDailyTasks = useCallback(
    async (force = false) => {
      if (!isSignedIn) return;

      setTasksLoading(true);
      try {
        const data = await taskApi.generateDailyTasks(getToken, force);
        // After generating, fetch all today's tasks to ensure state is fully synced
        await fetchTodayTasks();
        return data;
      } catch (err) {
        console.error("Error generating tasks:", err);
        setError(err.message);
        setTasksLoading(false);
        throw err;
      }
    },
    [getToken, isSignedIn, fetchTodayTasks],
  );

  const createTask = useCallback(
    async (taskData) => {
      if (!isSignedIn) return;

      try {
        const newTask = await taskApi.create(taskData, getToken);
        setTasks((prev) => [...prev, newTask]);
        return newTask;
      } catch (err) {
        console.error("Error creating task:", err);
        throw err;
      }
    },
    [getToken, isSignedIn],
  );

  const updateTask = useCallback(
    async (taskId, updates) => {
      if (!isSignedIn) return;

      try {
        const updatedTask = await taskApi.update(taskId, updates, getToken);
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? updatedTask : t)),
        );
        return updatedTask;
      } catch (err) {
        console.error("Error updating task:", err);
        throw err;
      }
    },
    [getToken, isSignedIn],
  );

  const deleteTask = useCallback(
    async (taskId) => {
      if (!isSignedIn) return;

      // Capture a snapshot of tasks before optimistic removal
      let snapshot = null;

      try {
        console.log("Deleting task with ID:", taskId);

        // Optimistically remove from state, capturing snapshot via functional updater
        setTasks((prev) => {
          snapshot = prev; // capture current state at removal time
          return prev.filter((t) => t._id !== taskId);
        });
        console.log("Task removed from state optimistically");

        // Then call the API
        const response = await taskApi.delete(taskId, getToken);
        console.log("Delete response:", response);
      } catch (err) {
        console.error("Error deleting task:", err);
        // Rollback to the exact snapshot taken at removal time
        if (snapshot) {
          setTasks(snapshot);
        }
        throw err;
      }
    },
    [getToken, isSignedIn],
  );

  const updateTaskStatus = useCallback(
    async (taskId, status) => {
      if (!isSignedIn) return;

      try {
        const updatedTask = await taskApi.updateStatus(
          taskId,
          status,
          getToken,
        );
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? updatedTask : t)),
        );
        return updatedTask;
      } catch (err) {
        console.error("Error updating task status:", err);
        throw err;
      }
    },
    [getToken, isSignedIn],
  );

  const updateTaskCompletion = useCallback(
    async (taskId, percentage) => {
      if (!isSignedIn) return;

      try {
        const updatedTask = await taskApi.updateCompletion(
          taskId,
          percentage,
          getToken,
        );
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? updatedTask : t)),
        );
        return updatedTask;
      } catch (err) {
        console.error("Error updating task completion:", err);
        throw err;
      }
    },
    [getToken, isSignedIn],
  );

  const getTaskById = useCallback(
    (taskId) => {
      return tasks.find((t) => t._id === taskId);
    },
    [tasks],
  );

  // ==================== STATISTICS ====================

  /**
   * Calculate user statistics from tasks and sessions
   */
  const calculateUserStats = useCallback(() => {
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const totalTasks = tasks.length;

    // Use real progress stats from backend
    const progress = user?.progress || {};
    const totalFocusMinutes = progress.totalStudyMinutes || 0;
    const xpPoints = progress.totalXP || user?.xpPoints || 0;

    // Convert minutes to hours for display
    const focusTimeHours = Math.round((totalFocusMinutes / 60) * 10) / 10;

    return {
      tasksCompleted: completedTasks,
      totalTasks: totalTasks,
      focusTimeHours: focusTimeHours,
      xpPoints: xpPoints,
      completionRate:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  }, [tasks, user]);

  /**
   * Calculate weekly progress from tasks
   */
  const calculateWeeklyStats = useCallback(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyData = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      // Filter tasks for this day
      const dayTasks = tasks.filter((task) => {
        if (!task.scheduledDate) return false;
        const taskDate = new Date(task.scheduledDate);
        return taskDate.toDateString() === date.toDateString();
      });

      const completed = dayTasks.filter((t) => t.status === "completed").length;
      const total = dayTasks.length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      weeklyData.push({
        day: days[i],
        value: progress,
        date: date.toISOString(),
      });
    }

    return weeklyData;
  }, [tasks]);

  // ==================== SESSIONS ====================

  // Session file state (for study material uploads)
  const [sessionFileUrl, setSessionFileUrl] = useState(null);

  const checkActiveSession = useCallback(async () => {
    if (!isSignedIn) return null;

    try {
      const session = await sessionApi.getActive(getToken);
      setActiveSession(session);

      // If there's an active session, check for uploaded files
      if (session?._id) {
        const files = await sessionApi.getFiles(session._id, getToken);
        if (files && files.length > 0) {
          setSessionFileUrl(files[0]);
        }
      }

      return session;
    } catch (err) {
      console.error("Error checking active session:", err);
      return null;
    }
  }, [getToken, isSignedIn]);

  const startSession = useCallback(
    async (subjectId, mode, taskId = null) => {
      if (!isSignedIn) return;

      try {
        const sessionData = { subjectId, mode };
        if (taskId) sessionData.taskId = taskId;

        const session = await sessionApi.start(sessionData, getToken);
        setActiveSession(session);

        // Update task status to in_progress if taskId provided
        if (taskId) {
          await updateTaskStatus(taskId, "in_progress");
        }

        return session;
      } catch (err) {
        console.error("Error starting session:", err);
        throw err;
      }
    },
    [getToken, isSignedIn, updateTaskStatus],
  );

  const endSession = useCallback(
    async (sessionId, notes = "", taskId = null, markComplete = true) => {
      if (!isSignedIn) return;

      try {
        // Delete session file if exists before ending
        if (sessionFileUrl) {
          try {
            await sessionApi.deleteFile(sessionId, sessionFileUrl, getToken);
          } catch (deleteErr) {
            console.warn("Could not delete session file:", deleteErr);
          }
          setSessionFileUrl(null);
        }

        const result = await sessionApi.end(sessionId, notes, getToken);
        setActiveSession(null);

        // Update task status to completed if taskId provided and markComplete is true
        if (taskId && markComplete) {
          await updateTaskStatus(taskId, "completed");
        }

        // Sync user to get latest XP and focus time totals
        await syncUser();

        return result;
      } catch (err) {
        console.error("Error ending session:", err);
        throw err;
      }
    },
    [getToken, isSignedIn, updateTaskStatus, sessionFileUrl],
  );

  // Upload file to active session
  const uploadSessionFile = useCallback(
    async (sessionId, file) => {
      if (!isSignedIn || !sessionId) return null;

      try {
        const fileUrl = await sessionApi.uploadFile(sessionId, file, getToken);
        setSessionFileUrl(fileUrl);
        return fileUrl;
      } catch (err) {
        console.error("Error uploading session file:", err);
        throw err;
      }
    },
    [getToken, isSignedIn],
  );

  // Delete file from session
  const deleteSessionFile = useCallback(
    async (sessionId, fileUrl) => {
      if (!isSignedIn || !sessionId || !fileUrl) return;

      try {
        await sessionApi.deleteFile(sessionId, fileUrl, getToken);
        setSessionFileUrl(null);
      } catch (err) {
        console.error("Error deleting session file:", err);
        throw err;
      }
    },
    [getToken, isSignedIn],
  );

  // ==================== INITIALIZATION ====================

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      syncUser();
      fetchSubjects();
      fetchTodayTasks();
      checkActiveSession();
    } else if (isLoaded && !isSignedIn) {
      setUser(null);
      setSubjects([]);
      setTasks([]);
      setActiveSession(null);
      setUserLoading(false);
      setSubjectsLoading(false);
      setTasksLoading(false);
    }
  }, [
    isLoaded,
    isSignedIn,
    syncUser,
    fetchSubjects,
    fetchTodayTasks,
    checkActiveSession,
  ]);

  // ==================== CONTEXT VALUE ====================

  const value = {
    // User
    user,
    userLoading,
    syncUser,
    updateUser,

    // Subjects
    subjects,
    subjectsLoading,
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    getSubjectById,

    // Tasks
    tasks,
    tasksLoading,
    fetchTodayTasks,
    generateDailyTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskCompletion,
    getTaskById,

    // Sessions
    activeSession,
    checkActiveSession,
    startSession,
    endSession,
    hasActiveSession: !!activeSession,
    sessionFileUrl,
    uploadSessionFile,
    deleteSessionFile,

    // Statistics
    userStats: calculateUserStats(),
    weeklyStats: calculateWeeklyStats(),

    // General
    error,
    isLoading: userLoading || subjectsLoading || tasksLoading,
    isSignedIn,
    isLoaded,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Hook to use the App context
 */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

export default AppContext;
