import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Globe, ChevronDown, User, ShieldCheck, LogOut, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { slowScroll } from '../utils/scroll';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const langRef = useRef(null);
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = ['/login', '/forgot-password', '/reset-password'].includes(location.pathname);
  const isCreatePage = location.pathname === '/create';
  const isAdminPage = location.pathname === '/DI-2406';

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧', label: 'EN' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺', label: 'RU' },
    { code: 'uz_cyrl', name: 'Ўзбекча', flag: '🇺🇿', label: 'ЎЗ' },
    { code: 'tj', name: 'Тоҷикӣ', flag: '🇹🇯', label: 'ТО' }
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      
      // Simple scroll spy logic
      const sections = ['templates', 'features'];
      let current = 'home';
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && window.scrollY >= element.offsetTop - 120) {
          current = section;
        }
      }
      setActiveSection(current);
    };

    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setShowLang(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (isAuthPage) return null;

  const NavLink = ({ id, label, onClick }) => {
    const isActive = activeSection === id;
    return (
      <button 
        onClick={onClick} 
        className={`relative px-4 py-2 transition-colors uppercase tracking-widest text-[9px] font-extrabold ${
          isActive ? 'text-emerald-950' : 'text-emerald-950/40 hover:text-gold-500'
        }`}
      >
        {isActive && (
          <motion.div 
            layoutId="nav-pill"
            className="absolute inset-0 bg-emerald-100/80 rounded-full border border-emerald-200/50 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.1)]"
            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
          />
        )}
        <span className="relative z-10">{label}</span>
      </button>
    );
  };

  return (
    <nav className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-[100] transition-all duration-500 rounded-2xl border ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-xl border-emerald-950/10 shadow-lg py-2' 
        : 'bg-transparent border-transparent py-4'
    }`}>
      <div className="px-6 md:px-10 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-950 to-emerald-800 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-950/20 group-hover:scale-105 transition-transform">
            <Heart className="text-white fill-white/20" size={20} />
          </div>
          <span className="font-sans font-extrabold text-lg tracking-[-0.04em] text-emerald-950 ml-1 uppercase">
            Taklifnoma<span className="text-gold-500">.vip</span>
          </span>
        </Link>
        
        {/* Main Nav */}
        <div className="hidden lg:flex items-center gap-2 font-sans">
          {!isCreatePage && !isAdminPage ? (
            <>
              <NavLink id="home" label={t('nav.home')} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
              <NavLink id="templates" label={t('nav.templates')} onClick={() => slowScroll('templates')} />
              <NavLink id="features" label={t('nav.features')} onClick={() => slowScroll('features')} />
            </>
          ) : (
            <Link to="/" className="flex items-center gap-2 hover:text-emerald-500 transition-colors uppercase tracking-widest text-[9px] font-extrabold text-emerald-950/40">
               {t('nav.home') || 'Back to Home'}
            </Link>
          )}
        </div>
 
        {/* Auth & Utilities */}
        <div className="flex items-center gap-4">
           {/* Language Dropdown */}
           <div className="relative" ref={langRef}>
              <button 
                onClick={() => setShowLang(!showLang)}
                className="flex items-center gap-2 text-emerald-950/70 hover:text-emerald-950 transition-colors cursor-pointer bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-950/10"
              >
                <Globe size={14} className="opacity-50" />
                <span className="font-sans text-[11px] font-bold uppercase tracking-wider">{currentLang.label}</span>
                <ChevronDown size={12} className={`transition-transform ${showLang ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showLang && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-3 bg-white border border-emerald-50 shadow-[0_20px_50px_rgba(6,78,59,0.1)] py-2 min-w-[180px] rounded-xl z-[110] overflow-hidden"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLang(false);
                        }}
                        className={`w-full flex items-center justify-between px-5 py-3 text-[11px] font-bold tracking-wider hover:bg-emerald-50 transition-colors uppercase ${
                          language === lang.code ? 'text-gold-500 bg-emerald-50/50' : 'text-emerald-950/60'
                        }`}
                      >
                        <span>{lang.name}</span>
                        <span className="text-sm grayscale-0">{lang.flag}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
           </div>

           <div className="hidden md:flex items-center gap-3">
             {/* CTA FIRST */}
             {!isCreatePage && (
               <button onClick={() => navigate('/create')} className="luxury-button !h-10 !px-6 !text-[9px] !font-bold !tracking-[2px]">
                 {t('nav.create')}
               </button>
             )}

             {user ? (
               <div className="flex items-center gap-3">
                  <button onClick={logout} className="p-2.5 text-emerald-950/30 hover:text-red-500 transition-colors">
                     <LogOut size={18} />
                  </button>
               </div>
             ) : (
               <button 
                 onClick={() => navigate('/login')} 
                 className="px-4 py-2 text-emerald-950/80 font-bold text-[9px] tracking-widest uppercase rounded-xl hover:bg-emerald-50 transition-all border border-emerald-950/5"
               >
                 Log In
               </button>
             )}
           </div>

           {/* Mobile Menu */}
           <div className="md:hidden">
              <div className="w-10 h-10 flex items-center justify-center bg-emerald-50 rounded-xl text-emerald-950">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </div>
           </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
