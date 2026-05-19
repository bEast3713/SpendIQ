import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/database';

export const useWallets = () => {
  const { profile } = useAuth();
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchWallets = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const { data, error } = await db.wallets.list(profile.id);
      if (error) throw error;
      setWallets(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, [profile?.id]);

  return { wallets, loading, error, refresh: fetchWallets };
};
