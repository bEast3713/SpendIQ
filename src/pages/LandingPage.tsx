import { useNavigate } from 'react-router-dom';
import { TrendingUp, Zap, Wallet, School, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import AnimatedCounter from '../components/AnimatedCounter';
import { supabase } from '../lib/supabase';

const LandingPage = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ users: 0, transactions: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: txCount } = await supabase.from('transactions').select('*', { count: 'exact', head: true });
      setCounts({ users: userCount || 0, transactions: txCount || 0 });
    };

    fetchCounts();

    // Set up Real-time subscriptions
    const usersChannel = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => {
        setCounts(prev => ({ ...prev, users: prev.users + 1 }));
      })
      .subscribe();

    const txChannel = supabase
      .channel('public:transactions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, () => {
        setCounts(prev => ({ ...prev, transactions: prev.transactions + 1 }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(txChannel);
    };
  }, []);

  return (
    <div className="bg-background min-h-screen text-on-background font-body overflow-x-hidden">
      {/* TopAppBar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 w-full z-50 bg-surface-glass backdrop-blur-md shadow-sm border-b border-border-glass"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-container-padding py-4">
          <div className="text-2xl font-display font-bold text-primary tracking-tight">SpendIQ</div>
          <div className="hidden md:flex gap-8 items-center">
            <a className="text-secondary font-bold border-b-2 border-secondary pb-1 hover:text-secondary hover:-translate-y-1 transition-all duration-300" href="#features">Features</a>
            <a className="text-on-surface-variant font-medium hover:text-secondary hover:-translate-y-1 transition-all duration-300" href="#">Analytics</a>
            <a className="text-on-surface-variant font-medium hover:text-secondary hover:-translate-y-1 transition-all duration-300" href="#">Pricing</a>
          </div>
          <button 
            onClick={() => navigate('/auth')}
            className="bg-primary-container text-on-primary-container px-6 py-2 rounded-xl font-bold transition-transform duration-300 active:scale-95 glow-primary"
          >
            Get Started
          </button>
        </div>
      </motion.nav>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative px-container-padding py-stack-lg max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 overflow-visible">
          {/* Decorative Gradients */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -z-10"></div>
          <div className="absolute top-1/2 -right-24 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full -z-10"></div>
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center md:text-left space-y-stack-md"
          >
            <h1 className="text-5xl md:text-6xl font-display font-bold text-text-primary leading-tight">
              Smarter money for <span className="gradient-text">smarter students</span>
            </h1>
            <p className="text-lg text-on-surface-variant max-w-xl mx-auto md:mx-0">
              Master your finances with the most elegant expense tracker designed for campus life. Track, budget, and save with a futuristic interface that understands your lifestyle.
            </p>
            <div className="pt-stack-sm flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={() => navigate('/auth')}
                className="btn-primary flex items-center justify-center gap-2"
              >
                Get Started <ChevronRight size={20} />
              </button>
              <button className="btn-secondary">
                Watch Demo
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: 12 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex-1 relative perspective-1000 w-full max-w-lg"
          >
            <div className="relative transform hover:rotate-0 transition-transform duration-700">
              <img 
                className="w-full rounded-3xl shadow-2xl glass-card" 
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop" 
                alt="Digital Finance Visual" 
              />
              {/* Floating Badge */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 glass-card p-4 rounded-2xl flex items-center gap-3 shadow-xl"
              >
                <div className="bg-secondary/20 p-2 rounded-full">
                  <TrendingUp className="text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Daily Savings</p>
                  <p className="font-bold text-secondary">+12.4%</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Social Proof */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-container-padding py-stack-md"
        >
          <div className="glass-card rounded-2xl py-12 flex flex-wrap justify-around items-center gap-8 border-none bg-surface-container-low/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            
            <div className="text-center px-4">
              <h2 className="text-4xl md:text-5xl font-display font-extrabold text-primary mb-2">
                <AnimatedCounter value={counts.users} suffix="" simulateLive />
              </h2>
              <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-black">Active Students</p>
            </div>
            
            <div className="h-12 w-px bg-border-glass hidden md:block"></div>
            
            <div className="text-center px-4">
              <h2 className="text-4xl md:text-5xl font-display font-extrabold text-secondary mb-2">
                <AnimatedCounter value={counts.transactions} suffix="" simulateLive />
              </h2>
              <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-black">Transactions Sync'd</p>
            </div>
            
            <div className="h-12 w-px bg-border-glass hidden md:block"></div>
            
            <div className="text-center px-4">
              <h2 className="text-4xl md:text-5xl font-display font-extrabold text-tertiary mb-2">
                <AnimatedCounter value={4.9} suffix="/5" decimals={1} />
              </h2>
              <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-black">App Store Rating</p>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary/20 to-transparent"></div>
          </div>
        </motion.section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-container-padding py-stack-lg">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-display font-bold">Built for the <span className="text-secondary">Next Generation</span></h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">Financial tools shouldn't feel like a chore. SpendIQ combines powerful analytics with a beautiful interface that actually makes budgeting fun.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap size={30} className="text-secondary" />}
              title="Real-time Analytics"
              description="Get instant spending insights the moment you swipe. Our AI categorizes every transaction to show you exactly where your money goes."
              color="secondary"
              index={0}
            />
            <FeatureCard 
              icon={<Wallet size={30} className="text-primary" />}
              title="Multi-wallet Support"
              description="Seamlessly track bank accounts, cash, and digital wallets in one unified dashboard. Full encryption keeps your data yours."
              color="primary"
              index={1}
            />
            <FeatureCard 
              icon={<School size={30} className="text-tertiary" />}
              title="Student-Focused"
              description="Specialized tools for tuition, textbooks, and social budgets. Plan for the semester without breaking the bank."
              color="tertiary"
              index={2}
            />
          </div>
        </section>

        {/* CTA Canvas */}
        <section className="max-w-7xl mx-auto px-container-padding py-stack-lg">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card rounded-[2rem] p-12 text-center relative overflow-hidden bg-gradient-to-br from-surface-container-low to-surface-container-lowest"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] -z-10"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-[80px] -z-10"></div>
            <h2 className="text-4xl font-display font-bold mb-6">Ready to take control?</h2>
            <p className="text-lg text-on-surface-variant mb-10 max-w-xl mx-auto">Join students already mastering their financial future. Start tracking your expenses like a pro today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/auth')}
                className="bg-primary text-on-primary px-12 py-4 rounded-xl font-extrabold text-lg hover:scale-105 transition-transform glow-primary"
              >
                Join the Revolution
              </button>
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-surface-container-high text-on-surface px-12 py-4 rounded-xl font-extrabold text-lg hover:scale-105 transition-transform border border-border-glass"
              >
                Explore Features
              </button>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-stack-lg px-container-padding flex flex-col md:flex-row justify-between items-center gap-4 border-t border-border-glass bg-surface-container-lowest">
        <div className="flex flex-col gap-2 items-center md:items-start">
          <div className="text-2xl font-display font-bold text-primary">SpendIQ</div>
          <p className="text-xs text-muted font-body">© 2026 SpendIQ. Elevating Student Finance.</p>
        </div>
        <div className="flex gap-8">
          <a className="text-muted text-xs hover:text-secondary transition-colors" href="#">Privacy Policy</a>
          <a className="text-muted text-xs hover:text-secondary transition-colors" href="#">Terms</a>
          <a className="text-muted text-xs hover:text-secondary transition-colors" href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, color, index }: any) => {
  const colorMap: any = {
    primary: "bg-primary/10 border-primary/20 hover:glow-primary text-primary",
    secondary: "bg-secondary/10 border-secondary/20 hover:glow-secondary text-secondary",
    tertiary: "bg-tertiary/10 border-tertiary/20 hover:shadow-[0_0_20px_rgba(255,184,105,0.3)] text-tertiary"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      className="glass-card p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 group"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border transition-all ${colorMap[color]}`}>
        {icon}
      </div>
      <h3 className="text-2xl font-display font-bold mb-3">{title}</h3>
      <p className="text-on-surface-variant leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

export default LandingPage;
