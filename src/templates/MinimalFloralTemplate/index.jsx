import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, Clock, Heart, MapPin } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../lib/db';

const RED = '#8f1118';
const RED_DARK = '#4f070b';
const RED_DEEP = '#260306';
const GOLD = '#d8ae58';
const CREAM = '#fff6e6';
const PAPER = '#fffaf0';
const INK = '#2d1714';
const MUTED = '#745a50';

const MONTH_NAMES = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  uz: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'],
  uz_cyrl: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'],
  tg: ['Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн', 'Июл', 'Август', 'Сентябр', 'Октябр', 'Ноябр', 'Декабр'],
  tj: ['Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн', 'Июл', 'Август', 'Сентябр', 'Октябр', 'Ноябр', 'Декабр'],
};

function parseDate(dateStr) {
  if (!dateStr) return { day: 25, month: 4, year: 2026 };
  const [d, m, y] = String(dateStr).split('.');
  return {
    day: parseInt(d, 10) || 25,
    month: parseInt(m, 10) || 4,
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

const goldFoil = 'linear-gradient(135deg, #8e5d1c 0%, #d8ae58 40%, #fff1ae 52%, #bd812c 66%, #704312 100%)';
const textGold = {
  background: goldFoil,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: GOLD,
};

function CurtainPanel({ side = 'left', open = false, fixed = false }) {
  const isLeft = side === 'left';
  const width = fixed ? '17vw' : '50vw';
  const minWidth = fixed ? 54 : 0;
  const x = open ? (isLeft ? '-66%' : '66%') : '0%';

  return (
    <motion.div
      aria-hidden
      initial={false}
      animate={{ x }}
      transition={{ duration: 1.35, ease: [0.76, 0, 0.24, 1] }}
      style={{
        position: fixed ? 'fixed' : 'absolute',
        top: 0,
        bottom: 0,
        [isLeft ? 'left' : 'right']: 0,
        width,
        minWidth,
        zIndex: fixed ? 20 : 5,
        pointerEvents: 'none',
        overflow: 'hidden',
        background:
          `linear-gradient(${isLeft ? 90 : 270}deg, ${RED_DEEP} 0%, ${RED_DARK} 14%, ${RED} 35%, #b51d24 52%, ${RED_DARK} 76%, ${RED_DEEP} 100%)`,
        boxShadow: isLeft ? '18px 0 36px rgba(30,0,2,0.34)' : '-18px 0 36px rgba(30,0,2,0.34)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(90deg, rgba(255,255,255,0.13), transparent 13%, rgba(0,0,0,0.22) 26%, transparent 42%, rgba(255,255,255,0.1) 56%, rgba(0,0,0,0.28) 76%, transparent)',
          backgroundSize: '58px 100%',
          opacity: 0.8,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          [isLeft ? 'right' : 'left']: 0,
          width: 18,
          background: 'linear-gradient(180deg, rgba(255,236,168,0.8), rgba(128,65,13,0.8), rgba(255,236,168,0.72))',
          boxShadow: isLeft ? '-8px 0 18px rgba(0,0,0,0.28)' : '8px 0 18px rgba(0,0,0,0.28)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 70,
          background: `linear-gradient(180deg, ${RED_DARK}, rgba(143,17,24,0))`,
        }}
      />
    </motion.div>
  );
}

function TopValance({ fixed = false }) {
  return (
    <div
      aria-hidden
      style={{
        position: fixed ? 'fixed' : 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: fixed ? 54 : 76,
        zIndex: fixed ? 22 : 8,
        pointerEvents: 'none',
        background: `linear-gradient(180deg, ${RED_DARK} 0%, ${RED} 54%, ${RED_DARK} 100%)`,
        boxShadow: '0 14px 30px rgba(35,0,2,0.28)',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.12), transparent 12%, rgba(0,0,0,0.2) 25%, transparent 42%)', backgroundSize: '72px 100%' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 5, background: goldFoil }} />
    </div>
  );
}

function StageBackdrop({ children, dark = false }) {
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '88px 20px 72px',
        background: dark
          ? `radial-gradient(circle at center, rgba(216,174,88,0.18), transparent 38%), linear-gradient(180deg, ${RED_DEEP}, ${RED_DARK})`
          : `radial-gradient(circle at 50% 18%, rgba(216,174,88,0.18), transparent 28%), linear-gradient(180deg, ${PAPER}, ${CREAM})`,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          opacity: dark ? 0.18 : 0.42,
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(216,174,88,0.18) 1px, transparent 0), linear-gradient(90deg, rgba(143,17,24,0.05) 1px, transparent 1px)',
          backgroundSize: '26px 26px, 54px 54px',
        }}
      />
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 920, textAlign: 'center', color: dark ? PAPER : INK }}>
        {children}
      </div>
    </section>
  );
}

function Divider({ dark = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 'min(260px, 72%)', margin: '24px auto' }}>
      <span style={{ flex: 1, height: 1, background: dark ? 'rgba(216,174,88,0.5)' : 'rgba(143,17,24,0.28)' }} />
      <span style={{ width: 7, height: 7, transform: 'rotate(45deg)', background: goldFoil }} />
      <span style={{ flex: 1, height: 1, background: dark ? 'rgba(216,174,88,0.5)' : 'rgba(143,17,24,0.28)' }} />
    </div>
  );
}

function Section({ children, dark = false }) {
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '86px 20px',
        background: dark
          ? `radial-gradient(circle at 50% 0%, rgba(216,174,88,0.18), transparent 30%), linear-gradient(180deg, ${RED_DARK}, ${RED_DEEP})`
          : `linear-gradient(180deg, ${PAPER}, ${CREAM})`,
        color: dark ? PAPER : INK,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          opacity: dark ? 0.16 : 0.36,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(216,174,88,0.18) 1px, transparent 0)',
          backgroundSize: '26px 26px',
        }}
      />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 920, margin: '0 auto', textAlign: 'center' }}>
        {children}
      </div>
    </section>
  );
}

function SectionTitle({ children, script = false, dark = false }) {
  return (
    <h2
      style={{
        fontFamily: script ? "'Pinyon Script', cursive" : "'Playfair Display', serif",
        fontSize: script ? 'clamp(3.1rem, 10vw, 5.2rem)' : 'clamp(2rem, 6vw, 3.3rem)',
        fontStyle: script ? 'normal' : 'italic',
        fontWeight: 400,
        marginBottom: 4,
        letterSpacing: 0,
        ...(dark ? textGold : { color: INK }),
      }}
    >
      {children}
    </h2>
  );
}

// Removed MusicToggle in favor of GlobalInvitationControls

function CurtainIntro({ opened, onOpen }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55 }}
      style={{
        minHeight: '100dvh',
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        overflow: 'hidden',
        background: `radial-gradient(circle at center, rgba(216,174,88,0.24), transparent 34%), linear-gradient(180deg, ${RED_DEEP}, #120102)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <TopValance />
      <CurtainPanel side="left" open={opened} />
      <CurtainPanel side="right" open={opened} />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: opened ? 0 : 1, y: opened ? -10 : 0, scale: opened ? 0.96 : 1 }}
        transition={{ duration: opened ? 0.45 : 0.9, delay: opened ? 0 : 0.35 }}
        style={{
          position: 'relative',
          zIndex: 10,
          width: 'min(92vw, 560px)',
          padding: '56px clamp(24px, 6vw, 64px)',
          textAlign: 'center',
          color: CREAM,
          border: `1px solid rgba(216,174,88,0.55)`,
          background: 'rgba(30,2,4,0.4)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.38)',
          backdropFilter: 'blur(2px)',
        }}
      >
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.5rem, 9vw, 5.2rem)', fontWeight: 400, lineHeight: 1.05, color: CREAM }}>
          Behind the Curtain
        </h1>
        <Divider dark />
        <motion.button
          type="button"
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onOpen}
          style={{
            marginTop: 16,
            padding: '14px 34px',
            border: 'none',
            background: goldFoil,
            color: RED_DEEP,
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '0.72rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 14px 30px rgba(0,0,0,0.28)',
          }}
        >
          Click to Open
        </motion.button>
      </motion.div>
    </motion.section>
  );
}

export default function MinimalFloralTemplate({ data }) {
  const [introOpen, setIntroOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const { t, language } = useLanguage();
  const params = useParams();
  const invRef = params['*'] || params.id || (params.slugPrefix && params.slugName ? `${params.slugPrefix}/${params.slugName}` : '');

  const groomName = data?.groomName || 'Rustam';
  const brideName = data?.brideName || 'Tahmina';
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

  useEffect(() => {
    if (!introOpen) return undefined;
    const id = setTimeout(() => setShowIntro(false), 1250);
    return () => clearTimeout(id);
  }, [introOpen]);

  const openInvitation = () => {
    setIntroOpen(true);
  };

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
    border: '1px solid rgba(143,17,24,0.22)',
    background: 'rgba(255,250,240,0.78)',
    color: INK,
    outlineColor: RED,
    fontFamily: "'Lato', sans-serif",
    fontSize: '1rem',
  };

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', background: PAPER, color: INK, fontFamily: "'Lato', sans-serif" }}>
      <TopValance fixed />
      {introOpen && (
        <>
          <CurtainPanel side="left" open fixed />
          <CurtainPanel side="right" open fixed />
        </>
      )}

      <AnimatePresence>
        {showIntro && <CurtainIntro key="curtain-intro" opened={introOpen} onOpen={openInvitation} />}
      </AnimatePresence>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: introOpen ? 1 : 0.18 }}
        transition={{ duration: 0.9, delay: introOpen ? 0.45 : 0 }}
        style={{ position: 'relative', zIndex: 1 }}
      >


        <StageBackdrop dark>
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: introOpen ? 1 : 0, y: introOpen ? 0 : 28 }} transition={{ duration: 1, delay: introOpen ? 0.9 : 0 }}>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.68rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: GOLD }}>
              {t('invitation.label') || 'Wedding Invitation'}
            </p>
            <h1 style={{ marginTop: 28, fontFamily: "'Pinyon Script', cursive", fontSize: 'clamp(3rem, 12vw, 6rem)', lineHeight: 0.76, ...textGold }}>
              {groomName}
              <span style={{ display: 'block', fontSize: '0.46em', color: CREAM, WebkitTextFillColor: CREAM, fontFamily: "'Playfair Display', serif", fontStyle: 'normal' }}>&amp;</span>
              {brideName}
            </h1>
            <Divider dark />
            <p style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.26em', textTransform: 'uppercase', color: 'rgba(255,246,230,0.82)', fontSize: '0.76rem' }}>
              {monthName} {day}, {year}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: '-50%' }}
            animate={{ opacity: introOpen ? 1 : 0, x: '-50%', y: [0, 10, 0] }}
            transition={{ opacity: { duration: 1, delay: 1.4 }, y: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
            style={{ position: 'absolute', left: '50%', bottom: 10, zIndex: 4, color: GOLD, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.62rem', letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(255,246,230,0.76)' }}>{t('invitation.scroll') || 'Scroll down'}</span>
            <ChevronDown size={24} />
          </motion.div>
        </StageBackdrop>

        <Section>
          <motion.div initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-120px' }} transition={{ duration: 0.9 }}>
            <SectionTitle script>{t('invitation.welcome') || 'Welcome'}</SectionTitle>
            <Divider />
            <p style={{ maxWidth: 700, margin: '0 auto', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 'clamp(1.16rem, 3vw, 1.56rem)', lineHeight: 1.95, color: MUTED }}>
              {t('invitation.speech') || 'We are delighted to invite you to celebrate this beautiful day with us.'}
            </p>
          </motion.div>
        </Section>

        <Section dark>
          <motion.div initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}>
            <SectionTitle dark>{t('invitation.calendar') || 'Save the Date'}</SectionTitle>
            <Divider dark />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 30, alignItems: 'center', marginTop: 36 }}>
              <div>
                <Calendar size={34} color={GOLD} style={{ margin: '0 auto 20px' }} />
                <p style={{ fontFamily: "'Pinyon Script', cursive", fontSize: 'clamp(4rem, 13vw, 6.5rem)', lineHeight: 0.86, ...textGold }}>{day}</p>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 7vw, 3.5rem)', fontStyle: 'italic', color: CREAM, marginTop: 16 }}>
                  {monthName}
                </p>
                <p style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.34em', textTransform: 'uppercase', color: 'rgba(255,246,230,0.72)', marginTop: 12 }}>{year}</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 22, color: GOLD, fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.14em' }}>
                  <Clock size={18} />
                  <span>{data?.time || '18:00'}</span>
                </div>
              </div>
              <div style={{ background: 'rgba(255,246,230,0.95)', padding: 24, border: `1px solid rgba(216,174,88,0.42)`, boxShadow: '0 22px 44px rgba(0,0,0,0.22)', color: INK }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.35rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 18 }}>
                  {monthName} {year}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, i) => (
                    <div key={`${label}-${i}`} style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.68rem', fontWeight: 800, color: RED, paddingBottom: 9 }}>{label}</div>
                  ))}
                  {calendarCells.map((value, i) => (
                    <div key={i} style={{ height: 34, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: value === null ? 'transparent' : INK, fontWeight: 700 }}>
                      {value === day && <Heart size={34} fill={RED} color={RED} style={{ position: 'absolute', opacity: 0.95 }} />}
                      <span style={{ position: 'relative', zIndex: 1, color: value === day ? CREAM : 'inherit' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </Section>

        <Section>
          <motion.div initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}>
            <SectionTitle script>{t('invitation.location') || 'Location'}</SectionTitle>
            <Divider />
            <MapPin size={34} color={RED} style={{ margin: '18px auto' }} />
            <p style={{ maxWidth: 640, margin: '0 auto 28px', fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.55rem, 5vw, 2.45rem)', lineHeight: 1.35, color: INK }}>
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
                    color: RED_DEEP,
                    textDecoration: 'none',
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '0.72rem',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    fontWeight: 900,
                  }}
                >
                  <MapPin size={16} />
                  {item.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </Section>

        <Section dark>
          <motion.div initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}>
            <SectionTitle dark>{t('invitation.counting') || 'We are counting every second'}</SectionTitle>
            <Divider dark />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(72px, 1fr))', gap: 14, maxWidth: 620, margin: '38px auto 0' }}>
              {[
                { value: timeLeft.days, label: t('invitation.days') || 'Days' },
                { value: timeLeft.hours, label: t('invitation.hours') || 'Hours' },
                { value: timeLeft.minutes, label: t('invitation.minutes') || 'Minutes' },
                { value: timeLeft.seconds, label: t('invitation.seconds') || 'Seconds' },
              ].map((item) => (
                <div key={item.label} style={{ minHeight: 108, padding: '18px 8px', background: 'rgba(255,246,230,0.08)', border: '1px solid rgba(216,174,88,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 7vw, 3rem)', lineHeight: 1, ...textGold }}>{String(item.value).padStart(2, '0')}</span>
                  <span style={{ marginTop: 10, fontFamily: "'Montserrat', sans-serif", fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,246,230,0.7)' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </Section>

        {wishes.length > 0 && (
          <Section>
            <motion.div initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}>
              <SectionTitle script>{t('invitation.wishes') || 'Guest Wishes'}</SectionTitle>
              <Divider />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18, marginTop: 34 }}>
                {wishes.slice(0, 6).map((wish, i) => (
                  <motion.div key={`${wish.name}-${i}`} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }} style={{ padding: 26, background: 'rgba(255,250,240,0.78)', border: '1px solid rgba(143,17,24,0.16)', boxShadow: '0 18px 36px rgba(45,23,20,0.08)' }}>
                    <Heart size={22} fill={RED} color={RED} style={{ marginBottom: 14 }} />
                    <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '1.08rem', lineHeight: 1.7, color: MUTED }}>"{wish.wish}"</p>
                    <p style={{ marginTop: 18, color: RED, fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: '0.68rem', fontWeight: 900 }}>{wish.name}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </Section>
        )}

        <Section>
          <motion.div initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}>
            <SectionTitle script>{t('invitation.rsvp') || 'RSVP'}</SectionTitle>
            <Divider />
            {rsvpDone ? (
              <div style={{ marginTop: 28 }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 6vw, 2.8rem)', color: RED, fontStyle: 'italic' }}>{t('invitation.rsvp_success_title') || 'Thank you!'}</p>
                <p style={{ marginTop: 10, color: MUTED }}>{t('invitation.rsvp_success_desc') || 'Your response has been received.'}</p>
              </div>
            ) : (
              <form onSubmit={handleRsvp} style={{ maxWidth: 560, margin: '34px auto 0', padding: 'clamp(24px, 5vw, 42px)', background: 'rgba(255,250,240,0.78)', border: '1px solid rgba(143,17,24,0.18)', boxShadow: '0 22px 44px rgba(45,23,20,0.08)', display: 'flex', flexDirection: 'column', gap: 20, textAlign: 'left' }}>
                <label style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: RED, fontWeight: 900 }}>
                  {t('invitation.rsvp_name') || 'Your Name'}
                  <input type="text" required placeholder="" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ ...inputStyle, marginTop: 10 }} />
                </label>
                <label style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: RED, fontWeight: 900 }}>
                  {t('invitation.rsvp_wish') || 'Leave a wish'}
                  <textarea rows={4} placeholder="" value={form.wish} onChange={(e) => setForm({ ...form, wish: e.target.value })} style={{ ...inputStyle, marginTop: 10, resize: 'vertical', lineHeight: 1.5 }} />
                </label>
                {rsvpError && <p style={{ color: '#9f3d36', textAlign: 'center', margin: 0 }}>{rsvpError}</p>}
                <motion.button
                  type="submit"
                  disabled={rsvpLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ alignSelf: 'center', minWidth: 210, padding: '15px 26px', border: 'none', background: goldFoil, color: RED_DEEP, fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 900, cursor: rsvpLoading ? 'default' : 'pointer', opacity: rsvpLoading ? 0.72 : 1 }}
                >
                  {rsvpLoading ? (t('invitation.rsvp_sending') || 'Sending...') : (t('invitation.confirm') || 'Confirm')}
                </motion.button>
              </form>
            )}
          </motion.div>
        </Section>

        <footer style={{ position: 'relative', overflow: 'hidden', padding: '84px 20px 96px', background: `linear-gradient(180deg, ${RED_DARK}, ${RED_DEEP})`, color: CREAM, textAlign: 'center' }}>
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 720, margin: '0 auto' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 'clamp(1.2rem, 4vw, 1.65rem)', lineHeight: 1.75, color: 'rgba(255,246,230,0.82)' }}>
              {t('invitation.footer_message') || 'We are honored to celebrate this day surrounded by the people we love most.'}
            </p>
            <h3 style={{ marginTop: 22, fontFamily: "'Pinyon Script', cursive", fontSize: 'clamp(3rem, 12vw, 5.5rem)', lineHeight: 0.9, ...textGold }}>
              {groomName} <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'normal', color: CREAM, WebkitTextFillColor: CREAM }}>&amp;</span> {brideName}
            </h3>
            <p style={{ marginTop: 28, fontFamily: "'Montserrat', sans-serif", fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,246,230,0.46)' }}>
              2026 Taklifnoma
            </p>
          </div>
        </footer>
      </motion.main>
    </div>
  );
}
