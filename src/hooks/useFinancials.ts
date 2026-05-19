import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/database';

export const useFinancials = () => {
  const { profile } = useAuth();
  const [data, setData] = useState({
    wallets: [] as any[],
    recentTransactions: [] as any[],
    stats: {
      totalBalance: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      dailyData: [] as any[],
      categoryTotals: {} as Record<string, number>,
      wallets: [] as any[]
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      // We also need transactions from the last 7 days for the chart, 
      // which might cross into the previous month. Let's fetch the last 30 days.
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];

      const [walletsRes, transRes] = await Promise.all([
        db.wallets.list(profile.id),
        db.transactions.listByDateRange(profile.id, thirtyDaysAgoStr, todayStr)
      ]);

      const wallets = walletsRes.data || [];
      const recentTransactions = transRes.data || [];
      
      const totalBalance = wallets.reduce((sum: number, w: any) => sum + (w.balance || 0), 0);
      
      const monthlyTrans = recentTransactions.filter((t: any) => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      const monthlyIncome = monthlyTrans
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + t.amount, 0);
        
      const monthlyExpenses = monthlyTrans
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      // Aggregates for chart (Rolling 7 days)
      const dailyMap: Record<string, { income: number, expense: number }> = {};
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      // Initialize last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = days[d.getDay()];
        dailyMap[dayName] = { income: 0, expense: 0 };
      }
      const categoryTotals: Record<string, number> = {};

      recentTransactions.forEach((t: any) => {
        const d = new Date(t.date);
        const dayName = days[d.getDay()];
        
        // Only include in chart if it occurred in the last 7 days
        const diffTime = Math.abs(new Date().getTime() - d.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (dailyMap[dayName] && diffDays <= 7) {
          if (t.type === 'income') dailyMap[dayName].income += t.amount;
          else dailyMap[dayName].expense += t.amount;
        }

        if (t.type === 'expense') {
          const catName = t.categories?.name || 'Other';
          categoryTotals[catName] = (categoryTotals[catName] || 0) + t.amount;
        }
      });

      const dailyData = Object.entries(dailyMap).map(([name, vals]) => ({ name, ...vals }));

      setData({
        wallets,
        recentTransactions: recentTransactions.slice(0, 5), // Keep only top 5 for recent activity
        stats: {
          totalBalance,
          monthlyIncome,
          monthlyExpenses,
          dailyData,
          categoryTotals,
          wallets // Pass full wallets for the dashboard list
        }
      });
    } catch (err) {
      console.error('Fetch financials error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, loading, error, refresh: fetchData };
};
