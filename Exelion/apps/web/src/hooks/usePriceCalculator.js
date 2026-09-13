import { useState, useCallback } from 'react';
import apiClient from '@/lib/apiClient';

export const calculateEnrollmentPrice = async (teacherId, type, quantity) => {
  if (!teacherId || !type || !quantity || quantity < 1) return null;

  try {
    const { pricing } = await apiClient.get(`/public/teachers/${teacherId}/pricing`);
    const match = pricing.find((p) => p.type === type && p.quantity === quantity);

    if (match) {
      return match.price;
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
