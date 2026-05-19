import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/database';

export type RecurringPayment = {
  id: string;
  name: string;
  amount: number;
  category_id: string;
  wallet_id: string;
  next_date: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  status: 'active' | 'paused';
  categories?: { name: string, icon: string };
};

export const useRecurringPayments = () => {
  const { profile } = useAuth();
  const [payments, setPayments] = useState<RecurringPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchPayments = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const { data, error } = await db.recurringPayments.list(profile.id);
      
      if (error) throw error;
      setPayments(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return { payments, loading, error, refresh: fetchPayments };
};
