import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Check,
  Copy,
  ChevronDown,
  Image as ImageIcon,
  Link2,
  MapPin,
  Music4,
  Sparkles,
  Trash2,
  UploadCloud,
  Clock,
} from 'lucide-react';
import { useInvitation } from '../context/InvitationContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../lib/db';
import { getTemplateName } from '../lib/templates';

import m1 from '../music/AUDIO-2026-06-03-19-11-34.mp3';
import m2 from '../music/AUDIO-2026-06-03-19-18-12.mp3';
import m3 from '../music/British_Style_Floral_Design_Soft_Music_Save_the_Date_Wedding_Invite.mp3';
import m4 from '../music/Calming relaxing music 30 seconds.mp3';
import m5 from '../music/Destination_Save_the_Date_Video_Invitation,_World_Map_Digital_Animated.mp3';
import m6 from '../music/Electronic_Wedding_Invitation_Video_Virtual_Wedding_Invite_Rustic.mp3';

const DEFAULT_WELCOME_TEXT = 'We invite you to share in the joy of our wedding day. Your presence will make our celebration complete as we begin our new life together.';

const MUSIC_OPTIONS = [
  { id: 'romantic-audio-1', name: { en: 'Audio 1', ru: 'Аудио 1', uz_cyrl: 'Аудио 1', tj: 'Аудио 1' }, url: m1 },
  { id: 'romantic-audio-2', name: { en: 'Audio 2', ru: 'Аудио 2', uz_cyrl: 'Аудио 2', tj: 'Аудио 2' }, url: m2 },
  { id: 'british-floral', name: { en: 'Audio 3', ru: 'Аудио 3', uz_cyrl: 'Аудио 3', tj: 'Аудио 3' }, url: m3 },
  { id: 'calming-relaxing', name: { en: 'Audio 4', ru: 'Аудио 4', uz_cyrl: 'Аудио 4', tj: 'Аудио 4' }, url: m4 },
  { id: 'destination-animated', name: { en: 'Audio 5', ru: 'Аудио 5', uz_cyrl: 'Аудио 5', tj: 'Аудио 5' }, url: m5 },
  { id: 'electronic-rustic', name: { en: 'Audio 6', ru: 'Аудио 6', uz_cyrl: 'Аудио 6', tj: 'Аудио 6' }, url: m6 },
];

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(new Error('Failed to read file'));
  reader.readAsDataURL(file);
});

const buildInvitationUrl = (reference) => {
  if (!reference || typeof window === 'undefined') {
    return '';
  }

  return `${window.location.origin}/${reference}`;
};

const isYouTubeUrl = (value = '') => /(youtube\.com|youtu\.be)/i.test(String(value));

const resolveText = (t, key, fallback) => {
  const value = t(key);
  return value === key ? fallback : value;
};

const Editor = () => {
  const { t, language } = useLanguage();
  const { invitationData, updateInvitation, setActiveStep } = useInvitation();
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderSlug, setOrderSlug] = useState(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [invalidFields, setInvalidFields] = useState([]);
  const [isErrorShaking, setIsErrorShaking] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [isImageDragActive, setIsImageDragActive] = useState(false);
  const [isAudioDragActive, setIsAudioDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showMusicList, setShowMusicList] = useState(false);

  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const hiddenDateInputRef = useRef(null);
  const hiddenTimeInputRef = useRef(null);

  const copyText = useCallback((key, fallback) => resolveText(t, key, fallback), [t]);
  const shareUrl = useMemo(() => buildInvitationUrl(orderSlug || orderId), [orderId, orderSlug]);
  const templateId = location.state?.templateId || invitationData.templateId || 'envelope-classic';

  const templateName = useMemo(() => {
    const rawName = getTemplateName(templateId);
    const localized = t(`templates_catalog.${templateId}.name`);
    return localized !== `templates_catalog.${templateId}.name` ? localized : rawName;
  }, [templateId, t]);

  const selectedTrack = useMemo(() => {
    return MUSIC_OPTIONS.find((option) => option.url === invitationData.musicUrl);
  }, [invitationData.musicUrl]);

  const selectedTrackLabel = useMemo(() => {
    if (!selectedTrack) {
      return copyText('editor.upload.chooseMusic', 'Choose Music');
    }
    return selectedTrack.name[language] || selectedTrack.name.en;
  }, [selectedTrack, language, copyText]);

  useEffect(() => {
    setActiveStep(1);
    updateInvitation({
      templateId,
      groomName: '',
      brideName: '',
      date: '',
      time: '',
      location: '',
      locationUrl: '',
      musicUrl: '',
      image_url: '',
      images: [],
      welcomeText: '',
      phone: '',
    });
    
    // Scroll to top when opening the editor
    window.scrollTo(0, 0);
  }, [setActiveStep, templateId, updateInvitation]);

  const clearInvalidField = (fieldName) => {
    setInvalidFields((previous) => previous.filter((field) => field !== fieldName));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    updateInvitation({ [name]: value });
    clearInvalidField(name);
  };

  const processImageFile = useCallback(async (file) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMsg(copyText('editor.errors.photoType', 'Please choose an image file.'));
      setIsImageDragActive(false);
      return;
    }

    setErrorMsg('');
    setUploadingImage(true);

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const response = await db.uploadImage({
        dataUrl,
        fileName: file.name || 'invitation-photo.png',
        mimeType: file.type,
      });

      updateInvitation({ image_url: response?.url || '' });
    } catch (error) {
      console.error(error);
      setErrorMsg(copyText('editor.errors.photoUpload', 'Photo upload failed. Please try again.'));
    } finally {
      setUploadingImage(false);
      setIsImageDragActive(false);
    }
  }, [copyText, updateInvitation]);

  const processAudioFile = useCallback(async (file) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('audio/')) {
      setErrorMsg(copyText('editor.errors.musicType', 'Please choose an audio file.'));
      setIsAudioDragActive(false);
      return;
    }

    setErrorMsg('');
    setUploadingAudio(true);

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const response = await db.uploadAudio({
        dataUrl,
        fileName: file.name || 'invitation-music.mp3',
        mimeType: file.type,
      });

      updateInvitation({ musicUrl: response?.url || '' });
    } catch (error) {
      console.error(error);
      setErrorMsg(copyText('editor.errors.musicUpload', 'Music upload failed. Please try again.'));
    } finally {
      setUploadingAudio(false);
      setIsAudioDragActive(false);
    }
  }, [copyText, updateInvitation]);

  const handleImageFileInputChange = async (event) => {
    const file = event.target.files?.[0];

    if (file) {
      await processImageFile(file);
    }

    event.target.value = '';
  };

  const handleAudioFileInputChange = async (event) => {
    const file = event.target.files?.[0];

    if (file) {
      await processAudioFile(file);
    }

    event.target.value = '';
  };

  const handleImageDrop = async (event) => {
    event.preventDefault();
    setIsImageDragActive(false);

    if (uploadingImage) {
      return;
    }

    const file = Array.from(event.dataTransfer?.files || []).find((entry) => entry.type.startsWith('image/'));

    if (file) {
      await processImageFile(file);
    }
  };

  const handleAudioDrop = async (event) => {
    event.preventDefault();
    setIsAudioDragActive(false);

    if (uploadingAudio) {
      return;
    }

    const file = Array.from(event.dataTransfer?.files || []).find((entry) => entry.type.startsWith('audio/'));

    if (file) {
      await processAudioFile(file);
    }
  };

  const handleWindowPaste = useCallback(async (event) => {
    if (uploadingImage || orderId) {
      return;
    }

    const imageItem = Array.from(event.clipboardData?.items || []).find((item) => item.type.startsWith('image/'));

    if (!imageItem) {
      return;
    }

    const file = imageItem.getAsFile();

    if (!file) {
      return;
    }

    event.preventDefault();
    await processImageFile(file);
  }, [orderId, processImageFile, uploadingImage]);

  useEffect(() => {
    if (orderId) {
      return undefined;
    }

    window.addEventListener('paste', handleWindowPaste);

    return () => {
      window.removeEventListener('paste', handleWindowPaste);
    };
  }, [handleWindowPaste, orderId]);

  const validateForm = () => {
    const invalids = [];

    if (!String(invitationData.groomName || '').trim()) {
      invalids.push('groomName');
    }

    if (!String(invitationData.brideName || '').trim()) {
      invalids.push('brideName');
    }

    const dateStr = String(invitationData.date || '').trim();
    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!dateStr || !dateRegex.test(dateStr)) {
      invalids.push('date');
    }

    const timeStr = String(invitationData.time || '').trim();
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeStr || !timeRegex.test(timeStr)) {
      invalids.push('time');
    }

    if (!String(invitationData.location || '').trim()) {
      invalids.push('location');
    }

    if (invalids.length === 0) {
      setErrorMsg('');
      return true;
    }

    setInvalidFields(invalids);
    
    // Check if format error exists
    const isDateInvalid = !dateStr || !dateRegex.test(dateStr);
    const isTimeInvalid = !timeStr || !timeRegex.test(timeStr);
    if (isDateInvalid || isTimeInvalid) {
      setErrorMsg('Please input the date (DD.MM.YYYY) and time (HH:MM) correctly.');
    } else if (invalids.every((field) => field === 'groomName' || field === 'brideName')) {
      setErrorMsg(copyText('editor.errors.names', 'Please enter both names fully!'));
    } else {
      setErrorMsg(copyText('editor.errors.details', 'Please do not forget the date and venue details.'));
    }
    
    setIsErrorShaking(true);
    window.setTimeout(() => setIsErrorShaking(false), 420);
    
    // Scroll to the first invalid field
    setTimeout(() => {
      const firstError = document.querySelector('.input-shake');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    
    return false;
  };

  const handleSaveOrder = async () => {
    if (!user) {
      window.alert(copyText('auth.loginFirst', 'Please log in first to create a template.'));
      window.dispatchEvent(new CustomEvent('open-login-modal'));
      return;
    }

    if (uploadingImage || uploadingAudio || !validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data = await db.createOrder({
        template_id: templateId,
        groom_name: invitationData.groomName,
        bride_name: invitationData.brideName,
        wedding_date: invitationData.date,
        wedding_time: invitationData.time,
        location_name: invitationData.location,
        location_url: invitationData.locationUrl,
        welcome_text: invitationData.welcomeText,
        music_url: invitationData.musicUrl,
        image_url: invitationData.image_url,
        phone: invitationData.phone,
        user_id: user.id,
      });

      if (!data?.invite_uuid) {
        throw new Error('Invitation creation failed');
      }

      setOrderId(data.invite_uuid);
      setOrderSlug(data.slug || data.invite_uuid);
      setActiveStep(5);
    } catch (error) {
      console.error(error);
      const message = error?.message || 'Invitation creation failed';
      setErrorMsg(message);
      window.alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      
      // Warning for local dev
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.alert('Eslatma: "localhost" havolasi faqat sizning kompyuteringizda ishlaydi. Boshqalarga yuborish uchun loyihani serverga yuklash kerak.');
      }
    } catch (_) {
      // fallback handled by navigator.clipboard usually but we can add more if needed
    }
  };

  if (orderId) {
    return (
      <EditorShell>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[36px] bg-white shadow-[0_40px_100px_-30px_rgba(6,78,59,0.22)] border border-emerald-900/10"
        >
          {/* ── Celebration hero banner ── */}
          <div className="relative flex flex-col items-center justify-center px-6 py-16 text-center overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #0d7254 70%, #1a5c3f 100%)' }}
          >
            {/* Decorative glow blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" />
              <div className="absolute -bottom-16 -right-8 h-72 w-72 rounded-full bg-yellow-300/10 blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
            </div>

            {/* Animated sparkle ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              className="relative mb-8"
            >
              <div className="h-24 w-24 rounded-full border border-white/15 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full border border-white/25 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Sparkles size={28} className="text-yellow-300" />
                  </motion.div>
                </div>
              </div>
              {/* Orbit dots */}
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <div key={deg} className="absolute inset-0 flex items-start justify-center"
                  style={{ transform: `rotate(${deg}deg)` }}>
                  <div className="h-1.5 w-1.5 -mt-0.5 rounded-full bg-yellow-300/70" />
                </div>
              ))}
            </motion.div>

            {/* Status label */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[10px] font-black uppercase tracking-[5px] text-emerald-300 mb-5"
            >
              {copyText('editor.payment.ready', 'Ready')}
            </motion.p>

            {/* Couple names — large */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="text-white leading-tight mb-2"
              style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(2.4rem, 8vw, 4rem)' }}
            >
              {invitationData.groomName || 'Groom'}
              <span className="text-yellow-300 mx-3 not-italic" style={{ fontStyle: 'normal', fontSize: '60%', verticalAlign: 'middle' }}>&</span>
              {invitationData.brideName || 'Bride'}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="text-white/55 text-sm tracking-wide max-w-sm mt-4"
            >
              {copyText('editor.payment.successDesc', 'Your invitation is live. Share it with your guests!')}
            </motion.p>
          </div>

          {/* ── Share link row ── */}
          <div className="px-6 py-6 border-b border-emerald-900/8 bg-[#fafdfb]">
            <p className="text-[9px] font-black uppercase tracking-[3px] text-emerald-900/35 mb-3">
              {copyText('editor.payment.couple', 'Your link')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 h-12 rounded-2xl border border-emerald-900/12 bg-white px-4 text-sm font-semibold text-emerald-950 outline-none shadow-sm"
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleCopy}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-6 text-[10px] font-black uppercase tracking-[2px] text-white shadow-md transition-colors shrink-0"
                style={{ backgroundColor: copied ? '#059669' : '#064e3b' }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? copyText('editor.payment.copied', 'Copied!') : copyText('editor.payment.copyBtn', 'Copy link')}
              </motion.button>
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div className="flex flex-col sm:flex-row gap-4 px-6 py-6 bg-white">
            <motion.a
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl border-2 border-emerald-900/15 bg-[#f7fdf9] text-[11px] font-black uppercase tracking-[2.5px] text-emerald-900 shadow-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              {copyText('editor.payment.viewInv', 'View Invitation')}
            </motion.a>

            <motion.button
              whileHover={{ scale: 1.02, y: -2, boxShadow: '0 12px 32px -8px rgba(6,78,59,0.45)' }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[2.5px] text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              {copyText('dashboard.title', 'My Dashboard')}
            </motion.button>
          </div>
        </motion.div>
      </EditorShell>
    );
  }

  return (
    <EditorShell>
      <style>{`
        .input-shake {
          animation: editorShake 0.38s ease-in-out;
        }

        @keyframes editorShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          50% { transform: translateX(6px); }
          75% { transform: translateX(-4px); }
        }

        @keyframes eqBar {
          0%, 100% { height: 4px; }
          50% { height: 14px; }
        }
        .eq-bar-1 { animation: eqBar 0.6s ease-in-out infinite; }
        .eq-bar-2 { animation: eqBar 0.8s ease-in-out infinite; animation-delay: 0.15s; }
        .eq-bar-3 { animation: eqBar 0.5s ease-in-out infinite; animation-delay: 0.3s; }
      `}</style>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[30px] border-[3px] border-emerald-900/10 bg-white shadow-[0_30px_80px_-50px_rgba(6,78,59,0.34)] w-full"
      >
        <div className="border-b border-emerald-900/10 bg-[#F8FAF9] px-5 py-5 md:px-6 rounded-t-[27px]">
          <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 md:gap-6">
            <div className="md:col-span-3">
              <p className="text-[10px] font-black uppercase tracking-[3px] text-emerald-900/50">
                {copyText('editor.payment.formTitle', 'Invitation Form')}
              </p>
              <h1 className="mt-2 text-[1.65rem] font-black tracking-tight text-emerald-950 md:text-[1.9rem]">
                {copyText('editor.payment.formSubtitle', 'Fill everything on one page')}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-emerald-900/60">
                {copyText('editor.payment.formDesc', 'Add the names, event details, photo, and optional music here. When it is ready, create the invitation at the bottom.')}
              </p>
            </div>

            <div className="md:col-span-1 flex md:justify-end">
              <div className="rounded-[20px] border border-emerald-900/12 bg-white px-4 py-3 w-full md:max-w-[180px]">
                <p className="text-[9px] font-black uppercase tracking-[2px] text-emerald-900/35">
                  {copyText('editor.payment.templateLabel', 'Template')}
                </p>
                <p className="mt-1 text-sm font-black text-emerald-950 font-medium">
                  {templateName}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5 md:p-6">
          <FormSection>
            <div className="grid gap-4 md:grid-cols-2">
              <div className={isErrorShaking && invalidFields.includes('groomName') ? 'input-shake' : ''}>
                <EditorInput
                  required
                  label={copyText('editor.fields.groom', "Groom's Name")}
                  name="groomName"
                  value={invitationData.groomName}
                  onChange={handleInputChange}
                  placeholder={copyText('editor.placeholders.groom', 'Doniyor')}
                  invalid={invalidFields.includes('groomName')}
                />
              </div>

              <div className={isErrorShaking && invalidFields.includes('brideName') ? 'input-shake' : ''}>
                <EditorInput
                  required
                  label={copyText('editor.fields.bride', "Bride's Name")}
                  name="brideName"
                  value={invitationData.brideName}
                  onChange={handleInputChange}
                  placeholder={copyText('editor.placeholders.bride', 'Iroda')}
                  invalid={invalidFields.includes('brideName')}
                />
              </div>

              <div className="md:col-span-2">
                <EditorTextarea
                  label={copyText('editor.fields.welcome', 'Welcome Text')}
                  name="welcomeText"
                  value={invitationData.welcomeText}
                  onChange={handleInputChange}
                  placeholder={t('invitation.speech')}
                />
              </div>
            </div>
          </FormSection>

          <FormSection>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="date"
                ref={hiddenDateInputRef}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
                onChange={(e) => {
                  const dateVal = e.target.value;
                  if (dateVal) {
                    const [y, m, d] = dateVal.split('-');
                    const formatted = `${d}.${m}.${y}`;
                    updateInvitation({ date: formatted });
                    clearInvalidField('date');
                  }
                }}
              />
              <input
                type="time"
                ref={hiddenTimeInputRef}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
                onChange={(e) => {
                  const timeVal = e.target.value;
                  if (timeVal) {
                    updateInvitation({ time: timeVal });
                    clearInvalidField('time');
                  }
                }}
              />

              <div className={isErrorShaking && invalidFields.includes('date') ? 'input-shake' : ''}>
                <EditorInput
                  required
                  label={copyText('editor.fields.date', 'Date')}
                  name="date"
                  type="text"
                  value={invitationData.date}
                  onChange={handleInputChange}
                  placeholder={copyText('editor.placeholders.date', '26.02.2027')}
                  icon={<Calendar size={16} strokeWidth={3} />}
                  onIconClick={() => hiddenDateInputRef.current && hiddenDateInputRef.current.showPicker()}
                  invalid={invalidFields.includes('date')}
                />
              </div>

              <div className={isErrorShaking && invalidFields.includes('time') ? 'input-shake' : ''}>
                <EditorInput
                  required
                  label={copyText('editor.fields.time', 'Time')}
                  name="time"
                  type="text"
                  value={invitationData.time}
                  onChange={handleInputChange}
                  placeholder={copyText('editor.placeholders.time', '18:00')}
                  icon={<Clock size={16} strokeWidth={3} />}
                  onIconClick={() => hiddenTimeInputRef.current && hiddenTimeInputRef.current.showPicker()}
                  invalid={invalidFields.includes('time')}
                />
              </div>

              <div className={isErrorShaking && invalidFields.includes('location') ? 'input-shake' : ''}>
                <EditorInput
                  required
                  label={copyText('editor.fields.location', 'Venue')}
                  name="location"
                  value={invitationData.location}
                  onChange={handleInputChange}
                  placeholder={copyText('editor.placeholders.location', 'Wedding hall')}
                  icon={<MapPin size={16} strokeWidth={3} />}
                  invalid={invalidFields.includes('location')}
                />
              </div>

              <div className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[2px] text-emerald-950">
                  {copyText('editor.fields.photoMusicSection', 'Music')}
                </span>
                <div className="relative z-50">
                  <button
                    type="button"
                    onClick={() => setShowMusicList((prev) => !prev)}
                    className="flex w-full items-center justify-between rounded-[18px] border-2 border-emerald-900/20 bg-white px-4 min-h-[3.25rem] text-sm font-extrabold text-emerald-950 shadow-sm transition-all hover:border-emerald-900/40 hover:bg-[#F8FAF9] focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-800">
                        <Music4 size={16} strokeWidth={3} className={previewUrl ? "animate-pulse text-emerald-800" : ""} />
                      </span>
                      <span className="text-emerald-950 font-medium">
                        {selectedTrackLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {invitationData.musicUrl && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            updateInvitation({ musicUrl: '' });
                            if (previewUrl) setPreviewUrl(null);
                          }}
                          className="rounded-lg bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600 transition-colors hover:bg-red-100 cursor-pointer"
                        >
                          {copyText('editor.upload.removeMusic', 'Remove')}
                        </span>
                      )}
                      <ChevronDown
                        size={16}
                        className={`text-emerald-900/45 transition-transform duration-300 ${
                          showMusicList ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {previewUrl && (
                    <audio
                      src={previewUrl}
                      autoPlay
                      loop
                      ref={(el) => {
                        if (el) {
                          el.volume = 0.4;
                        }
                      }}
                    />
                  )}
                </div>
              </div>

              <AnimatePresence>
                {showMusicList && (
                  <motion.div
                    key="music-list"
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden mt-2 rounded-[16px] border-2 border-emerald-900/10 bg-white shadow-lg w-full md:col-span-2"
                  >
                    <div className="border-b border-emerald-900/10 bg-[#F8FAF9] px-4 py-2.5 rounded-t-[14px]">
                      <p className="text-[9px] font-black uppercase tracking-[3px] text-emerald-900/50">
                        {copyText('editor.fields.photoMusicSection', 'Music Selection')}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 p-2.5">
                      {MUSIC_OPTIONS.map((option) => {
                        const isSelected = invitationData.musicUrl === option.url;
                        const isPlaying = previewUrl === option.url;
                        const label = option.name[language] || option.name.en;

                        return (
                          <div
                            key={option.id}
                            onClick={() => {
                              updateInvitation({ musicUrl: option.url });
                              setPreviewUrl(option.url);
                            }}
                            className={`flex flex-col items-center justify-between rounded-xl border-[1.5px] p-2.5 w-full transition-all cursor-pointer select-none ${
                              isSelected
                                ? 'border-emerald-800 bg-emerald-50 text-emerald-950 shadow-sm'
                                : 'border-emerald-900/10 bg-white text-emerald-900/80 hover:border-emerald-900/30 hover:bg-emerald-50/30'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-1.5">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isSelected ? 'bg-emerald-900 text-white' : 'bg-emerald-100/50 text-emerald-800'}`}>
                                <Music4 size={12} strokeWidth={3} />
                              </div>
                              <span className="text-[10px] font-black tracking-wider uppercase text-center whitespace-nowrap">{label}</span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isPlaying) {
                                  setPreviewUrl(null);
                                } else {
                                  updateInvitation({ musicUrl: option.url });
                                  setPreviewUrl(option.url);
                                }
                              }}
                              className={`flex h-6 w-6 items-center justify-center rounded-full transition-all border-2 mt-2 ${
                                isPlaying
                                  ? 'border-emerald-800 bg-emerald-900 text-white'
                                  : 'border-emerald-900/20 bg-white text-emerald-800 hover:bg-emerald-50'
                              }`}
                            >
                              {isPlaying ? (
                                <div className="flex gap-[1.5px] items-end justify-center h-2.5 w-2.5">
                                  <span className="w-[1.5px] bg-current eq-bar-1 h-2.5" />
                                  <span className="w-[1.5px] bg-current eq-bar-2 h-1.5" />
                                  <span className="w-[1.5px] bg-current eq-bar-3 h-3" />
                                </div>
                              ) : (
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 ml-[1.5px]">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <div className="p-3 border-t border-emerald-900/10 bg-[#F8FAF9]">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMusicList(false);
                          setPreviewUrl(null);
                        }}
                        className="w-full flex h-9 items-center justify-center rounded-xl bg-emerald-900 px-4 font-bold uppercase tracking-[2px] text-white shadow-sm transition-all hover:bg-emerald-800 text-[10px]"
                      >
                        {copyText('editor.upload.closeBtn', 'Close')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </FormSection>

          {errorMsg ? (
            <p className="text-sm font-bold text-red-500">
              {errorMsg}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 rounded-[24px] border border-emerald-900/12 bg-emerald-50/70 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[2px] text-emerald-900/35">
                {copyText('editor.payment.finalStep', 'Final Step')}
              </p>
              <p className="mt-1 text-sm font-semibold text-emerald-900/65">
                {copyText('editor.payment.finalStepDesc', 'Fill the required fields above, then create the invitation.')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveOrder}
              disabled={loading || uploadingImage || uploadingAudio}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-900 px-5 text-[10px] font-black uppercase tracking-[2px] text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles size={16} />
              {loading ? copyText('editor.payment.saving', 'Saving...') : copyText('editor.payment.saveBtn', 'Create Invitation')}
            </button>
          </div>
        </div>
      </motion.section>
    </EditorShell>
  );
};

const EditorShell = ({ children }) => (
  <div className="relative min-h-screen w-full bg-[#F8FAF9] overflow-x-hidden">
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute left-[-12%] top-[-14%] h-[28rem] w-[28rem] rounded-full bg-emerald-200/50 blur-[120px]" />
      <div className="absolute bottom-[-18%] right-[-12%] h-[30rem] w-[30rem] rounded-full bg-[#f4d67f]/32 blur-[130px]" />
    </div>

    <div className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-10 pt-28 md:px-6 md:pt-32">
      {children}
    </div>
  </div>
);

const FormSection = ({ title = null, children }) => (
  <div className="py-6 border-b border-emerald-900/10 last:border-b-0">
    {title && (
      <p className="text-xs font-black uppercase tracking-[2px] text-emerald-950">
        {title}
      </p>
    )}
    <div className={title ? "mt-4" : ""}>
      {children}
    </div>
  </div>
);

const EditorInput = ({ label, name, value, onChange, placeholder, invalid = false, icon = null, onIconClick = null, type = "text", required = false }) => (
  <label className="block">
    <span className="mb-2 block text-[10px] font-black uppercase tracking-[2px] text-emerald-950">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </span>
    <div className={`flex min-h-[3.25rem] items-center gap-3 rounded-[18px] border-[1.5px] px-4 ${invalid ? 'border-red-400 bg-red-50/70' : 'border-emerald-900/30 bg-white'}`}>
      {icon ? (
        <span
          onClick={onIconClick}
          className={onIconClick ? "text-emerald-800 cursor-pointer hover:scale-110 active:scale-95 transition-transform shrink-0 flex items-center justify-center" : "text-emerald-800 shrink-0 flex items-center justify-center"}
        >
          {icon}
        </span>
      ) : null}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-full w-full bg-transparent text-sm font-semibold text-emerald-950 outline-none placeholder:text-emerald-900/40"
      />
    </div>
  </label>
);

const EditorTextarea = ({ label, name, value, onChange, placeholder, required = false }) => (
  <label className="block">
    <span className="mb-2 block text-[10px] font-black uppercase tracking-[2px] text-emerald-950">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </span>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={5}
      className="w-full rounded-[20px] border-[1.5px] border-emerald-900/30 bg-white px-4 py-4 text-sm font-semibold text-emerald-950 outline-none placeholder:text-emerald-900/40"
    />
  </label>
);

const MediaCard = ({ title, badge, children }) => (
  <div className="rounded-[20px] border border-emerald-900/12 bg-[#fffaf1] p-3.5">
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="text-[10px] font-black uppercase tracking-[2px] text-emerald-900/35">
        {title}
      </p>
      <span className="rounded-full border border-emerald-900/10 bg-white px-3 py-1 text-[9px] font-black uppercase tracking-[2px] text-emerald-900/55">
        {badge}
      </span>
    </div>
    {children}
  </div>
);

const EmptyDropzoneState = ({ icon, title, description, className = '' }) => (
  <div className={`flex min-h-[8rem] flex-col items-center justify-center gap-2.5 ${className}`}>
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
      {icon}
    </div>
    <p className="text-[0.95rem] font-black tracking-tight text-emerald-950">
      {title}
    </p>
    <p className="max-w-sm text-[13px] leading-5 text-emerald-900/55 px-2">
      {description}
    </p>
  </div>
);

export default Editor;
