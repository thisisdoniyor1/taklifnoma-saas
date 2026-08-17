import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/db';
import TemplateManager from '../components/TemplateManager';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Clock, MessageCircle } from 'lucide-react';
import { PAYMENT_CONFIG } from '../config';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';

const translateText = async (text, targetLang) => {
  if (!text || !text.trim()) return '';
  let tl = 'uz';
  if (targetLang === 'ru') tl = 'ru';
  else if (targetLang === 'en') tl = 'en';
  else if (targetLang === 'tj') tl = 'tg';
  else if (targetLang === 'uz_cyrl') tl = 'uz';

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0].map(x => x[0]).join('');
    }
  } catch (e) {
    console.error('Translation failed:', e);
  }
  return text;
};

const InvitationView = () => {
  const params = useParams();
  const { t, language, setLanguage } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Initializing...');
  const [translatedWelcome, setTranslatedWelcome] = useState({});
  const [currentWelcomeText, setCurrentWelcomeText] = useState('');

  const invitationRef = useMemo(() => {
    const wildcardId = String(params['*'] || '').trim();
    const directId = String(params.id || '').trim();
    const nestedId = params.slugPrefix && params.slugName
      ? `${String(params.slugPrefix).trim()}/${String(params.slugName).trim()}`
      : '';
    return wildcardId || nestedId || directId;
  }, [params]);

  useEffect(() => {
    if (!invitationRef) {
      setData(null);
      setLoading(false);
      setStatus('Xatolik: Taklifnoma topilmadi');
      return undefined;
    }

    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        setStatus("Xatolik: Tarmoq vaqti tugadi");
        setLoading(false);
      }
    }, 10000);

    const fetchInvitationData = async () => {
      try {
        const cleanId = invitationRef;
        setStatus(`Qidirilmoqda...`); // Searching...

        // Parallel fetch for better performance
        const [backendData, rsvpData] = await Promise.all([
          db.getOrder(cleanId),
          db.getRSVPs(cleanId)
        ]);

        if (!backendData) {
          throw new Error("Taklifnoma topilmadi");
        }

        setStatus(`Ma'lumotlar yuklanmoqda...`);

        let rsvps = Array.isArray(rsvpData) ? rsvpData : [];

        setStatus(`Tayyorlanmoqda...`);

        const transformedData = {
          templateId: backendData.template_id,
          groomName: backendData.groom_name,
          brideName: backendData.bride_name,
          date: backendData.wedding_date,
          time: backendData.wedding_time,
          location: backendData.location_name,
          locationUrl: backendData.location_url || `https://maps.google.com/?q=${encodeURIComponent(backendData.location_name || '')}`,
          welcomeText: backendData.welcome_text,
          musicUrl: backendData.music_url,
          image_url: backendData.image_url,
          status: backendData.status,
          defaultLang: backendData.default_lang || 'uz_cyrl',
          isRealInvitation: true,
          rsvps
        };

        if (!isMounted) return;

        setData(transformedData);

        if (backendData.default_lang) {
          setLanguage(backendData.default_lang);
        }

        // Background view increment - only once per device
        try {
          const viewKey = `viewed_invite_${cleanId}`;
          if (!localStorage.getItem(viewKey)) {
            db.incrementView(cleanId)
              .then(() => {
                try { localStorage.setItem(viewKey, 'true'); } catch (err) {}
              })
              .catch(() => { });
          }
        } catch (e) {
          // Fallback if localStorage is disabled/blocked (e.g. private mode)
          db.incrementView(cleanId).catch(() => { });
        }

        setLoading(false);
        clearTimeout(timeoutId);

        // Confetti after render
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#C2A36B', '#8E7345', '#FFFFFF']
          });
        }, 500);

      } catch (err) {
        if (!isMounted) return;
        const errorMsg = err.name === 'AbortError' ? "Tarmoq vaqti tugadi" : err.message;
        setStatus(`Xatolik: ${errorMsg}`);
        setData(null);
        setLoading(false);
        clearTimeout(timeoutId);
      }
    };

    fetchInvitationData();
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [invitationRef]);

  useEffect(() => {
    if (!data?.welcomeText) return;
    
    if (translatedWelcome[language]) {
      setCurrentWelcomeText(translatedWelcome[language]);
      return;
    }

    let isMounted = true;
    const loadTranslation = async () => {
      const translated = await translateText(data.welcomeText, language);
      if (isMounted) {
        setTranslatedWelcome(prev => ({ ...prev, [language]: translated }));
        setCurrentWelcomeText(translated);
      }
    };

    loadTranslation();
    return () => { isMounted = false; };
  }, [language, data?.welcomeText, translatedWelcome]);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a1a14', // bg-dark emerald
        color: '#c9a84c' // primary gold
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #c9a84c33',
          borderTopColor: '#c9a84c',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <p style={{ fontFamily: 'serif', fontSize: '1.1rem', letterSpacing: '3px', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            TAKLIFNOMA YUKLANMOQDA
          </p>
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', tracking: '0.2em', opacity: 0.6 }}>
            {status}
          </p>
        </div>
        <style>
          {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
        </style>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: '20px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'serif', color: '#1a1a1a', marginBottom: '1rem' }}>Taklifnoma topilmadi</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          {status.includes('Xatolik') ? status : "Ushbu havola yaroqsiz yoki taklifnoma o'chirilgan bo'lishi mumkin."}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#064e3b',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Qaytadan urinib ko'rish
        </button>
      </div>
    );
  }

  const isPreviewMode = window.location.search.includes('preview=true');
  const isDeactivated = (data.status === 'deactivated' || data.status === 'inactive') && !isPreviewMode;

  if (isDeactivated) {
    const groom = data.groomName || 'Groom';
    const bride = data.brideName || 'Bride';
    const link = window.location.href;
    const text = `Assalomu alaykum! Men taklifnoma faollashtirish holati bo'yicha yozmoqdaman (${groom} & ${bride}):\n${link}`;
    const whatsappUrl = `https://wa.me/${PAYMENT_CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a1a14', color: '#fff', padding: '24px', textAlign: 'center' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'rgba(212,175,55,0.15)', border: '1.5px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 0 30px rgba(212,175,55,0.2)' }}>
          <Clock size={34} color="#d4af37" />
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', color: '#fbe8a6', marginBottom: '12px', fontWeight: 800 }}>
          {t('payment.activationPendingTitle')}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.78)', maxWidth: '440px', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '28px' }}>
          {t('payment.activationPendingDesc')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center', width: '100%', maxWidth: '340px' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              width: '100%',
              padding: '14px 28px',
              backgroundColor: '#d4af37',
              color: '#0a1a14',
              border: 'none',
              borderRadius: '24px',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: '0.8rem',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              boxShadow: '0 8px 24px rgba(212,175,55,0.3)'
            }}
          >
            {t('payment.recheckBtn')}
          </button>

          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', marginTop: '12px', marginBottom: '2px', fontWeight: 500 }}>
            {t('payment.contactHint')}
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '14px 28px',
              backgroundColor: '#25D366',
              color: '#ffffff',
              borderRadius: '24px',
              fontWeight: 800,
              fontSize: '0.8rem',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(37,211,102,0.35)'
            }}
          >
            <MessageCircle size={18} />
            {t('payment.contactWhatsAppBtn')}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', margin: '0 auto', overflowX: 'hidden' }}>
      <ErrorBoundary>
        <TemplateManager
          templateId={data.templateId}
          data={{
            ...data,
            welcomeText: currentWelcomeText || data.welcomeText
          }}
        />
      </ErrorBoundary>
    </div>
  );
};

export default InvitationView;
