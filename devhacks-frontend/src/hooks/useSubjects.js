import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { subjectApi } from '../api';

/**
 * Hook for managing subjects data
 */
export function useSubjects() {
  const { getToken, isSignedIn } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all subjects
  const fetchSubjects = useCallback(async () => {
    if (!isSignedIn) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await subjectApi.getAll(getToken);
      setSubjects(data);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken, isSignedIn]);

  // Create a new subject
  const createSubject = useCallback(async (subjectData) => {
    if (!isSignedIn) return;
    
    try {
      const newSubject = await subjectApi.create(subjectData, getToken);
      setSubjects(prev => [...prev, newSubject]);
      return newSubject;
    } catch (err) {
      console.error('Error creating subject:', err);
      setError(err.message);
      throw err;
    }
  }, [getToken, isSignedIn]);

  // Update a subject
  const updateSubject = useCallback(async (id, updates) => {
    if (!isSignedIn) return;
    
    try {
      const updatedSubject = await subjectApi.update(id, updates, getToken);
      setSubjects(prev => prev.map(s => s._id === id ? updatedSubject : s));
      return updatedSubject;
    } catch (err) {
      console.error('Error updating subject:', err);
      setError(err.message);
      throw err;
    }
  }, [getToken, isSignedIn]);

  // Delete a subject
  const deleteSubject = useCallback(async (id) => {
    if (!isSignedIn) return;
    
    try {
      await subjectApi.delete(id, getToken);
      setSubjects(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      console.error('Error deleting subject:', err);
      setError(err.message);
      throw err;
    }
  }, [getToken, isSignedIn]);

  // Get subject by ID
  const getSubjectById = useCallback((id) => {
    return subjects.find(s => s._id === id);
  }, [subjects]);

  // Fetch subjects on mount
  useEffect(() => {
    if (isSignedIn) {
      fetchSubjects();
    }
  }, [isSignedIn, fetchSubjects]);

  return {
    subjects,
    loading,
    error,
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    getSubjectById,
  };
}

export default useSubjects;
