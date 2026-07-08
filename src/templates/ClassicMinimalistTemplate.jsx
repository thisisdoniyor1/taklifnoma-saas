import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, MapPin, Navigation, Clock, Heart, CheckCircle, Send, Check } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/db';
import FloatingControls from '../components/FloatingControls';
import { useLanguage } from '../context/LanguageContext';
import { getWelcomeText } from './WatercolorTuscanVillaTemplate/utils/transliterate';

import coverBg from './ClassicMinimalistAssets/cover_bg.png';
import sectionBg from './ClassicMinimalistAssets/section_bg.png';
import coupleSketch from './WatercolorTuscanVillaTemplate/assets/tuscany_couple_standing_v5.png';

// ─── Constants ────────────────────────────────────────────────────────────────
const ROSE    = '#c0616a';
const PINK    = '#d4849a';
const BLUSH   = '#f9eef2';
const DARK    = '#2a1020';
const MAUVE   = '#7d4059';
const GOLD    = '#c9a07a';
const INK     = '#3b1a28';
const LIGHT   = '#fdf5f8';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseDate(dateString) {
  const parts = String(dateString || '26.02.2027').split('.');
  const day   = parseInt(parts[0], 10) || 26;
  const month = parseInt(parts[1], 10) || 2;
  const year  = parseInt(parts[2], 10) || 2027;
  return { day, month, year };
}

function getTargetDate(dateString, timeString) {
  const { day, month, year } = parseDate(dateString);
  return new Date(
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${timeString || '18:00'}:00`
  );
}

function getTimeLeft(targetDate) {
  const diff = Math.max(0, targetDate.getTime() - Date.now());
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ─── Divider ─────────────────────────────────────────────────────────────────
const PinkDivider = () => (
  <div style={{
    width: '4rem', height: '1px', margin: '1.2rem auto',
    background: `linear-gradient(90deg, transparent, ${PINK}, transparent)`,
  }} />
);

// ─── Cover Page ──────────────────────────────────────────────────────────────

const LABELS = {
  uz: { invite: 'Sizga taklifnoma bor', open: 'Ochish uchun tugmani bosing' },
  uz_cyrl: { invite: 'Сизга таклифнома бор', open: 'Очиш учун тугмани босинг' },
  tj: { invite: 'Барои шумо даъватнома аст', open: 'Барои кушодан тугмаро пахш кунед' },
  ru: { invite: 'У вас есть приглашение', open: 'Нажмите, чтобы открыть' },
  en: { invite: 'You have an invitation', open: 'Click to Open' },
};

function Cover({ data, onOpen, isThumbnail }) {
  const { language } = useLanguage();
  const [opening, setOpening] = useState(false);
  const tr = LABELS[language] || LABELS.en;

  const handleOpen = () => {
    if (isThumbnail || opening) return;
    setOpening(true);
    window.setTimeout(onOpen, 700);
  };

  return (
    <motion.div
      onClick={handleOpen}
      initial={false}
      animate={{ opacity: opening ? 0 : 1, scale: opening ? 1.03 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: isThumbnail ? 'absolute' : 'fixed',
        inset: 0,
        zIndex: 5000,
        cursor: isThumbnail ? 'default' : 'pointer',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: DARK,
      }}
    >
      {/* Full-screen cover photo */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${coverBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 1,
      }} />

      {/* Gradient overlay — top dark, center clear, bottom very dark */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        background: `linear-gradient(
          to bottom,
          rgba(30,8,20,0.72) 0%,
          rgba(30,8,20,0.18) 38%,
          rgba(30,8,20,0.22) 60%,
          rgba(30,8,20,0.88) 100%
        )`,
      }} />

      {/* TOP — invitation text + decorative line */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, delay: 0.25 }}
        style={{
          position: 'relative', zIndex: 10,
          width: '100%', textAlign: 'center',
          paddingTop: isThumbnail ? '1.2rem' : '4.5rem',
          paddingLeft: '1.5rem', paddingRight: '1.5rem',
        }}
      >
        {/* Decorative ornament */}
        <div style={{
          width: '2.5rem', height: '1px',
          background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)`,
          margin: '0 auto 0.9rem',
        }} />
        <p style={{
          fontFamily: 'Lato, Arial, sans-serif',
          fontSize: isThumbnail ? '0.44rem' : '0.65rem',
          fontWeight: 800,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.92)',
          textShadow: '0 2px 10px rgba(0,0,0,0.6)',
          margin: 0,
        }}>
          {tr.invite}
        </p>
        <div style={{
          width: '2.5rem', height: '1px',
          background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)`,
          margin: '0.9rem auto 0',
        }} />
      </motion.div>

      {/* CENTER — names */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.5 }}
        style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 2rem' }}
      >
        <p style={{
          fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
          fontSize: isThumbnail ? '1.6rem' : 'clamp(2.8rem, 9vw, 4.4rem)',
          fontStyle: 'italic',
          fontWeight: 400,
          color: '#ffffff',
          textShadow: '0 4px 20px rgba(0,0,0,0.5)',
          margin: 0,
          lineHeight: 1.05,
        }}>
          {data?.groomName || 'Groom'}
        </p>
        <p style={{
          fontSize: isThumbnail ? '0.8rem' : '1.6rem',
          color: GOLD,
          fontStyle: 'italic',
          margin: '0.3rem 0',
          textShadow: '0 2px 8px rgba(0,0,0,0.4)',
          fontFamily: '"Cormorant Garamond", Georgia, serif',
        }}>&</p>
        <p style={{
          fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
          fontSize: isThumbnail ? '1.6rem' : 'clamp(2.8rem, 9vw, 4.4rem)',
          fontStyle: 'italic',
          fontWeight: 400,
          color: '#ffffff',
          textShadow: '0 4px 20px rgba(0,0,0,0.5)',
          margin: 0,
          lineHeight: 1.05,
        }}>
          {data?.brideName || 'Bride'}
        </p>

        {data?.date && (
          <p style={{
            marginTop: '1.2rem',
            fontFamily: 'Lato, Arial, sans-serif',
            fontSize: isThumbnail ? '0.38rem' : '0.62rem',
            letterSpacing: '0.28em',
            color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase',
            textShadow: '0 1px 4px rgba(0,0,0,0.4)',
          }}>
            {data.date}
          </p>
        )}
      </motion.div>

      {/* BOTTOM — open button */}
      {!isThumbnail && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.7 }}
          style={{ position: 'relative', zIndex: 10, paddingBottom: '4.5rem', textAlign: 'center' }}
        >
          <motion.button
            type="button"
            onClick={handleOpen}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            style={{
              padding: '0.8rem 2rem',
              borderRadius: '999px',
              border: '1.5px solid rgba(255,255,255,0.55)',
              background: 'rgba(255,255,255,0.14)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              color: '#fff',
              fontFamily: 'Lato, Arial, sans-serif',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
              textShadow: '0 1px 4px rgba(0,0,0,0.3)',
              maxWidth: '260px',
              lineHeight: '1.4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              margin: '0 auto',
            }}
          >
            {tr.open}
          </motion.button>

          {/* Animated scroll hint */}
          <motion.div
            animate={{ y: [0, 6, 0], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ marginTop: '1.5rem' }}
          >
            <svg width="20" height="28" viewBox="0 0 20 28" fill="none" style={{ display: 'block', margin: '0 auto' }}>
              <line x1="10" y1="0" x2="10" y2="18" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
              <polyline points="4,14 10,22 16,14" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Hero (Names + Couple Image) ─────────────────────────────────────────────
function Hero({ data }) {
  const coupleImg = data?.image_url || coupleSketch;

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      background: `linear-gradient(180deg, ${LIGHT} 0%, #fef0f5 50%, ${LIGHT} 100%)`,
      padding: '5rem 2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative corner brackets */}
      {[
        { top: '2rem', left: '2rem', borderTop: `1.5px solid rgba(192,97,106,0.25)`, borderLeft: `1.5px solid rgba(192,97,106,0.25)` },
        { top: '2rem', right: '2rem', borderTop: `1.5px solid rgba(192,97,106,0.25)`, borderRight: `1.5px solid rgba(192,97,106,0.25)` },
        { bottom: '2rem', left: '2rem', borderBottom: `1.5px solid rgba(192,97,106,0.25)`, borderLeft: `1.5px solid rgba(192,97,106,0.25)` },
        { bottom: '2rem', right: '2rem', borderBottom: `1.5px solid rgba(192,97,106,0.25)`, borderRight: `1.5px solid rgba(192,97,106,0.25)` },
      ].map((style, i) => (
        <div key={i} style={{ position: 'absolute', width: '2.5rem', height: '2.5rem', pointerEvents: 'none', ...style }} />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
      >
        {/* Eyebrow label */}
        <p style={{
          fontFamily: 'Lato, Arial, sans-serif',
          fontSize: '0.65rem',
          fontWeight: 800,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: PINK,
          margin: '0 0 1.5rem',
        }}>
          Wedding Invitation
        </p>

        <PinkDivider />

        {/* Couple Portrait */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.3, delay: 0.2 }}
          style={{
            width: 'clamp(180px, 52vw, 240px)',
            height: 'clamp(220px, 66vw, 300px)',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            overflow: 'hidden',
            border: `2px solid rgba(192,97,106,0.35)`,
            boxShadow: `0 20px 60px rgba(0,0,0,0.1), 0 4px 16px rgba(192,97,106,0.2)`,
            margin: '2rem 0',
            position: 'relative',
            background: '#f5e9ed',
          }}
        >
          <img
            src={coupleImg}
            alt="Couple"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
          />
          {/* Subtle rose shimmer overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(192,97,106,0.06) 0%, transparent 40%, rgba(192,97,106,0.08) 100%)',
          }} />
        </motion.div>

        {/* Names */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          style={{
            fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(2.4rem, 8vw, 4rem)',
            color: INK,
            lineHeight: 1.08,
            margin: 0,
          }}
        >
          {data?.groomName || 'Groom'}
          <span style={{
            display: 'block',
            fontSize: 'clamp(1rem, 3.5vw, 1.5rem)',
            fontStyle: 'normal',
            letterSpacing: '0.3em',
            color: PINK,
            margin: '0.6rem 0',
            fontWeight: 300,
          }}>
            &amp;
          </span>
          {data?.brideName || 'Bride'}
        </motion.h1>

        <PinkDivider />

        {/* Date below names */}
        {data?.date && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            style={{
              fontFamily: 'Lato, Arial, sans-serif',
              fontSize: '0.62rem',
              letterSpacing: '0.28em',
              color: MAUVE,
              textTransform: 'uppercase',
              marginTop: '0.5rem',
            }}
          >
            {data.date}
          </motion.p>
        )}

        {/* Scroll hint */}
        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ marginTop: '3.5rem' }}
        >
          <span style={{
            display: 'block',
            fontFamily: 'Lato, Arial, sans-serif',
            fontSize: '0.6rem',
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
            color: PINK,
            marginBottom: '0.6rem',
            opacity: 0.7,
          }}>Scroll</span>
          <svg width="18" height="26" viewBox="0 0 18 26" fill="none" style={{ display: 'block', margin: '0 auto' }}>
            <line x1="9" y1="0" x2="9" y2="18" stroke={PINK} strokeWidth="1.3" />
            <polyline points="3,14 9,21 15,14" fill="none" stroke={PINK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Welcome / Speech ─────────────────────────────────────────────────────────
function Welcome({ data }) {
  const { language, t } = useLanguage();
  const text = getWelcomeText(data?.welcomeText, language, t);
  return (
    <section style={{ padding: '5rem 2rem', background: BLUSH, textAlign: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{
          maxWidth: '28rem', margin: '0 auto',
          background: 'rgba(255,255,255,0.75)',
          border: `1px solid rgba(192,97,106,0.15)`,
          borderRadius: '2rem',
          padding: '3rem 2.5rem',
          boxShadow: '0 12px 40px rgba(192,97,106,0.08)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <p style={{
          fontFamily: 'Lato, Arial, sans-serif',
          fontSize: '0.62rem',
          fontWeight: 800,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: PINK,
          margin: '0 0 1rem',
        }}>Welcome</p>
        <PinkDivider />
        <p style={{
          fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
          fontStyle: 'italic',
          fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
          lineHeight: 1.8,
          color: '#6b4a56',
          margin: '1rem 0 0',
        }}>
          {text}
        </p>
      </motion.div>
    </section>
  );
}

// ─── Date Section ─────────────────────────────────────────────────────────────
function DateSection({ data }) {
  const { day, month, year } = parseDate(data?.date);
  const date = getTargetDate(data?.date, data?.time);
  const monthName = MONTHS[month - 1];
  const weekday = WEEKDAYS[date.getDay()];

  return (
    <section style={{ padding: '5rem 2rem', background: LIGHT, textAlign: 'center' }}>
      <p style={{
        fontFamily: 'Lato, Arial, sans-serif',
        fontSize: '0.62rem', fontWeight: 800,
        letterSpacing: '0.3em', textTransform: 'uppercase',
        color: PINK, margin: '0 0 1.5rem',
      }}>
        Wedding Date
      </p>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.75 }}
        style={{
          maxWidth: '22rem', margin: '0 auto',
          background: 'rgba(255,255,255,0.8)',
          border: `1px solid rgba(192,97,106,0.18)`,
          borderRadius: '2rem',
          padding: '2.5rem 2rem',
          boxShadow: '0 12px 40px rgba(192,97,106,0.1)',
          backdropFilter: 'blur(8px)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Double ornate inner border */}
        <div style={{ position: 'absolute', inset: '0.8rem', border: `1px solid rgba(192,97,106,0.12)`, borderRadius: '1.5rem', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: '1.3rem', border: `1px solid rgba(192,97,106,0.07)`, borderRadius: '1.2rem', pointerEvents: 'none' }} />

        <CalendarDays size={30} color={ROSE} strokeWidth={1.3} style={{ display: 'block', margin: '0 auto 1rem' }} />
        <p style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontSize: '1.7rem', fontStyle: 'italic',
          color: MAUVE, margin: '0 0 0.3rem',
        }}>
          {monthName} {year}
        </p>
        <p style={{
          fontFamily: 'Lato, Arial, sans-serif',
          fontSize: '0.6rem', fontWeight: 800,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: PINK, margin: '0 0 1.5rem',
        }}>
          {weekday}
        </p>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.3rem', maxWidth: '17rem', margin: '0 auto 1.5rem' }}>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((num) => (
            num === day ? (
              <div key={num} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '2rem' }}>
                <div style={{
                  position: 'relative',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg viewBox="0 0 32 30" style={{ width: '100%', height: '100%', filter: `drop-shadow(0 2px 5px rgba(192,97,106,0.4))` }}>
                    <path d="M16 27 C16 27, 2 17, 2 9 C2 4.5 5.5 2 9 2 C11.5 2 13.8 3.4 16 6 C18.2 3.4 20.5 2 23 2 C26.5 2 30 4.5 30 9 C30 17 16 27 16 27 Z" fill={ROSE} />
                  </svg>
                  <span style={{
                    position: 'absolute',
                    zIndex: 10,
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    transform: 'translateY(-1px)',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                  }}>
                    {num}
                  </span>
                </div>
              </div>
            ) : (
              <span key={num} style={{ height: '2rem', display: 'grid', placeItems: 'center', color: '#8a6070', fontSize: '0.85rem', fontWeight: 400 }}>
                {num}
              </span>
            )
          ))}
        </div>

        {/* Time */}
        {data?.time && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: MAUVE, fontFamily: 'Lato, Arial, sans-serif', fontSize: '0.8rem', fontWeight: 800 }}>
            <Clock size={16} color={ROSE} />
            {data.time}
          </div>
        )}
      </motion.div>
    </section>
  );
}

// ─── Countdown ────────────────────────────────────────────────────────────────
function Countdown({ data }) {
  const target = useMemo(() => getTargetDate(data?.date, data?.time), [data?.date, data?.time]);
  const [left, setLeft] = useState(() => getTimeLeft(target));

  useEffect(() => {
    const timer = setInterval(() => setLeft(getTimeLeft(target)), 1000);
    return () => clearInterval(timer);
  }, [target]);

  const pieces = [
    { label: 'Days',    value: left.days },
    { label: 'Hours',   value: left.hours },
    { label: 'Minutes', value: left.minutes },
    { label: 'Seconds', value: left.seconds },
  ];

  return (
    <section style={{
      padding: '5rem 2rem',
      textAlign: 'center',
      background: BLUSH,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Floral background image — very subtle */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${sectionBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.18,
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{
          fontFamily: 'Lato, Arial, sans-serif',
          fontSize: '0.62rem', fontWeight: 800,
          letterSpacing: '0.3em', textTransform: 'uppercase',
          color: ROSE, margin: '0 0 0.5rem',
        }}>
          Celebrating in
        </p>
        <PinkDivider />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.8rem',
          maxWidth: '22rem',
          margin: '1.5rem auto 0',
        }}>
          {pieces.map(({ label, value }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              style={{
                background: 'rgba(255,255,255,0.82)',
                border: `1px solid rgba(192,97,106,0.22)`,
                borderRadius: '1.2rem',
                padding: '1.2rem 0.5rem',
                boxShadow: '0 6px 20px rgba(192,97,106,0.1)',
                position: 'relative',
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* Top accent line */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: `linear-gradient(90deg, transparent, ${ROSE}, transparent)`,
                borderRadius: '1.2rem 1.2rem 0 0',
              }} />
              <motion.strong
                key={value}
                initial={{ opacity: 0.3, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  display: 'block',
                  fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
                  fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
                  fontWeight: 400,
                  color: INK,
                  lineHeight: 1,
                }}
              >
                {String(value).padStart(2, '0')}
              </motion.strong>
              <span style={{
                display: 'block',
                marginTop: '0.5rem',
                fontFamily: 'Lato, Arial, sans-serif',
                fontSize: '0.58rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: PINK,
              }}>
                {label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Venue / Location ─────────────────────────────────────────────────────────
function Venue({ data }) {
  const location = data?.location || 'Tashkent, "Oltin Saroy"';
  const googleUrl = data?.locationUrl || `https://maps.google.com/?q=${encodeURIComponent(location)}`;
  const appleUrl  = `https://maps.apple.com/?q=${encodeURIComponent(location)}`;

  return (
    <section style={{ padding: '5rem 2rem', background: LIGHT, textAlign: 'center' }}>
      <p style={{
        fontFamily: 'Lato, Arial, sans-serif',
        fontSize: '0.62rem', fontWeight: 800,
        letterSpacing: '0.3em', textTransform: 'uppercase',
        color: PINK, margin: '0 0 1.5rem',
      }}>
        The Venue
      </p>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.75 }}
        style={{
          maxWidth: '22rem', margin: '0 auto',
          background: 'rgba(255,255,255,0.8)',
          border: `1px solid rgba(192,97,106,0.18)`,
          borderRadius: '2rem',
          padding: '2.5rem 2rem',
          boxShadow: '0 12px 40px rgba(192,97,106,0.1)',
          position: 'relative', overflow: 'hidden',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Double inner frame */}
        <div style={{ position: 'absolute', inset: '0.8rem', border: `1px solid rgba(192,97,106,0.12)`, borderRadius: '1.5rem', pointerEvents: 'none' }} />

        {/* Castle SVG illustration */}
        <svg viewBox="0 0 120 100" style={{ width: '8rem', height: '6.5rem', display: 'block', margin: '0 auto 1.5rem', color: ROSE, filter: `drop-shadow(0 3px 8px rgba(192,97,106,0.2))` }} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          {/* Ground */}
          <line x1="5" y1="92" x2="115" y2="92" stroke="currentColor" strokeOpacity="0.3" />
          {/* Left turret */}
          <rect x="8" y="65" width="16" height="27" />
          <rect x="6" y="58" width="5" height="9" />
          <rect x="12" y="58" width="5" height="9" />
          <rect x="18" y="58" width="5" height="9" />
          <path d="M10 65 L10 42 L22 42 L22 65" />
          <path d="M8 42 l6 -10 l6 10 z" fill="currentColor" fillOpacity="0.12" />
          <rect x="13" y="50" width="6" height="8" rx="3" />
          {/* Right turret (mirror) */}
          <rect x="96" y="65" width="16" height="27" />
          <rect x="94" y="58" width="5" height="9" />
          <rect x="100" y="58" width="5" height="9" />
          <rect x="106" y="58" width="5" height="9" />
          <path d="M110 65 L110 42 L98 42 L98 65" />
          <path d="M102 42 l6 -10 l6 10 z" fill="currentColor" fillOpacity="0.12" />
          <rect x="101" y="50" width="6" height="8" rx="3" />
          {/* Main wall */}
          <rect x="24" y="68" width="72" height="24" />
          {/* Wall battlements */}
          <rect x="24" y="60" width="8" height="10" />
          <rect x="36" y="60" width="8" height="10" />
          <rect x="48" y="60" width="8" height="10" />
          <rect x="60" y="60" width="8" height="10" />
          <rect x="72" y="60" width="8" height="10" />
          <rect x="84" y="60" width="8" height="10" />
          {/* Main gate arch */}
          <path d="M50 92 L50 80 Q50 72 60 72 Q70 72 70 80 L70 92" />
          {/* Central tower */}
          <rect x="47" y="38" width="26" height="32" />
          {/* Central battlements */}
          <rect x="45" y="30" width="6" height="10" />
          <rect x="53" y="30" width="6" height="10" />
          <rect x="61" y="30" width="6" height="10" />
          <rect x="69" y="30" width="6" height="10" />
          {/* Central high tower */}
          <rect x="52" y="10" width="16" height="22" />
          <path d="M50 10 l10 -8 l10 8 z" fill="currentColor" fillOpacity="0.15" />
          {/* Flag */}
          <line x1="60" y1="2" x2="60" y2="10" />
          <path d="M60 2 L68 5 L60 8 z" fill="currentColor" fillOpacity="0.4" />
          {/* Tower windows */}
          <rect x="56" y="16" width="8" height="9" rx="4" />
          {/* Side windows */}
          <rect x="32" y="74" width="8" height="10" rx="2" />
          <rect x="80" y="74" width="8" height="10" rx="2" />
          <rect x="52" y="44" width="6" height="7" rx="3" />
          <rect x="62" y="44" width="6" height="7" rx="3" />
        </svg>

        {/* Venue heading */}
        <h2 style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontSize: '2.2rem', fontStyle: 'italic', fontWeight: 400,
          color: INK, margin: '0 0 0.5rem',
        }}>
          <MapPin size={26} color={ROSE} strokeWidth={1.4} style={{ flexShrink: 0 }} />
          Location
        </h2>
        <p style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontSize: 'clamp(1.5rem, 5vw, 1.9rem)', fontStyle: 'italic',
          fontWeight: 700,
          color: INK, margin: '0 auto 0.8rem',
          maxWidth: '20rem', lineHeight: 1.3,
        }}>
          {location}
        </p>
        {data?.time && (
          <p style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: '1.25rem', fontWeight: 700,
            color: MAUVE, margin: '0 0 1.8rem',
          }}>
            <Clock size={18} color={ROSE} /> {data.time}
          </p>
        )}

        {/* Map buttons */}
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { href: googleUrl, label: 'Google Maps' },
            { href: appleUrl,  label: 'Apple Maps' },
          ].map(({ href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                padding: '0.75rem 1.4rem',
                borderRadius: '999px',
                background: `linear-gradient(135deg, ${ROSE} 0%, ${MAUVE} 100%)`,
                color: '#fff',
                fontFamily: 'Lato, Arial, sans-serif',
                fontSize: '0.72rem', fontWeight: 800,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                textDecoration: 'none',
                boxShadow: `0 6px 18px rgba(192,97,106,0.28)`,
              }}
            >
              <Navigation size={14} />
              {label}
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// ─── RSVP ─────────────────────────────────────────────────────────────────────
function RSVPSection({ data }) {
  const { t } = useLanguage();
  const params = useParams();
  const invitationRef = params['*'] || params.id || '';
  const [form, setForm]   = useState({ name: '', wish: '' });
  const [done, setDone]   = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !invitationRef) return;
    setLoading(true);
    try {
      await db.addRSVP(invitationRef, { name: form.name.trim(), wish: form.wish.trim(), status: 'attending' });
      setDone(true);
    } catch {
      setDone(false);
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = {
    width: '100%',
    border: `1px solid rgba(192,97,106,0.25)`,
    borderRadius: '1rem',
    padding: '0.9rem 1.1rem',
    background: 'rgba(255,255,255,0.9)',
    color: INK,
    font: `600 0.95rem Lato, Arial, sans-serif`,
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <section style={{ padding: '5rem 2rem', background: BLUSH, textAlign: 'center' }}>
      <p style={{ fontFamily: 'Lato, Arial, sans-serif', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: PINK, margin: '0 0 1.5rem' }}>
        RSVP
      </p>
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{
          maxWidth: '22rem', margin: '0 auto',
          background: 'rgba(255,255,255,0.8)',
          border: `1px solid rgba(192,97,106,0.18)`,
          borderRadius: '2rem',
          padding: '2.5rem 2rem',
          boxShadow: '0 12px 40px rgba(192,97,106,0.1)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {!done ? (
          <form onSubmit={submit} style={{ display: 'grid', gap: '1rem' }}>
            <h2 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontStyle: 'italic', fontSize: '2rem', color: INK, margin: '0 0 0.5rem' }}>
              Confirm Attendance
            </h2>
            <PinkDivider />
            <input required value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} placeholder="Your name" style={fieldStyle} />
            <textarea rows={3} value={form.wish} onChange={e => setForm(v => ({ ...v, wish: e.target.value }))} placeholder={t('invitation.rsvp_wish') || 'Leave a wish'} style={{ ...fieldStyle, resize: 'none' }} />
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                padding: '1rem',
                borderRadius: '999px',
                border: 'none',
                background: `linear-gradient(135deg, ${ROSE} 0%, ${MAUVE} 100%)`,
                color: '#fff',
                fontFamily: 'Lato, Arial, sans-serif',
                fontSize: '0.76rem', fontWeight: 800,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: `0 8px 20px rgba(192,97,106,0.3)`,
              }}
            >
              <Send size={15} /> {loading ? 'Sending…' : 'Confirm Attendance'}
            </button>
          </form>
        ) : (
          <div style={{ display: 'grid', justifyItems: 'center', gap: '1.2rem', padding: '1.5rem 0' }}>
            <span style={{ width: '4rem', height: '4rem', borderRadius: '50%', display: 'grid', placeItems: 'center', background: `linear-gradient(135deg, ${ROSE} 0%, ${MAUVE} 100%)`, color: '#fff', boxShadow: `0 8px 20px rgba(192,97,106,0.3)` }}>
              <Check size={30} />
            </span>
            <p style={{ margin: 0, fontFamily: '"Cormorant Garamond", Georgia, serif', fontStyle: 'italic', fontSize: '1.4rem', color: MAUVE, lineHeight: 1.4 }}>
              Thank you. Your response has been received.
            </p>
          </div>
        )}
      </motion.div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ data }) {
  return (
    <footer style={{
      padding: '4rem 2rem 5rem',
      background: `linear-gradient(135deg, ${ROSE} 0%, ${MAUVE} 100%)`,
      color: 'rgba(255,255,255,0.9)',
      textAlign: 'center',
      fontFamily: '"Cormorant Garamond", Georgia, serif',
      fontSize: '1.1rem',
      fontStyle: 'italic',
      letterSpacing: '0.05em',
    }}>
      <Heart size={20} style={{ display: 'block', margin: '0 auto 1rem', opacity: 0.7 }} fill="rgba(255,255,255,0.5)" />
      We look forward to celebrating this beautiful moment with you. ♥
      
      <div style={{ fontSize: '0.75rem', letterSpacing: '0.25em', marginTop: '40px', fontFamily: "'Cormorant Garamond', serif", textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)' }}>
        © 2026 TAKLIFNOMA.VIP
      </div>
    </footer>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────
function MainContent({ data }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
      <Hero data={data} />
      <Welcome data={data} />
      <DateSection data={data} />
      <Countdown data={data} />
      <Venue data={data} />
      <RSVPSection data={data} />
      <Footer data={data} />
    </motion.div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────
const ClassicMinimalistTemplate = ({ data, isThumbnail }) => {
  const [opened, setOpened] = useState(false);

  return (
    <div style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', background: LIGHT, minHeight: '100vh' }}>
      {/* Load Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500&family=Lato:wght@400;600;700;800&display=swap');
      `}</style>

      {!isThumbnail && <FloatingControls musicUrl={data?.musicUrl} accentColor={`rgba(192,97,106,0.88)`} />}

      <AnimatePresence mode="wait">
        {!opened ? (
          <Cover key="cover" data={data} isThumbnail={isThumbnail} onOpen={() => setOpened(true)} />
        ) : (
          <MainContent key="main" data={data} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClassicMinimalistTemplate;
