import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, Clock, Heart, MapPin } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../lib/db';
import blueBookCover from './blue_book_cover.png';

const CREAM = '#f8f1dc';
const PAPER = '#fffaf0';
const WARM = '#efe2bf';
const INK = '#3f382f';
const MUTED = '#786d5e';
const GOLD = '#b88735';
const GOLD_LIGHT = '#e5c56d';
const EMERALD = '#00a86b';
const DEEP_EMERALD = '#117554';

const MONTH_NAMES = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  uz: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'],
  uz_cyrl: ['Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн', 'Июл', 'Август', 'Сентабр', 'Октабр', 'Ноябр', 'Декабр'],
  tg: ['Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн', 'Июл', 'Август', 'Сентябр', 'Октябр', 'Ноябр', 'Декабр'],
  tj: ['Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн', 'Июл', 'Август', 'Сентябр', 'Октябр', 'Ноябр', 'Декабр'],
};

function parseDate(dateStr) {
  if (!dateStr) return { day: 12, month: 10, year: 2026 };
  const [d, m, y] = String(dateStr).split('.');
  return {
    day: parseInt(d, 10) || 12,
    month: parseInt(m, 10) || 10,
    year: parseInt(y, 10) || 2026,
  };
}

function calcTimeLeft(dateStr, timeStr) {
  if (!dateStr) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const { day, month, year } = parseDate(dateStr);
  const time = timeStr || '18:00';
  const target = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${time}:00`);
  const diff = Math.max(0, target.getTime() - Date.now());

  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

const goldFoil = 'linear-gradient(135deg, #8c6023 0%, #d5ad52 36%, #fff0aa 50%, #c28d36 64%, #7a501e 100%)';
const textGold = {
  background: goldFoil,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: GOLD,
};

function PaperTexture() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: 0.42,
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(184,135,53,0.16) 1px, transparent 0), radial-gradient(circle at 12px 18px, rgba(17,117,84,0.08) 1px, transparent 0)',
        backgroundSize: '24px 24px, 34px 34px',
      }}
    />
  );
}

function Jewel({ x, y, r = 3, color = EMERALD }) {
  return <circle cx={x} cy={y} r={r} fill={color} stroke="#fff7df" strokeWidth="1.2" />;
}

function ArabesqueMandala({ size = 360, position = 'top', style = {}, opacity = 1 }) {
  const translate = position === 'right' ? 'translate(180 180) rotate(90)' : position === 'left' ? 'translate(180 180) rotate(-90)' : 'translate(180 180)';

  return (
    <svg
      aria-hidden
      viewBox="0 0 360 360"
      width={size}
      height={size}
      style={{ display: 'block', opacity, pointerEvents: 'none', ...style }}
    >
      <defs>
        <linearGradient id={`mandalaGold-${position}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8c6023" />
          <stop offset="38%" stopColor="#d5ad52" />
          <stop offset="52%" stopColor="#fff0aa" />
          <stop offset="68%" stopColor="#c28d36" />
          <stop offset="100%" stopColor="#7a501e" />
        </linearGradient>
      </defs>
      <g transform={translate}>
        {[...Array(16)].map((_, i) => (
          <g key={i} transform={`rotate(${i * 22.5})`}>
            <path d="M0 -22 C22 -48 26 -84 0 -128 C-26 -84 -22 -48 0 -22Z" fill="rgba(0,168,107,0.11)" stroke={`url(#mandalaGold-${position})`} strokeWidth="2.2" />
            <path d="M0 -45 C14 -66 15 -88 0 -110 C-15 -88 -14 -66 0 -45Z" fill="rgba(255,250,240,0.5)" stroke={`url(#mandalaGold-${position})`} strokeWidth="1" opacity="0.76" />
            <path d="M15 -56 C35 -76 46 -98 43 -126" fill="none" stroke={`url(#mandalaGold-${position})`} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M-15 -56 C-35 -76 -46 -98 -43 -126" fill="none" stroke={`url(#mandalaGold-${position})`} strokeWidth="1.8" strokeLinecap="round" />
            <Jewel x="0" y="-98" r="3.2" />
            <Jewel x="35" y="-121" r="2.4" color={DEEP_EMERALD} />
            <Jewel x="-35" y="-121" r="2.4" color={DEEP_EMERALD} />
          </g>
        ))}
        {[...Array(8)].map((_, i) => (
          <g key={`arc-${i}`} transform={`rotate(${i * 45})`}>
            <path d="M0 -144 C42 -136 70 -112 88 -74" fill="none" stroke={`url(#mandalaGold-${position})`} strokeWidth="4" strokeLinecap="round" />
            <path d="M0 -162 C58 -152 102 -118 126 -65" fill="none" stroke={`url(#mandalaGold-${position})`} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
          </g>
        ))}
        <circle r="66" fill="rgba(255,250,240,0.36)" stroke={`url(#mandalaGold-${position})`} strokeWidth="2" />
        <circle r="38" fill="rgba(0,168,107,0.08)" stroke={`url(#mandalaGold-${position})`} strokeWidth="2" />
        <path d="M0 -25 L7 -7 L25 0 L7 7 L0 25 L-7 7 L-25 0 L-7 -7Z" fill={EMERALD} stroke="#fff7df" strokeWidth="2" />
        <circle r="8" fill={GOLD_LIGHT} stroke="#fff7df" strokeWidth="2" />
      </g>
    </svg>
  );
}

function OrnamentFrame({ children, dense = false }) {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100dvh',
        height: '100dvh',
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: dense ? '34px 16px' : '56px 20px',
        background: `linear-gradient(180deg, ${PAPER} 0%, ${CREAM} 100%)`,
      }}
    >
      <PaperTexture />
      <ArabesqueMandala
        size={dense ? 430 : 470}
        position="top"
        style={{ position: 'absolute', top: dense ? -220 : -236, left: '50%', transform: 'translateX(-50%)' }}
      />
      <ArabesqueMandala
        size={dense ? 300 : 310}
        position="left"
        opacity={0.88}
        style={{ position: 'absolute', bottom: dense ? -92 : -70, left: dense ? -112 : -94 }}
      />
      <ArabesqueMandala
        size={dense ? 300 : 310}
        position="right"
        opacity={0.88}
        style={{ position: 'absolute', bottom: dense ? -92 : -70, right: dense ? -112 : -94 }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: dense ? '14px' : '20px',
          border: `1px solid rgba(184,135,53,0.34)`,
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.7)',
        }}
      />
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 820, textAlign: 'center' }}>
        {children}
      </div>
    </section>
  );
}

function Divider() {
  return (
    <div style={{ width: 'min(260px, 72%)', margin: '24px auto', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(184,135,53,0.76))' }} />
      <span style={{ width: 7, height: 7, transform: 'rotate(45deg)', background: EMERALD, border: `1px solid ${GOLD_LIGHT}` }} />
      <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(184,135,53,0.76), transparent)' }} />
    </div>
  );
}

function Section({ children, ornate = false, warm = false }) {
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '86px 20px',
        background: warm ? `linear-gradient(180deg, ${CREAM}, ${WARM})` : `linear-gradient(180deg, ${PAPER}, ${CREAM})`,
        color: INK,
      }}
    >
      <PaperTexture />
      {ornate && (
        <>
          <ArabesqueMandala size={330} position="left" opacity={0.68} style={{ position: 'absolute', left: -132, top: -90 }} />
          <ArabesqueMandala size={330} position="right" opacity={0.68} style={{ position: 'absolute', right: -132, bottom: -90 }} />
        </>
      )}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 920, margin: '0 auto', textAlign: 'center' }}>
        {children}
      </div>
    </section>
  );
}

function SectionTitle({ children, script = false }) {
  return (
    <h2
      style={{
        fontFamily: script ? "'Pinyon Script', cursive" : "'Playfair Display', serif",
        fontSize: script ? 'clamp(3rem, 10vw, 5rem)' : 'clamp(2rem, 6vw, 3.3rem)',
        fontStyle: script ? 'normal' : 'italic',
        fontWeight: 400,
        marginBottom: 4,
        letterSpacing: 0,
        ...textGold,
      }}
    >
      {children}
    </h2>
  );
}

// Removed MusicToggle in favor of GlobalInvitationControls

function JeweledMandalaIntro({ data, onOpen, isThumbnail = false }) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ rotateY: 0 }}
      exit={{ rotateY: -110, opacity: 0, transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] } }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        transformOrigin: 'left center',
        perspective: '2000px',
        transformStyle: 'preserve-3d',
        pointerEvents: isThumbnail ? 'none' : 'auto',
        cursor: isThumbnail ? 'default' : 'pointer',
        backgroundColor: '#0f172a'
      }}
      onClick={onOpen}
    >
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100vh',
        height: '100vh',
        backgroundImage: `url(${blueBookCover})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        // Dynamic CSS Mask to punch a hole where the gold frame's center is
        maskImage: 'radial-gradient(ellipse 20.5% 26% at 50% 50%, transparent 99%, black 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 20.5% 26% at 50% 50%, transparent 99%, black 100%)',
      }} />

      {/* Inner shadow to give the cutout 3D depth */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100vh',
        height: '100vh',
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '41vh',
          height: '52vh',
          borderRadius: '50%',
          boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.8)',
        }} />
      </div>

      {!isThumbnail && (
        <div style={{ position: 'absolute', bottom: '8%', width: '100%', textAlign: 'center', animation: 'pulse 2s infinite' }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: '#FCD34D', textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontStyle: 'italic', letterSpacing: '0.1em' }}>
            {t('invitation.click_to_open') || 'Click to Open'}
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default function JeweledMandalaTemplate({ data, isThumbnail }) {
  const [opened, setOpened] = useState(false);
  const { t, language } = useLanguage();
  const params = useParams();
  const invRef = params['*'] || params.id || (params.slugPrefix && params.slugName ? `${params.slugPrefix}/${params.slugName}` : '');

  const groomName = data?.groomName || 'Rustam';
  const brideName = data?.brideName || 'Sevara';
  const { day, month, year } = parseDate(data?.date);
  const monthName = (MONTH_NAMES[language] || MONTH_NAMES.en)[month - 1];
  const location = data?.location || '';
  const mapQuery = encodeURIComponent(location || 'Wedding venue');
  const googleMapUrl = data?.locationUrl || `https://maps.google.com/?q=${mapQuery}`;
  const appleMapUrl = `http://maps.apple.com/?q=${mapQuery}`;
  const wishes = Array.isArray(data?.rsvps) ? data.rsvps.filter((item) => item?.wish) : [];

  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(data?.date, data?.time));
  const [form, setForm] = useState({ name: '', wish: '' });
  const [rsvpDone, setRsvpDone] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpError, setRsvpError] = useState('');

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft(data?.date, data?.time)), 1000);
    return () => clearInterval(id);
  }, [data?.date, data?.time]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDow = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const calendarCells = Array.from({ length: firstDow + daysInMonth }, (_, i) => (i < firstDow ? null : i - firstDow + 1));

  const handleRsvp = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    setRsvpLoading(true);
    setRsvpError('');
    try {
      await db.addRSVP(invRef, { name: form.name.trim(), wish: form.wish.trim(), status: 'attending' });
      setRsvpDone(true);
    } catch {
      setRsvpError(t('invitation.rsvp_error') || 'Something went wrong. Please try again.');
    }
    setRsvpLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '15px 16px',
    border: '1px solid rgba(184,135,53,0.38)',
    background: 'rgba(255,250,240,0.78)',
    color: INK,
    outlineColor: EMERALD,
    fontFamily: "'Lato', sans-serif",
    fontSize: '1rem',
  };

  return (
    <div style={{ background: CREAM, color: INK, minHeight: '100vh', height: opened ? 'auto' : '100vh', overflow: opened ? 'visible' : 'hidden', overflowX: 'hidden', fontFamily: "'Lato', sans-serif", position: 'relative' }}>
      
      {/* The main page content always renders behind the cover */}
      <motion.main key="main" initial={false} animate={{ opacity: 1 }} style={{ opacity: 1 }}>

        <OrnamentFrame dense>
          <motion.div initial={false} animate={{ opacity: 1, y: 0 }} style={{ paddingTop: 'clamp(20px, 5vh, 58px)' }}>
            <h1 style={{ marginTop: 0, fontFamily: "'Pinyon Script', cursive", fontSize: 'clamp(3.55rem, 13.6vw, 6.9rem)', lineHeight: 0.84, ...textGold }}>
              {groomName}
              <span style={{ display: 'block', fontSize: '0.46em', color: DEEP_EMERALD, WebkitTextFillColor: DEEP_EMERALD }}>&amp;</span>
              {brideName}
            </h1>
            <Divider />
            <p style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.26em', textTransform: 'uppercase', color: INK, fontSize: '0.76rem' }}>
              {monthName} {day}, {year}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: '-50%' }}
            animate={opened ? { opacity: 1, x: '-50%', y: [0, 10, 0] } : { opacity: 0, x: '-50%' }}
            transition={{ opacity: { duration: 1, delay: 1.2 }, y: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
            style={{ position: 'absolute', left: '50%', bottom: 16, zIndex: 4, color: GOLD, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
          >
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.58rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: MUTED }}>{t('invitation.scroll') || 'Scroll down'}</span>
            <ChevronDown size={22} />
          </motion.div>
        </OrnamentFrame>

        {/* BOOK COVER OVERLAY */}
        <AnimatePresence>
          {!opened && (
            <JeweledMandalaIntro key="intro" data={data} onOpen={() => setOpened(true)} isThumbnail={isThumbnail} />
          )}
        </AnimatePresence>

            <Section ornate>
              <motion.div initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-120px' }} transition={{ duration: 0.9 }}>
                <SectionTitle script>{t('invitation.welcome') || 'Welcome'}</SectionTitle>
                <Divider />
                <p style={{ maxWidth: 690, margin: '0 auto', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 'clamp(1.15rem, 3vw, 1.55rem)', lineHeight: 1.95, color: MUTED }}>
                  {t('invitation.speech') || 'We are so thrilled to share this special moment with our closest friends and family. Your presence is the greatest gift.'}
                </p>
              </motion.div>
            </Section>

            <Section warm ornate>
              <motion.div initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}>
                <SectionTitle>{t('invitation.calendar') || 'Save the Date'}</SectionTitle>
                <Divider />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 30, alignItems: 'center', marginTop: 36 }}>
                  <div>
                    <Calendar size={34} color={GOLD} style={{ margin: '0 auto 20px' }} />
                    <p style={{ fontFamily: "'Pinyon Script', cursive", fontSize: 'clamp(4rem, 13vw, 6.5rem)', lineHeight: 0.86, ...textGold }}>{day}</p>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 7vw, 3.5rem)', fontStyle: 'italic', color: INK, marginTop: 16 }}>
                      {monthName}
                    </p>
                    <p style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.34em', textTransform: 'uppercase', color: MUTED, marginTop: 12 }}>{year}</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 22, color: DEEP_EMERALD, fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.14em' }}>
                      <Clock size={18} />
                      <span>{data?.time || '18:00'}</span>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,250,240,0.88)', padding: 24, border: `1px solid rgba(184,135,53,0.34)`, boxShadow: '0 22px 44px rgba(85,61,26,0.12)' }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.35rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 18, color: INK }}>
                      {monthName} {year}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, i) => (
                        <div key={`${label}-${i}`} style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.68rem', fontWeight: 800, color: GOLD, paddingBottom: 9 }}>{label}</div>
                      ))}
                      {calendarCells.map((value, i) => (
                        <div key={i} style={{ height: 34, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: value === null ? 'transparent' : INK, fontWeight: 700 }}>
                          {value === day && <Heart size={34} fill={EMERALD} color={EMERALD} style={{ position: 'absolute', opacity: 0.92 }} />}
                          <span style={{ position: 'relative', zIndex: 1, color: value === day ? PAPER : 'inherit' }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </Section>

            <Section ornate>
              <motion.div initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}>
                <SectionTitle script>{t('invitation.location') || 'Location'}</SectionTitle>
                <Divider />
                <MapPin size={34} color={DEEP_EMERALD} style={{ margin: '18px auto' }} />
                <p style={{ maxWidth: 620, margin: '0 auto 28px', fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.55rem, 5vw, 2.45rem)', lineHeight: 1.35, color: INK }}>
                  {location || 'Wedding venue'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
                  {[
                    { href: googleMapUrl, label: t('invitation.google_maps') || 'Google Maps' },
                    { href: appleMapUrl, label: t('invitation.apple_maps') || 'Apple Maps' },
                  ].map((item) => (
                    <motion.a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ y: -2, scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 9,
                        padding: '13px 22px',
                        background: goldFoil,
                        color: PAPER,
                        textDecoration: 'none',
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: '0.72rem',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        fontWeight: 800,
                      }}
                    >
                      <MapPin size={16} />
                      {item.label}
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </Section>

            <Section warm ornate>
              <motion.div initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}>
                <SectionTitle>{t('invitation.counting') || 'We are counting every second'}</SectionTitle>
                <Divider />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(72px, 1fr))', gap: 14, maxWidth: 620, margin: '38px auto 0' }}>
                  {[
                    { value: timeLeft.days, label: t('invitation.days') || 'Days' },
                    { value: timeLeft.hours, label: t('invitation.hours') || 'Hours' },
                    { value: timeLeft.minutes, label: t('invitation.minutes') || 'Minutes' },
                    { value: timeLeft.seconds, label: t('invitation.seconds') || 'Seconds' },
                  ].map((item) => (
                    <div key={item.label} style={{ minHeight: 108, padding: '18px 8px', background: 'rgba(255,250,240,0.7)', border: '1px solid rgba(184,135,53,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 7vw, 3rem)', lineHeight: 1, ...textGold }}>{String(item.value).padStart(2, '0')}</span>
                      <span style={{ marginTop: 10, fontFamily: "'Montserrat', sans-serif", fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </Section>

            {wishes.length > 0 && (
              <Section ornate>
                <motion.div initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}>
                  <SectionTitle script>{t('invitation.wishes') || 'Guest Wishes'}</SectionTitle>
                  <Divider />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18, marginTop: 34 }}>
                    {wishes.slice(0, 6).map((wish, i) => (
                      <motion.div key={`${wish.name}-${i}`} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }} style={{ padding: 26, background: 'rgba(255,250,240,0.76)', border: '1px solid rgba(184,135,53,0.24)', boxShadow: '0 18px 36px rgba(85,61,26,0.08)' }}>
                        <Heart size={22} fill={EMERALD} color={EMERALD} style={{ marginBottom: 14 }} />
                        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '1.08rem', lineHeight: 1.7, color: MUTED }}>"{wish.wish}"</p>
                        <p style={{ marginTop: 18, color: GOLD, fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: '0.68rem', fontWeight: 800 }}>{wish.name}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </Section>
            )}

            <Section warm ornate>
              <motion.div initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}>
                <SectionTitle script>{t('invitation.rsvp') || 'RSVP'}</SectionTitle>
                <Divider />
                {rsvpDone ? (
                  <div style={{ marginTop: 28 }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 6vw, 2.8rem)', fontStyle: 'italic', ...textGold }}>{t('invitation.rsvp_success_title') || 'Thank you!'}</p>
                    <p style={{ marginTop: 10, color: MUTED }}>{t('invitation.rsvp_success_desc') || 'Your response has been received.'}</p>
                  </div>
                ) : (
                  <form onSubmit={handleRsvp} style={{ maxWidth: 560, margin: '34px auto 0', padding: 'clamp(24px, 5vw, 42px)', background: 'rgba(255,250,240,0.76)', border: '1px solid rgba(184,135,53,0.28)', boxShadow: '0 22px 44px rgba(85,61,26,0.09)', display: 'flex', flexDirection: 'column', gap: 20, textAlign: 'left' }}>
                    <label style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, fontWeight: 800 }}>
                      {t('invitation.rsvp_name') || 'Your Name'}
                      <input type="text" required placeholder={t('invitation.rsvp_name_placeholder') || 'Your full name'} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ ...inputStyle, marginTop: 10 }} />
                    </label>
                    <label style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, fontWeight: 800 }}>
                      {t('invitation.rsvp_wish') || 'Leave a wish'}
                      <textarea rows={4} placeholder={t('invitation.rsvp_wish_placeholder') || 'Leave your message...'} value={form.wish} onChange={(e) => setForm({ ...form, wish: e.target.value })} style={{ ...inputStyle, marginTop: 10, resize: 'vertical', lineHeight: 1.5 }} />
                    </label>
                    {rsvpError && <p style={{ color: '#9f3d36', textAlign: 'center', margin: 0 }}>{rsvpError}</p>}
                    <motion.button
                      type="submit"
                      disabled={rsvpLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ alignSelf: 'center', minWidth: 210, padding: '15px 26px', border: 'none', background: goldFoil, color: PAPER, fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 800, cursor: rsvpLoading ? 'default' : 'pointer', opacity: rsvpLoading ? 0.72 : 1 }}
                    >
                      {rsvpLoading ? (t('invitation.rsvp_sending') || 'Sending...') : (t('invitation.confirm') || 'Confirm')}
                    </motion.button>
                  </form>
                )}
              </motion.div>
            </Section>

            <footer style={{ position: 'relative', overflow: 'hidden', padding: '78px 20px', background: `linear-gradient(180deg, ${PAPER}, ${CREAM})`, color: INK, textAlign: 'center' }}>
              <PaperTexture />
              <ArabesqueMandala size={430} position="top" opacity={0.88} style={{ position: 'absolute', top: -250, left: '50%', transform: 'translateX(-50%)' }} />
              <div style={{ position: 'relative', zIndex: 2, maxWidth: 720, margin: '0 auto' }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 'clamp(1.2rem, 4vw, 1.65rem)', lineHeight: 1.75, color: MUTED }}>
                  {t('invitation.footer_message') || 'We are honored to celebrate this day surrounded by the people we love most.'}
                </p>
                <h3 style={{ marginTop: 22, fontFamily: "'Pinyon Script', cursive", fontSize: 'clamp(3rem, 12vw, 5.5rem)', lineHeight: 0.9, ...textGold }}>
                  {groomName} &amp; {brideName}
                </h3>
                <p style={{ marginTop: 28, fontFamily: "'Montserrat', sans-serif", fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(120,109,94,0.72)' }}>
                  2026 Taklifnoma
                </p>
              </div>
            </footer>
          </motion.main>
    </div>
  );
}
