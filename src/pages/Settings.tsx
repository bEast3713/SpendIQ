import { useState, useRef } from 'react';
import { User, Bell, Shield, LogOut, ChevronRight, Save, Camera, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { auth } from '../lib/firebase';
import { supabase } from '../lib/supabase';

const Settings = () => {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    email: auth.currentUser?.email || '',
    currency: profile?.currency || 'USD',
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          currency: formData.currency
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      await refreshProfile();
      showToast('Changes saved successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to save changes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('File too large (Max 2MB)', 'error');
        return;
      }

      setLoading(true);
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const base64 = reader.result as string;
          const { error } = await supabase
            .from('profiles')
            .update({ avatar_url: base64 })
            .eq('id', profile.id);

          if (error) throw error;
          await refreshProfile();
          showToast('Avatar updated successfully!', 'success');
        };
      } catch (err: any) {
        showToast('Failed to upload avatar', 'error');
      } finally {
        setLoading(false);
      }
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

      <div>
        <h2 className="text-3xl font-black text-text-primary tracking-tight">Settings</h2>
        <p className="text-text-muted mt-1">Personalize your SpendIQ experience.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Navigation */}
        <div className="md:col-span-4 space-y-2">
          <SettingsNavItem 
            icon={<User size={20} />} 
            label="My Profile" 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')}
          />
          <SettingsNavItem 
            icon={<Bell size={20} />} 
            label="Alerts" 
            active={activeTab === 'notifications'} 
            onClick={() => setActiveTab('notifications')}
          />
          <SettingsNavItem 
            icon={<Shield size={20} />} 
            label="Account Privacy" 
            active={activeTab === 'security'} 
            onClick={() => setActiveTab('security')}
          />
          <div className="pt-4 mt-4 border-t border-border-glass">
            <button 
              onClick={() => auth.signOut()}
              className="w-full flex items-center gap-3 px-4 py-3 text-accent-negative hover:bg-error/10 rounded-xl transition-all"
            >
              <LogOut size={20} />
              <span className="font-bold text-sm">Log Out</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-8 space-y-6">
          {activeTab === 'profile' && (
            <div className="glass-card rounded-3xl p-8 space-y-6 border border-border-glass animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-bold text-text-primary mb-4">Personal Info</h3>
              
              <div className="flex items-center gap-6 mb-8">
                <div 
                  onClick={handleAvatarClick}
                  className="relative group cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-black border-4 border-primary/20 overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      formData.fullName.charAt(0) || 'S'
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white" />
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                </div>
                <div>
                  <Button variant="secondary" size="sm" onClick={handleAvatarClick}>Update Photo</Button>
                  <p className="text-[10px] text-text-muted uppercase font-bold mt-2 tracking-widest">JPG, PNG (Max 2MB)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Input 
                  label="Display Name" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  icon={<User size={20} />}
                />
                <Input 
                  label="Email Address" 
                  disabled
                  value={formData.email}
                  icon={<Save size={20} className="opacity-0" />}
                  className="opacity-50"
                />
                <div className="space-y-1">
                  <label className="block text-xs text-text-muted font-medium ml-1 uppercase tracking-widest">Preferred Currency</label>
                  <div className="relative group">
                    <select 
                      className="w-full bg-[#0F172A]/50 backdrop-blur-xl border border-white/10 py-4 px-6 text-white font-medium focus:outline-none focus:border-secondary/50 focus:bg-[#0F172A]/80 focus:ring-4 focus:ring-secondary/5 transition-all duration-300 rounded-2xl appearance-none [&>option]:bg-[#0F172A]"
                      value={formData.currency}
                      onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    >
                      <option value="AED">AED (د.إ)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border-glass flex justify-end">
                <Button loading={loading} onClick={handleSave} className="gap-2 px-8">
                  <Save size={18} /> Save Changes
                </Button>
              </div>
            </div>
          )}

          {(activeTab === 'notifications' || activeTab === 'security') && (
            <div className="glass-card rounded-3xl p-12 flex flex-col items-center justify-center text-center border border-border-glass animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                {activeTab === 'notifications' ? <Bell className="text-secondary" size={32} /> : <Shield className="text-primary" size={32} />}
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Coming Soon</h3>
              <p className="text-sm text-text-muted max-w-xs">We're building this feature for you! Check back in the next update.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsNavItem = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${active ? 'bg-white/10 text-secondary border border-secondary/20 shadow-lg' : 'text-text-muted hover:bg-white/5'}`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span className="font-bold text-sm">{label}</span>
    </div>
    <ChevronRight size={16} />
  </button>
);

export default Settings;
