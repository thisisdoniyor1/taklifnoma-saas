import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Eye,
  Mail,
  MessageSquare,
  PencilLine,
  Plus,
  Save,
  Share2,
  ShieldCheck,
  Trash2,
  RefreshCcw,
  Users,
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
});

const Admin = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [overview, setOverview] = useState({
    orders: [],
    deleted_orders: [],
    users: [],
    deleted_users: [],
    totals: {
      invitations: 0,
      signups: 0,
      views: 0,
      rsvps: 0,
      active_creators: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState('invitations');
  const [senderEmail, setSenderEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('Taklifnoma update');
  const [emailBody, setEmailBody] = useState('Hello,\n\nThank you for signing up to Taklifnoma.\n\n');
  const [savingEmailSettings, setSavingEmailSettings] = useState(false);
  const [copiedRecipients, setCopiedRecipients] = useState(false);
  const [showDeletedUsers, setShowDeletedUsers] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      // Run both API calls in parallel to halve load time
      const [data, emailData] = await Promise.all([
        db.getAdminOverview(),
        db.getAdminEmailSettings().catch(() => null),
      ]);
      setOverview({
        orders: Array.isArray(data?.orders) ? data.orders : [],
        deleted_orders: Array.isArray(data?.deleted_orders) ? data.deleted_orders : [],
        users: Array.isArray(data?.users) ? data.users : [],
        deleted_users: Array.isArray(data?.deleted_users) ? data.deleted_users : [],
        totals: {
          invitations: Number(data?.totals?.invitations) || 0,
          signups: Number(data?.totals?.signups) || 0,
          views: Number(data?.totals?.views) || 0,
          rsvps: Number(data?.totals?.rsvps) || 0,
          active_creators: Number(data?.totals?.active_creators) || 0,
        },
      });
      setSenderEmail((prev) => prev || emailData?.sender_email || user?.email || '');
    } catch (error) {
      console.error('Admin init failed:', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAll();
    // Run only once on mount — user.email is used only as a default for senderEmail
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const invitations = overview.orders;
  const users = overview.users;
  const viewInsights = useMemo(() => {
    const buckets = {
      no_views: 0,
      lower_range: 0,
      mid_range: 0,
      higher_range: 0,
    };
    const topViewed = [...invitations]
      .sort((left, right) => (Number(right.views_count) || 0) - (Number(left.views_count) || 0))
      .slice(0, 6);

    invitations.forEach((invite) => {
      const views = Number(invite.views_count) || 0;

      if (views === 0) {
        buckets.no_views += 1;
      } else if (views < 25) {
        buckets.lower_range += 1;
      } else if (views < 75) {
        buckets.mid_range += 1;
      } else {
        buckets.higher_range += 1;
      }
    });

    return {
      buckets,
      topViewed,
      averageViews: invitations.length > 0
        ? Math.round((Number(overview.totals.views) || 0) / invitations.length)
        : 0,
    };
  }, [invitations, overview.totals.views]);

  const panelTitle = activePanel === 'invitations'
    ? t('admin.section.invitationsTitle')
    : activePanel === 'signups'
      ? t('admin.section.signupsTitle')
      : activePanel === 'deleted'
        ? 'Deleted Invitations'
        : t('admin.section.viewsTitle');

  const panelCountLabel = activePanel === 'invitations'
    ? `${invitations.length} ${t('admin.section.invitationsCount')}`
    : activePanel === 'signups'
      ? `${users.length} ${t('admin.section.usersCount')}`
      : activePanel === 'deleted'
        ? `${overview.deleted_orders.length} deleted`
        : `${overview.totals.views} ${t('admin.section.viewsCount')}`;

  const openTemplates = useCallback(() => {
    navigate('/#templates');
  }, [navigate]);

  const recipientEmails = useMemo(
    () => users.map((entry) => entry.email).filter(Boolean),
    [users]
  );

  const saveSenderEmail = useCallback(async () => {
    if (!senderEmail.trim()) {
      window.alert('Sender email is required.');
      return false;
    }

    setSavingEmailSettings(true);

    try {
      const data = await db.updateAdminEmailSettings(senderEmail.trim());
      setSenderEmail(data?.sender_email || senderEmail.trim());
      return true;
    } catch (error) {
      window.alert(error.message || 'Failed to save sender email.');
      return false;
    } finally {
      setSavingEmailSettings(false);
    }
  }, [senderEmail]);

  const openEmailDraft = useCallback(async () => {
    if (recipientEmails.length === 0) {
      window.alert('No signed up users to email yet.');
      return;
    }

    const saved = await saveSenderEmail();

    if (!saved) {
      return;
    }

    const mailtoUrl = `mailto:?bcc=${encodeURIComponent(recipientEmails.join(','))}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;
  }, [emailBody, emailSubject, recipientEmails, saveSenderEmail]);

  const copyRecipients = useCallback(async () => {
    if (recipientEmails.length === 0) {
      return;
    }

    await navigator.clipboard.writeText(recipientEmails.join(', '));
    setCopiedRecipients(true);
    window.setTimeout(() => setCopiedRecipients(false), 1800);
  }, [recipientEmails]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F4F9F6] text-emerald-950 selection:bg-emerald-200">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute right-[-12%] top-[-12%] h-[32rem] w-[32rem] rounded-full bg-emerald-200/55 blur-[140px]" />
        <div className="absolute bottom-[-18%] left-[-12%] h-[36rem] w-[36rem] rounded-full bg-[#f3d789]/35 blur-[150px]" />
      </div>

      <div className="sticky top-0 z-[120] border-b border-white/50 bg-white/72 px-4 py-3 backdrop-blur-2xl shadow-[0_8px_40px_rgba(6,78,59,0.06)] md:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <BrandLogo
              asLink={false}
              showSubtitle
              subtitle={t('admin.subtitle')}
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
            />
          </div>
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-6">
        {/* Sub-navbar action row */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-emerald-900/10 bg-white px-4 text-[10px] font-black uppercase tracking-[2px] text-emerald-900 shadow-sm transition-colors hover:bg-emerald-50"
          >
            <ArrowLeft size={14} />
            <span>{t('admin.header.back')}</span>
          </button>

          <button
            onClick={openTemplates}
            className="inline-flex h-10 items-center gap-2 rounded-2xl bg-emerald-900 px-4 text-[10px] font-black uppercase tracking-[2px] text-white shadow-lg shadow-emerald-950/20 transition-colors hover:bg-emerald-800"
          >
            <Plus size={14} />
            <span>{t('nav.create')}</span>
          </button>
        </div>

        {/* ── Mobile: stacked. Laptop (md+): sidebar left + content right ── */}
        <div className="md:flex md:items-start md:gap-4">

          {/* LEFT: stat cards sidebar */}
          <div className="mb-4 md:mb-0 md:w-44 lg:w-52 md:shrink-0 md:sticky md:top-[4.5rem]">
            <div className="rounded-[20px] border border-emerald-900/12 bg-white/80 p-2 shadow-[0_8px_32px_-12px_rgba(6,78,59,0.14)] backdrop-blur-xl">
              {/* Mobile: 2×2 grid. Laptop: vertical stack */}
              <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
                <StatCard
                  icon={<ShieldCheck className="text-emerald-600" />}
                  label={t('admin.stats.invitations')}
                  value={overview.totals.invitations}
                  active={activePanel === 'invitations'}
                  onClick={() => setActivePanel('invitations')}
                />
                <StatCard
                  icon={<Users className="text-emerald-600" />}
                  label={t('admin.stats.signups')}
                  value={overview.totals.signups}
                  active={activePanel === 'signups'}
                  onClick={() => setActivePanel('signups')}
                />
                <StatCard
                  icon={<Eye className="text-emerald-600" />}
                  label={t('admin.stats.views')}
                  value={overview.totals.views}
                  active={activePanel === 'views'}
                  onClick={() => setActivePanel('views')}
                />
                <StatCard
                  icon={<Trash2 className="text-emerald-600" />}
                  label="Deleted"
                  value={overview.deleted_orders.length}
                  active={activePanel === 'deleted'}
                  onClick={() => setActivePanel('deleted')}
                />
              </div>
            </div>
          </div>

          {/* RIGHT: content panel */}
          <div className="flex-1 min-w-0">
            <div className="rounded-[24px] border border-emerald-900/12 bg-white/60 p-2 shadow-[0_24px_70px_-50px_rgba(6,78,59,0.26)] backdrop-blur-xl md:p-2.5">
              <div className="flex items-center gap-4">
                <h2 className="text-[11px] font-black uppercase tracking-[4px] text-emerald-900/35">
                  {panelTitle}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-emerald-900/15 to-transparent" />
                <span className="rounded-full border border-emerald-900/10 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[2px] text-emerald-900/45">
                  {panelCountLabel}
                </span>
              </div>

              {loading ? (
                <div className="flex justify-center py-24">
                  <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-200" />
                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                  </div>
                </div>
              ) : activePanel === 'invitations' || activePanel === 'deleted' ? (
                (activePanel === 'invitations' ? invitations : overview.deleted_orders).length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {(activePanel === 'invitations' ? invitations : overview.deleted_orders).map((invite) => (
                      <InviteRow
                        key={invite.id}
                        invite={invite}
                        onRefresh={fetchAll}
                        onDeleteOptimistic={(uuid) => setOverview((prev) => ({
                          ...prev,
                          orders: prev.orders.filter((entry) => entry.invite_uuid !== uuid),
                        }))}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyPanel label={t('admin.empty.invitations')} />
                )
              ) : activePanel === 'signups' ? (
                <div className="mt-5 space-y-4">
                  <SignupEmailComposer
                    senderEmail={senderEmail}
                    setSenderEmail={setSenderEmail}
                    emailSubject={emailSubject}
                    setEmailSubject={setEmailSubject}
                    emailBody={emailBody}
                    setEmailBody={setEmailBody}
                    recipientCount={recipientEmails.length}
                    onSaveSenderEmail={saveSenderEmail}
                    onOpenEmailDraft={openEmailDraft}
                    onCopyRecipients={copyRecipients}
                    savingEmailSettings={savingEmailSettings}
                    copiedRecipients={copiedRecipients}
                  />
                  <div className="flex gap-2 mb-2 px-2">
                    <button
                      onClick={() => setShowDeletedUsers(false)}
                      className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-[2px] transition-all ${
                        !showDeletedUsers ? 'bg-emerald-950 text-white shadow-md' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                      }`}
                    >
                      Active Users ({users.length})
                    </button>
                    <button
                      onClick={() => setShowDeletedUsers(true)}
                      className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-[2px] transition-all ${
                        showDeletedUsers ? 'bg-emerald-950 text-white shadow-md' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                      }`}
                    >
                      Deleted Users ({overview.deleted_users.length})
                    </button>
                  </div>
                  <UserColumn
                    title={showDeletedUsers ? 'Deleted Users' : t('admin.signups.allUsersTitle')}
                    subtitle={showDeletedUsers ? 'Users that have been soft-deleted' : t('admin.signups.allUsersSubtitle')}
                    users={showDeletedUsers ? overview.deleted_users : users}
                    emptyLabel={showDeletedUsers ? 'No deleted users' : t('admin.signups.noUsers')}
                    onRefresh={fetchAll}
                    isDeleted={showDeletedUsers}
                  />
                </div>
              ) : (
                <ViewInsightsPanel
                  totalViews={overview.totals.views}
                  averageViews={viewInsights.averageViews}
                  buckets={viewInsights.buckets}
                  topViewed={viewInsights.topViewed}
                />
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
      className={`rounded-[18px] border p-2.5 text-left shadow-lg shadow-emerald-950/5 transition-colors ${clickable ? 'cursor-pointer' : 'cursor-default'} ${active ? 'border-emerald-800 bg-emerald-950 text-white' : 'border-white/70 bg-white/85 text-emerald-950'}`}
    >
      <div className="flex items-center justify-between">
        <div className={`flex h-8 w-8 items-center justify-center rounded-[12px] border shadow-sm ${active ? 'border-white/10 bg-white/10 [&>svg]:text-[#f5d989]' : 'border-emerald-900/5 bg-emerald-50'}`}>
          {icon}
        </div>
        <div className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-[#f5d989]' : 'bg-emerald-300'}`} />
      </div>
      <p className={`mt-2 text-[8px] font-black uppercase tracking-[2.5px] ${active ? 'text-white/45' : 'text-emerald-900/35'}`}>
        {label}
      </p>
      <p className={`mt-0.5 text-[1.2rem] font-black tracking-tight md:text-[1.35rem] ${active ? 'text-white' : 'text-emerald-950'}`}>
        {value}
      </p>
    </motion.button>
  );
};

const InviteRow = ({ invite, onRefresh, onDeleteOptimistic }) => {
  const { t, language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [rsvps, setRsvps] = useState([]);
  const [loadingRSVPs, setLoadingRSVPs] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [saving, setSaving] = useState(false);
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
        // Fallback for HTTP/non-secure contexts
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

  const handleDelete = async () => {
    setConfirmDelete(false);
    onDeleteOptimistic(invite.invite_uuid);
    setDeleting(true);

    try {
      await db.deleteOrder(invite.invite_uuid);
      await onRefresh();
    } catch (error) {
      window.alert(`${t('admin.feedback.deleteFailed')}: ${error.message}`);
      await onRefresh();
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${invite.groom_name} & ${invite.bride_name}`,
          url: shareUrl,
        });
      } catch (_) {
        // user cancelled
      }
    } else {
      // Fallback: copy to clipboard
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
      } catch (_) {
        // silently ignore
      }
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

  const handleSave = async () => {
    setSaving(true);

    try {
      await db.updateOrder(invite.invite_uuid, editForm);
      setIsEditing(false);
      await onRefresh();
    } catch (error) {
      window.alert(`${t('admin.feedback.saveFailed')}: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (key, value) => {
    setEditForm((prev) => ({
      ...prev,
      [key]: value,
    }));
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
              className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                className="w-full max-w-sm rounded-[28px] bg-white p-7 shadow-2xl text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 mx-auto mb-5">
                  <Trash2 size={24} className="text-red-500" />
                </div>
                <h3 className="text-lg font-black tracking-tight text-emerald-950 mb-2">{t('admin.invitation.deleteConfirmTitle')}</h3>
                <p className="text-sm font-medium text-emerald-900/55 mb-6">{t('admin.invitation.deleteConfirmDesc')}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 h-12 rounded-2xl border border-emerald-900/10 bg-white text-[11px] font-black uppercase tracking-[2px] text-emerald-900 hover:bg-emerald-50 transition-colors"
                  >
                    {t('admin.invitation.cancel')}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 h-12 rounded-2xl bg-red-500 text-[11px] font-black uppercase tracking-[2px] text-white hover:bg-red-600 transition-colors disabled:opacity-60"
                  >
                    {deleting ? t('admin.invitation.deleting') : t('admin.invitation.yesDelete')}
                  </button>
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
                    {t('admin.invitation.createdBy')}
                  </p>
                  <p className="mt-0.5 truncate text-[0.78rem] font-bold text-[#f5d989]">
                    {invite.user_email || t('admin.invitation.unknownUser')}
                  </p>
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-[1.1rem] font-black tracking-tight text-white md:text-[1.25rem]">
                    {invite.groom_name} <span className="font-light text-[#f5d989]">&</span> {invite.bride_name}
                  </h3>
                  {invite.created_at && (
                    <p className="mt-0.5 text-[6.5px] font-semibold text-white/40 uppercase tracking-[1.5px]">
                      {new Date(invite.created_at).toLocaleDateString()}
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

            {/* Delete button - laptop only, in the views-tile slot */}
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
                  label={deleting ? t('admin.invitation.deleting') : t('admin.invitation.delete')}
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
                  label={isExpanded ? t('admin.invitation.rsvpsClose') : t('admin.invitation.rsvpsOpen')}
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
                  label={t('admin.invitation.open')}
                  className="border-transparent bg-emerald-900 text-white shadow-lg shadow-emerald-950/15 hover:bg-emerald-800 xl:min-h-[2.3rem]"
                />

                <ActionButton
                  onClick={handleCopy}
                  icon={copied ? <Check size={14} /> : <Copy size={14} />}
                  label={copied ? t('admin.invitation.copied') : t('admin.invitation.copy')}
                  className={copied
                    ? 'border-emerald-700 bg-emerald-700 text-white xl:min-h-[2.3rem]'
                    : 'border-emerald-900/10 bg-white text-emerald-900 hover:bg-emerald-100 xl:min-h-[2.3rem]'}
                />

                <ActionButton
                  onClick={handleShare}
                  icon={<Share2 size={14} />}
                  label={t('admin.invitation.share')}
                  className="border-emerald-900/10 bg-white text-emerald-900 hover:bg-emerald-100 xl:min-h-[2.3rem]"
                />

                {/* Delete — mobile only; on laptop it lives in the views-tile slot */}
                <ActionButton
                  onClick={() => setConfirmDelete(true)}
                  disabled={deleting}
                  icon={<Trash2 size={14} />}
                  label={deleting ? t('admin.invitation.deleting') : t('admin.invitation.delete')}
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
              key="edit"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-emerald-900/10 bg-[#fffaf1]"
            >
              <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 lg:p-5">
                <Field label={t('admin.editor.groom')} value={editForm.groom_name} onChange={(value) => handleFieldChange('groom_name', value)} />
                <Field label={t('admin.editor.bride')} value={editForm.bride_name} onChange={(value) => handleFieldChange('bride_name', value)} />
                <Field label={t('admin.editor.date')} value={editForm.wedding_date} onChange={(value) => handleFieldChange('wedding_date', value)} />
                <Field label={t('admin.editor.time')} value={editForm.wedding_time} onChange={(value) => handleFieldChange('wedding_time', value)} />
                <Field label={t('admin.editor.locationName')} value={editForm.location_name} onChange={(value) => handleFieldChange('location_name', value)} />
                <Field label={t('admin.editor.locationUrl')} value={editForm.location_url} onChange={(value) => handleFieldChange('location_url', value)} />
                <Field label={t('admin.editor.musicUrl')} value={editForm.music_url} onChange={(value) => handleFieldChange('music_url', value)} />
                <Field label={t('admin.editor.imageUrl')} value={editForm.image_url} onChange={(value) => handleFieldChange('image_url', value)} />
                <Field label={t('admin.editor.phone')} value={editForm.phone} onChange={(value) => handleFieldChange('phone', value)} />
                <div className="md:col-span-2 lg:col-span-3">
                  <Area label={t('admin.editor.welcome')} value={editForm.welcome_text} onChange={(value) => handleFieldChange('welcome_text', value)} />
                </div>

                <div className="flex flex-wrap gap-2.5 md:col-span-2 lg:col-span-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex h-12 items-center gap-2 rounded-2xl bg-emerald-900 px-5 text-[10px] font-black uppercase tracking-[2px] text-white shadow-lg shadow-emerald-950/15 transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Save size={16} />
                    {saving ? t('admin.editor.saving') : t('admin.editor.save')}
                  </button>
                  <button
                    onClick={() => {
                      setEditForm(buildEditForm(invite));
                      setIsEditing(false);
                    }}
                    className="inline-flex h-12 items-center gap-2 rounded-2xl border border-emerald-900/10 bg-white px-5 text-[10px] font-black uppercase tracking-[2px] text-emerald-900 transition-colors hover:bg-emerald-50"
                  >
                    <X size={16} />
                    {t('admin.editor.cancel')}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {isExpanded ? (
            <motion.div
              key="rsvps"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-emerald-900/10 bg-emerald-50/60"
            >
              <div className="p-4 lg:p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[4px] text-emerald-900/35">
                      {t('admin.invitation.rsvpTitle')}
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-emerald-900/65">
                      {t('admin.invitation.rsvpDesc')}
                    </p>
                  </div>

                  <span className="rounded-full border border-emerald-900/10 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[2px] text-emerald-900/45">
                    {rsvps.length} {t('admin.invitation.responses')}
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
                      <div key={rsvp.id} className="rounded-[20px] border border-emerald-900/8 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[1rem] font-black tracking-tight text-emerald-950">
                            {rsvp.name}
                          </p>
                          <span className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[2px] ${rsvp.status === 'attending'
                            ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                            : 'border-red-100 bg-red-50 text-red-600'
                            }`}>
                            {rsvp.status === 'attending' ? t('admin.invitation.attending') : t('admin.invitation.declined')}
                          </span>
                        </div>
                        {rsvp.wish ? (
                          <p className="mt-3 rounded-2xl bg-emerald-50/70 p-3 text-sm font-medium leading-relaxed text-emerald-900/75">
                            “{rsvp.wish}”
                          </p>
                        ) : null}
                        <p className="mt-4 text-[10px] font-black uppercase tracking-[2px] text-emerald-900/35">
                          {formatLocalizedDateLabel(rsvp.created_at, language, t('admin.time.noDate'))}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyPanel label={t('admin.invitation.noRsvps')} compact={true} />
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.article>
    </>
  );
};

const UserColumn = ({ title, subtitle, users, emptyLabel, onRefresh, isDeleted }) => (
  <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white/88 shadow-lg shadow-emerald-950/5">
    <div className="border-b border-emerald-900/8 bg-emerald-50/70 px-5 py-4">
      <p className="text-[10px] font-black uppercase tracking-[3px] text-emerald-900/35">
        {title}
      </p>
      <p className="mt-1 text-sm font-semibold text-emerald-900/65">
        {subtitle}
      </p>
    </div>

    {users.length > 0 ? (
      <div className="max-h-[34rem] overflow-auto divide-y divide-emerald-900/8">
        {users.map((user) => (
          <UserListRow key={user.id} user={user} onRefresh={onRefresh} isDeleted={isDeleted} />
        ))}
      </div>
    ) : (
      <div className="px-5 py-12 text-center">
        <p className="text-[11px] font-black uppercase tracking-[4px] text-emerald-900/30">
          {emptyLabel}
        </p>
      </div>
    )}
  </div>
);

const SignupEmailComposer = ({
  senderEmail,
  setSenderEmail,
  emailSubject,
  setEmailSubject,
  emailBody,
  setEmailBody,
  recipientCount,
  onSaveSenderEmail,
  onOpenEmailDraft,
  onCopyRecipients,
  savingEmailSettings,
  copiedRecipients,
}) => (
  <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/88 shadow-lg shadow-emerald-950/5">
    <div className="border-b border-emerald-900/8 bg-emerald-50/70 px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[3px] text-emerald-900/35">
            Email Users
          </p>
          <p className="mt-1 text-sm font-semibold text-emerald-900/65">
            Open a draft to all signed-up users and keep a preferred sender email saved for later.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-emerald-800 shadow-sm">
          <Mail size={16} />
        </div>
      </div>
    </div>

    <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
      <Field label="Sender Email" value={senderEmail} onChange={setSenderEmail} />
      <Field label="Subject" value={emailSubject} onChange={setEmailSubject} />
      <div className="md:col-span-2">
        <Area label="Message" value={emailBody} onChange={setEmailBody} />
      </div>
      <div className="rounded-[20px] border border-emerald-900/10 bg-[#f8fbf8] px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[2px] text-emerald-900/35">
          Recipients
        </p>
        <p className="mt-1 text-sm font-semibold text-emerald-950">
          {recipientCount} signed up users
        </p>
        <p className="mt-2 text-sm leading-6 text-emerald-900/55">
          For now this opens your mail app with all users in `BCC`. The sender account is chosen by the mail app, and this saved sender email is kept for future setup.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onSaveSenderEmail}
          disabled={savingEmailSettings}
          className="inline-flex h-11 items-center gap-2 rounded-2xl border border-emerald-900/10 bg-white px-4 text-[10px] font-black uppercase tracking-[2px] text-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={15} />
          {savingEmailSettings ? 'Saving...' : 'Save Sender'}
        </button>
        <button
          type="button"
          onClick={onCopyRecipients}
          className="inline-flex h-11 items-center gap-2 rounded-2xl border border-emerald-900/10 bg-white px-4 text-[10px] font-black uppercase tracking-[2px] text-emerald-900"
        >
          <Copy size={15} />
          {copiedRecipients ? 'Copied' : 'Copy Emails'}
        </button>
        <button
          type="button"
          onClick={onOpenEmailDraft}
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-emerald-900 px-4 text-[10px] font-black uppercase tracking-[2px] text-white"
        >
          <Mail size={15} />
          Open Draft
        </button>
      </div>
    </div>
  </div>
);

const UserListRow = ({ user, onRefresh, isDeleted }) => {
  const { t, language } = useLanguage();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handleDelete = async () => {
    setConfirmDelete(false);
    setDeleting(true);
    try {
      await db.deleteUser(user.id);
      await onRefresh();
    } catch (error) {
      window.alert(`Delete failed: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await db.restoreUser(user.id);
      await onRefresh();
    } catch (error) {
      window.alert(`Restore failed: ${error.message}`);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <>
      {createPortal(
        <AnimatePresence>
          {confirmDelete && (
            <motion.div
              key="delete-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] flex items-center justify-center bg-emerald-950/40 backdrop-blur-md px-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-[340px] overflow-hidden rounded-[32px] bg-white p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] text-center border border-emerald-900/10"
              >
                <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-red-400/10 blur-[40px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-emerald-400/10 blur-[40px] pointer-events-none" />

                <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                  <div className="absolute inset-0 animate-ping rounded-full bg-red-100 opacity-60 duration-1000" />
                  <div className="absolute inset-2 rounded-full bg-red-50 border border-red-100 shadow-inner" />
                  <Trash2 size={28} className="relative z-10 text-red-500" strokeWidth={2.5} />
                </div>

                <h3 className="relative z-10 text-[1.3rem] font-black tracking-tight text-emerald-950 mb-3">
                  Delete User?
                </h3>
                <p className="relative z-10 text-[0.85rem] font-semibold leading-relaxed text-emerald-900/50 mb-8 px-2">
                  This user and all their invitations will be soft-deleted. They will not be able to log in.
                </p>

                <div className="relative z-10 flex flex-col gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full h-[3.25rem] rounded-[20px] bg-gradient-to-r from-red-500 to-red-600 text-[11px] font-black uppercase tracking-[2px] text-white shadow-lg shadow-red-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed border border-red-500/50"
                  >
                    {deleting ? t('dashboard.row.deleting') : t('dashboard.row.yesDelete')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setConfirmDelete(false)}
                    className="w-full h-[3.25rem] rounded-[20px] bg-emerald-50/50 border border-emerald-900/10 text-[11px] font-black uppercase tracking-[2px] text-emerald-900 hover:bg-emerald-50 transition-all"
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

      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="min-w-0 flex flex-col gap-0.5">
          <div className="truncate text-sm font-black text-emerald-950">
            {user.email}
          </div>
          <div className="text-[10px] font-black uppercase tracking-[2px] text-emerald-900/35">
            {formatLocalizedDateLabel(user.created_at, language, t('admin.time.noDate'))}
          </div>
        </div>
        
        <div className="shrink-0 flex items-center gap-2">
          {!isDeleted ? (
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={deleting}
              className="flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[1px] text-red-500 hover:bg-red-100 transition-colors disabled:opacity-60"
            >
              <Trash2 size={12} />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          ) : (
            <button
              onClick={handleRestore}
              disabled={restoring}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-900/10 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[1px] text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-60"
            >
              <RefreshCcw size={12} />
              {restoring ? 'Restoring...' : 'Restore'}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

const ViewInsightsPanel = ({ totalViews, averageViews, buckets, topViewed }) => {
  const { t } = useLanguage();

  return (
    <div className="mt-5 space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard value={buckets.no_views} label={t('admin.views.zero')} />
        <MetricCard value={buckets.lower_range} label={t('admin.views.lower')} />
        <MetricCard value={buckets.mid_range} label={t('admin.views.mid')} />
        <MetricCard value={buckets.higher_range} label={t('admin.views.high')} />
      </div>

      <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white/88 shadow-lg shadow-emerald-950/5">
        <div className="border-b border-emerald-900/8 bg-emerald-50/70 px-5 py-4">
          <p className="text-[10px] font-black uppercase tracking-[3px] text-emerald-900/35">
            {t('admin.views.summaryTitle')}
          </p>
          <p className="mt-1 text-sm font-semibold text-emerald-900/65">
            {t('admin.views.total')}: {totalViews} · {t('admin.views.average')}: {averageViews}
          </p>
        </div>

        {topViewed.length > 0 ? (
          <div className="divide-y divide-emerald-900/8">
            {topViewed.map((invite) => (
              <div key={invite.invite_uuid} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-emerald-950">
                    {invite.groom_name} & {invite.bride_name}
                  </p>
                  <p className="mt-1 truncate text-[10px] font-black uppercase tracking-[2px] text-emerald-900/35">
                    {invite.user_email || t('admin.invitation.unknownUser')}
                  </p>
                </div>
                <div className="shrink-0 rounded-full border border-emerald-900/10 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[2px] text-emerald-700">
                  {Number(invite.views_count) || 0} {t('admin.views.viewsLabel')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-[11px] font-black uppercase tracking-[4px] text-emerald-900/30">
              {t('admin.views.noViews')}
            </p>
          </div>
        )}
      </div>
    </div>
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

const MetricCard = ({ value, label, compact = false, highlighted = false }) => (
  <div className={`rounded-[16px] border px-3 py-1.5 ${highlighted ? 'border-emerald-300/60 bg-emerald-100/80' : 'border-emerald-900/8 bg-emerald-50/70'} ${compact ? 'px-3 py-1.5' : ''}`}>
    <p className="text-[8px] font-black uppercase tracking-[2px] text-emerald-900/35">
      {label}
    </p>
    <p className={`mt-0.5 font-black tracking-tight text-emerald-950 ${compact ? 'text-lg' : 'text-[1.05rem] md:text-[1.16rem]'}`}>
      {value}
    </p>
  </div>
);

const EmptyPanel = ({ label, compact = false }) => (
  <div className={`rounded-[28px] border-2 border-dashed border-emerald-900/10 bg-white/70 text-center ${compact ? 'py-14' : 'mt-5 py-20'}`}>
    <p className="text-[11px] font-black uppercase tracking-[4px] text-emerald-900/30">
      {label}
    </p>
  </div>
);

const Field = ({ label, value, onChange }) => (
  <div>
    <label className="mb-2 block text-[10px] font-black uppercase tracking-[2px] text-emerald-900/45">
      {label}
    </label>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 text-sm font-semibold text-emerald-950 outline-none transition-colors placeholder:text-emerald-900/25 focus:border-emerald-400"
    />
  </div>
);

const Area = ({ label, value, onChange }) => (
  <div>
    <label className="mb-2 block text-[10px] font-black uppercase tracking-[2px] text-emerald-900/45">
      {label}
    </label>
    <textarea
      rows={4}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-[24px] border border-emerald-900/10 bg-white px-4 py-3 text-sm font-semibold text-emerald-950 outline-none transition-colors placeholder:text-emerald-900/25 focus:border-emerald-400"
    />
  </div>
);

export default Admin;
