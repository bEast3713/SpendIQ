import { Search, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TopAppBar = ({ title, subtitle }: { title?: string, subtitle?: string }) => {
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-surface-glass backdrop-blur-md border-b border-border-glass px-container-padding py-4 flex justify-between items-center max-w-full">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">
          {title || "SpendIQ Dashboard"}
        </h2>
        <p className="text-sm text-text-muted">{subtitle || `Welcome back, ${profile?.full_name?.split(' ')[0] || 'Student'}!`}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center glass-card rounded-full px-4 py-1.5 gap-2">
          <Search size={18} className="text-text-muted" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted w-40"
          />
        </div>
        
        <button className="w-10 h-10 flex items-center justify-center rounded-full glass-card text-on-surface-variant hover:text-primary transition-colors">
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
};

export default TopAppBar;
