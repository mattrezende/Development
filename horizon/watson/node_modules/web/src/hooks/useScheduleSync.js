
import { useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { calculateTimeDistribution } from '@/lib/calculateTimeDistribution';

export const useScheduleSync = (onSyncComplete) => {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser?.id) return;

    const handleScheduleChange = async (e) => {
      console.log('[useScheduleSync] Schedule changed, recalculating active cycles...', e.action);
      
      try {
        // 1. Calculate new total time from schedule
        const schedules = await pb.collection('studySchedule').getFullList({
          filter: `userId = "${currentUser.id}" && slotType = "Estudo"`,
          $autoCancel: false,
        });
        const totalMinutes = schedules.length * 30;
        const totalHours = totalMinutes / 60;

        // 2. Fetch all active cycles for the user
        const activeCycles = await pb.collection('studyCycles').getFullList({
          filter: `userId = "${currentUser.id}" && status = "active"`,
          $autoCancel: false,
        });

        // 3. Recalculate and update each active cycle
        const updatePromises = activeCycles.map(async (cycle) => {
          const currentSubjects = cycle.subjects || [];
          const updatedSubjects = calculateTimeDistribution(currentSubjects, totalMinutes);
          
          return pb.collection('studyCycles').update(cycle.id, {
            subjects: updatedSubjects,
            totalCycleDuration: totalHours
          }, { $autoCancel: false });
        });

        await Promise.all(updatePromises);
        console.log(`[useScheduleSync] Successfully updated ${activeCycles.length} active cycles.`);
        
        if (onSyncComplete) {
          onSyncComplete();
        }
      } catch (error) {
        console.error('[useScheduleSync] Error syncing schedule to cycles:', error);
      }
    };

    // Subscribe to changes in the studySchedule collection
    pb.collection('studySchedule').subscribe('*', handleScheduleChange);

    return () => {
      pb.collection('studySchedule').unsubscribe('*');
    };
  }, [currentUser?.id, onSyncComplete]);
};
