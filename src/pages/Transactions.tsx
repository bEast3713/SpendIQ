import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  HelpCircle,
  Trash2,
  Edit2,
  ArrowDownAZ,
  ArrowUpZA
} from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import AddTransactionModal from '../components/AddTransactionModal';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { getCurrencySymbol } from '../utils/currency';

const Transactions = () => {
  const { profile } = useAuth();
  const { transactions, loading, refresh, deleteTransaction } = useTransactions(100);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const currencySymbol = getCurrencySymbol(profile?.currency);

  const filteredTransactions = transactions
    .filter(t => 
      (t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       t.categories?.name?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (typeFilter === 'all' || t.type === typeFilter)
    )
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  const handleEdit = (tx: any) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setEditingTx(null), 300); // Wait for modal close animation
  };

  return (
    <div className="space-y-stack-lg max-w-7xl mx-auto py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">Transactions</h2>
          <p className="text-text-muted">Track and categorize every cent of your campus life.</p>
        </div>
        <Button onClick={() => { setEditingTx(null); setIsModalOpen(true); }} className="flex items-center gap-2">
          <Plus size={20} /> Add Transaction
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-secondary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search items or categories..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0F172A]/50 backdrop-blur-xl border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-secondary transition-all"
          />
        </div>
        <div className="md:col-span-4 flex gap-2">
          <div className="flex-1 relative group">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full glass-card rounded-xl flex items-center justify-center gap-2 py-3 pl-10 pr-4 hover:bg-white/5 transition-colors border border-border-glass appearance-none bg-transparent text-white focus:outline-none focus:border-secondary cursor-pointer"
            >
              <option value="all" className="bg-[#0F172A]">All Types</option>
              <option value="income" className="bg-[#0F172A]">Income</option>
              <option value="expense" className="bg-[#0F172A]">Expense</option>
            </select>
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
          <button 
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex-1 glass-card rounded-xl flex items-center justify-center gap-2 py-3 hover:bg-white/5 transition-colors border border-border-glass"
          >
            {sortOrder === 'desc' ? <ArrowDownAZ size={18} /> : <ArrowUpZA size={18} />} Date
          </button>
        </div>
      </div>

      {/* Transactions Table/List */}
      <div className="glass-card rounded-3xl overflow-hidden border border-border-glass">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-glass bg-white/5">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-text-muted font-black">Item</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-text-muted font-black hidden md:table-cell">Category</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-text-muted font-black hidden md:table-cell">Method</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-text-muted font-black">Date</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-text-muted font-black text-right">Amount</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-glass">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-white/5 rounded w-full" /></td>
                  </tr>
                ))
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <TransactionRow 
                    key={tx.id} 
                    tx={tx} 
                    currencySymbol={currencySymbol} 
                    onEdit={() => handleEdit(tx)}
                    onDelete={() => handleDelete(tx.id)}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <HelpCircle size={48} className="mx-auto mb-4 text-text-muted/20" />
                    <p className="text-text-muted">No transactions found. Add one to get started!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSuccess={refresh} 
        initialData={editingTx}
      />
    </div>
  );
};

const TransactionRow = ({ tx, currencySymbol, onEdit, onDelete }: { tx: any, currencySymbol: string, onEdit: () => void, onDelete: () => void }) => {
  const isIncome = tx.type === 'income';
  const categoryName = tx.categories?.name || 'Other';
  const categoryIcon = tx.categories?.icon || '📦';

  return (
    <tr className="hover:bg-white/5 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center glass-card border-none ${isIncome ? 'bg-secondary/10' : 'bg-white/5'}`}>
            {isIncome ? <ArrowUpRight className="text-secondary" /> : <ArrowDownLeft className="text-accent-negative" />}
          </div>
          <div>
            <p className="font-bold text-text-primary text-sm">{tx.description || 'No description'}</p>
            <p className="text-[10px] text-text-muted md:hidden">{categoryName}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 hidden md:table-cell">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-sm">
            {categoryIcon}
          </div>
          <span className="text-xs font-medium text-text-primary">{categoryName}</span>
        </div>
      </td>
      <td className="px-6 py-4 hidden md:table-cell">
        <span className="text-[10px] font-black text-text-muted px-2 py-1 rounded bg-white/5 border border-border-glass uppercase">
          {tx.wallets?.name || 'Unknown'}
        </span>
      </td>
      <td className="px-6 py-4">
        <p className="text-xs text-text-muted font-medium">
          {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      </td>
      <td className="px-6 py-4 text-right">
        <p className={`font-bold text-sm ${isIncome ? 'text-secondary' : 'text-accent-negative'}`}>
          {isIncome ? '+' : '-'}{currencySymbol}{Math.abs(tx.amount).toFixed(2)}
        </p>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={onEdit}
            className="text-text-muted hover:text-secondary transition-colors"
            title="Edit Transaction"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={onDelete}
            className="text-text-muted hover:text-error transition-colors"
            title="Delete Transaction"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default Transactions;
