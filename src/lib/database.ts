import { supabase } from './supabase';

export const db = {
  profiles: {
    get: (userId: string) => supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    update: (userId: string, data: any) => supabase.from('profiles').update(data).eq('id', userId),
  },
  wallets: {
    list: (userId: string) => supabase.from('wallets').select('*').eq('user_id', userId),
    create: (data: any) => supabase.from('wallets').insert(data),
    update: (id: string, data: any) => supabase.from('wallets').update(data).eq('id', id),
    delete: (id: string) => supabase.from('wallets').delete().eq('id', id),
  },
  transactions: {
    list: (userId: string, limit = 10) => 
      supabase.from('transactions')
        .select('*, wallets(name), categories(name, icon, color)')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit),
    listByDateRange: (userId: string, startDate: string, endDate: string) =>
      supabase.from('transactions')
        .select('*, wallets(name), categories(name, icon, color)')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false }),
    create: async (data: any) => {
      // Create transaction (wallet balance is automatically updated via database trigger)
      const { data: tx, error: txError } = await supabase.from('transactions').insert(data).select().maybeSingle();
      if (txError) throw txError;

      return tx;
    },
    update: async (id: string, data: any) => {
      const { data: tx, error: txError } = await supabase.from('transactions').update(data).eq('id', id).select().maybeSingle();
      if (txError) throw txError;
      return tx;
    },
    delete: (id: string) => supabase.from('transactions').delete().eq('id', id)
  },
  recurringPayments: {
    list: (userId: string) => 
      supabase.from('recurring_payments')
        .select('*, categories(name, icon)')
        .eq('user_id', userId)
        .order('next_date', { ascending: true }),
    create: (data: any) => supabase.from('recurring_payments').insert(data),
    delete: (id: string) => supabase.from('recurring_payments').delete().eq('id', id),
    update: (id: string, data: any) => supabase.from('recurring_payments').update(data).eq('id', id),
  },
  categories: {
    list: () => supabase.from('categories').select('*').order('name'),
    seed: async () => {
      const { count } = await supabase.from('categories').select('*', { count: 'exact', head: true });
      if (count === 0) {
        const { CATEGORIES } = await import('../data/categories');
        const toInsert = CATEGORIES.map(c => ({
          id: c.id,
          name: c.name,
          icon: c.name, // Storing name as icon reference or similar
          color: c.color,
          type: c.type
        }));
        await supabase.from('categories').insert(toInsert);
      }
    }
  },
  budgets: {
    list: (userId: string) => supabase.from('budgets').select('*').eq('user_id', userId),
    update: (userId: string, category: string, amount: number) => 
      supabase.from('budgets')
        .upsert({ user_id: userId, category, limit_amount: amount }, { onConflict: 'user_id,category' })
  }
};
