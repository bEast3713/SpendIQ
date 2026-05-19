import React, { useState, useEffect } from 'react';
import { X, Tag, Calendar, Layout, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import { db } from '../lib/database';
import { useAuth } from '../context/AuthContext';

import { useWallets } from '../hooks/useWallets';
import { useCategories } from '../hooks/useCategories';
import { getCurrencySymbol } from '../utils/currency';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const AddTransactionModal = ({ isOpen, onClose, onSuccess, initialData }: AddTransactionModalProps) => {
  const { profile } = useAuth();
  const { wallets } = useWallets();
  const { categories } = useCategories();
  const [loading, setLoading] = useState(false);
  const currencySymbol = getCurrencySymbol(profile?.currency);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category_id: '',
    wallet_id: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };


  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          amount: Math.abs(initialData.amount).toString(),
          type: initialData.type,
          category_id: initialData.category_id || '',
          wallet_id: initialData.wallet_id || '',
          description: initialData.description || '',
          date: initialData.date || new Date().toISOString().split('T')[0]
        });
      } else {
        setFormData({
          amount: '',
          type: 'expense',
          category_id: '',
          wallet_id: '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        });
        if (wallets.length > 0) {
          setFormData(prev => ({ ...prev, wallet_id: wallets[0].id }));
        }
      }
    }
  }, [isOpen, initialData, wallets]);

  useEffect(() => {
    if (isOpen && !initialData) {
      const filteredCats = categories.filter(c => c.type === formData.type || c.type === 'both');
      if (filteredCats.length > 0 && !formData.category_id) {
        setFormData(prev => ({ ...prev, category_id: filteredCats[0].id }));
      }
    }
  }, [isOpen, categories, formData.type, initialData]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) {
      showToast('Session expired. Please log in again.', 'error');
      setLoading(false);
      return;
    }
    
    if (!formData.category_id || formData.category_id === '') {
      showToast('Please select a category', 'error');
      setLoading(false);
      return;
    }

    if (!formData.wallet_id || formData.wallet_id === '') {
      showToast('Please select a payment method', 'error');
      setLoading(false);
      return;
    }

    try {
      if (initialData) {
        await db.transactions.update(initialData.id, {
          wallet_id: formData.wallet_id,
          category_id: formData.category_id,
          amount: parseFloat(formData.amount),
          type: formData.type,
          description: formData.description || '',
          date: formData.date
        });
        showToast('Transaction updated!', 'success');
      } else {
        await db.transactions.create({
          user_id: profile.id,
          wallet_id: formData.wallet_id,
          category_id: formData.category_id,
          amount: parseFloat(formData.amount),
          type: formData.type,
          description: formData.description || '',
          date: formData.date
        });
        showToast('Transaction saved!', 'success');
      }
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 500);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to save transaction', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="glass-card w-full max-w-lg rounded-3xl p-8 relative animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute right-6 top-6 text-text-muted hover:text-white transition-colors">
          <X size={24} />
        </button>

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

        <h2 className="text-2xl font-bold text-white mb-2">{initialData ? 'Edit Transaction' : 'New Transaction'}</h2>
        <p className="text-white/60 mb-6">{initialData ? 'Update the details below' : 'Record a new expense or income'}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex bg-surface-container-low p-1 rounded-full">
            <button 
              type="button"
              onClick={() => setFormData({...formData, type: 'expense'})}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${formData.type === 'expense' ? 'bg-error-container text-white shadow-lg' : 'text-text-muted'}`}
            >
              Expense
            </button>
            <button 
              type="button"
              onClick={() => setFormData({...formData, type: 'income'})}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${formData.type === 'income' ? 'bg-secondary-container text-white shadow-lg' : 'text-text-muted'}`}
            >
              Income
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label={`Amount (${profile?.currency || 'USD'})`} 
              type="number" 
              step="0.01" 
              required
              placeholder="0.00"
              icon={<span className="text-sm font-bold text-text-muted">{currencySymbol}</span>}
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
            />
            <div className="space-y-1">
              <label className="block text-xs text-text-muted font-medium ml-1 uppercase tracking-widest">Category</label>
              <div className="relative group">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-secondary transition-colors" size={20} />
                <select 
                  className="w-full bg-[#0F172A]/50 backdrop-blur-xl border border-white/10 py-3.5 pl-12 pr-10 text-white text-sm font-medium focus:outline-none focus:border-secondary/50 focus:bg-[#0F172A]/80 focus:ring-4 focus:ring-secondary/5 transition-all duration-300 rounded-2xl appearance-none [&>option]:bg-[#0F172A]"
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                >
                  {categories
                    .filter(c => c.type === formData.type || c.type === 'both')
                    .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs text-text-muted font-medium ml-1 uppercase tracking-widest">Payment Method</label>
              <div className="relative group">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-secondary transition-colors" size={20} />
                <select 
                  required
                  className="w-full bg-[#0F172A]/50 backdrop-blur-xl border border-white/10 py-3.5 pl-12 pr-10 text-white text-sm font-medium focus:outline-none focus:border-secondary/50 focus:bg-[#0F172A]/80 focus:ring-4 focus:ring-secondary/5 transition-all duration-300 rounded-2xl appearance-none [&>option]:bg-[#0F172A]"
                  value={formData.wallet_id}
                  onChange={(e) => setFormData({...formData, wallet_id: e.target.value})}
                >
                  {wallets.length > 0 ? (
                    wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)
                  ) : (
                    <option disabled value="">No wallets found</option>
                  )}
                </select>
              </div>
            </div>
            <Input 
              label="Transaction Date" 
              type="date" 
              required
              icon={<Calendar size={20} />}
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <Input 
            label="Description" 
            placeholder="What was this for?"
            icon={<Layout size={20} />}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />

          <Button type="submit" loading={loading} className="w-full py-4 text-lg">
            {initialData ? 'Update Transaction' : 'Save Transaction'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
