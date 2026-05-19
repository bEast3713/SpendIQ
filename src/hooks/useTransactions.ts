import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/database';

export const useTransactions = (limit = 50) => {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchTransactions = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const { data, error } = await db.transactions.list(profile.id, limit);
      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (id: string, data: any) => {
    try {
      await db.transactions.update(id, data);
      await fetchTransactions();
    } catch (err) {
      console.error('Failed to update transaction', err);
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await db.transactions.delete(id);
      await fetchTransactions();
    } catch (err) {
      console.error('Failed to delete transaction', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [profile?.id, limit]);

  return { transactions, loading, error, refresh: fetchTransactions, updateTransaction, deleteTransaction };
};
