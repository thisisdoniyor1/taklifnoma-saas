import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, MapPin, Heart } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { db } from '../../../lib/db';
import { localizedName, translateLocation, getWelcomeText } from '../../WatercolorTuscanVillaTemplate/utils/transliterate';

import palaceBg from '../assets/palace_interior_staircase.png';
import castleImg from '../assets/castle_illustration.png';
import baroqueCandle from '../assets/baroque_candle.png';
import palaceLineDraw from '../assets/palace_transparent.png';

const GOLD = '#D4AF37';
const LIGHT_GOLD = 'rgba(212, 175, 55, 0.2)';
const CREAM = '#FFFAF0';
const ROYAL_IVORY = '#fffdf8';
const DARK = '#2C3E50';
const DARK_BRONZE = '#3d2b1f';
const FONT = "'Cormorant Garamond', Georgia, serif";

// ── helpers ──────────────────────────────────────────────────────────────────
function parseDate(dateStr) {
  if (!dateStr) return { day: 26, month: 2, year: 2027 };
  const str = String(dateStr);
  if (str.includes('-')) {
    const [y, m, d] = str.split('-');
    return { day: parseInt(d, 10) || 26, month: parseInt(m, 10) || 2, year: parseInt(y, 10) || 2027 };
  }
  const [d, m, y] = str.split('.');
  return { day: parseInt(d, 10) || 26, month: parseInt(m, 10) || 2, year: parseInt(y, 10) || 2027 };
}

function calcTimeLeft(dateStr, timeStr) {
  const { day, month, year } = parseDate(dateStr || '26.02.2027');
  const t = timeStr || '18:00';
  const diff = Math.max(0, new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${t}:00`).getTime() - Date.now());
  return {
    days: Math.floor(diff / 864e5),
    hours: Math.floor((diff / 36e5) % 24),
    minutes: Math.floor((diff / 6e4) % 60),
    seconds: Math.floor((diff / 1e3) % 60),
  };
}

const MONTH_NAMES = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  uz_cyrl: ['Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн', 'Июл', 'Август', 'Сентабр', 'Октабр', 'Ноябр', 'Декабр'],
  tj: ['Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн', 'Июл', 'Август', 'Сентябр', 'Октябр', 'Ноябр', 'Декабр'],
};

// ── sub-components ────────────────────────────────────────────────────────────
function Section({ children, bg = '#fff', id }) {
  return (
    <section id={id} style={{ padding: '80px 20px', backgroundColor: bg }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>{children}</div>
    </section>
  );
}

function SectionTitle({ children, script = false, color = GOLD }) {
  return (
    <h2 
      className={script ? "wedding-date-title" : "confirm-attendance-title"}
      style={{
        fontFamily: FONT,
        fontSize: script ? 'clamp(2.4rem, 8vw, 3.2rem)' : 'clamp(1.8rem, 5vw, 2.2rem)',
        color: color,
        fontWeight: script ? 300 : 400,
        textAlign: 'center',
        marginBottom: 40,
        fontStyle: script ? 'italic' : 'normal',
        letterSpacing: script ? 1 : 2,
      }}
    >
      {children}
    </h2>
  );
}

const DUMMY_WISHES_BY_LANG = {
  en: [
    { name: 'Sarah & James', wish: 'Wishing you a lifetime of love and happiness!' },
    { name: 'The Smith Family', wish: 'So excited to celebrate this beautiful day with you both.' },
    { name: 'Emily', wish: 'May your years ahead be filled with lasting joy.' }
  ],
  ru: [
    { name: 'Дмитрий и Анна', wish: 'Желаем вам бесконечной любви и семейного счастья!' },
    { name: 'Семья Смирновых', wish: 'Очень рады разделить с вами этот прекрасный день.' },
    { name: 'Елена', wish: 'Пусть ваша совместная жизнь будет полна радости и тепла.' }
  ],
  uz_cyrl: [
    { name: 'Азиз ва Малика', wish: 'Сизларга умрбод севги ва оилавий бахт тилаймиз!' },
    { name: 'Каримовлар оиласи', wish: 'Ушбу гўзал кунни сизлар билан нишонлашдан жуда мамнунмиз.' },
    { name: 'Дилором', wish: 'Келажак ҳаётингиз доимо қувонч ва бахтга тўла бўлсин.' }
  ],
  tj: [
    { name: 'Азиз ва Малика', wish: 'Ба шумо ишқу муҳаббати ҷовидона ва бахти оилавӣ таманно дорем!' },
    { name: 'Оилаи Каримовҳо', wish: 'Хеле хушҳолем, ки ин рӯзи зеборо бо шумо ҷашн мегирем.' },
    { name: 'Дилором', wish: 'Бигзор ҳаёти муштараки шумо ҳамеша пур аз шодиву нишот бошад.' }
  ]
};

// ── main ─────────────────────────────────────────────────────────────────────
export default function MainContent({ data }) {
  const { t, language } = useLanguage();
  const params = useParams();
  const invRef = params['*'] || params.id || (params.slugPrefix && params.slugName ? `${params.slugPrefix}/${params.slugName}` : '');

  const WRITE_WISH_HEADING = {
    en: "Write Your Wishes",
    ru: "Напишите свои пожелания",
    uz_cyrl: "Тилакларингизни ёзинг",
    tj: "Таманниёти худро нависед"
  };

  const SEND_WISH_BTN = {
    en: "Send Wish",
    ru: "Отправить пожелание",
    uz_cyrl: "Тилакни юбориш",
    tj: "Таманниётро ирсол кунед"
  };

  const groomName = localizedName(data?.groomName || 'Groom', language);
  const brideName = localizedName(data?.brideName || 'Bride', language);
  const { day, month, year } = parseDate(data?.wedding_date || data?.date);
  const monthName = (MONTH_NAMES[language] || MONTH_NAMES.en)[month - 1];
  const welcomeText = getWelcomeText(data?.welcomeText, language, t);
  const timeLabels = {
    en: 'Time',
    ru: 'Время',
    uz_cyrl: 'Vaqt',
    tj: 'Вақт'
  };
  const timeLabel = timeLabels[language] || 'Time';

  // Countdown
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(data?.wedding_date || data?.date, data?.wedding_time || data?.time));
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft(data?.wedding_date || data?.date, data?.wedding_time || data?.time)), 1000);
    return () => clearInterval(id);
  }, [data?.wedding_date, data?.date, data?.wedding_time, data?.time]);

  // Calendar
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDow = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const calCells = Array.from({ length: firstDow + daysInMonth }, (_, i) =>
    i < firstDow ? null : i - firstDow + 1
  );

  // RSVP
  const [form, setForm] = useState({ name: '', wish: '' });
  const [rsvpDone, setRsvpDone] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const handleRsvp = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setRsvpLoading(true);
    try {
      await db.addRSVP(invRef, { name: form.name, wish: form.wish, status: 'attending' });
      setRsvpDone(true);
    } catch { }
    setRsvpLoading(false);
  };

  let wishes = Array.isArray(data?.rsvps) ? data.rsvps.filter(r => r.wish) : [];
  const isPreview = !invRef || data?.isPreview;
  if (isPreview && wishes.length === 0) {
    wishes = DUMMY_WISHES_BY_LANG[language] || DUMMY_WISHES_BY_LANG.en;
  }
  const location = translateLocation(data?.location || '', language);
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(location)}`;
  const appleMapsUrl = `http://maps.apple.com/?q=${encodeURIComponent(location)}`;

  const isCyrillicFallback = language === 'uz_cyrl' || language === 'tj';
  const currentFont = isCyrillicFallback ? 'Georgia, serif' : FONT;
  const currentTitleFont = isCyrillicFallback ? 'Georgia, serif' : "'Playfair Display', serif";

  return (
    <motion.div key={language} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ fontFamily: currentFont, color: DARK_BRONZE, backgroundColor: ROYAL_IVORY }}>
      <style>{`
        @media (min-width: 1024px) {
          body.preview-open .confirm-attendance-title {
            font-size: 1.5rem !important;
          }
          body.preview-open .wedding-date-title {
            font-size: 1.8rem !important;
          }
          body.preview-open .location-title {
            font-size: 1.5rem !important;
          }
        }
      `}</style>
      {/* HERO — Grand Palace Interior Staircase */}
      <section style={{
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundImage: `linear-gradient(180deg, rgba(20,10,5,0.38) 0%, rgba(10,5,2,0.18) 50%, rgba(20,10,5,0.48) 100%), url(${palaceBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#1a0f05',
        color: '#fff', 
        textAlign: 'center', 
        padding: '0 20px', 
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* No overlay — let the palace breathe */}

        {/* Name Card — no frame, names float freely over the palace */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          transition={{ duration: 1.5, delay: 0.4 }}
          style={{ 
            maxWidth: '500px', 
            margin: '-80px auto 0',
            padding: '40px 30px',
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            position: 'relative',
            zIndex: 1
          }}
        >
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1, delay: 0.8 }}
            style={{ 
              fontFamily: FONT, 
              fontSize: 'clamp(2.6rem, 10vw, 4.0rem)', 
              fontWeight: 400, 
              letterSpacing: 1, 
              color: '#fff', 
              margin: 0,
              fontStyle: 'italic',
              textShadow: '0 2px 20px rgba(0,0,0,0.75), 0 1px 6px rgba(0,0,0,0.5)'
            }}
          >
            {groomName}
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 1, delay: 1.2 }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '18px 0' 
            }}
          >
            <div style={{ width: '60px', height: '1.5px', background: '#fff', opacity: 0.8 }} />
            <span style={{ 
              fontFamily: FONT, 
              fontStyle: 'italic', 
              fontSize: 'clamp(1.6rem, 4.5vw, 2.8rem)', 
              color: '#fff', 
              padding: '0 22px' 
            }}>
              &
            </span>
            <div style={{ width: '60px', height: '1.5px', background: '#fff', opacity: 0.8 }} />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1, delay: 1 }}
            style={{ 
              fontFamily: FONT, 
              fontSize: 'clamp(2.6rem, 10vw, 4.0rem)', 
              fontWeight: 400, 
              letterSpacing: 1, 
              color: '#fff', 
              margin: 0,
              fontStyle: 'italic',
              textShadow: '0 2px 20px rgba(0,0,0,0.75), 0 1px 6px rgba(0,0,0,0.5)'
            }}
          >
            {brideName}
          </motion.h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} 
          animate={{ opacity: 0.9, y: [0, 8, 0] }}
          transition={{ opacity: { duration: 1, delay: 2.5 }, y: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
          style={{ 
            position: 'absolute', 
            bottom: 40,
            left: 0,
            right: 0,
            margin: '0 auto',
            width: 'fit-content',
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 8,
          }}
        >
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 3, fontWeight: 700, color: '#fbe8a6', textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
            {t('invitation.scroll')}
          </span>
          <ChevronDown size={22} color="#fbe8a6" />
        </motion.div>
      </section>

      {/* INVITATION TEXT with candles at bottom corners */}
      <Section bg={CREAM}>
        <div style={{ position: 'relative' }}>
          <motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 30 }} transition={{ duration: 1 }} viewport={{ once: true }}>
            <p style={{ fontFamily: FONT, fontSize: 'clamp(1.1rem,2vw,1.5rem)', fontStyle: 'italic', lineHeight: 1.9, color: DARK_BRONZE, opacity: 0.9, maxWidth: 700, margin: '0 auto', textAlign: 'center', padding: '0 20px', paddingBottom: '60px' }}>
              {welcomeText}
            </p>
          </motion.div>
          {/* Candle — bottom left */}
          <motion.img
            src={baroqueCandle}
            alt="candle"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }} viewport={{ once: true }}
            style={{
              position: 'absolute',
              bottom: -20,
              left: '12%',
              width: '85px',
              height: 'auto',
              objectFit: 'contain',
              mixBlendMode: 'multiply',
              pointerEvents: 'none',
            }}
          />
          {/* Candle — bottom right */}
          <motion.img
            src={baroqueCandle}
            alt="candle"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }} viewport={{ once: true }}
            style={{
              position: 'absolute',
              bottom: -20,
              right: '12%',
              width: '85px',
              height: 'auto',
              objectFit: 'contain',
              mixBlendMode: 'multiply',
              pointerEvents: 'none',
              transform: 'scaleX(-1)',
            }}
          />
        </div>
      </Section>

      {/* EVENT DETAILS — calendar + maps */}
      <Section bg={ROYAL_IVORY}>
        <SectionTitle script>{t('invitation.calendar')}</SectionTitle>

        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} viewport={{ once: true }}
          style={{
            maxWidth: 300, margin: '0 auto 40px',
            background: 'white', borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)', border: '1px solid #f0e0d0', padding: 16,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 16, borderBottom: '2px solid #fdfaf5', paddingBottom: 12 }}>
            <span style={{ 
              fontFamily: FONT, 
              fontSize: 'clamp(1.1rem, 3.5vw, 1.3rem)', 
              color: GOLD, 
              textTransform: 'uppercase', 
              letterSpacing: 2, 
              fontWeight: 700,
              fontStyle: 'italic'
            }}>
              {monthName} {year}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, textAlign: 'center' }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} style={{ fontFamily: "'Lato',sans-serif", fontSize: '0.65rem', fontWeight: 800, color: GOLD, opacity: 0.6, paddingBottom: 6 }}>{d}</div>
            ))}
            {calCells.map((d, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 30, position: 'relative', fontFamily: "'Lato',sans-serif", fontSize: '0.75rem', fontWeight: d === day ? 800 : 600, color: d === day ? '#fff' : d === null ? 'transparent' : '#444' }}>
                {d === day && (
                  <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                    style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 0 }}>
                    <Heart size={32} color={GOLD} fill={GOLD} strokeWidth={0} style={{ position: 'absolute', transform: 'translateY(1px)' }} />
                  </motion.div>
                )}
                <span style={{ position: 'relative', zIndex: 1, lineHeight: 1, display: 'inline-block', transform: 'translateY(-0.5px)' }}>{d}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {location && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }} viewport={{ once: true }} style={{ textAlign: 'center', marginTop: 50 }}>
            <h3 
              className="location-title"
              style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.8rem,5vw,2.4rem)', color: DARK_BRONZE, marginBottom: 24, fontWeight: 700, letterSpacing: 1 }}
            >
              {t('invitation.location')}
            </h3>

            {/* Palace illustration — short banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }} viewport={{ once: true }}
              style={{ display: 'flex', justifyContent: 'center', marginBottom: 24, overflow: 'hidden' }}
            >
              <img
                src={palaceLineDraw}
                alt="Palace illustration"
                style={{
                  width: '100%',
                  maxWidth: '550px',
                  height: '200px',
                  objectFit: 'contain',
                  opacity: 0.95,
                  mixBlendMode: 'multiply',
                }}
              />
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap', maxWidth: '90%' }}>
                <MapPin size={24} color={DARK_BRONZE} style={{ flexShrink: 0 }} />
                <p style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 'clamp(1.5rem, 4.8vw, 2.1rem)', fontWeight: 600, color: DARK_BRONZE, lineHeight: 1.5, opacity: 0.95, margin: 0, textAlign: 'center' }}>
                  {location}
                </p>
              </div>
              {(data?.wedding_time || data?.time) && (
                <p style={{ fontFamily: "'Lato',sans-serif", fontSize: '1.1rem', color: DARK_BRONZE, margin: 0, fontWeight: 700 }}>
                  {timeLabel}: {data?.wedding_time || data?.time}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'nowrap', width: '100%', maxWidth: '360px', margin: '0 auto' }}>
              {[
                { href: mapsUrl, label: t('invitation.google_maps') || 'Google Maps' },
                { href: appleMapsUrl, label: t('invitation.apple_maps') || 'Apple Maps' }
              ].map(btn => (
                <motion.a key={btn.label} href={btn.href} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, backgroundColor: '#2a1a0e' }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '10px 16px', borderRadius: '30px', textDecoration: 'none',
                    fontSize: '0.68rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                    backgroundColor: DARK_BRONZE, color: '#fbe8a6', border: '1px solid rgba(212,175,55,0.4)',
                    boxShadow: '0 4px 12px rgba(62,42,24,0.2)',
                    cursor: 'pointer',
                    flex: 1,
                    maxWidth: 180,
                    whiteSpace: 'nowrap'
                  }}>
                  <MapPin size={12} color="#fbe8a6" />
                  {btn.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </Section>

      {/* COUNTDOWN */}
      <section style={{ padding: '60px 20px', backgroundColor: CREAM, textAlign: 'center' }}>
        <h2 style={{ fontFamily: currentTitleFont, fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', color: DARK_BRONZE, marginBottom: 30, fontWeight: 400, letterSpacing: 1 }}>
          {t('invitation.counting')}
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'nowrap', maxWidth: '100%', margin: '0 auto' }}>
          {[
            { val: timeLeft.days, label: t('invitation.days') },
            { val: timeLeft.hours, label: t('invitation.hours') },
            { val: timeLeft.minutes, label: t('invitation.minutes') },
            { val: timeLeft.seconds, label: t('invitation.seconds') },
          ].map((u, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white', padding: 6, borderRadius: '50%', width: 74, height: 74, justifyContent: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', border: `1px solid ${GOLD}`, flexShrink: 0 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 600, color: GOLD, fontFamily: currentFont, lineHeight: 1.1 }}>{String(u.val).padStart(2, '0')}</span>
              <span style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: 0.5, color: '#95A5A6', marginTop: 2 }}>{u.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* WISHES */}
      <Section bg={CREAM}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {wishes.length > 0 ? (
            <>
              <h3 style={{ fontFamily: currentTitleFont, fontSize: 'clamp(1.3rem, 3.5vw, 1.8rem)', color: DARK_BRONZE, marginBottom: 24, fontWeight: 400, textAlign: 'center', letterSpacing: 1 }}>
                {t('invitation.wishes')}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                {wishes.slice(0, 6).map((w, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true }}
                    style={{ background: 'white', padding: 20, borderRadius: 15, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderTop: `5px solid ${GOLD}`, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <p style={{ fontFamily: isCyrillicFallback ? 'Georgia, serif' : "'Lato',sans-serif", fontSize: '0.95rem', color: DARK_BRONZE, lineHeight: 1.6, fontStyle: 'italic', marginBottom: 12 }}>"{w.wish}"</p>
                    <span style={{ fontFamily: currentTitleFont, fontSize: '0.95rem', color: GOLD, fontWeight: 600 }}>— {w.name}</span>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <h3 style={{ fontFamily: currentTitleFont, fontSize: '1.6rem', color: DARK_BRONZE, marginBottom: 12, fontWeight: 400 }}>
                {t('invitation.wishes')}
              </h3>
              <p style={{ fontFamily: currentFont, fontSize: '0.95rem', color: DARK_BRONZE, opacity: 0.7, fontStyle: 'italic' }}>
                {t('invitation.wish_empty')}
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* RSVP */}
      <Section bg="#f9f5ed">
        <SectionTitle>{WRITE_WISH_HEADING[language] || WRITE_WISH_HEADING.en}</SectionTitle>
        {rsvpDone ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '2rem', color: GOLD, fontWeight: 300 }}>{t('invitation.rsvp_success_title')}</p>
            <p style={{ marginTop: 12, color: '#666' }}>{t('invitation.rsvp_success_desc')}</p>
          </motion.div>
        ) : (
          <motion.form onSubmit={handleRsvp} whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 30 }} transition={{ duration: 0.8 }} viewport={{ once: true }}
            style={{ maxWidth: 580, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28, background: '#fdfcf9', padding: 40, borderRadius: 15, boxShadow: '0 10px 30px rgba(0,0,0,0.03)', textAlign: 'left' }}>
            {[
              { key: 'name', label: t('invitation.rsvp_name'), placeholder: '', type: 'text', required: true },
              { key: 'wish', label: t('invitation.rsvp_wish'), placeholder: '', type: 'textarea' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontFamily: "'Lato',sans-serif", color: DARK_BRONZE, fontWeight: 600, fontSize: '0.85rem', letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.7, display: 'block', marginBottom: 10 }}>{f.label}</label>
                <input type="text" required={f.key === 'name'} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width: '100%', padding: '14px 16px', border: '1px solid #ddd', borderRadius: 8, fontFamily: "'Lato',sans-serif", fontSize: '1rem', outline: 'none', color: DARK_BRONZE }} />
              </div>
            ))}
            <motion.button type="submit" disabled={rsvpLoading}
              whileHover={{ scale: 1.03, backgroundColor: '#2a1a0e' }} whileTap={{ scale: 0.97 }}
              style={{
                padding: '13px 36px', backgroundColor: DARK_BRONZE, color: '#fbe8a6', border: '1px solid rgba(212,175,55,0.4)',
                boxShadow: '0 8px 20px rgba(62,42,24,0.3)',
                borderRadius: '30px', fontFamily: "'Lato',sans-serif", fontSize: '0.8rem', letterSpacing: 2,
                textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', alignSelf: 'center', marginTop: 8
              }}>
              {rsvpLoading ? '...' : (SEND_WISH_BTN[language] || SEND_WISH_BTN.en)}
            </motion.button>
          </motion.form>
        )}
      </Section>

      {/* FOOTER */}
      <footer style={{ padding: '60px 20px', backgroundColor: DARK_BRONZE, color: 'white', textAlign: 'center' }}>
        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', marginBottom: 16, fontStyle: 'italic', fontWeight: 300, opacity: 0.9, letterSpacing: 1 }}>
          {t('invitation.footer_message')}
        </p>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2.2rem', color: GOLD, marginBottom: 20, fontWeight: 300, letterSpacing: 2 }}>
          {groomName} &amp; {brideName}
        </h3>
        <p style={{ fontFamily: "'Lato',sans-serif", fontSize: '0.85rem', opacity: 0.5, letterSpacing: '1.5px', marginTop: 28, lineHeight: 1.6 }}>
          © 2026 Taklifnoma
        </p>
      </footer>
    </motion.div>
  );
}
