import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { userApi } from '../api';

/**
 * Hook for managing user data and syncing with backend
 */
export function useUser() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync user with backend on login
  const syncUser = useCallback(async () => {
    if (!isSignedIn || !isLoaded) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userData = await userApi.login(getToken);
      setUser(userData);
    } catch (err) {
      console.error('Error syncing user:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken, isSignedIn, isLoaded]);

  // Fetch current user
  const fetchUser = useCallback(async () => {
    if (!isSignedIn || !isLoaded) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userData = await userApi.getCurrentUser(getToken);
      setUser(userData);
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken, isSignedIn, isLoaded]);

  // Update user preferences
  const updateUser = useCallback(async (updates) => {
    if (!isSignedIn) return;
    
    setError(null);
    
    try {
      const updatedUser = await userApi.updateUser(updates, getToken);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.message);
      throw err;
    }
  }, [getToken, isSignedIn]);

  // Sync user on mount when signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      syncUser();
    } else if (isLoaded && !isSignedIn) {
      setUser(null);
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, syncUser]);

  return {
    user,
    loading,
    error,
    syncUser,
    fetchUser,
    updateUser,
    isSignedIn,
    isLoaded,
  };
}

export default useUser;
