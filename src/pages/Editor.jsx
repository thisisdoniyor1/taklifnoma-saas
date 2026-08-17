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
  MessageCircle,
  Lock,
  Unlock,
  CheckCircle2,
} from 'lucide-react';
import { PAYMENT_CONFIG } from '../config';
import { useInvitation } from '../context/InvitationContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../lib/db';
import { getTemplateName } from '../lib/templates';
import { CustomDatePicker, CustomTimePicker, CustomLanguageSelect, CustomVenueInput } from '../components/CustomEditorPickers';

import m1 from '../music/AUDIO-2026-06-03-19-11-34.mp3';
import m2 from '../music/AUDIO-2026-06-03-19-18-12.mp3';
import m3 from '../music/British_Style_Floral_Design_Soft_Music_Save_the_Date_Wedding_Invite.mp3';
import m4 from '../music/Calming relaxing music 30 seconds.mp3';
import m5 from '../music/Destination_Save_the_Date_Video_Invitation,_World_Map_Digital_Animated.mp3';
import m6 from '../music/Electronic_Wedding_Invitation_Video_Virtual_Wedding_Invite_Rustic.mp3';

const DEFAULT_WELCOME_TEXT = 'We invite you to share in the joy of our wedding day. Your presence will make our celebration complete as we begin our new life together.';

const MUSIC_OPTIONS = [
  { id: 'romantic-audio-1', name: { en: 'Audio 1', ru: 'Аудио 1', uz_cyrl: 'Audio 1', tj: 'Аудио 1' }, url: m1 },
  { id: 'romantic-audio-2', name: { en: 'Audio 2', ru: 'Аудио 2', uz_cyrl: 'Audio 2', tj: 'Аудио 2' }, url: m2 },
  { id: 'british-floral', name: { en: 'Audio 3', ru: 'Аудио 3', uz_cyrl: 'Audio 3', tj: 'Аудио 3' }, url: m3 },
  { id: 'calming-relaxing', name: { en: 'Audio 4', ru: 'Аудио 4', uz_cyrl: 'Audio 4', tj: 'Аудио 4' }, url: m4 },
  { id: 'destination-animated', name: { en: 'Audio 5', ru: 'Аудио 5', uz_cyrl: 'Audio 5', tj: 'Аудио 5' }, url: m5 },
  { id: 'electronic-rustic', name: { en: 'Audio 6', ru: 'Аудио 6', uz_cyrl: 'Audio 6', tj: 'Аудио 6' }, url: m6 },
];

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(new Error('Failed to read file'));
  reader.readAsDataURL(file);
});

const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = String(event.target?.result || '');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Export to compressed JPEG to save bandwidth and load 10x faster
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
  });
};

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
  const [orderId, setOrderId] = useState(() => {
    try { return sessionStorage.getItem('editor_orderId') || null; } catch { return null; }
  });
  const [orderSlug, setOrderSlug] = useState(() => {
    try { return sessionStorage.getItem('editor_orderSlug') || null; } catch { return null; }
  });
  const [copiedBankId, setCopiedBankId] = useState(null);
  const [hasSentReceipt, setHasSentReceipt] = useState(false);

  // Handle new creation requests to clear out old order sessions
  useEffect(() => {
    if (location.state?.startNew) {
      try {
        sessionStorage.removeItem('editor_orderId');
        sessionStorage.removeItem('editor_orderSlug');
        sessionStorage.removeItem('editor_groomName');
        sessionStorage.removeItem('editor_brideName');
      } catch {}
      setOrderId(null);
      setOrderSlug(null);
      setHasSentReceipt(false);
      
      // Update history state to disable startNew flag on refresh
      navigate(location.pathname, {
        replace: true,
        state: {
          ...location.state,
          startNew: false,
        }
      });
    }
  }, [location.state, location.pathname, navigate]);

  // Persist orderId/orderSlug to sessionStorage so payment page survives refresh
  useEffect(() => {
    try {
      if (orderId) sessionStorage.setItem('editor_orderId', orderId);
      if (orderSlug) sessionStorage.setItem('editor_orderSlug', orderSlug);
    } catch {}
  }, [orderId, orderSlug]);

  useEffect(() => {
    if (orderId && typeof window !== 'undefined') {
      const isSent = localStorage.getItem(`receipt_sent_${orderId}`) === 'true';
      if (isSent) {
        setHasSentReceipt(true);
      }
    }
  }, [orderId]);
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

  const isValidDate = (dateStr) => {
    const regex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!regex.test(dateStr)) return false;
    const [dStr, mStr, yStr] = dateStr.split('.');
    const day = parseInt(dStr, 10);
    const month = parseInt(mStr, 10);
    const year = parseInt(yStr, 10);
    if (month < 1 || month > 12) return false;
    if (year < 1000 || year > 9999) return false;
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) return false;
    return true;
  };

  const isValidTime = (timeStr) => {
    const regex = /^\d{2}:\d{2}$/;
    if (!regex.test(timeStr)) return false;
    const [hStr, mStr] = timeStr.split(':');
    const hour = parseInt(hStr, 10);
    const minute = parseInt(mStr, 10);
    if (hour < 0 || hour > 23) return false;
    if (minute < 0 || minute > 59) return false;
    return true;
  };

  const getInputValueDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      const [d, m, y] = parts;
      if (y && m && d && y.length === 4) {
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
    }
    return '';
  };

  const handleDateChangeNative = (e) => {
    const val = e.target.value;
    if (val) {
      const [y, m, d] = val.split('-');
      const formatted = `${d}.${m}.${y}`;
      updateInvitation({ date: formatted });
      clearInvalidField('date');
    } else {
      updateInvitation({ date: '' });
    }
  };

  const handleTimeChangeNative = (e) => {
    const val = e.target.value;
    if (val) {
      updateInvitation({ time: val });
      clearInvalidField('time');
    } else {
      updateInvitation({ time: '' });
    }
  };

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
      const dataUrl = await compressImage(file);
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
    if (!isValidDate(dateStr)) {
      invalids.push('date');
    }

    const timeStr = String(invitationData.time || '').trim();
    if (!isValidTime(timeStr)) {
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
    const isDateInvalid = !isValidDate(dateStr);
    const isTimeInvalid = !isValidTime(timeStr);
    if (isDateInvalid) {
      setErrorMsg(copyText('editor.errors.invalidDate', 'Iltimos, haqiqiy sanani kiriting (masalan: 26.02.2027)!'));
    } else if (isTimeInvalid) {
      setErrorMsg(copyText('editor.errors.invalidTime', 'Iltimos, haqiqiy vaqtni kiriting (masalan: 18:00)!'));
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
        default_lang: invitationData.defaultLang || 'uz_cyrl',
      });

      if (!data?.invite_uuid) {
        throw new Error('Invitation creation failed');
      }

      setOrderId(data.invite_uuid);
      setOrderSlug(data.slug || data.invite_uuid);
      try {
        sessionStorage.setItem('editor_groomName', invitationData.groomName || '');
        sessionStorage.setItem('editor_brideName', invitationData.brideName || '');
      } catch {}
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

  const handleCopyBankCard = (cardNumber, bankId) => {
    try {
      navigator.clipboard.writeText(cardNumber.replace(/\s+/g, ''));
      setCopiedBankId(bankId);
      window.setTimeout(() => setCopiedBankId(null), 1800);
    } catch (_) {}
  };

  const handleWhatsAppSend = () => {
    const groom = invitationData.groomName || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('editor_groomName')) || 'Groom';
    const bride = invitationData.brideName || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('editor_brideName')) || 'Bride';
    const templateMsg = copyText('editor.payment.whatsappMessage', `Assalomu alaykum! Men bu taklifnoma uchun to'lov qildim ({groom} & {bride}):\n{link}\n\nMana to'lov skrinshotim.`);
    const text = templateMsg.replace('{groom}', groom).replace('{bride}', bride).replace('{link}', shareUrl);
    const whatsappUrl = `https://wa.me/${PAYMENT_CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
    
    window.open(whatsappUrl, '_blank');

    setHasSentReceipt(true);
    if (orderId) {
      localStorage.setItem(`receipt_sent_${orderId}`, 'true');
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
          <div className="relative flex flex-col items-center justify-center px-6 py-10 sm:py-14 text-center overflow-hidden bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#043427]">
            {/* Ambient gold glow circles */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-12 -left-12 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
              <div className="absolute -bottom-12 -right-12 h-56 w-56 rounded-full bg-gold-500/15 blur-3xl" />
            </div>

            {/* Status label pill */}
            {hasSentReceipt && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-400/30 backdrop-blur-md mb-4 shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-[3px] text-emerald-100">
                  {copyText('editor.payment.ready', 'Ready!')}
                </span>
              </motion.div>
            )}

            {/* Couple names — clean, high-contrast, beautiful typography */}
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-2 font-sans"
            >
              {invitationData.groomName || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('editor_groomName')) || 'Groom'}
              <span className="text-gold-400 font-serif italic mx-2.5 font-normal">&</span>
              {invitationData.brideName || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('editor_brideName')) || 'Bride'}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-emerald-100/70 text-xs sm:text-sm tracking-wide max-w-md mt-2 leading-relaxed"
            >
              {hasSentReceipt
                ? copyText('editor.payment.successDesc', 'Your invitation is active! Share your link with guests below.')
                : copyText('editor.payment.pendingDesc', 'Complete payment to activate your invitation link.')}
            </motion.p>
          </div>

          {/* ── Bank Transfer & WhatsApp Receipt Section ── */}
          <div className="px-4 py-5 sm:px-6 sm:py-8 border-b border-emerald-900/10 bg-[#f4faf6]">
            <div className="mb-4 sm:mb-6 text-center sm:text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-900/10 text-emerald-900 text-[8.5px] sm:text-[9px] font-black uppercase tracking-[2px] mb-1.5">
                {copyText('editor.payment.bankTitle', 'Payment & Activation')}
              </span>
              <p className="text-[11px] sm:text-xs font-semibold text-emerald-950/70 max-w-lg leading-relaxed">
                {copyText('editor.payment.bankDesc', 'Transfer payment to any bank card below, then send your payment screenshot via WhatsApp to activate your invitation.')}
              </p>
            </div>

            {/* Bank Card Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
              {PAYMENT_CONFIG.banks.map((bank) => {
                const isCopied = copiedBankId === bank.id;
                return (
                  <div
                    key={bank.id}
                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-emerald-900/12 shadow-xs flex flex-col justify-between hover:border-emerald-700/30 transition-all"
                  >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] sm:text-[11px] font-black text-emerald-950 uppercase tracking-wide">
                          {bank.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-emerald-50/60 py-2 px-3 rounded-lg sm:rounded-xl border border-emerald-900/5">
                        <p className="flex-1 text-xs sm:text-sm font-mono font-bold text-emerald-950 tracking-wider select-all text-center">
                          {bank.cardNumber}
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => handleCopyBankCard(bank.cardNumber, bank.id)}
                          className="shrink-0 p-1.5 rounded-lg hover:bg-emerald-200/60 transition-colors"
                          title={copyText('editor.payment.copyCard', 'Copy')}
                        >
                          {isCopied ? <Check size={16} className="text-emerald-700" /> : <Copy size={16} className="text-emerald-900/50" />}
                        </motion.button>
                      </div>
                  </div>
                );
              })}
            </div>

            {/* WhatsApp Direct Send Screenshot Button */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(37,211,102,0.4)' }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleWhatsAppSend}
              className="w-full h-14 px-5 rounded-xl sm:rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-[2px] shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <MessageCircle size={18} className="fill-current" />
              <span>{copyText('editor.payment.sendWhatsApp', 'Send Screenshot via WhatsApp')}</span>
            </motion.button>
          </div>

          {/* ── Share link row ── */}
          <div className="px-4 py-6 sm:px-6 border-b border-emerald-900/8 bg-[#fafdfb]">
            <p className="text-[9px] font-black uppercase tracking-[3px] text-emerald-900/35 mb-3">
              {copyText('editor.payment.couple', 'Your link')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <input
                readOnly
                value={hasSentReceipt ? shareUrl : ''}
                placeholder=""
                style={{ height: 56, minHeight: 56 }}
                className={`flex-1 rounded-2xl border-2 px-4 text-xs sm:text-sm font-semibold outline-none shadow-sm transition-all ${
                  hasSentReceipt
                    ? 'border-emerald-900/20 bg-white text-emerald-950'
                    : 'border-gray-200 bg-gray-100 text-gray-400 select-none cursor-not-allowed'
                }`}
              />
              <motion.button
                whileHover={hasSentReceipt ? { scale: 1.03 } : {}}
                whileTap={hasSentReceipt ? { scale: 0.97 } : {}}
                type="button"
                disabled={!hasSentReceipt}
                onClick={handleCopy}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 text-[10px] font-black uppercase tracking-[2px] transition-colors shrink-0 ${
                  hasSentReceipt
                    ? 'text-white shadow-md cursor-pointer'
                    : 'text-gray-400 bg-gray-200 cursor-not-allowed shadow-none border border-gray-300/40 opacity-60'
                }`}
                style={{ height: 56, minHeight: 56, ...(hasSentReceipt ? { backgroundColor: copied ? '#059669' : '#064e3b' } : {}) }}
              >
                {hasSentReceipt ? (copied ? <Check size={15} /> : <Copy size={15} />) : <Lock size={15} />}
                {copied ? copyText('editor.payment.copied', 'Copied!') : copyText('editor.payment.copyBtn', 'Copy link')}
              </motion.button>
            </div>

            {hasSentReceipt && (
              <div className="mt-4 p-4 rounded-2xl bg-[#ecfdf5] border border-emerald-500/30 text-emerald-950 flex items-start gap-3 shadow-xs">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-950 mb-1">
                    {copyText('editor.payment.activationPendingTitle', 'Invitation link is being activated')}
                  </p>
                  <p className="text-xs font-semibold leading-relaxed text-emerald-900/80">
                    {copyText('editor.payment.activationPendingDesc', 'Your link will be activated after we confirm the payment. You will be notified about confirmation on WhatsApp.')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Action buttons ── */}
          <div className="flex flex-col sm:flex-row gap-3 px-4 py-6 sm:px-6 bg-white">
            <motion.a
              whileHover={hasSentReceipt ? { scale: 1.02, y: -2 } : {}}
              whileTap={hasSentReceipt ? { scale: 0.97 } : {}}
              href={hasSentReceipt ? shareUrl : undefined}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                if (!hasSentReceipt) e.preventDefault();
              }}
              className={`flex-1 inline-flex items-center justify-center gap-2.5 rounded-2xl border-2 text-[11px] font-black uppercase tracking-[2.5px] transition-all ${
                hasSentReceipt
                  ? 'border-emerald-900/30 bg-[#f7fdf9] text-emerald-900 shadow-sm cursor-pointer'
                  : 'border-gray-200 bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed pointer-events-none'
              }`}
              style={{ height: 56, minHeight: 56 }}
            >
              {hasSentReceipt ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              ) : (
                <Lock size={16} />
              )}
              {copyText('editor.payment.viewInv', 'View Invitation')}
            </motion.a>

            <motion.button
              whileHover={hasSentReceipt ? { scale: 1.02, y: -2, boxShadow: '0 12px 32px -8px rgba(6,78,59,0.45)' } : {}}
              whileTap={hasSentReceipt ? { scale: 0.97 } : {}}
              type="button"
              disabled={!hasSentReceipt}
              onClick={() => {
                if (hasSentReceipt) navigate('/dashboard');
              }}
              className={`flex-1 inline-flex items-center justify-center gap-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[2.5px] transition-all ${
                hasSentReceipt
                  ? 'text-white shadow-lg cursor-pointer'
                  : 'text-gray-400 bg-gray-200 opacity-50 cursor-not-allowed'
              }`}
              style={{ height: 56, minHeight: 56, ...(hasSentReceipt ? { background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)' } : {}) }}
            >
              {hasSentReceipt ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
              ) : (
                <Lock size={16} />
              )}
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
                  placeholder={copyText('editor.placeholders.groom', 'Rustam')}
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
                  placeholder={copyText('editor.placeholders.bride', 'Madina')}
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

              <div className="md:col-span-2">
                <CustomLanguageSelect
                  label={copyText('editor.fields.defaultLang', 'Default Invitation Language')}
                  value={invitationData.defaultLang}
                  onChange={handleInputChange}
                  options={[
                    { value: 'uz_cyrl', label: 'O‘zbekcha' },
                    { value: 'ru', label: 'Русский' },
                    { value: 'en', label: 'English' },
                    { value: 'tj', label: 'Тоҷикӣ' },
                  ]}
                />
              </div>
            </div>
          </FormSection>

          <FormSection>
            <div className="grid gap-4 md:grid-cols-2">
              <div className={isErrorShaking && invalidFields.includes('date') ? 'input-shake' : ''}>
                <CustomDatePicker
                  required
                  label={copyText('editor.fields.date', 'Date')}
                  value={invitationData.date}
                  onChange={(newVal) => {
                    updateInvitation({ date: newVal });
                    clearInvalidField('date');
                  }}
                  placeholder={copyText('editor.placeholders.date', '26.02.2027')}
                  invalid={invalidFields.includes('date')}
                />
              </div>

              <div className={isErrorShaking && invalidFields.includes('time') ? 'input-shake' : ''}>
                <CustomTimePicker
                  required
                  label={copyText('editor.fields.time', 'Time')}
                  value={invitationData.time}
                  onChange={(newVal) => {
                    updateInvitation({ time: newVal });
                    clearInvalidField('time');
                  }}
                  placeholder={copyText('editor.placeholders.time', '18:00')}
                  invalid={invalidFields.includes('time')}
                />
              </div>

              <div className={isErrorShaking && invalidFields.includes('location') ? 'input-shake' : ''}>
                <CustomVenueInput
                  required
                  label={copyText('editor.fields.location', 'Venue')}
                  value={invitationData.location}
                  language={language}
                  onChange={(newVal) => {
                    updateInvitation({ location: newVal });
                    clearInvalidField('location');
                  }}
                  onSelectVenue={(venueName, venueUrl) => {
                    updateInvitation({
                      location: venueName,
                      locationUrl: venueUrl
                    });
                    clearInvalidField('location');
                  }}
                  placeholder={copyText('editor.placeholders.location', 'Wedding hall')}
                  invalid={invalidFields.includes('location')}
                />
              </div>

              <div>
                <EditorInput
                  label={copyText('editor.fields.locationUrl', 'Map Link')}
                  name="locationUrl"
                  value={invitationData.locationUrl}
                  onChange={handleInputChange}
                  placeholder={copyText('editor.placeholders.locationUrl', 'Paste Google/Apple Maps Share Link')}
                  icon={<Link2 size={16} strokeWidth={3} />}
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

const EditorInput = ({ label, name, value, onChange, placeholder, invalid = false, icon = null, onIconClick = null, type = "text", required = false }) => {
  const inputRef = React.useRef(null);
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[2px] text-emerald-950">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </span>
      <div 
        onClick={() => {
          if (type === 'date' || type === 'time') {
            try { inputRef.current?.showPicker(); } catch (e) {}
          }
        }}
        className={`flex min-h-[3.25rem] items-center gap-3 rounded-[18px] border-[1.5px] px-4 ${type === 'date' || type === 'time' ? 'cursor-pointer' : ''} ${invalid ? 'border-red-400 bg-red-50/70' : 'border-emerald-900/30 bg-white'}`}
      >
        {icon ? (
          <span
            onClick={(e) => {
              if (onIconClick) {
                e.stopPropagation();
                onIconClick();
              } else if (type === 'date' || type === 'time') {
                e.stopPropagation();
                try { inputRef.current?.showPicker(); } catch (err) {}
              }
            }}
            className="text-emerald-800 cursor-pointer hover:scale-110 active:scale-95 transition-transform shrink-0 flex items-center justify-center"
          >
            {icon}
          </span>
        ) : null}
        <input
          ref={inputRef}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`h-full w-full bg-transparent text-base font-semibold text-emerald-950 outline-none placeholder:text-emerald-900/40 ${type === 'date' || type === 'time' ? 'cursor-pointer' : ''}`}
        />
      </div>
    </label>
  );
};

const EditorSelect = ({ label, name, value, onChange, options, required = false }) => (
  <label className="block">
    <span className="mb-2 block text-[10px] font-black uppercase tracking-[2px] text-emerald-950">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </span>
    <div className="flex min-h-[3.25rem] items-center gap-3 rounded-[18px] border-[1.5px] border-emerald-900/30 bg-white px-4">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="h-full w-full bg-transparent text-base font-semibold text-emerald-950 outline-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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
      className="w-full rounded-[20px] border-[1.5px] border-emerald-900/30 bg-white px-4 py-4 text-base font-semibold text-emerald-950 outline-none placeholder:text-emerald-900/40"
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
