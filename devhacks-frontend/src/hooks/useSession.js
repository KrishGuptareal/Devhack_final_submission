import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { sessionApi } from '../api';

/**
 * Hook for managing study sessions
 */
export function useSession() {
  const { getToken, isSignedIn } = useAuth();
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check for active session
  const checkActiveSession = useCallback(async () => {
    if (!isSignedIn) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const session = await sessionApi.getActive(getToken);
      setActiveSession(session);
      return session;
    } catch (err) {
      console.error('Error checking active session:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getToken, isSignedIn]);

  // Start a new session
  const startSession = useCallback(async (subjectId, mode, taskId = null) => {
    if (!isSignedIn) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const sessionData = { subjectId, mode };
      if (taskId) sessionData.taskId = taskId;
      
      const session = await sessionApi.start(sessionData, getToken);
      setActiveSession(session);
      return session;
    } catch (err) {
      console.error('Error starting session:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getToken, isSignedIn]);

  // End the current session
  const endSession = useCallback(async (sessionId, notes = '') => {
    if (!isSignedIn) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await sessionApi.end(sessionId, notes, getToken);
      setActiveSession(null);
      return result;
    } catch (err) {
      console.error('Error ending session:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getToken, isSignedIn]);

  // Calculate session duration in minutes
  const getSessionDuration = useCallback(() => {
    if (!activeSession?.startTime) return 0;
    
    const start = new Date(activeSession.startTime);
    const now = new Date();
    const durationMs = now - start;
    return Math.floor(durationMs / 60000); // Convert to minutes
  }, [activeSession]);

  return {
    activeSession,
    loading,
    error,
    checkActiveSession,
    startSession,
    endSession,
    getSessionDuration,
    hasActiveSession: !!activeSession,
  };
}

export default useSession;
