import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, ChevronLeft } from 'lucide-react';
import Input from '../components/Input';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(userCredential.user, { displayName: formData.name });
      }
      navigate('/dashboard');
    } catch (err: any) {
      let message = 'An unexpected error occurred. Please try again.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') {
        message = 'Invalid details! Double-check your email/password and try again.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Try logging in instead!';
      } else if (err.code === 'auth/weak-password') {
        message = 'Your password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/user-not-found') {
        message = 'No account found with this email. Please sign up first.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-background min-h-screen text-text-primary flex items-center justify-center p-container-padding relative overflow-hidden font-body">
      {/* Ambient Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="w-full max-w-md z-10 space-y-8">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors group"
        >
          <ChevronLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Home
        </button>

        {/* Logo Section */}
        <div className="text-center">
          <h1 className="text-5xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">SpendIQ</h1>
          <p className="text-sm text-text-muted mt-2 uppercase tracking-widest font-medium">Next Gen Finance</p>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-3xl p-8 shadow-2xl relative">
          {/* Auth Toggle Switch */}
          <div className="bg-white/5 p-1 rounded-full flex items-center mb-8 border border-white/5">
            <button 
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all duration-300 ${isLogin ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-text-muted hover:text-white'}`}
            >
              Login
            </button>
            <button 
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all duration-300 ${!isLogin ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-text-muted hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 text-error p-4 rounded-2xl text-xs mb-6 text-center font-bold animate-in fade-in zoom-in duration-200">
              {error}
            </div>
          )}

          {/* Form Content */}
          <form key={isLogin ? 'login' : 'signup'} className="space-y-6" onSubmit={handleAuth}>
            {!isLogin && (
              <Input 
                label="Full Name"
                required
                placeholder="John Doe"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                icon={<User size={20} />}
              />
            )}

            <Input 
              label="Email Address"
              required
              placeholder="name@university.edu"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              icon={<Mail size={20} />}
            />

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-xs text-text-muted font-medium uppercase tracking-widest">Password</label>
                {isLogin && <button type="button" className="text-xs text-text-muted hover:text-secondary transition-colors">Forgot?</button>}
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-secondary transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  required
                  className="w-full bg-[#0F172A]/50 backdrop-blur-xl border border-white/10 py-4 pl-12 pr-12 text-white font-medium focus:outline-none focus:border-secondary/50 focus:bg-[#0F172A]/80 focus:ring-4 focus:ring-secondary/5 transition-all duration-300 rounded-2xl placeholder:text-white/20"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary-container to-primary-gradient-end rounded-xl text-lg text-white font-bold transition-all duration-300 hover:translate-y-[-2px] active:scale-95 glow-primary disabled:opacity-50" 
              type="submit"
            >
              {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Create Account')}
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-[1px] bg-white/10"></div>
              <span className="text-xs text-text-muted font-medium">or continue with</span>
              <div className="flex-1 h-[1px] bg-white/10"></div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3 glass-card rounded-xl hover:bg-white/5 transition-colors"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              <span className="text-sm font-bold">Google</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex justify-center items-center gap-2">
            <ShieldCheck size={16} className="text-secondary" />
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Secure & Encrypted</p>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 w-full py-4 px-container-padding flex flex-col md:flex-row justify-between items-center gap-2 border-t border-white/5 bg-background/80 backdrop-blur-sm z-20">
        <p className="text-[10px] text-text-muted">© 2026 SpendIQ. Elevating Student Finance.</p>
        <div className="flex gap-6">
          <a className="text-[10px] text-text-muted hover:text-secondary" href="#">Privacy</a>
          <a className="text-[10px] text-text-muted hover:text-secondary" href="#">Terms</a>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
