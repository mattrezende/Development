import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';

export const calculateEnrollmentPrice = async (teacherId, type, quantity) => {
  if (!teacherId || !type || !quantity || quantity < 1) return null;
  
  try {
    const records = await pb.collection('pricing').getFullList({
      filter: `teacher_id="${teacherId}" && type="${type}" && quantity=${quantity}`,
      $autoCancel: false,
    });
    
    if (records.length > 0) {
      return records[0].price;
    }
    
    console.warn(`[usePriceCalculator] No pricing found for teacher ${teacherId}, type ${type}, quantity ${quantity}`);
    return null;
  } catch (error) {
    console.error("[usePriceCalculator] Error calculating price:", error);
    return null;
  }
};

export const usePriceCalculator = () => {
  const [calculating, setCalculating] = useState(false);

  const getPrice = useCallback(async (teacherId, type, quantity) => {
    setCalculating(true);
    const price = await calculateEnrollmentPrice(teacherId, type, quantity);
    setCalculating(false);
    return price;
  }, []);

  return { getPrice, calculating };
};