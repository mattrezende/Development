import { useState, useEffect } from 'react';
import apiServerClient from '@/lib/apiServerClient';

export const usePaymentStatus = (paymentId, intervalMs = 5000) => {
  const [statusData, setStatusData] = useState({
    status: null,
    paymentId: null,
    amount: null,
    paymentMethod: null,
    createdAt: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!paymentId) {
      setStatusData(prev => ({ ...prev, isLoading: false, error: 'No payment ID provided' }));
      return;
    }

    let isMounted = true;
    let timeoutId;

    const checkStatus = async () => {
      try {
        const response = await apiServerClient.fetch(`/mercado-pago/payment-status/${paymentId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch payment status');
        }
        
        const data = await response.json();
        
        if (isMounted) {
          setStatusData({
            status: data.status,
            paymentId: data.paymentId,
            amount: data.amount,
            paymentMethod: data.paymentMethod,
            createdAt: data.createdAt,
            isLoading: false,
            error: null,
          });

          // Continue polling if status is pending or in_process
          if (data.status === 'pending' || data.status === 'in_process') {
            timeoutId = setTimeout(checkStatus, intervalMs);
          }
        }
      } catch (error) {
        if (isMounted) {
          setStatusData(prev => ({
            ...prev,
            isLoading: false,
            error: error.message || 'An error occurred while checking payment status',
          }));
          // Retry on error after a longer delay
          timeoutId = setTimeout(checkStatus, intervalMs * 2);
        }
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [paymentId, intervalMs]);

  return statusData;
};