import { NavLink } from 'react-router-dom';
import { Home, Wallet, ReceiptText, Settings, LogOut, CalendarClock } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { profile } = useAuth();

  const navItems = [
    { name: 'Home', icon: Home, path: '/dashboard' },
    { name: 'Methods', icon: Wallet, path: '/wallets' },
    { name: 'Scheduled', icon: CalendarClock, path: '/upcoming' },
    { name: 'Transactions', icon: ReceiptText, path: '/transactions' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-lowest border-r border-border-glass hidden md:flex flex-col z-40">
      <div className="p-container-padding flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <ReceiptText className="text-primary" size={24} />
        </div>
        <h1 className="text-2xl font-display font-black text-white tracking-tighter">SpendIQ</h1>
      </div>

      <nav className="flex-1 px-4 mt-stack-lg space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 transition-all rounded-lg ${
                isActive 
                  ? "bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary text-primary" 
                  : "text-on-surface-variant hover:text-secondary hover:bg-surface-container-low"
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-container-padding mt-auto space-y-4">
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              profile?.full_name?.charAt(0) || 'S'
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-text-primary truncate">{profile?.full_name || 'Student'}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Student Account</p>
          </div>
        </div>
        
        <button 
          onClick={() => auth.signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 text-accent-negative hover:bg-error/10 rounded-lg transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
