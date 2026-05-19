import { useState } from 'react';
import { Plus, CreditCard, Wallet as WalletIcon, Banknote, MoreVertical, TrendingUp, Settings2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useWallets } from '../hooks/useWallets';
import AddWalletModal from '../components/AddWalletModal';
import EditWalletModal from '../components/EditWalletModal';
import Button from '../components/Button';
import { db } from '../lib/database';
import { useAuth } from '../context/AuthContext';
import { getCurrencySymbol } from '../utils/currency';

const Wallets = () => {
  const { profile } = useAuth();
  const { wallets, loading, refresh } = useWallets();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const currencySymbol = getCurrencySymbol(profile?.currency);

  const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-stack-lg max-w-7xl mx-auto py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-text-primary tracking-tight">Payment Methods</h2>
          <p className="text-text-muted mt-1">Total Balance: <span className="text-secondary font-bold">{currencySymbol}{totalBalance.toLocaleString()}</span></p>
        </div>

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

        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 glow-primary">
          <Plus size={20} /> New Method
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-48 glass-card animate-pulse rounded-3xl" />)
        ) : wallets.length > 0 ? (
          wallets.map((wallet) => (
            <WalletCard 
              key={wallet.id} 
              wallet={wallet} 
              onRefresh={refresh} 
              onEdit={() => setEditingWallet(wallet)}
              showToast={showToast}
              currencySymbol={currencySymbol}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center glass-card rounded-3xl border-dashed border-2 border-white/5">
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6">
              <CreditCard size={40} className="text-text-muted/40" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">No Methods Added</h3>
            <p className="text-text-muted mb-8 max-w-xs mx-auto">Add a bank account or cash to start tracking your spending.</p>
            <Button variant="secondary" onClick={() => setIsModalOpen(true)}>Add First Method</Button>
          </div>
        )}
      </div>

      <AddWalletModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={refresh} 
      />

      <EditWalletModal
        isOpen={!!editingWallet}
        wallet={editingWallet}
        onClose={() => setEditingWallet(null)}
        onSuccess={refresh}
      />
    </div>
  );

  function WalletCard({ wallet, onRefresh, onEdit, showToast, currencySymbol }: { wallet: any, onRefresh: () => void, onEdit: () => void, showToast: (msg: string, type: 'success' | 'error') => void, currencySymbol: string }) {
    const [showMenu, setShowMenu] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
      if (!confirm('Are you sure you want to delete this? This will not remove transactions associated with it.')) return;
      setIsDeleting(true);
      try {
        const { error } = await db.wallets.delete(wallet.id);
        if (error) throw error;
        showToast('Account removed successfully', 'success');
        onRefresh();
      } catch (err: any) {
        console.error('Delete error:', err);
        showToast(err.message || 'Failed to delete account', 'error');
      } finally {
        setIsDeleting(false);
      }
    };

    const typeIcons: any = {
      bank: <CreditCard className="text-primary" size={24} />,
      digital: <WalletIcon className="text-secondary" size={24} />,
      cash: <Banknote className="text-tertiary" size={24} />
    };

    return (
      <div className={`relative overflow-hidden glass-card rounded-3xl p-7 group hover:-translate-y-2 transition-all duration-500 border-l-4 ${wallet.wallet_type === 'bank' ? 'border-l-primary' : wallet.wallet_type === 'cash' ? 'border-l-tertiary' : 'border-l-secondary'}`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${wallet.wallet_type === 'bank' ? 'from-primary/10' : wallet.wallet_type === 'cash' ? 'from-tertiary/10' : 'from-secondary/10'} opacity-30 group-hover:opacity-50 transition-opacity`} />
        
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex justify-between items-start">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
              {typeIcons[wallet.wallet_type] || <WalletIcon className="text-secondary" size={24} />}
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="text-text-muted hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
              >
                <MoreVertical size={20} />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 glass-card rounded-2xl border border-white/10 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <button 
                      onClick={() => {
                        onEdit();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white hover:bg-white/10 rounded-xl transition-all"
                    >
                      <Settings2 size={16} />
                      Edit Method
                    </button>
                    <button 
                      disabled={isDeleting}
                      onClick={handleDelete}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-error hover:bg-error/10 rounded-xl transition-all"
                    >
                      {isDeleting ? 'Deleting...' : 'Remove Method'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-8">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">{wallet.wallet_type || 'Custom'} Account</p>
            <h3 className="text-2xl font-bold text-text-primary mb-5 group-hover:text-white transition-colors">{wallet.name}</h3>
            
            <div className="flex items-end justify-between">
              <p className="text-3xl font-black text-text-primary tracking-tighter">{currencySymbol}{wallet.balance?.toLocaleString()}</p>
              <div className="flex items-center gap-1.5 text-[11px] font-black text-secondary bg-secondary/10 px-3 py-1.5 rounded-full border border-secondary/10">
                <TrendingUp size={12} /> +2.4%
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Wallets;
