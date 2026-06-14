
import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

export const useFlashcardReviews = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const submitReview = async (flashcardId, performance) => {
    if (!currentUser?.id) return null;
    
    try {
      const record = await pb.collection('flashcard_reviews').create({
        flashcardId,
        userId: currentUser.id,
        performance,
        timestamp: new Date().toISOString(),
      }, { $autoCancel: false });
      
      return record;
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error('Erro ao salvar revisão');
      throw err;
    }
  };

  const getReviewStats = useCallback(async () => {
    if (!currentUser?.id) return null;
    
    setLoading(true);
    try {
      const reviews = await pb.collection('flashcard_reviews').getFullList({
        filter: `userId = "${currentUser.id}"`,
        $autoCancel: false,
      });
      
      const stats = {
        total: reviews.length,
        errei: reviews.filter(r => r.performance === 'errei').length,
        dificil: reviews.filter(r => r.performance === 'dificil').length,
        medio: reviews.filter(r => r.performance === 'medio').length,
        facil: reviews.filter(r => r.performance === 'facil').length,
      };
      
      return stats;
    } catch (err) {
      console.error('Error fetching review stats:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  const getReviewsByFlashcard = useCallback(async (flashcardId) => {
    if (!currentUser?.id) return [];
    
    try {
      return await pb.collection('flashcard_reviews').getFullList({
        filter: `userId = "${currentUser.id}" && flashcardId = "${flashcardId}"`,
        sort: '-timestamp',
        $autoCancel: false,
      });
    } catch (err) {
      console.error('Error fetching flashcard reviews:', err);
      return [];
    }
  }, [currentUser?.id]);

  const getSessionStats = (sessionReviews) => {
    const stats = {
      total: sessionReviews.length,
      errei: 0,
      dificil: 0,
      medio: 0,
      facil: 0,
    };
    
    sessionReviews.forEach(review => {
      if (stats[review.performance] !== undefined) {
        stats[review.performance]++;
      }
    });
    
    const correctCount = stats.facil + stats.medio;
    stats.accuracy = stats.total > 0 ? Math.round((correctCount / stats.total) * 100) : 0;
    
    return stats;
  };

  return {
    submitReview,
    getReviewStats,
    getReviewsByFlashcard,
    getSessionStats,
    loading
  };
};
