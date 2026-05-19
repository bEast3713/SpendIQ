import { useState } from 'react';
import { X, CreditCard, Wallet, Banknote, Landmark, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { db } from '../lib/database';
import Button from './Button';
import Input from './Input';
import { useAuth } from '../context/AuthContext';
import { getCurrencySymbol } from '../utils/currency';

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddWalletModal = ({ isOpen, onClose, onSuccess }: AddWalletModalProps) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const currencySymbol = getCurrencySymbol(profile?.currency);
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank',
    balance: ''
  });
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const walletTypes = [
    { id: 'bank', name: 'Bank Account', icon: <Landmark size={20} /> },
    { id: 'digital', name: 'Digital Wallet', icon: <Wallet size={20} /> },
    { id: 'cash', name: 'Cash', icon: <Banknote size={20} /> }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      await db.wallets.create({
        user_id: profile.id,
        name: formData.name,
        wallet_type: formData.type,
        balance: parseFloat(formData.balance) || 0
      });
      
      showToast('Payment method added!', 'success');
      setTimeout(() => {
        onSuccess();
        onClose();
        setFormData({ name: '', type: 'bank', balance: '' });
      }, 500);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to add payment method', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <div className="glass-card w-full max-w-md rounded-3xl p-8 relative animate-in fade-in zoom-in duration-300 border border-white/10">
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

        <h2 className="text-2xl font-bold text-text-primary mb-6 tracking-tight">Add Payment Method</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {walletTypes.map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setFormData({...formData, type: type.id})}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300
                  ${formData.type === type.id 
                    ? 'border-secondary bg-secondary/10 text-secondary shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
                    : 'border-white/5 bg-[#0F172A]/50 text-text-muted hover:bg-[#0F172A]/80 hover:border-white/10'}
                `}
              >
                {type.icon}
                <span className="text-[10px] font-bold uppercase tracking-widest">{type.name}</span>
              </button>
            ))}
          </div>

          <Input 
            label="Method Name" 
            placeholder="e.g. My Savings"
            required
            icon={<CreditCard size={20} />}
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />

          <Input 
            label={`Initial Balance (${profile?.currency || 'USD'})`} 
            type="number"
            step="0.01"
            placeholder="0.00"
            icon={<span className="text-sm font-bold text-text-muted">{currencySymbol}</span>}
            value={formData.balance}
            onChange={(e) => setFormData({...formData, balance: e.target.value})}
          />

          <Button type="submit" loading={loading} className="w-full py-4 text-lg gap-2 glow-primary">
            <Plus size={20} /> Add Method
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddWalletModal;
