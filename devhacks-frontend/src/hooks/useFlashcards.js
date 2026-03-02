import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { flashcardApi } from '../api';

/**
 * Hook for managing flashcards data
 */
export function useFlashcards(initialFilters = {}) {
  const { getToken, isSignedIn } = useAuth();
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  // Fetch flashcards with optional filters
  const fetchFlashcards = useCallback(async (filterOverrides = {}) => {
    if (!isSignedIn) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const activeFilters = { ...filters, ...filterOverrides };
      const data = await flashcardApi.getAll(getToken, activeFilters);
      setFlashcards(data);
    } catch (err) {
      console.error('Error fetching flashcards:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken, isSignedIn, filters]);

  // Create a new flashcard
  const createFlashcard = useCallback(async (flashcardData) => {
    if (!isSignedIn) return;
    
    try {
      const newFlashcard = await flashcardApi.create(flashcardData, getToken);
      setFlashcards(prev => [...prev, newFlashcard]);
      return newFlashcard;
    } catch (err) {
      console.error('Error creating flashcard:', err);
      setError(err.message);
      throw err;
    }
  }, [getToken, isSignedIn]);

  // Update a flashcard
  const updateFlashcard = useCallback(async (id, updates) => {
    if (!isSignedIn) return;
    
    try {
      const updatedFlashcard = await flashcardApi.update(id, updates, getToken);
      setFlashcards(prev => prev.map(f => f._id === id ? updatedFlashcard : f));
      return updatedFlashcard;
    } catch (err) {
      console.error('Error updating flashcard:', err);
      setError(err.message);
      throw err;
    }
  }, [getToken, isSignedIn]);

  // Delete a flashcard
  const deleteFlashcard = useCallback(async (id) => {
    if (!isSignedIn) return;
    
    try {
      await flashcardApi.delete(id, getToken);
      setFlashcards(prev => prev.filter(f => f._id !== id));
    } catch (err) {
      console.error('Error deleting flashcard:', err);
      setError(err.message);
      throw err;
    }
  }, [getToken, isSignedIn]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Fetch flashcards on mount and when filters change
  useEffect(() => {
    if (isSignedIn) {
      fetchFlashcards();
    }
  }, [isSignedIn, fetchFlashcards]);

  return {
    flashcards,
    loading,
    error,
    filters,
    fetchFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    updateFilters,
  };
}

export default useFlashcards;
