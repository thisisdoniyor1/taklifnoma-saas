import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Shield, 
  Chrome, 
  ArrowLeft,
  Sparkles,
  Github,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({ email: '', password: '' });
    setLoading(true);
    
    const result = isLogin 
      ? await login(email, password)
      : await signup(email, password);

    if (result.success) {
      if (isLogin) {
        navigate(from, { replace: true });
      } else {
        alert('Account successfully created!');
        setIsLogin(true);
      }
    } else {
      const errLower = result.error.toLowerCase();
      if (errLower.includes('password')) {
        setFieldErrors({ email: '', password: 'Incorrect password' });
      } else if (errLower.includes('user') || errLower.includes('email')) {
        setFieldErrors({ email: result.error, password: '' });
      } else {
        setError(result.error);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-[#F8FAFC] px-6 font-sans overflow-hidden relative">
      {/* Modern Backdrop Assets */}
      <div className="grid-bg opacity-30" />
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-cyan-200/20 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-200/20 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full bg-white/70 backdrop-blur-2xl rounded-[32px] border border-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden relative z-10"
      >
        <div className="p-12">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-cyan-500/30">
               <Sparkles className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-slate-400 text-[11px] uppercase tracking-[3px] font-extrabold">
              {isLogin ? 'Log in to your account' : 'Sign up for a new account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 text-red-500 p-4 rounded-2xl text-[11px] font-bold uppercase tracking-wider text-center border border-red-100"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-cyan-500 transition-colors text-slate-400">
                   <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  required
                  placeholder="Enter your email"
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border ${fieldErrors.email ? 'border-red-500' : 'border-slate-100'} rounded-2xl focus:outline-none focus:border-cyan-500 focus:bg-white text-sm font-medium transition-all`}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors({...fieldErrors, email: ''}); }}
                />
                {fieldErrors.email && <p className="text-red-500 text-[10px] uppercase font-bold mt-2 ml-2 tracking-widest">{fieldErrors.email}</p>}
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-cyan-500 transition-colors text-slate-400">
                   <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="Enter your password"
                  className={`w-full pl-12 pr-12 py-4 bg-slate-50 border ${fieldErrors.password ? 'border-red-500' : 'border-slate-100'} rounded-2xl focus:outline-none focus:border-cyan-500 focus:bg-white text-sm font-medium transition-all`}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors({...fieldErrors, password: ''}); }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 top-0 h-[54px] right-0 pr-4 flex items-center text-slate-400 hover:text-cyan-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {fieldErrors.password && <p className="text-red-500 text-[10px] uppercase font-bold mt-2 ml-2 tracking-widest">{fieldErrors.password}</p>}
              </div>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-[10px] font-bold text-slate-400 hover:text-cyan-500 uppercase tracking-widest transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="luxury-button !h-16 !w-full !rounded-2xl text-[11px] font-extrabold uppercase tracking-[4px] shadow-2xl shadow-cyan-500/20"
            >
              {loading ? 'Processing...' : isLogin ? 'Log In' : 'Sign Up'}
              {!loading && <ArrowRight size={18} className="ml-2" />}
            </button>
          </form>

          <div className="mt-10">
            <div className="relative mb-10">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-extrabold"><span className="px-4 bg-[#F8FAFC] text-slate-400">OR</span></div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button 
                type="button"
                className="flex items-center justify-center gap-3 w-full py-4 border border-slate-100 rounded-2xl text-[11px] font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
              >
                <Chrome size={18} className="text-red-500" /> Log in with Google Account
              </button>
            </div>
          </div>

          <div className="mt-12 text-center text-[11px] font-bold uppercase tracking-widest">
            <p className="text-slate-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-cyan-500 hover:text-indigo-600 transition-colors"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>

        <div className="bg-slate-900 py-4 px-10 text-center border-t border-slate-800">
           <p className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center justify-center gap-3 font-bold">
             <Shield size={12} className="text-emerald-500" /> End-to-End Cryptographic Security
           </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
