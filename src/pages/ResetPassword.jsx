import React, { useState } from 'react';
import { KeyRound, CheckCircle2, ArrowLeft, ArrowRight, ShieldAlert } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db } from '../lib/db';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setErrorMsg('Invalid or missing recovery token.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await db.resetPassword(token, password);
      setSent(true);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-[#F8FAFC] px-6 font-sans relative overflow-hidden">
      <div className="grid-bg opacity-30" />
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-emerald-200/20 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gold-200/20 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full bg-white/70 backdrop-blur-2xl rounded-[32px] border border-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden relative z-10"
      >
        <div className="p-12">
          {!sent ? (
            <>
              <div className="text-center mb-12">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-800/30">
                   <KeyRound className="text-white" size={28} />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3 capitalize">Reset Password</h1>
                <p className="text-slate-400 text-[11px] font-extrabold uppercase tracking-[3px]">Establish a new security key</p>
              </div>

              {!token ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                     <ShieldAlert size={24} />
                  </div>
                  <p className="text-red-600 text-sm font-semibold mb-6">Invalid, broken, or missing recovery link.</p>
                  <button 
                    onClick={() => navigate('/forgot-password')}
                    className="w-full py-4 bg-slate-950 text-white rounded-2xl text-[11px] font-extrabold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                  >
                    Request New Link
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMsg && (
                    <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-xs font-semibold border border-red-100/60 text-center">
                      {errorMsg}
                    </div>
                  )}

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-emerald-800 transition-colors text-slate-400">
                       <KeyRound size={18} />
                    </div>
                    <input 
                      type="password" 
                      required
                      placeholder="New Password"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-emerald-800 focus:bg-white text-sm font-medium transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-emerald-800 transition-colors text-slate-400">
                       <KeyRound size={18} />
                    </div>
                    <input 
                      type="password" 
                      required
                      placeholder="Confirm New Password"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-emerald-800 focus:bg-white text-sm font-medium transition-all"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="luxury-button !h-16 !w-full !rounded-2xl text-[11px] font-extrabold uppercase tracking-[4px]"
                  >
                    {loading ? 'Processing...' : 'Reset Password'}
                    {!loading && <ArrowRight size={18} className="ml-2" />}
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
                 <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-4 capitalize">Password Changed!</h2>
              <p className="text-slate-400 text-[11px] font-extrabold mb-10 uppercase tracking-[3px] leading-relaxed">Your password has been successfully reset. You can now log in.</p>
              <button 
                onClick={() => navigate('/login')}
                className="w-full py-4 bg-slate-950 text-white rounded-2xl text-[11px] font-extrabold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
              >
                Go to Sign In
              </button>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-50 flex justify-center">
             <button 
               onClick={() => navigate('/login')}
               className="flex items-center gap-2 text-[10px] font-extrabold text-slate-400 hover:text-emerald-800 transition-all uppercase tracking-widest"
             >
               <ArrowLeft size={16} /> Return to Login
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
