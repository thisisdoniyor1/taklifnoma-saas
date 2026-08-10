import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../lib/db';

export const AccountSettingsModal = ({ mode, isAdmin, onClose, onSuccess }) => {
  const { applySession } = useAuth();
  const { t } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEmailMode = mode === 'email';
  const title = isEmailMode
    ? (isAdmin ? 'Change Admin Email' : 'Change Email')
    : (isAdmin ? (t('password.changeAdminTitle') || 'Change Admin Password') : (t('password.changeTitle') || 'Change Password'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentPassword) {
      setError(t('password.currentPasswordRequired') || 'Current password is required');
      return;
    }

    if (isEmailMode) {
      if (!email) {
        setError('New email is required');
        return;
      }
    } else {
      if (!newPassword) {
        setError(t('password.newPasswordRequired') || 'New password is required');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError(t('password.passwordsMismatch') || 'Passwords do not match');
        return;
      }
    }

    setLoading(true);

    try {
      const result = isEmailMode
        ? await db.updateAccountEmail(email, currentPassword)
        : await db.updateAccountPassword(currentPassword, newPassword);

      applySession(result);
      onSuccess();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[220] bg-emerald-950/30 backdrop-blur-sm px-4"
      >
        <div className="flex min-h-screen items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="w-full max-w-md rounded-[28px] border border-white/70 bg-white p-8 shadow-2xl shadow-emerald-950/10"
          >
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[3px] text-emerald-900/35">
                  Account Settings
                </p>
                <h3 className="mt-2 text-2xl font-black tracking-tight text-emerald-950">
                  {title}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-900/10 bg-emerald-50 text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-[11px] font-bold text-red-500">
                  {error}
                </div>
              )}

              {isEmailMode && (
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[2px] text-emerald-900/45">
                    New Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-emerald-900/10 bg-emerald-50/70 px-4 py-3 text-sm font-semibold text-emerald-950 outline-none transition-colors placeholder:text-emerald-900/25 focus:border-emerald-400 focus:bg-white"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              )}

              {!isEmailMode && (
                <>
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[2px] text-emerald-900/45">
                      {t('password.newPassword') || 'New Password'}
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-2xl border border-emerald-900/10 bg-emerald-50/70 px-4 py-3 text-sm font-semibold text-emerald-950 outline-none transition-colors placeholder:text-emerald-900/25 focus:border-emerald-400 focus:bg-white"
                      placeholder={t('password.newPasswordPlaceholder') || 'Enter a new password'}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[2px] text-emerald-900/45">
                      {t('password.confirmPassword') || 'Confirm Password'}
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-2xl border border-emerald-900/10 bg-emerald-50/70 px-4 py-3 text-sm font-semibold text-emerald-950 outline-none transition-colors placeholder:text-emerald-900/25 focus:border-emerald-400 focus:bg-white"
                      placeholder={t('password.confirmPasswordPlaceholder') || 'Repeat the new password'}
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[2px] text-emerald-900/45">
                  {t('password.currentPassword') || 'Current Password'}
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-2xl border border-emerald-900/10 bg-emerald-50/70 px-4 py-3 text-sm font-semibold text-emerald-950 outline-none transition-colors placeholder:text-emerald-900/25 focus:border-emerald-400 focus:bg-white"
                  placeholder={t('password.currentPasswordPlaceholder') || 'Enter your current password'}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-2xl bg-emerald-900 px-5 py-3 text-[11px] font-black uppercase tracking-[2px] text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (t('password.savingBtn') || 'Saving...') : (t('password.saveBtn') || 'Save Changes')}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-emerald-900/10 bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[2px] text-emerald-900 transition-colors hover:bg-emerald-50"
                >
                  {t('auth.goBack') || 'Cancel'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const AccountMenu = ({
  buttonClassName = '',
  dropdownClassName = '',
  showIdentity = true,
  compactAvatar = false,
  logoutOnly = false,
  menuVariant = 'default',
  openOnHover = false,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return null;
  }

  const accountTitle = user.isAdmin ? 'Admin Account' : 'My Account';
  const avatarImage = user.profilePicture || user.photoURL || user.avatarUrl || user.avatar_url || '';
  const avatarInitial = (user.email?.trim()?.charAt(0) || 'U').toUpperCase();
  const isDashboardVariant = menuVariant === 'dashboard';

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const openModal = (mode) => {
    setIsOpen(false);
    setModalMode(mode);
  };

  return (
    <>
      <div
        className={`relative ${dropdownClassName}`}
        ref={menuRef}
        onMouseEnter={openOnHover ? () => setIsOpen(true) : undefined}
        onMouseLeave={openOnHover ? () => setIsOpen(false) : undefined}
      >
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center ${compactAvatar ? 'gap-0 rounded-full p-0.5' : 'gap-3 rounded-full px-3 py-2'} border border-emerald-900/10 bg-white/90 text-left shadow-sm transition-all hover:bg-white hover:shadow-md ${isDashboardVariant ? 'hover:border-emerald-400 hover:shadow-[0_18px_38px_-24px_rgba(6,78,59,0.45)]' : ''} ${buttonClassName}`}
        >
          <div className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center overflow-hidden rounded-full border-[0.5px] border-white/10 shadow-sm ${compactAvatar ? 'bg-emerald-900 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
            {avatarImage ? (
              <img
                src={avatarImage}
                alt={user.email}
                className="h-full w-full object-cover"
              />
            ) : compactAvatar ? (
              <span className="text-sm font-black uppercase tracking-[1px]">
                {avatarInitial}
              </span>
            ) : user.isAdmin ? (
              <ShieldCheck size={19} />
            ) : (
              <User size={19} />
            )}
          </div>
          {showIdentity && (
            <div className="hidden min-w-0 md:flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[2px] text-emerald-900/35">
                {accountTitle}
              </span>
              <span className="max-w-[220px] truncate text-sm font-bold text-emerald-950">
                {user.email}
              </span>
            </div>
          )}
          {!compactAvatar && (
            <ChevronDown
              size={16}
              className={`text-emerald-900/40 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              className={`absolute right-0 z-[210] mt-3 overflow-hidden rounded-[24px] border p-2 shadow-2xl ${logoutOnly ? 'w-52' : 'w-72'} ${isDashboardVariant ? 'border-white/10 bg-emerald-950 text-white shadow-[0_28px_70px_-32px_rgba(2,44,34,0.85)]' : 'border-emerald-900/10 bg-white shadow-2xl shadow-emerald-950/10'}`}
            >
              {!logoutOnly && (
                <div className={`rounded-2xl px-4 py-3 ${isDashboardVariant ? 'bg-white/8 border border-white/8' : 'bg-emerald-50/70'}`}>
                  {user.displayName && (
                    <div className="mb-2">
                      <p className={`text-[9px] font-black uppercase tracking-[2px] ${isDashboardVariant ? 'text-white/45' : 'text-emerald-900/35'}`}>
                        Full Name
                      </p>
                      <p className={`mt-0.5 truncate text-sm font-bold ${isDashboardVariant ? 'text-white' : 'text-emerald-950'}`}>
                        {user.displayName}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className={`text-[9px] font-black uppercase tracking-[2px] ${isDashboardVariant ? 'text-white/45' : 'text-emerald-900/35'}`}>
                      Email Address
                    </p>
                    <p className={`mt-0.5 truncate text-sm font-bold ${isDashboardVariant ? 'text-white' : 'text-emerald-950'}`}>
                      {user.email}
                    </p>
                  </div>
                </div>
              )}

              <div className={`${logoutOnly ? '' : 'mt-2'} flex flex-col gap-1`}>
                {!logoutOnly && location.pathname !== '/dashboard' && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/dashboard');
                    }}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${isDashboardVariant ? 'text-white hover:bg-white/10' : 'text-emerald-900 hover:bg-emerald-50'}`}
                  >
                    <LayoutDashboard size={17} className={isDashboardVariant ? 'text-[#f5d989]' : 'text-emerald-700'} />
                    My Dashboard
                  </button>
                )}

                {!logoutOnly && user.isAdmin && location.pathname !== '/DI-2406' && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/DI-2406');
                    }}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${isDashboardVariant ? 'text-white hover:bg-white/10' : 'text-emerald-900 hover:bg-emerald-50'}`}
                  >
                    <ShieldCheck size={17} className={isDashboardVariant ? 'text-[#f5d989]' : 'text-emerald-700'} />
                    Admin Panel
                  </button>
                )}

                {!logoutOnly && (
                  <>
                    <button
                      type="button"
                      onClick={() => openModal('email')}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${isDashboardVariant ? 'text-white hover:bg-white/10' : 'text-emerald-900 hover:bg-emerald-50'}`}
                    >
                      <Mail size={17} className={isDashboardVariant ? 'text-[#f5d989]' : 'text-emerald-700'} />
                      Change Email
                    </button>

                    <button
                      type="button"
                      onClick={() => openModal('password')}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${isDashboardVariant ? 'text-white hover:bg-white/10' : 'text-emerald-900 hover:bg-emerald-50'}`}
                    >
                      <KeyRound size={17} className={isDashboardVariant ? 'text-[#f5d989]' : 'text-emerald-700'} />
                      {t('password.changeTitle') || 'Change Password'}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${isDashboardVariant ? 'text-red-200 hover:bg-red-500/15' : 'text-red-500 hover:bg-red-50'}`}
                >
                  <LogOut size={17} />
                  Log Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!logoutOnly && modalMode && (
        <AccountSettingsModal
          mode={modalMode}
          isAdmin={Boolean(user.isAdmin)}
          onClose={() => setModalMode(null)}
          onSuccess={() => setModalMode(null)}
        />
      )}
    </>
  );
};

export default AccountMenu;
