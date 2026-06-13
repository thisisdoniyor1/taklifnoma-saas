import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Shield, 
  Eye,
  EyeOff,
  User,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../lib/db';

const Auth = () => {
  const { language } = useLanguage();
  const { login, signup, applySession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ── State derived from location ──────────────────────────────────────────
  const isLogin = location.pathname === '/login';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '', confirmPassword: '', terms: '', displayName: '' });
  const [shakeFields, setShakeFields] = useState({ email: false, password: false, confirmPassword: false, terms: false, displayName: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleBtnElement, setGoogleBtnElement] = useState(null);

  // Reset errors and specific fields when toggling between login and signup
  useEffect(() => {
    setError('');
    setFieldErrors({ email: '', password: '', confirmPassword: '', terms: '', displayName: '' });
    setConfirmPassword('');
    setDisplayName('');
    setTermsAccepted(false);
  }, [isLogin]);

  // ── Routing helpers ───────────────────────────────────────────────────────
  const from = location.state?.from?.pathname || '/';
  const templateId = location.state?.templateId;
  const isAdminLogin = from === '/DI-2406';

  const completeAuthNavigation = useCallback(() => {
    navigate(from, {
      replace: true,
      state: templateId ? { templateId } : undefined,
    });
  }, [navigate, from, templateId]);



  // ── Google Sign-In callback ───────────────────────────────────────────────
  const handleCredentialResponse = useCallback(async (response) => {
    setLoading(true);
    setError('');

    try {
      // Send the raw Google ID token to the backend for secure server-side verification
      const data = await db.googleAuth(response.credential);
      applySession(data);
      completeAuthNavigation();
    } catch (err) {
      setError('Google Sign-In failed: ' + (err.message || 'Please try again'));
    } finally {
      setLoading(false);
    }
  }, [applySession, completeAuthNavigation]);

  // ── Initialise Google Identity Services button ────────────────────────────
  useEffect(() => {
    if (!googleBtnElement) return;

    let checkInterval;

    const initGoogle = () => {
      if (window.google && googleBtnElement) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '1066068691515-2njt5855hh6hnb7ksd4ofh365q19ikf1.apps.googleusercontent.com',
          callback: handleCredentialResponse,
        });

        // Clear any previously rendered button before re-rendering
        googleBtnElement.innerHTML = '';
        const calculatedWidth = googleBtnElement.clientWidth ? Math.min(googleBtnElement.clientWidth, 260) : (window.innerWidth < 440 ? 240 : 260);
        window.google.accounts.id.renderButton(googleBtnElement, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'pill',
          width: calculatedWidth.toString(),
          text: isLogin ? 'signin_with' : 'signup_with',
          locale: language === 'uz' ? 'en' : language,
        });
      } else if (!window.google) {
        checkInterval = setTimeout(initGoogle, 100);
      }
    };

    initGoogle();
    return () => clearTimeout(checkInterval);
  }, [googleBtnElement, isLogin, language, handleCredentialResponse]);

  // ── Email / password form submit ──────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const emptyErrors = { email: '', password: '', confirmPassword: '', terms: '', displayName: '' };
    setFieldErrors(emptyErrors);
    setShakeFields({ email: false, password: false, confirmPassword: false, terms: false, displayName: false });

    let hasEmpty = false;
    const nextErrors = { ...emptyErrors };
    const nextShake = { email: false, password: false, confirmPassword: false, terms: false, displayName: false };

    if (!isLogin && !isAdminLogin) {
      if (!displayName.trim()) {
        nextErrors.displayName = 'Fill in this blank';
        nextShake.displayName = true;
        hasEmpty = true;
      }
    }

    if (!email.trim()) {
      nextErrors.email = 'Fill in this blank';
      nextShake.email = true;
      hasEmpty = true;
    }

    if (!password) {
      nextErrors.password = 'Fill in this blank';
      nextShake.password = true;
      hasEmpty = true;
    }

    if (!isLogin && !isAdminLogin) {
      if (!confirmPassword) {
        nextErrors.confirmPassword = 'Fill in this blank';
        nextShake.confirmPassword = true;
        hasEmpty = true;
      }
      if (!termsAccepted) {
        nextErrors.terms = 'Fill in this blank';
        nextShake.terms = true;
        hasEmpty = true;
      }
    }

    if (hasEmpty) {
      setFieldErrors(nextErrors);
      setShakeFields(nextShake);
      setTimeout(() => {
        setShakeFields({ email: false, password: false, confirmPassword: false, terms: false, displayName: false });
      }, 500);
      return;
    }

    setLoading(true);

    if (!isLogin) {
      if (password !== confirmPassword) {
        setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
        setShakeFields(prev => ({ ...prev, confirmPassword: true }));
        setTimeout(() => setShakeFields(prev => ({ ...prev, confirmPassword: false })), 500);
        setLoading(false);
        return;
      }
    }

    const result = isLogin
      ? await login(email, password, isAdminLogin)
      : await signup(email, password, displayName);

    if (result.success) {
      if (isLogin) {
        completeAuthNavigation();
      } else {
        const loginResult = await login(email, password, false);
        if (loginResult.success) {
          completeAuthNavigation();
        } else {
          alert('Account successfully created! Please log in.');
          navigate('/login', { replace: true });
        }
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#E6F0EA] via-[#F4FAF6] to-[#DCEDE3] px-6 font-sans overflow-hidden py-10 selection:bg-gold-500 selection:text-white">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        .shake-input {
          animation: shake 0.4s ease-in-out;
          border-color: #f87171 !important;
          box-shadow: 0 0 0 1px rgba(248, 113, 113, 0.35) !important;
        }
      `}</style>

      {/* Luxury Backdrop Assets */}
      <div className="grid-bg opacity-15" />
      <div className="absolute top-[-10%] right-[-10%] w-[550px] h-[550px] bg-emerald-200/40 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[650px] h-[650px] bg-emerald-100/50 blur-[140px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="max-w-md w-full bg-white/90 backdrop-blur-3xl rounded-[36px] border border-emerald-950/5 shadow-[0_30px_70px_rgba(6,78,59,0.06)] overflow-hidden relative z-10 my-auto"
      >
        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {/* Logo / Header */}
          <div className="text-center mb-6">
            <h1
              className="text-3xl font-black text-emerald-950 tracking-tight mb-2"
              style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}
            >
              {isAdminLogin ? 'Admin Portal' : isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-emerald-900/40 text-[9px] uppercase tracking-[3px] font-black">
              {isAdminLogin ? 'Secure admin access only' : isLogin ? 'Log in to your dashboard' : 'Create your wedding invitation'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 max-w-[320px] mx-auto">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 text-red-500 p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center border border-red-100"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-3.5">
              {!isLogin && !isAdminLogin && (
                <div className="space-y-1">
                  {fieldErrors.displayName && (
                    <div className="flex justify-end px-1 pb-1">
                      <span className="text-red-400 text-[9px] font-extrabold uppercase tracking-[2px] animate-pulse">
                        * {fieldErrors.displayName}
                      </span>
                    </div>
                  )}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none group-focus-within:text-gold-500 transition-colors text-emerald-900/30">
                       <User size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      className={`w-full pl-14 pr-4 py-3.5 bg-slate-50/40 border ${fieldErrors.displayName ? 'border-red-400' : 'border-emerald-900/10'} ${shakeFields.displayName ? 'shake-input' : ''} rounded-xl focus:outline-none focus:border-gold-500 focus:bg-white text-sm font-semibold text-emerald-950 transition-all placeholder:text-emerald-900/30 placeholder:font-medium`}
                      value={displayName}
                      onChange={(e) => { setDisplayName(e.target.value); setFieldErrors({...fieldErrors, displayName: ''}); }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {fieldErrors.email && (
                  <div className="flex justify-end px-1 pb-1">
                    <span className="text-red-400 text-[9px] font-extrabold uppercase tracking-[2px] animate-pulse">
                      * {fieldErrors.email}
                    </span>
                  </div>
                )}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none group-focus-within:text-gold-500 transition-colors text-emerald-900/30">
                     <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    className={`w-full pl-14 pr-4 py-3.5 bg-slate-50/40 border ${fieldErrors.email ? 'border-red-400' : 'border-emerald-900/10'} ${shakeFields.email ? 'shake-input' : ''} rounded-xl focus:outline-none focus:border-gold-500 focus:bg-white text-sm font-semibold text-emerald-950 transition-all placeholder:text-emerald-900/30 placeholder:font-medium`}
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors({...fieldErrors, email: ''}); }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                {fieldErrors.password && (
                  <div className="flex justify-end px-1 pb-1">
                    <span className="text-red-400 text-[9px] font-extrabold uppercase tracking-[2px] animate-pulse">
                      * {fieldErrors.password}
                    </span>
                  </div>
                )}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none group-focus-within:text-gold-500 transition-colors text-emerald-900/30">
                     <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    className={`w-full pl-14 pr-12 py-3.5 bg-slate-50/40 border ${fieldErrors.password ? 'border-red-400' : 'border-emerald-900/10'} ${shakeFields.password ? 'shake-input' : ''} rounded-xl focus:outline-none focus:border-gold-500 focus:bg-white text-sm font-semibold text-emerald-950 transition-all placeholder:text-emerald-900/30 placeholder:font-medium`}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors({...fieldErrors, password: ''}); }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-emerald-900/30 hover:text-gold-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {!isLogin && !isAdminLogin && (
                <div className="space-y-1">
                  {fieldErrors.confirmPassword && (
                    <div className="flex justify-end px-1 pb-1">
                      <span className="text-red-400 text-[9px] font-extrabold uppercase tracking-[2px] animate-pulse">
                        * {fieldErrors.confirmPassword}
                      </span>
                    </div>
                  )}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none group-focus-within:text-gold-500 transition-colors text-emerald-900/30">
                       <Lock size={18} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      className={`w-full pl-14 pr-12 py-3.5 bg-slate-50/40 border ${fieldErrors.confirmPassword ? 'border-red-400' : 'border-emerald-900/10'} ${shakeFields.confirmPassword ? 'shake-input' : ''} rounded-xl focus:outline-none focus:border-gold-500 focus:bg-white text-sm font-semibold text-emerald-950 transition-all placeholder:text-emerald-900/30 placeholder:font-medium`}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors({...fieldErrors, confirmPassword: ''}); }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-5 flex items-center text-emerald-900/30 hover:text-gold-500 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!isLogin && !isAdminLogin && (
              <div className="pt-1 space-y-1.5">
                {fieldErrors.terms && (
                  <div className="flex justify-end px-1 pb-1">
                    <span className="text-red-400 text-[9px] font-extrabold uppercase tracking-[2px] animate-pulse">
                      * {fieldErrors.terms}
                    </span>
                  </div>
                )}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${termsAccepted ? 'bg-gold-500 border-gold-500' : fieldErrors.terms ? 'border-red-400 shake-input' : 'border-emerald-900/20 group-hover:border-gold-500'}`}>
                    {termsAccepted && <Check size={14} className="text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={termsAccepted} onChange={(e) => { setTermsAccepted(e.target.checked); setFieldErrors({...fieldErrors, terms: ''}); }} />
                  <span className="text-[8.5px] font-bold text-emerald-900/60 uppercase tracking-[1px] group-hover:text-emerald-950 transition-colors whitespace-nowrap">
                    I agree to the <Link to="/terms" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-sky-500 hover:text-sky-600 transition-colors" style={{ color: '#0ea5e9' }}>Terms of Use</Link> and <Link to="/privacy" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-sky-500 hover:text-sky-600 transition-colors" style={{ color: '#0ea5e9' }}>Privacy Policy</Link>
                  </span>
                </label>
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-[10px] font-extrabold text-sky-500 hover:text-sky-600 uppercase tracking-[2px] transition-colors"
                  style={{ color: '#0ea5e9' }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-emerald-950 text-white rounded-xl text-[11px] font-extrabold uppercase tracking-[3px] shadow-[0_12px_24px_rgba(6,78,59,0.12)] hover:bg-emerald-900 hover:-translate-y-0.5 transition-all flex items-center justify-center mt-1 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? 'Processing...' : isLogin ? 'Log In' : 'Create Account'}
              {!loading && <ArrowRight size={16} className="ml-2" />}
            </button>
          </form>

          {!isAdminLogin && (
            <div className="max-w-[260px] mx-auto">
              {/* Google Sign-In split-line divider */}
              <div className="mt-5 pt-2">
                <div className="relative flex py-3 items-center">
                  <div className="flex-grow border-t border-emerald-900/5"></div>
                  <span className="flex-shrink mx-4 text-emerald-900/30 text-[9px] font-black uppercase tracking-[2.5px]">or continue with</span>
                  <div className="flex-grow border-t border-emerald-900/5"></div>
                </div>
                <div
                  ref={setGoogleBtnElement}
                  id="google-btn-container"
                  className="w-full flex justify-center overflow-hidden min-h-[40px] mt-1 shadow-[0_4px_12px_rgba(0,0,0,0.05)] rounded-full hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow"
                />
              </div>

              {/* Toggle login ↔ signup */}
              <div className="mt-5 text-center text-[10px] font-extrabold uppercase tracking-[2px]">
                <p className="whitespace-nowrap" style={{ color: '#064E3B' }}>
                  {isLogin ? 'New to Taklifnoma?' : 'Already have an account?'}
                  <Link
                    to={isLogin ? '/signup' : '/login'}
                    state={location.state}
                    className="ml-2 text-sky-500 hover:text-sky-600 transition-colors"
                    style={{ textDecoration: 'none', color: '#0ea5e9' }}
                  >
                    {isLogin ? 'Create Account' : 'Log in'}
                  </Link>
                </p>
              </div>
            </div>
          )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Security Badge */}
        <div className="bg-emerald-950 py-3 px-8 text-center">
           <p className="text-[9px] text-emerald-100/50 uppercase tracking-[3px] flex items-center justify-center gap-2 font-extrabold">
             <Shield size={12} className="text-gold-500" /> Secure Login
           </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
