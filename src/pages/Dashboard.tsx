import { useState, cloneElement } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus, 
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  CalendarClock,
  Wallet
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useFinancials } from '../hooks/useFinancials';
import { useRecurringPayments } from '../hooks/useRecurringPayments';
import AddTransactionModal from '../components/AddTransactionModal';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import AnimatedCounter from '../components/AnimatedCounter';
import { getCurrencySymbol } from '../utils/currency';

const Dashboard = () => {
  const { profile } = useAuth();
  const { recentTransactions, stats, refresh } = useFinancials();
  const { payments: scheduledPayments } = useRecurringPayments();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currencySymbol = getCurrencySymbol(profile?.currency);

  const chartData = stats.dailyData || [
    { name: 'Mon', income: 0, expense: 0 },
    { name: 'Tue', income: 0, expense: 0 },
    { name: 'Wed', income: 0, expense: 0 },
    { name: 'Thu', income: 0, expense: 0 },
    { name: 'Fri', income: 0, expense: 0 },
    { name: 'Sat', income: 0, expense: 0 },
    { name: 'Sun', income: 0, expense: 0 },
  ];

  const categoryColors: any = {
    'Food': '#A855F7',
    'Rent': '#06B6D4',
    'Fun': '#F43F5E',
    'Transport': '#10B981',
    'Shopping': '#EAB308',
    'Other': '#94A3B8'
  };

  const categoryData = Object.entries(stats.categoryTotals || {}).map(([name, value]) => ({
    name,
    value,
    color: categoryColors[name] || '#64748B'
  }));

  return (
    <div className="space-y-stack-lg max-w-7xl mx-auto py-4">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-text-primary tracking-tight">
            Hi, <span className="text-secondary">{profile?.full_name?.split(' ')[0] || 'Student'}</span>! 👋
          </h2>
          <p className="text-text-muted mt-1">Here's how your money is doing today.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button onClick={() => setIsModalOpen(true)} className="flex-1 md:flex-initial">
            <Plus size={20} /> Add Transaction
          </Button>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Balance" 
          amount={stats.totalBalance} 
          trend="+12.5%" 
          isPositive={true} 
          icon={<DollarSign className="text-primary" />} 
          color="primary"
          currencySymbol={currencySymbol}
        />
        <StatCard 
          title="Total In" 
          amount={stats.monthlyIncome} 
          trend="+5.2%" 
          isPositive={true} 
          icon={<TrendingUp className="text-secondary" />} 
          color="secondary"
          currencySymbol={currencySymbol}
        />
        <StatCard 
          title="Total Out" 
          amount={stats.monthlyExpenses} 
          trend="-2.4%" 
          isPositive={false} 
          icon={<TrendingDown className="text-tertiary" />} 
          color="tertiary"
          currencySymbol={currencySymbol}
        />
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-8 glass-card rounded-3xl p-8 relative overflow-hidden border border-border-glass">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-text-primary">Cash Flow</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-xs text-secondary font-bold">
                <div className="w-2 h-2 rounded-full bg-secondary" /> In
              </span>
              <span className="flex items-center gap-1.5 text-xs text-error font-bold">
                <div className="w-2 h-2 rounded-full bg-error" /> Out
              </span>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            {recentTransactions.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94A3B8', fontSize: 12}} 
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px'}}
                    itemStyle={{color: '#F8FAFC'}}
                  />
                  <Area type="monotone" dataKey="income" stroke="#06B6D4" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expense" stroke="#A855F7" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <TrendingUp size={48} className="mb-4" />
                <p className="text-sm font-medium">Add some transactions to see your spending trends!</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-4 glass-card rounded-3xl p-8 border border-border-glass">
          <h3 className="text-xl font-bold text-text-primary mb-8">Where it Goes</h3>
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-text-muted font-bold uppercase tracking-widest">Spent</span>
              <span className="text-xl font-black text-text-primary">{currencySymbol}{stats.monthlyExpenses.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-8 space-y-4">
            {categoryData.map((item) => (
              <div key={item.name} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}} />
                  <span className="text-sm font-medium text-text-primary">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-text-primary">{currencySymbol}{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Transactions & Wallets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass-card rounded-3xl p-8 border border-border-glass">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-text-primary">Recent History</h3>
            <Link to="/transactions" className="text-secondary text-sm font-bold hover:underline flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-border-glass">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5`}>
                      {tx.type === 'income' ? <ArrowUpRight className="text-secondary" /> : <ArrowDownLeft className="text-accent-negative" />}
                    </div>
                    <div>
                      <p className="font-bold text-text-primary text-sm">{tx.description}</p>
                      <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">{tx.categories?.name || 'Other'}</p>
                    </div>
                  </div>
                  <p className={`font-black ${tx.type === 'income' ? 'text-secondary' : 'text-accent-negative'}`}>
                    {tx.type === 'income' ? '+' : '-'}{currencySymbol}{Math.abs(tx.amount).toFixed(2)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 opacity-50">No recent transactions</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 glass-card rounded-3xl p-8 border border-border-glass">
          <h3 className="text-xl font-bold text-text-primary mb-6">My Accounts</h3>
          <div className="space-y-4">
             {stats.wallets?.map((w: any) => (
                <div key={w.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <Wallet className="text-secondary" size={20} />
                    <span className="text-sm font-bold text-text-primary">{w.name}</span>
                  </div>
                  <span className="text-sm font-black text-text-primary">{currencySymbol}{(w.balance || 0).toLocaleString()}</span>
                </div>
             ))}
             {(!stats.wallets || stats.wallets.length === 0) && (
               <div className="text-center py-4 text-xs text-text-muted">No payment methods added</div>
             )}
          </div>
          <Link to="/wallets">
            <Button variant="secondary" className="w-full mt-6">Manage Accounts</Button>
          </Link>
        </div>

        {/* Scheduled Payments */}
        <div className="lg:col-span-12 glass-card rounded-3xl p-8 border border-border-glass">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-text-primary">Upcoming Payments</h3>
            <Link to="/upcoming" className="text-secondary text-sm font-bold hover:underline flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scheduledPayments.slice(0, 3).map((p) => (
              <div key={p.id} className="p-4 rounded-2xl bg-white/5 border border-border-glass flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <CalendarClock size={16} />
                    </div>
                    <span className="font-bold text-sm text-text-primary">{p.name}</span>
                  </div>
                  <span className="font-black text-secondary">{currencySymbol}{p.amount}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] text-text-muted uppercase font-black tracking-widest">Next: {new Date(p.next_date).toLocaleDateString()}</span>
                  <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold uppercase">{p.frequency}</span>
                </div>
              </div>
            ))}
            {scheduledPayments.length === 0 && (
              <div className="col-span-full text-center py-6 opacity-50 text-sm">No upcoming payments scheduled</div>
            )}
          </div>
        </div>
      </div>

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={refresh} 
      />
    </div>
  );
};

const StatCard = ({ title, amount, trend, isPositive, icon, color, currencySymbol }: any) => {
  const colors: any = {
    primary: "from-primary/20 to-transparent border-l-primary",
    secondary: "from-secondary/20 to-transparent border-l-secondary",
    tertiary: "from-tertiary/20 to-transparent border-l-tertiary"
  };

  return (
    <div className={`glass-card rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 border-l-4 ${colors[color]}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-xl bg-white/5 border border-border-glass">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${isPositive ? 'text-secondary bg-secondary/10' : 'text-error bg-error/10'}`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {trend}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-black text-text-primary mt-1 tracking-tighter">
          <AnimatedCounter value={amount} prefix={currencySymbol} decimals={amount % 1 === 0 ? 0 : 2} />
        </h3>
      </div>
      <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
        {cloneElement(icon, { size: 100 })}
      </div>
    </div>
  );
}

export default Dashboard;
