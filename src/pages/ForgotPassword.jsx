import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db } from '../lib/db';
import { useLanguage } from '../context/LanguageContext';

const ForgotPassword = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await db.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setErrorMsg(err.message || t('password.forgotError') || 'Failed to request recovery link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-[#F8FAFC] px-6 font-sans relative overflow-hidden">
      <div className="grid-bg opacity-30" />
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-cyan-200/20 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-200/20 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full bg-white/70 backdrop-blur-2xl rounded-[32px] border border-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden relative z-10"
      >
        <div className="p-8 sm:p-12">
          {!sent ? (
            <>
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-cyan-500/30">
                   <ShieldCheck className="text-white" size={28} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                  {t('password.forgotTitle') || 'Parolni tiklash'}
                </h1>
                <p className="text-slate-400 text-xs font-semibold">
                  {t('password.forgotSubtitle') || 'Elektron pochta manzilingizni kiriting'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMsg && (
                  <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-xs font-semibold border border-red-100/60 text-center">
                    {errorMsg}
                  </div>
                )}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-cyan-500 transition-colors text-slate-400">
                     <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    required
                    placeholder={t('password.emailPlaceholder') || 'Elektron pochta manzili'}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-cyan-500 focus:bg-white text-sm font-medium transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="luxury-button !h-14 !w-full !rounded-2xl text-[11px] font-extrabold uppercase tracking-[3px]"
                >
                  {loading ? (t('password.sending') || 'Yuborilmoqda...') : (t('password.sendRecoveryBtn') || 'Tiklash havolasini yuborish')}
                  {!loading && <ArrowRight size={18} className="ml-2" />}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-3">
                {t('password.linkSentTitle') || 'Havola yuborildi!'}
              </h2>
              <p className="text-slate-500 text-xs font-medium mb-8 leading-relaxed">
                {t('password.linkSentDesc') || 'Parolni tiklash havolasi elektron pochtangizga yuborildi.'}
              </p>
              <button 
                onClick={() => navigate('/login')}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-extrabold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
              >
                {t('password.backToLogin') || 'Kirish sahifasiga qaytish'}
              </button>
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-slate-100 flex justify-center">
             <button 
               onClick={() => navigate('/login')}
               className="flex items-center gap-2 text-[11px] font-extrabold text-slate-400 hover:text-cyan-600 transition-all uppercase tracking-widest"
             >
               <ArrowLeft size={16} /> {t('password.backToLogin') || 'Kirish sahifasiga qaytish'}
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
