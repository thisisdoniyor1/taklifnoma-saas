import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  MessageSquare,
  PencilLine,
  Plus,
  Save,
  Share2,
  Trash2,
  RefreshCcw,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/db';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AccountMenu from '../components/AccountMenu';
import BrandLogo from '../components/BrandLogo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { formatLocalizedDateLabel } from '../utils/localization';
import { CustomDatePicker, CustomTimePicker, CustomLanguageSelect, CustomVenueInput } from '../components/CustomEditorPickers';

const buildEditForm = (invite) => ({
  groom_name: invite.groom_name || '',
  bride_name: invite.bride_name || '',
  wedding_date: invite.wedding_date || '',
  wedding_time: invite.wedding_time || '',
  location_name: invite.location_name || '',
  location_url: invite.location_url || '',
  welcome_text: invite.welcome_text || '',
  image_url: invite.image_url || '',
  music_url: invite.music_url || '',
  phone: invite.phone || '',
  default_lang: invite.default_lang || 'uz_cyrl',
});

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeInvitations, setActiveInvitations] = useState([]);
  const [deletedInvitations, setDeletedInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDeleted, setShowDeleted] = useState(false);

  const openTemplates = useCallback(() => {
    navigate('/#templates');
  }, [navigate]);

  const fetchMyInvites = useCallback(async () => {
    try {
      if (!user) {
        return;
      }
      setLoading(true);
      const [activeData, deletedData] = await Promise.all([
        db.getMyInvitations(false),
        db.getMyInvitations(true)
      ]);
      setActiveInvitations(Array.isArray(activeData) ? activeData : []);
      setDeletedInvitations(Array.isArray(deletedData) ? deletedData : []);
    } catch (error) {
      console.error('Fetch failed:', error);
      setActiveInvitations([]);
      setDeletedInvitations([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyInvites();
  }, [fetchMyInvites]);

  const displayedInvitations = showDeleted ? deletedInvitations : activeInvitations;


  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F4F9F6] text-emerald-950 selection:bg-emerald-200">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-18%] h-[30rem] w-[30rem] rounded-full bg-emerald-200/55 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[34rem] w-[34rem] rounded-full bg-[#f4d67f]/40 blur-[150px]" />
      </div>

      <div className="sticky top-0 z-[120] border-b border-white/50 bg-white/70 px-4 py-3 backdrop-blur-2xl shadow-[0_8px_40px_rgba(6,78,59,0.06)] md:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <BrandLogo
              asLink={false}
              showSubtitle
              subtitle={t('dashboard.subtitle')}
              badgeClassName="!h-11 !w-11 sm:!h-12 sm:!w-12"
              wordmarkClassName="!text-[1.05rem] sm:!text-lg"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            <AccountMenu
              buttonClassName="border-emerald-900/5 bg-white/95 shadow-lg shadow-emerald-950/10"
              showIdentity={false}
              compactAvatar={true}
              menuVariant="dashboard"
              openOnHover={true}
            />
          </div>
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-6">
        {/* Sub-navbar action row */}
        <div className="mb-4 flex items-center justify-between">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-emerald-900/10 bg-white px-4 text-[10px] font-black uppercase tracking-[2px] text-emerald-900 shadow-sm transition-colors hover:bg-emerald-50"
          >
            <ArrowLeft size={14} />
            <span>{t('dashboard.header.back')}</span>
          </motion.button>

          <motion.button
            whileHover={{ y: -1, boxShadow: '0 18px 35px -18px rgba(6,78,59,0.45)' }}
            whileTap={{ scale: 0.98 }}
            onClick={openTemplates}
            className="inline-flex h-10 items-center gap-2 rounded-2xl bg-emerald-900 px-4 text-[10px] font-black uppercase tracking-[2px] text-white shadow-lg shadow-emerald-950/20 transition-colors hover:bg-emerald-800"
          >
            <Plus size={14} />
            <span>{t('nav.create')}</span>
          </motion.button>
        </div>

        {/* ── Mobile: stacked. Laptop (md+): sidebar left + cards right ── */}
        <div className="md:flex md:items-start md:gap-4">

          {/* LEFT: section tabs (sidebar on laptop, full-width on mobile) */}
          <div className="mb-4 md:mb-0 md:w-44 lg:w-52 md:shrink-0 md:sticky md:top-[4.5rem]">
            <div className="rounded-[20px] border border-emerald-900/12 bg-white/80 p-2 shadow-[0_8px_32px_-12px_rgba(6,78,59,0.14)] backdrop-blur-xl">
              {/* Mobile: 2-col grid. Laptop: vertical stack */}
              <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
                <StatCard
                  icon={<Plus size={16} className="text-emerald-600" />}
                  label={t('dashboard.section.viewActive')}
                  value={activeInvitations.length}
                  active={!showDeleted}
                  onClick={() => setShowDeleted(false)}
                />
                <StatCard
                  icon={<Trash2 size={16} className="text-emerald-600" />}
                  label={t('dashboard.section.viewDeleted')}
                  value={deletedInvitations.length}
                  active={showDeleted}
                  onClick={() => setShowDeleted(true)}
                />
              </div>
            </div>
          </div>

          {/* RIGHT: invitation cards */}
          <div className="flex-1 min-w-0">
            <div className="rounded-[24px] border border-emerald-900/12 bg-white/60 p-2 shadow-[0_24px_70px_-50px_rgba(6,78,59,0.26)] backdrop-blur-xl md:p-2.5">
              <div className="flex items-center gap-4">
                <h2 className="text-[11px] font-black uppercase tracking-[4px] text-emerald-900/35">
                  {showDeleted ? t('dashboard.section.viewDeleted') : t('dashboard.section.viewActive')}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-emerald-900/15 to-transparent" />
                <span className="rounded-full border border-emerald-900/10 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[2px] text-emerald-900/45">
                  {displayedInvitations.length} {showDeleted ? 'deleted' : 'invitations'}
                </span>
              </div>

              {loading ? (
                <div className="flex justify-center py-24">
                  <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-200" />
                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                  </div>
                </div>
              ) : displayedInvitations.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {displayedInvitations.map((invite) => (
                    <InvitationStudioCard
                      key={invite.id}
                      invite={invite}
                      onRefresh={fetchMyInvites}
                      ownerEmail={user?.email}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[28px] border-2 border-dashed border-emerald-900/10 bg-white/70 mt-5 py-20 text-center">
                  <p className="text-[11px] font-black uppercase tracking-[4px] text-emerald-900/30">
                    {t('dashboard.emptyState.title')}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: '0 20px 45px -20px rgba(6,78,59,0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openTemplates}
                    className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-emerald-900 px-8 py-4 text-[11px] font-black uppercase tracking-[3px] text-white shadow-xl shadow-emerald-950/15 transition-colors hover:bg-emerald-800"
                  >
                    <Plus size={18} />
                    {t('dashboard.emptyState.cta')}
                  </motion.button>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );

};

const StatCard = ({ icon, label, value, active = false, onClick }) => {
  const clickable = typeof onClick === 'function';

  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`rounded-[18px] border p-2.5 text-left shadow-lg shadow-emerald-950/5 transition-colors sm:p-3.5 ${clickable ? 'cursor-pointer' : 'cursor-default'} ${active ? 'border-emerald-800 bg-emerald-950 text-white' : 'border-white/70 bg-white/85 text-emerald-950'}`}
    >
      <div className="flex items-center justify-between">
        <div className={`flex h-8 w-8 items-center justify-center rounded-[12px] border shadow-sm sm:h-10 sm:w-10 sm:rounded-[14px] ${active ? 'border-white/10 bg-white/10 [&>svg]:text-[#f5d989]' : 'border-emerald-900/5 bg-emerald-50 [&>svg]:text-emerald-600'}`}>
          {icon}
        </div>
        {active && <div className={`h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2 ${active ? 'bg-[#f5d989]' : 'bg-emerald-300'}`} />}
      </div>
      <p className={`mt-2 text-[8px] font-black uppercase tracking-[2.5px] sm:mt-3 sm:text-[9px] ${active ? 'text-white/45' : 'text-emerald-900/35'}`}>
        {label}
      </p>
      <p className={`mt-0.5 text-[1.2rem] font-black tracking-tight sm:text-[1.75rem] md:text-[2rem] ${active ? 'text-white' : 'text-emerald-950'}`}>
        {value}
      </p>
    </motion.button>
  );
};

const InvitationStudioCard = ({ invite, onRefresh, ownerEmail }) => {
  const { t, language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [rsvps, setRsvps] = useState([]);
  const [loadingRSVPs, setLoadingRSVPs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editForm, setEditForm] = useState(buildEditForm(invite));

  useEffect(() => {
    setEditForm(buildEditForm(invite));
  }, [invite]);

  const shareUrl = `${window.location.origin}/${invite.slug || invite.invite_uuid}`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      
      // Warning for local dev
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.alert('Eslatma: "localhost" havolasi faqat sizning kompyuteringizda ishlaydi. Boshqalarga yuborish uchun loyihani serverga yuklash kerak.');
      }
    } catch (_) {
      // silently ignore
    }
  };

  const toggleExpand = async () => {
    if (!isExpanded && rsvps.length === 0) {
      setLoadingRSVPs(true);

      try {
        const data = await db.getRSVPs(invite.invite_uuid);
        setRsvps(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingRSVPs(false);
      }
    }

    setIsExpanded((prev) => !prev);
  };

  const handleFieldChange = (key, value) => {
    setEditForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      await db.updateOrder(invite.invite_uuid, editForm);
      setIsEditing(false);
      await onRefresh();
    } catch (error) {
      window.alert(`${t('dashboard.feedback.saveFailed')}: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    setDeleting(true);
    try {
      await db.deleteOrder(invite.invite_uuid);
      await onRefresh();
    } catch (error) {
      window.alert(`Delete failed: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = async () => {
    const shareText = `Assalomu alaykum! Sizni to'yimizga taklif qilamiz. Taklifnomani ushbu havola orqali ko'rishingiz mumkin: ${shareUrl}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${invite.groom_name} & ${invite.bride_name} Taklifnomasi`,
          text: shareText,
          url: shareUrl,
        });
      } catch (_) {
        // user cancelled
      }
    } else {
      // Fallback: copy to clipboard
      handleCopy();
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await db.restoreOrder(invite.invite_uuid);
      await onRefresh();
    } catch (error) {
      window.alert(`Restore failed: ${error.message}`);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <>
      {/* Delete Confirmation Modal using createPortal to prevent transform issues */}
      {createPortal(
        <AnimatePresence>
          {confirmDelete && (
            <motion.div
              key="delete-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] flex items-center justify-center bg-emerald-950/60 backdrop-blur-md px-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="relative w-full max-w-[360px] overflow-hidden rounded-[32px] bg-white p-8 shadow-[0_30px_70px_-15px_rgba(4,47,38,0.35)] text-center border border-emerald-900/10"
              >
                {/* Gold/emerald decorative radial glows */}
                <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-red-400/10 blur-[40px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-gold-400/10 blur-[40px] pointer-events-none" />

                {/* Animated trash container icon */}
                <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50/80 border border-red-100 shadow-[inset_0_2px_4px_rgba(239,68,68,0.06)]">
                  <div className="absolute inset-0 animate-ping rounded-full bg-red-100/40 opacity-75 duration-[1500ms]" />
                  <Trash2 size={30} className="relative z-10 text-red-500" strokeWidth={2} />
                </div>

                <h3 className="text-xl font-extrabold tracking-tight text-emerald-950 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {t('dashboard.row.deleteConfirmTitle')}
                </h3>
                <p className="text-[13px] font-medium leading-relaxed text-emerald-900/60 mb-8 px-2">
                  {t('dashboard.row.deleteConfirmDesc')}
                </p>

                <div className="flex flex-col gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-[10px] font-black uppercase tracking-[2.5px] text-white shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed border border-red-500/20"
                  >
                    {deleting ? t('dashboard.row.deleting') : t('dashboard.row.yesDelete')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setConfirmDelete(false)}
                    className="w-full h-12 rounded-2xl bg-[#f4faf6] border border-emerald-900/10 text-[10px] font-black uppercase tracking-[2.5px] text-emerald-900 hover:bg-[#eaf5ee] hover:text-emerald-950 transition-all"
                  >
                    {t('dashboard.row.cancel')}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <motion.article
        layout
        transition={{ type: 'spring', stiffness: 240, damping: 28 }}
        className="overflow-hidden rounded-[20px] border border-emerald-900/12 bg-white/88 shadow-[0_22px_64px_-46px_rgba(6,78,59,0.3)]"
      >
        <div className="p-1.5 flex flex-col xl:flex-row gap-1.5">
          <div className="grid gap-1.5 grid-cols-[minmax(0,1fr)_5rem] sm:grid-cols-[minmax(0,1fr)_6.5rem] xl:w-[50%] xl:order-1">
            {/* Green names panel - left */}
            <div className="relative overflow-hidden rounded-[16px] border border-white/8 bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#0b3d32] px-3.5 py-2.5 text-white">
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#f3d789]/18 to-transparent" />
              <div className="absolute -right-12 top-0 h-28 w-28 rounded-full bg-[#f4d67f]/18 blur-3xl" />

              <div className="relative flex min-h-[82px] flex-col justify-between gap-1 pr-14">
                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-[3px] text-white/45">
                    {t('dashboard.row.badge')}
                  </p>
                  <p className="mt-0.5 truncate text-[0.78rem] font-bold text-[#f5d989]">
                    {ownerEmail || 'user@email.com'}
                  </p>
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-[1.1rem] font-black tracking-tight text-white md:text-[1.25rem]">
                    {invite.groom_name} <span className="font-light text-[#f5d989]">&</span> {invite.bride_name}
                  </h3>
                  {invite.created_at && (
                    <p className="mt-0.5 text-[6.5px] font-semibold text-white/40 uppercase tracking-[1.5px]">
                      {formatLocalizedDateLabel(invite.created_at, language, '')}
                    </p>
                  )}
                </div>
              </div>

              {/* Views (laptop) + Edit button anchored to right */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5">
                <div className="hidden xl:flex flex-col items-center">
                  <span className="text-[13px] font-black text-white leading-none">{invite.views_count || 0}</span>
                  <span className="text-[5px] font-black uppercase tracking-[1px] text-white/55">{t('dashboard.row.views')}</span>
                </div>
                {!invite.is_deleted && (
                  <button
                    onClick={() => setIsEditing((prev) => !prev)}
                    className={`flex flex-col items-center justify-center rounded-[10px] border px-2 py-1.5 text-[7px] font-black uppercase tracking-[1px] transition-all gap-0.5 ${isEditing
                      ? 'border-white/30 bg-white/20 text-white'
                      : 'border-white/20 bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <PencilLine size={12} />
                    <span>{isEditing ? 'Close' : 'Edit'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Views tile - mobile only */}
            <div className="rounded-[16px] border border-emerald-900/10 bg-[#f8fbf8] p-2 flex flex-col items-center justify-center xl:hidden">
              <InviteMetricTile value={invite.views_count || 0} label={t('dashboard.row.views')} centered />
            </div>

            {/* Delete/Restore button - laptop only, in the views-tile slot */}
            <div className="hidden xl:flex flex-col">
              {invite.is_deleted ? (
                <ActionButton
                  onClick={handleRestore}
                  disabled={restoring}
                  icon={<RefreshCcw size={14} />}
                  label={restoring ? t('dashboard.row.restoring') : t('dashboard.row.restore')}
                  className="h-full border-emerald-100 bg-white text-emerald-600 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70"
                />
              ) : (
                <ActionButton
                  onClick={() => setConfirmDelete(true)}
                  disabled={deleting}
                  icon={<Trash2 size={14} />}
                  label={deleting ? t('dashboard.row.deleting') : t('dashboard.row.delete')}
                  className="h-full border-red-100 bg-white text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 xl:flex-1 xl:order-2">
            {!invite.is_deleted ? (
              <>
                <ActionButton
                  onClick={toggleExpand}
                  icon={<MessageSquare size={14} />}
                  label={isExpanded ? t('dashboard.row.activityClose') : t('dashboard.row.activityOpen')}
                  className={isExpanded
                    ? 'border-emerald-700 bg-emerald-700 text-white xl:min-h-[2.3rem]'
                    : 'border-emerald-900/10 bg-white text-emerald-900 hover:bg-emerald-100 xl:min-h-[2.3rem]'}
                />

                <ActionButton
                  as="a"
                  href={shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  icon={<ExternalLink size={14} />}
                  label={t('dashboard.row.view')}
                  className="border-transparent bg-emerald-900 text-white shadow-lg shadow-emerald-950/15 hover:bg-emerald-800 xl:min-h-[2.3rem]"
                />

                <ActionButton
                  onClick={handleCopy}
                  icon={copied ? <Check size={14} /> : <Copy size={14} />}
                  label={copied ? t('dashboard.row.copied') : t('dashboard.row.copy')}
                  className={copied
                    ? 'border-emerald-700 bg-emerald-700 text-white xl:min-h-[2.3rem]'
                    : 'border-emerald-900/10 bg-white text-emerald-900 hover:bg-emerald-100 xl:min-h-[2.3rem]'}
                />

                <ActionButton
                  onClick={handleShare}
                  icon={<Share2 size={14} />}
                  label={t('dashboard.row.share')}
                  className="border-emerald-900/10 bg-white text-emerald-900 hover:bg-emerald-100 xl:min-h-[2.3rem]"
                />

                {/* Delete — mobile only; on laptop it lives in the views-tile slot */}
                <ActionButton
                  onClick={() => setConfirmDelete(true)}
                  disabled={deleting}
                  icon={<Trash2 size={14} />}
                  label={deleting ? t('dashboard.row.deleting') : t('dashboard.row.delete')}
                  className="border-red-100 bg-white text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70 xl:hidden"
                />
              </>
            ) : (
              <ActionButton
                onClick={handleRestore}
                disabled={restoring}
                icon={<RefreshCcw size={14} />}
                label={restoring ? t('dashboard.row.restoring') : t('dashboard.row.restore')}
                className="border-emerald-900/10 bg-white text-emerald-900 hover:bg-emerald-100 xl:hidden"
              />
            )}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isEditing ? (
            <motion.div
              key="editor"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-emerald-900/10 bg-[#fffaf1]"
            >
              <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 lg:p-5">
                <EditorField
                  label={t('dashboard.editor.groom')}
                  value={editForm.groom_name}
                  onChange={(value) => handleFieldChange('groom_name', value)}
                />
                <EditorField
                  label={t('dashboard.editor.bride')}
                  value={editForm.bride_name}
                  onChange={(value) => handleFieldChange('bride_name', value)}
                />
                <CustomDatePicker
                  isDashboard
                  label={t('dashboard.editor.date')}
                  value={editForm.wedding_date}
                  placeholder="26.02.2027"
                  onChange={(value) => handleFieldChange('wedding_date', value)}
                />
                <CustomTimePicker
                  isDashboard
                  label={t('dashboard.editor.time')}
                  value={editForm.wedding_time}
                  placeholder="18:00"
                  onChange={(value) => handleFieldChange('wedding_time', value)}
                />
                <CustomVenueInput
                  isDashboard
                  label={t('dashboard.editor.locationName')}
                  value={editForm.location_name}
                  language={language}
                  onChange={(value) => handleFieldChange('location_name', value)}
                  onSelectVenue={(venueName, venueUrl) => {
                    handleFieldChange('location_name', venueName);
                    handleFieldChange('location_url', venueUrl);
                  }}
                  placeholder="Wedding hall"
                />
                <EditorField
                  label={t('dashboard.editor.locationUrl') || 'Map Link'}
                  value={editForm.location_url}
                  placeholder="https://maps.google.com/..."
                  onChange={(value) => handleFieldChange('location_url', value)}
                />
                <div className="md:col-span-2 lg:col-span-3">
                  <EditorArea
                    label={t('dashboard.editor.welcome')}
                    value={editForm.welcome_text}
                    onChange={(value) => handleFieldChange('welcome_text', value)}
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <CustomLanguageSelect
                    isDashboard
                    label={t('editor.fields.defaultLang') || 'Default Invitation Language'}
                    value={editForm.default_lang}
                    onChange={(value) => handleFieldChange('default_lang', value)}
                    options={[
                      { value: 'uz_cyrl', label: 'O‘zbekcha' },
                      { value: 'ru', label: 'Русский' },
                      { value: 'en', label: 'English' },
                      { value: 'tj', label: 'Тоҷикӣ' },
                    ]}
                  />
                </div>

                <div className="flex flex-wrap gap-2.5 md:col-span-2 lg:col-span-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex h-12 items-center gap-2 rounded-2xl bg-emerald-900 px-5 text-[10px] font-black uppercase tracking-[2px] text-white shadow-lg shadow-emerald-950/15 transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Save size={16} />
                    {saving ? t('dashboard.editor.saving') : t('dashboard.editor.save')}
                  </button>

                  <button
                    onClick={() => {
                      setEditForm(buildEditForm(invite));
                      setIsEditing(false);
                    }}
                    className="inline-flex h-12 items-center gap-2 rounded-2xl border border-emerald-900/10 bg-white px-5 text-[10px] font-black uppercase tracking-[2px] text-emerald-900 transition-colors hover:bg-emerald-50"
                  >
                    <X size={16} />
                    {t('dashboard.editor.cancel')}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {isExpanded ? (
            <motion.div
              key="activity"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-emerald-900/10 bg-emerald-50/60"
            >
              <div className="p-4 lg:p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[4px] text-emerald-900/35">
                      {t('dashboard.row.guestActivity')}
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-emerald-900/65">
                      {t('dashboard.row.guestActivityDesc')}
                    </p>
                  </div>

                  <span className="rounded-full border border-emerald-900/10 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[2px] text-emerald-900/45">
                    {rsvps.length} {t('dashboard.row.responses')}
                  </span>
                </div>

                {loadingRSVPs ? (
                  <div className="flex justify-center py-12">
                    <div className="relative h-12 w-12">
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-200" />
                      <div className="absolute inset-0 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                    </div>
                  </div>
                ) : rsvps.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {rsvps.map((rsvp) => (
                      <div
                        key={rsvp.id}
                        className="rounded-[20px] border border-emerald-900/8 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[1rem] font-black tracking-tight text-emerald-950">
                            {rsvp.name}
                          </p>
                          <span className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[2px] ${rsvp.status === 'attending'
                            ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                            : 'border-red-100 bg-red-50 text-red-600'
                            }`}>
                            {rsvp.status === 'attending' ? t('dashboard.row.attending') : t('dashboard.row.declined')}
                          </span>
                        </div>

                        {rsvp.wish ? (
                          <p className="mt-3 rounded-2xl bg-emerald-50/70 p-3 text-sm font-medium leading-relaxed text-emerald-900/75">
                            “{rsvp.wish}”
                          </p>
                        ) : null}

                        <p className="mt-4 text-[10px] font-black uppercase tracking-[2px] text-emerald-900/35">
                          {formatLocalizedDateLabel(rsvp.created_at, language, t('dashboard.time.justNow'))}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[28px] border-2 border-dashed border-emerald-900/10 bg-white/70 py-14 text-center">
                    <p className="text-[11px] font-black uppercase tracking-[4px] text-emerald-900/30">
                      {t('dashboard.row.noResponses')}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.article>
    </>
  );
};

const ActionButton = ({ as = 'button', icon, label, className, ...props }) => {
  const sharedClassName = `inline-flex flex-1 sm:min-w-[5.5rem] min-h-[2.1rem] md:min-h-[1.7rem] items-center justify-center gap-1 rounded-[10px] border px-1.5 py-1 md:py-0.5 text-center text-[7.5px] font-black uppercase leading-[1.05] tracking-[1px] transition-all duration-200 hover:-translate-y-px hover:scale-[1.02] ${className}`;

  if (as === 'a') {
    return (
      <a className={sharedClassName} {...props}>
        {icon}
        <span className="max-w-full whitespace-normal break-words">{label}</span>
      </a>
    );
  }

  return (
    <button type="button" className={sharedClassName} {...props}>
      {icon}
      <span className="max-w-full whitespace-normal break-words">{label}</span>
    </button>
  );
};

const InviteMetricTile = ({ value, label, centered = false }) => (
  <div className={`rounded-[14px] border border-emerald-900/10 bg-white px-2 py-1 ${centered ? 'flex flex-col items-center justify-center text-center' : ''}`}>
    <p className="text-[7.5px] font-black uppercase tracking-[1.5px] text-emerald-900/35">
      {label}
    </p>
    <p className="mt-0.5 text-[0.85rem] font-black tracking-tight text-emerald-950">
      {value}
    </p>
  </div>
);

const EditorField = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="mb-2 block text-[10px] font-black uppercase tracking-[2px] text-emerald-900/45">
      {label}
    </label>
    <input
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 text-base font-semibold text-emerald-950 outline-none transition-colors placeholder:text-emerald-900/25 focus:border-emerald-400"
    />
  </div>
);

const EditorArea = ({ label, value, onChange }) => (
  <div>
    <label className="mb-2 block text-[10px] font-black uppercase tracking-[2px] text-emerald-900/45">
      {label}
    </label>
    <textarea
      rows={4}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-[24px] border border-emerald-900/10 bg-white px-4 py-3 text-base font-semibold text-emerald-950 outline-none transition-colors placeholder:text-emerald-900/25 focus:border-emerald-400"
    />
  </div>
);

const EditorSelect = ({ label, value, onChange, options }) => (
  <div>
    <label className="mb-2 block text-[10px] font-black uppercase tracking-[2px] text-emerald-900/45">
      {label}
    </label>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 text-base font-semibold text-emerald-950 outline-none transition-colors focus:border-emerald-400 cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default Dashboard;
