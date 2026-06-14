
/**
 * Calculates the proportional time allocation for a list of disciplines based on their rank.
 * 
 * @param {Array} disciplines - Array of discipline objects { name, rank, ... }
 * @param {number} totalMinutes - Total available time in minutes
 * @returns {Array} - Array of disciplines with calculated `allocated_time` in minutes
 */
export const calculateTimeDistribution = (disciplines, totalMinutes) => {
  if (!Array.isArray(disciplines) || disciplines.length === 0) {
    return [];
  }

  // Ensure totalMinutes is a valid positive number
  const validTotalMinutes = Math.max(0, Number(totalMinutes) || 0);

  if (validTotalMinutes === 0) {
    return disciplines.map((d, index) => ({
      ...d,
      allocated_time: 0,
      order_in_queue: d.order_in_queue ?? index
    }));
  }

  // Normalize disciplines and calculate total rank
  const normalizedDisciplines = disciplines.map(d => ({
    ...d,
    rank: Math.max(1, Number(d.rank) || 1) // Default rank to 1, minimum 1
  }));

  const totalRank = normalizedDisciplines.reduce((sum, d) => sum + d.rank, 0);

  // Calculate allocated time for each discipline
  let distributedDisciplines = normalizedDisciplines.map((d, index) => {
    // Formula: (discipline_rank / sum_of_all_ranks) * total_cycle_time
    const rawAllocatedTime = (d.rank / totalRank) * validTotalMinutes;
    
    return {
      ...d,
      allocated_time: Math.round(rawAllocatedTime),
      order_in_queue: d.order_in_queue ?? index
    };
  });

  // Adjust for rounding errors to ensure the sum exactly matches totalMinutes
  const currentSum = distributedDisciplines.reduce((sum, d) => sum + d.allocated_time, 0);
  const difference = validTotalMinutes - currentSum;

  if (difference !== 0 && distributedDisciplines.length > 0) {
    // Add/subtract the difference to the highest ranked discipline to balance
    const highestRankIndex = distributedDisciplines.reduce(
      (maxIdx, d, idx, arr) => d.rank > arr[maxIdx].rank ? idx : maxIdx, 
      0
    );
    distributedDisciplines[highestRankIndex].allocated_time += difference;
    
    // Ensure no negative times due to adjustment
    if (distributedDisciplines[highestRankIndex].allocated_time < 0) {
      distributedDisciplines[highestRankIndex].allocated_time = 0;
    }
  }

  // Sort by order_in_queue to maintain user preference, fallback to rank (highest first)
  return distributedDisciplines.sort((a, b) => {
    if (a.order_in_queue !== b.order_in_queue) {
      return a.order_in_queue - b.order_in_queue;
    }
    return b.rank - a.rank;
  });
};
