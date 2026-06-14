
import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { calculateTimeDistribution } from '@/lib/calculateTimeDistribution';

export const useTimeDistribution = () => {
  const { currentUser } = useAuth();
  const [totalAvailableMinutes, setTotalAvailableMinutes] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTotalTime = useCallback(async () => {
    if (!currentUser?.id) return 0;
    
    try {
      setLoading(true);
      // Fetch all study slots for the user
      const schedules = await pb.collection('studySchedule').getFullList({
        filter: `userId = "${currentUser.id}" && slotType = "Estudo"`,
        $autoCancel: false,
      });
      
      // Each block represents 30 minutes (0.5 hours)
      const totalMinutes = schedules.length * 30;
      setTotalAvailableMinutes(totalMinutes);
      return totalMinutes;
    } catch (error) {
      console.error('Error fetching total study time:', error);
      return 0;
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    fetchTotalTime();
  }, [fetchTotalTime]);

  const distributeTime = useCallback((disciplines, customTotalMinutes = null) => {
    const minutesToUse = customTotalMinutes !== null ? customTotalMinutes : totalAvailableMinutes;
    return calculateTimeDistribution(disciplines, minutesToUse);
  }, [totalAvailableMinutes]);

  const recalculateTimeDistribution = useCallback((disciplines, totalMinutes) => {
    return calculateTimeDistribution(disciplines, totalMinutes);
  }, []);

  return {
    totalAvailableMinutes,
    totalAvailableHours: totalAvailableMinutes / 60,
    distributeTime,
    recalculateTimeDistribution,
    loading,
    refetchTotalTime: fetchTotalTime
  };
};
