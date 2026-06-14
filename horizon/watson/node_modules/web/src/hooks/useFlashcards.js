
import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

export const useFlashcards = () => {
  const { currentUser } = useAuth();
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFlashcards = useCallback(async (disciplineId = null, subject = null) => {
    if (!currentUser?.id) return [];
    
    setLoading(true);
    setError(null);
    try {
      let filter = `userId = "${currentUser.id}"`;
      if (disciplineId) filter += ` && disciplineId = "${disciplineId}"`;
      if (subject) filter += ` && subject = "${subject}"`;

      const records = await pb.collection('flashcards').getFullList({
        filter,
        sort: '-created',
        $autoCancel: false,
      });
      
      setFlashcards(records);
      return records;
    } catch (err) {
      console.error('Error fetching flashcards:', err);
      setError(err.message);
      toast.error('Erro ao carregar flashcards');
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  const createFlashcard = async (data) => {
    if (!currentUser?.id) return null;
    
    setLoading(true);
    try {
      const record = await pb.collection('flashcards').create({
        ...data,
        userId: currentUser.id,
      }, { $autoCancel: false });
      
      setFlashcards(prev => [record, ...prev]);
      return record;
    } catch (err) {
      console.error('Error creating flashcard:', err);
      toast.error('Erro ao criar flashcard');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateFlashcard = async (id, data) => {
    setLoading(true);
    try {
      const record = await pb.collection('flashcards').update(id, data, { $autoCancel: false });
      setFlashcards(prev => prev.map(f => f.id === id ? record : f));
      return record;
    } catch (err) {
      console.error('Error updating flashcard:', err);
      toast.error('Erro ao atualizar flashcard');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteFlashcard = async (id) => {
    setLoading(true);
    try {
      await pb.collection('flashcards').delete(id, { $autoCancel: false });
      setFlashcards(prev => prev.filter(f => f.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting flashcard:', err);
      toast.error('Erro ao deletar flashcard');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getFlashcardsByDiscipline = useCallback(async (disciplineId) => {
    return fetchFlashcards(disciplineId);
  }, [fetchFlashcards]);

  return {
    flashcards,
    loading,
    error,
    fetchFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    getFlashcardsByDiscipline
  };
};
