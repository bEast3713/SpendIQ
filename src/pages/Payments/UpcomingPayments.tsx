import { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, CheckCircle2, AlertCircle, DollarSign, Trash2, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { db } from '../../lib/database';
import { useRecurringPayments } from '../../hooks/useRecurringPayments';
import { useCategories } from '../../hooks/useCategories';
import { useWallets } from '../../hooks/useWallets';
import { getCurrencySymbol } from '../../utils/currency';

const UpcomingPayments = () => {
  const { profile } = useAuth();
  const { payments, loading: paymentsLoading, refresh: refreshPayments } = useRecurringPayments();
  const { categories } = useCategories();
  const { wallets } = useWallets();
  const currencySymbol = getCurrencySymbol(profile?.currency);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category_id: '',
    wallet_id: '',
    next_date: new Date().toISOString().split('T')[0],
    frequency: 'monthly'
  });

  useEffect(() => {
    if (isAdding) {
      if (categories.length > 0 && !formData.category_id) {
        setFormData(prev => ({ ...prev, category_id: categories[0].id }));
      }
      if (wallets.length > 0 && !formData.wallet_id) {
        setFormData(prev => ({ ...prev, wallet_id: wallets[0].id }));
      }
    }
  }, [isAdding, categories, wallets]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      const dateObj = new Date(formData.next_date);
      const { error } = await db.recurringPayments.create({
        user_id: profile.id,
        name: formData.name,
        amount: parseFloat(formData.amount),
        category_id: formData.category_id,
        wallet_id: formData.wallet_id,
        next_date: formData.next_date,
        frequency: formData.frequency,
        status: 'active',
        due_day: dateObj.getDate(),
        month: dateObj.getMonth() + 1,
        year: dateObj.getFullYear()
      });

      if (error) throw error;
      
      showToast('Scheduled payment added!', 'success');
      setIsAdding(false);
      setFormData({
        name: '',
        amount: '',
        category_id: categories[0]?.id || '',
        wallet_id: wallets[0]?.id || '',
        next_date: new Date().toISOString().split('T')[0],
        frequency: 'monthly'
      });
      refreshPayments();
    } catch (err: any) {
      showToast(err.message || 'Error adding payment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await db.recurringPayments.delete(id);

      if (error) throw error;
      showToast('Payment removed', 'success');
      refreshPayments();
    } catch (err: any) {
      showToast('Failed to remove', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-stack-lg relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-in slide-in-from-top duration-300 ${
          toast.type === 'success' 
            ? 'bg-secondary/10 border-secondary/20 text-secondary' 
            : 'bg-error/10 border-error/20 text-error'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-text-primary tracking-tight">Upcoming Bills</h2>
          <p className="text-text-muted mt-1">Schedule your fixed expenses like rent or subs.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="gap-2">
          <Plus size={20} /> Schedule New
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {paymentsLoading ? (
          <div className="glass-card rounded-3xl p-12 flex justify-center border border-border-glass">
            <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : payments.length > 0 ? (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="glass-card rounded-3xl p-6 border border-border-glass flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-white/5 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                    <Clock size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">{payment.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-text-muted font-black uppercase tracking-widest border border-white/5">
                        {payment.categories?.name || 'Recurring'}
                      </span>
                      <span className="text-[10px] text-secondary font-bold flex items-center gap-1">
                        <Calendar size={12} /> Next: {new Date(payment.next_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-8">
                  <div className="text-right">
                    <p className="text-2xl font-black text-text-primary">{currencySymbol}{payment.amount}</p>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{payment.frequency}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(payment.id)}
                    className="p-3 rounded-xl bg-error/10 text-error opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/20"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-12 flex flex-col items-center justify-center text-center border border-border-glass">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
              <Calendar className="text-text-muted" size={32} />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">No Scheduled Payments</h3>
            <p className="text-sm text-text-muted max-w-xs mb-8">Keep track of your rent, subscriptions, and other recurring costs.</p>
            <Button variant="secondary" onClick={() => setIsAdding(true)}>Schedule Your First Payment</Button>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg rounded-3xl p-8 relative animate-in fade-in zoom-in duration-300 border border-border-glass">
            <button onClick={() => setIsAdding(false)} className="absolute right-6 top-6 text-text-muted hover:text-white">
              <Plus size={24} className="rotate-45" />
            </button>
            <h3 className="text-2xl font-bold text-text-primary mb-6">Schedule Payment</h3>
            
            <form onSubmit={handleAddPayment} className="space-y-6">
              <Input 
                label="Payment Name" 
                placeholder="e.g. Monthly Rent"
                required
                icon={<ArrowUpRight size={20} />}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Amount" 
                  type="number" 
                  required
                  icon={<DollarSign size={20} />}
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
                <div className="space-y-1">
                  <label className="block text-xs text-text-muted font-medium ml-1 uppercase tracking-widest">Category</label>
                  <select 
                    className="w-full bg-[#0F172A]/50 backdrop-blur-xl border border-white/10 py-4 px-6 text-white font-medium focus:outline-none focus:border-secondary/50 focus:bg-[#0F172A]/80 focus:ring-4 focus:ring-secondary/5 transition-all duration-300 rounded-2xl appearance-none [&>option]:bg-[#0F172A]"
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-text-muted font-medium ml-1 uppercase tracking-widest">Pay From</label>
                <select 
                  className="w-full bg-[#0F172A]/50 backdrop-blur-xl border border-white/10 py-4 px-6 text-white font-medium focus:outline-none focus:border-secondary/50 focus:bg-[#0F172A]/80 focus:ring-4 focus:ring-secondary/5 transition-all duration-300 rounded-2xl appearance-none [&>option]:bg-[#0F172A]"
                  value={formData.wallet_id}
                  onChange={(e) => setFormData({...formData, wallet_id: e.target.value})}
                >
                  {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Next Due Date" 
                  type="date" 
                  required
                  icon={<Calendar size={20} />}
                  value={formData.next_date}
                  onChange={(e) => setFormData({...formData, next_date: e.target.value})}
                />
                  <div className="space-y-1">
                    <label className="block text-xs text-text-muted font-medium ml-1 uppercase tracking-widest">Frequency</label>
                    <select 
                      className="w-full bg-[#0F172A]/50 backdrop-blur-xl border border-white/10 py-4 px-6 text-white font-medium focus:outline-none focus:border-secondary/50 focus:bg-[#0F172A]/80 focus:ring-4 focus:ring-secondary/5 transition-all duration-300 rounded-2xl appearance-none [&>option]:bg-[#0F172A]"
                      value={formData.frequency}
                      onChange={(e) => setFormData({...formData, frequency: e.target.value as any})}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
              </div>

              <Button type="submit" loading={loading} className="w-full py-4">
                Confirm Schedule
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingPayments;
