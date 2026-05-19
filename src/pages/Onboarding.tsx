import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Landmark, Coins, ChevronRight, Check, 
  CheckCircle2, AlertCircle, User, Plus, 
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { CATEGORIES } from '../data/categories';
import { useCategories } from '../hooks/useCategories';
import Button from '../components/Button';
import Input from '../components/Input';

const Onboarding = () => {
  const { profile, refreshProfile } = useAuth();
  const { categories } = useCategories();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    avatar_url: '',
    currency: 'AED',
    monthly_pocket_money: '',
    wallets: [
      { name: 'Bank Account', type: 'bank', balance: '' },
      { name: 'Cash', type: 'cash', balance: '' }
    ],
    scheduled_payments: [] as { name: string, amount: string, due_day: string, category_id: string }[]
  });
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const profileLoaded = useRef(false);

  useEffect(() => {
    if (profile && !profileLoaded.current) {
      const initialName = profile.full_name === 'Student' ? '' : (profile.full_name || '');
      setFormData(prev => ({ ...prev, full_name: initialName }));
      profileLoaded.current = true;
    }
  }, [profile]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const currencies = [
    { code: 'AED', label: 'UAE Dirham (AED)', symbol: 'AED' },
    { code: 'USD', label: 'US Dollar (USD)', symbol: '$' },
    { code: 'EUR', label: 'Euro (EUR)', symbol: '€' },
    { code: 'GBP', label: 'British Pound (GBP)', symbol: '£' },
    { code: 'INR', label: 'Indian Rupee (INR)', symbol: '₹' },
  ];

  const avatars = [
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=Felix&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=Aneka&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=Milo&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=Luna&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/lorelei/svg?seed=Oliver&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/lorelei/svg?seed=Bella&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/lorelei/svg?seed=Jasper&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/lorelei/svg?seed=Sophie&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Leo&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Mia&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Toby&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Zoe&backgroundColor=d1d4f9'
  ];

  const addScheduledPayment = () => {
    // Try to find a real expense category from DB first
    const dbExpenseCat = categories.find(c => c.type === 'expense' || c.type === 'both');
    const defaultId = dbExpenseCat?.id || (CATEGORIES.find(c => c.type === 'expense') || CATEGORIES[0]).id;
    
    setFormData({
      ...formData,
      scheduled_payments: [
        ...formData.scheduled_payments,
        { name: '', amount: '', due_day: '1', category_id: defaultId }
      ]
    });
  };

  const removeScheduledPayment = (index: number) => {
    const updated = [...formData.scheduled_payments];
    updated.splice(index, 1);
    setFormData({ ...formData, scheduled_payments: updated });
  };

  const handleComplete = async () => {
    if (!profile?.id) return;
    setLoading(true);

    try {
      // 1. Update Profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
          currency: formData.currency,
          monthly_pocket_money: parseFloat(formData.monthly_pocket_money) || 0,
          onboarded: true
        })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      // 2. Add Initial Wallets
      const walletsToInsert = formData.wallets
        .filter(w => w.balance !== '')
        .map(w => ({
          user_id: profile.id,
          name: w.name,
          balance: parseFloat(w.balance) || 0,
          wallet_type: w.type,
          color: w.type === 'bank' ? '#4cd7f6' : '#ffb869',
          icon: w.type === 'bank' ? '🏦' : '💵'
        }));

      if (walletsToInsert.length > 0) {
        const { data: createdWallets, error: walletError } = await supabase
          .from('wallets')
          .insert(walletsToInsert)
          .select();
        
        if (walletError) throw walletError;

        // 3. Add Scheduled Payments (Recurring Payments in DB)
        if (formData.scheduled_payments.length > 0 && createdWallets && createdWallets.length > 0) {
          const paymentsToInsert = formData.scheduled_payments
            .filter(p => p.name && p.amount)
            .map(p => {
              const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
              
              // Map the category_id if it's a slug from our static list
              let realCategoryId = p.category_id;
              
              if (!isUUID(realCategoryId)) {
                const dbCat = categories.find(c => c.id === p.category_id || c.name === p.name);
                if (dbCat && isUUID(dbCat.id)) {
                  realCategoryId = dbCat.id;
                } else {
                  // Try matching by static name
                  const staticCat = CATEGORIES.find(sc => sc.id === p.category_id);
                  if (staticCat) {
                    const matchingDbCat = categories.find(c => c.name === staticCat.name);
                    if (matchingDbCat && isUUID(matchingDbCat.id)) {
                      realCategoryId = matchingDbCat.id;
                    }
                  }
                }
              }

              // Final safety: if still not a UUID, use the first valid UUID from DB or null
              if (!isUUID(realCategoryId)) {
                realCategoryId = categories.find(c => isUUID(c.id))?.id || null;
              }

              return {
                user_id: profile.id,
                name: p.name,
                amount: parseFloat(p.amount),
                due_day: parseInt(p.due_day),
                category_id: realCategoryId,
                wallet_id: (createdWallets as any)[0].id,
                frequency: 'monthly',
                status: 'active'
              };
            });

          if (paymentsToInsert.length > 0) {
            const { error: paymentError } = await supabase
              .from('recurring_payments')
              .insert(paymentsToInsert);
            if (paymentError) throw paymentError;
          }
        }
      }

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899']
      });

      showToast('Welcome to SpendIQ!', 'success');
      await refreshProfile();
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error('Onboarding error:', err);
      showToast(err.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden flex items-center justify-center p-6">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-white/5 z-50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(step / 4) * 100}%` }}
          className="h-full bg-gradient-to-r from-primary to-secondary glow-primary"
        />
      </div>

      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/30 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-xl relative z-10">
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

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-4xl p-10 space-y-8 border border-white/10"
            >
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                  Step 1 of 4 • Identity
                </div>
                <h1 className="text-4xl font-black tracking-tight">Who are <span className="gradient-text">you?</span></h1>
                <p className="text-text-muted">Pick a name and an avatar that represents you.</p>
              </div>

              <div className="space-y-6">
                <Input 
                  label="Display Name"
                  placeholder="e.g. John Doe"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  icon={<User size={20} />}
                />
                <div className="flex flex-wrap justify-center gap-4">
                  {avatars.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setFormData({ ...formData, avatar_url: url })}
                      className={`w-16 h-16 rounded-2xl border-2 transition-all duration-300 p-1 ${
                        formData.avatar_url === url ? 'border-primary bg-primary/10 scale-110 shadow-lg' : 'border-white/5 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <img src={url} alt="Avatar" className="w-full h-full rounded-xl" />
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={nextStep} 
                className="w-full h-14 text-lg gap-2 glow-primary"
                disabled={!formData.full_name}
              >
                Let's Go <ChevronRight size={20} />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="glass-card rounded-4xl p-10 space-y-8 border border-white/10"
            >
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                  Step 2 of 4 • Basics
                </div>
                <h1 className="text-4xl font-black tracking-tight">Pick your <span className="gradient-text">Currency</span></h1>
                <p className="text-text-muted">And set your monthly budget for SpendIQ.</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-3">
                  {currencies.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => setFormData({ ...formData, currency: c.code })}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                        formData.currency === c.code 
                          ? 'bg-secondary/10 border-secondary shadow-lg' 
                          : 'bg-white/5 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
                          formData.currency === c.code ? 'bg-secondary text-white' : 'bg-white/5'
                        }`}>
                          {c.symbol}
                        </div>
                        <span className="font-bold">{c.label}</span>
                      </div>
                      {formData.currency === c.code && <Check className="text-secondary" size={20} />}
                    </button>
                  ))}
                </div>

                <Input 
                  label="Initial Monthly Budget"
                  placeholder={`e.g. 2000 ${formData.currency}`}
                  type="number"
                  icon={<Sparkles size={20} />}
                  value={formData.monthly_pocket_money}
                  onChange={(e) => setFormData({ ...formData, monthly_pocket_money: e.target.value })}
                />
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={prevStep} className="flex-1">Back</Button>
                <Button onClick={nextStep} disabled={!formData.monthly_pocket_money} className="flex-[2] glow-secondary">Continue</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="glass-card rounded-4xl p-10 space-y-8 border border-white/10"
            >
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                  Step 3 of 4 • Wallets
                </div>
                <h1 className="text-4xl font-black tracking-tight">Initial <span className="gradient-text">Funds</span></h1>
                <p className="text-text-muted">How much money are you starting with?</p>
              </div>

              <div className="space-y-6">
                {formData.wallets.map((wallet, index) => (
                  <div key={index} className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">{wallet.name}</label>
                    <Input 
                      placeholder={`Balance in ${formData.currency}`}
                      type="number"
                      value={wallet.balance}
                      onChange={(e) => {
                        const newWallets = [...formData.wallets];
                        newWallets[index].balance = e.target.value;
                        setFormData({ ...formData, wallets: newWallets });
                      }}
                      icon={wallet.type === 'bank' ? <Landmark size={20} /> : <Coins size={20} />}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={prevStep} className="flex-1">Back</Button>
                <Button onClick={nextStep} className="flex-[2] glow-primary">Next Step</Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="glass-card rounded-4xl p-10 space-y-8 border border-white/10"
            >
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                  Step 4 of 4 • Commitments
                </div>
                <h1 className="text-4xl font-black tracking-tight">Schedule <span className="gradient-text">Bills</span></h1>
                <p className="text-text-muted">Any recurring payments like Rent, Netflix, or Gym?</p>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {formData.scheduled_payments.map((p, index) => (
                  <div key={index} className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 relative group hover:border-secondary/30 transition-all">
                    <button 
                      onClick={() => removeScheduledPayment(index)}
                      className="absolute -right-2 -top-2 w-8 h-8 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 z-10"
                    >
                      <Plus size={16} className="rotate-45" />
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted uppercase ml-1">Bill Name</label>
                        <input 
                          type="text"
                          placeholder="Netflix"
                          value={p.name}
                          onChange={(e) => {
                            const updated = [...formData.scheduled_payments];
                            updated[index].name = e.target.value;
                            setFormData({...formData, scheduled_payments: updated});
                          }}
                          className="w-full bg-[#0F172A]/50 border border-white/10 p-3 rounded-2xl text-sm focus:outline-none focus:border-secondary transition-all text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted uppercase ml-1">Amount ({formData.currency})</label>
                        <input 
                          type="number"
                          placeholder="9.99"
                          value={p.amount}
                          onChange={(e) => {
                            const updated = [...formData.scheduled_payments];
                            updated[index].amount = e.target.value;
                            setFormData({...formData, scheduled_payments: updated});
                          }}
                          className="w-full bg-[#0F172A]/50 border border-white/10 p-3 rounded-2xl text-sm focus:outline-none focus:border-secondary transition-all text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted uppercase ml-1">Due Day</label>
                        <div className="relative">
                          <select 
                            className="w-full bg-[#0F172A]/50 border border-white/10 p-3 rounded-2xl text-sm focus:outline-none focus:border-secondary transition-all appearance-none text-white [&>option]:bg-[#0F172A]"
                            value={p.due_day}
                            onChange={(e) => {
                              const updated = [...formData.scheduled_payments];
                              updated[index].due_day = e.target.value;
                              setFormData({...formData, scheduled_payments: updated});
                            }}
                          >
                            {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>Day {i+1}</option>)}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                            <ChevronRight size={16} className="rotate-90" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted uppercase ml-1">Category</label>
                        <div className="relative">
                          <select 
                            className="w-full bg-[#0F172A]/50 border border-white/10 p-3 rounded-2xl text-sm focus:outline-none focus:border-secondary transition-all appearance-none text-white [&>option]:bg-[#0F172A]"
                            value={p.category_id}
                            onChange={(e) => {
                              const updated = [...formData.scheduled_payments];
                              updated[index].category_id = e.target.value;
                              setFormData({...formData, scheduled_payments: updated});
                            }}
                          >
                            {categories.length > 0 ? (
                              categories
                                .filter(c => c.type === 'expense' || c.type === 'both')
                                .map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                            ) : (
                              CATEGORIES
                                .filter(c => c.type === 'expense' || c.type === 'both')
                                .map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                            )}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                            <ChevronRight size={16} className="rotate-90" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={addScheduledPayment}
                  className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-text-muted hover:border-secondary hover:text-secondary transition-all flex items-center justify-center gap-2 font-bold text-sm"
                >
                  <Plus size={18} /> Add a Payment
                </button>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={prevStep} className="flex-1">Back</Button>
                <Button loading={loading} onClick={handleComplete} className="flex-[2] glow-secondary">Finish Setup</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;

