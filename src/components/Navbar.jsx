import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Menu, X, User, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { slowScroll, smoothScrollToTop } from '../utils/scroll';
import BrandLogo from './BrandLogo';
import LanguageSwitcher from './LanguageSwitcher';
import { AccountSettingsModal } from './AccountMenu';

const NavLink = ({ id, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`relative px-3 sm:px-4 py-1.5 sm:py-2 transition-colors uppercase tracking-widest text-[10px] sm:text-[11px] font-extrabold ${isActive ? 'text-emerald-950' : 'text-emerald-950/40 hover:text-gold-500'
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

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileInMenu, setShowProfileInMenu] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [modalMode, setModalMode] = useState(null);
  const menuRef = useRef(null);
  const isManualScrollRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(pathname);
  const isCreatePage = pathname.startsWith('/create');
  const isAdminPage = pathname === '/DI-2406';
  const isDashboardPage = pathname === '/dashboard';
  const isInvitationPage = pathname.startsWith('/v/') || pathname.startsWith('/i/') || (pathname !== '/' && !isCreatePage && pathname !== '/dashboard' && pathname !== '/DI-2406' && !isAuthPage);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      if (isManualScrollRef.current) return;
      
      const sections = ['templates', 'features', 'faq'];
      let current = 'home';
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const top = element.getBoundingClientRect().top + window.scrollY;
          if (window.scrollY >= top - 120) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
        setTimeout(() => setShowProfileInMenu(false), 200); // reset profile view after close
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  if (isAuthPage || isAdminPage || isDashboardPage || isInvitationPage) return null;

  const openTemplates = () => {
    if (pathname === '/') {
      slowScroll('templates');
    } else {
      navigate('/#templates');
    }
  };

  const handleNavClick = (id) => {
    setIsMenuOpen(false);
    setActiveSection(id);
    
    isManualScrollRef.current = true;
    clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isManualScrollRef.current = false;
    }, 1200);

    if (pathname !== '/') {
      navigate('/#' + id);
      return;
    }
    if (id === 'home') smoothScrollToTop();
    else slowScroll(id);
  };

  return (
    <>
      <nav data-app-navbar="true" className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-[100] transition-all duration-500 rounded-[999px] border ${isScrolled
          ? 'bg-white/60 backdrop-blur-3xl border-emerald-950/10 shadow-lg py-2'
          : 'bg-transparent border-transparent py-4'
        }`}>
        <div className="relative flex items-center justify-between pl-3 pr-1 sm:px-6 md:px-10">
          <div className="flex items-center gap-1.5 sm:gap-4">
            {isCreatePage && (
              <Link to="/" className="flex items-center gap-1.5 sm:gap-2 mr-1 sm:mr-2 pr-2 sm:pr-4 border-r border-emerald-950/20 group/home">
                <ChevronLeft size={16} className="text-emerald-950/40 group-hover/home:text-emerald-950 transition-colors" />
                <span className="hidden sm:inline text-[10px] font-extrabold uppercase tracking-widest text-emerald-950/40 group-hover/home:text-emerald-950 transition-colors">
                  {t('nav.home') || 'Home'}
                </span>
              </Link>
            )}
            <BrandLogo badgeClassName={isScrolled ? 'bg-white/95' : 'bg-white/90'} />
          </div>

          <div className="hidden lg:absolute lg:left-1/2 lg:top-1/2 lg:flex lg:-translate-x-1/2 lg:-translate-y-1/2 lg:items-center lg:gap-2 font-sans">
            {!isCreatePage && !isAdminPage && !isDashboardPage ? (
              <>
                <NavLink id="home" label={t('nav.home')} onClick={() => handleNavClick('home')} isActive={activeSection === 'home'} />
                <NavLink id="templates" label={t('nav.templates')} onClick={() => handleNavClick('templates')} isActive={activeSection === 'templates'} />
                <NavLink id="features" label={t('nav.features')} onClick={() => handleNavClick('features')} isActive={activeSection === 'features'} />
                <NavLink id="faq" label={t('nav.faq') || 'FAQ'} onClick={() => handleNavClick('faq')} isActive={activeSection === 'faq'} />
              </>
            ) : null}
          </div>

          <div className="ml-auto flex items-center justify-end gap-2 sm:gap-3">
            <LanguageSwitcher />

            {!isCreatePage && (
              <motion.button
                onClick={openTemplates}
                className="luxury-button !h-8 sm:!h-9 !px-3 sm:!px-4 !text-[8px] sm:!text-[8.5px] font-bold tracking-[1px] sm:tracking-[1.5px] uppercase transition-shadow flex items-center justify-center"
                whileHover={{ scale: 1.03, boxShadow: "0 0 24px rgba(16,185,129,0.28)" }}
                whileTap={{ scale: 0.98, boxShadow: "0 0 30px 5px rgba(16, 185, 129, 0.6)" }}
              >
                <span className="flex flex-col items-center leading-none mt-0.5 sm:mt-0 sm:block">
                  <span>{t('nav.create').split(' ')[0]}</span>
                  {t('nav.create').split(' ').length > 1 && (
                    <span className="sm:hidden mt-[1px]">
                      {t('nav.create').split(' ').slice(1).join(' ')}
                    </span>
                  )}
                  {t('nav.create').split(' ').length > 1 && (
                    <span className="hidden sm:inline">
                      {' ' + t('nav.create').split(' ').slice(1).join(' ')}
                    </span>
                  )}
                </span>
              </motion.button>
            )}

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => {
                  if (isMenuOpen) {
                    setIsMenuOpen(false);
                    setTimeout(() => setShowProfileInMenu(false), 200);
                  } else {
                    setIsMenuOpen(true);
                  }
                }}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-emerald-950 bg-transparent hover:bg-emerald-50 transition-colors"
              >
                <Menu size={22} />
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 z-[140] mt-3 w-48 sm:w-64 overflow-hidden rounded-2xl border border-emerald-900/10 bg-white py-2 shadow-[0_20px_50px_rgba(6,78,59,0.15)] flex flex-col"
                  >
                    {!showProfileInMenu ? (
                      <>
                        <div className="lg:hidden flex-1 py-2 px-2 flex flex-col">
                          <button onClick={() => handleNavClick('home')} className="text-left text-[12px] font-bold text-emerald-950/60 hover:text-emerald-950 hover:bg-emerald-50 px-4 py-3 rounded-lg transition-all uppercase tracking-wider">
                            {t('nav.home')}
                          </button>
                          <button onClick={() => handleNavClick('templates')} className="text-left text-[12px] font-bold text-emerald-950/60 hover:text-emerald-950 hover:bg-emerald-50 px-4 py-3 rounded-lg transition-all uppercase tracking-wider">
                            {t('nav.templates')}
                          </button>
                          <button onClick={() => handleNavClick('features')} className="text-left text-[12px] font-bold text-emerald-950/60 hover:text-emerald-950 hover:bg-emerald-50 px-4 py-3 rounded-lg transition-all uppercase tracking-wider">
                            {t('nav.features')}
                          </button>
                          <button onClick={() => handleNavClick('faq')} className="text-left text-[12px] font-bold text-emerald-950/60 hover:text-emerald-950 hover:bg-emerald-50 px-4 py-3 rounded-lg transition-all uppercase tracking-wider">
                            {t('nav.faq') || 'FAQ'}
                          </button>
                        </div>
                        <div className="px-4 py-3 border-t border-emerald-900/10 bg-[#F8FAF9]">
                          {user ? (
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => setShowProfileInMenu(true)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-950 text-white text-[10px] font-bold uppercase tracking-[2px] hover:bg-emerald-800 transition-colors shadow-md"
                              >
                                <User size={14} />
                                {t('nav.profile') || 'Profile'}
                              </button>
                              <button
                                onClick={() => {
                                  logout();
                                  setIsMenuOpen(false);
                                  setShowProfileInMenu(false);
                                  navigate('/');
                                }}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-100 text-red-600 bg-red-50 text-[10px] font-bold uppercase tracking-[2px] hover:bg-red-100 transition-colors"
                              >
                                {t('auth.logout') || 'Log Out'}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setIsMenuOpen(false);
                                navigate('/signup');
                              }}
                              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-950 text-white text-[10px] font-bold uppercase tracking-[2px] hover:bg-emerald-800 transition-colors shadow-md"
                            >
                              {t('auth.signUp') || 'Sign Up'}
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="px-4 py-4 flex flex-col items-center"
                      >
                        <div className="w-full flex justify-start mb-2">
                          <button
                            onClick={() => setShowProfileInMenu(false)}
                            className="text-emerald-900/40 hover:text-emerald-950 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                          >
                            <ChevronLeft size={14} /> Back
                          </button>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-900 mb-4 shadow-inner">
                          <User size={30} />
                        </div>
                        <h3 className="text-sm font-black text-emerald-950 mb-1">{user.displayName || 'User'}</h3>
                        <p className="text-[10px] font-bold text-emerald-900/40 mb-6 truncate max-w-full px-2">{user.email}</p>
                        
                        <button
                          onClick={() => setModalMode('password')}
                          className="w-full py-2.5 mb-2 rounded-xl border border-emerald-950/10 text-emerald-950 bg-emerald-50 text-[10px] font-extrabold uppercase tracking-[2px] hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <KeyRound size={13} />
                          Change Password
                        </button>

                        <button
                          onClick={() => {
                            logout();
                            setIsMenuOpen(false);
                            setShowProfileInMenu(false);
                            navigate('/');
                          }}
                          className="w-full py-2.5 rounded-xl border border-red-100 text-red-600 bg-red-50 text-[10px] font-bold uppercase tracking-[2px] hover:bg-red-100 transition-colors"
                        >
                          {t('auth.logout') || 'Log Out'}
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {modalMode && (
        <AccountSettingsModal
          mode={modalMode}
          isAdmin={Boolean(user?.isAdmin)}
          onClose={() => setModalMode(null)}
          onSuccess={() => setModalMode(null)}
        />
      )}
    </>
  );
};

export default Navbar;
