import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../lib/db';
import { useParams } from 'react-router-dom';

const WHITE = '#FFFFFF';
const GOLD = '#D4AF37';

function parseDate(dateStr) {
  if (!dateStr) return { day: 25, month: 7, year: 2026 };
  const [d, m, y] = String(dateStr).split('.');
  return { day: parseInt(d, 10) || 25, month: parseInt(m, 10) || 7, year: parseInt(y, 10) || 2026 };
}

const MONTH_NAMES = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

// Simulated Golden Feather SVG
const GoldenFeather = ({ width = 100, height = 100, style }) => (
  <svg viewBox="0 0 100 200" width={width} height={height} style={style}>
    <path d="M 50 190 Q 50 100 80 20 Q 40 50 20 120 Q 50 100 50 190 Z" fill="none" stroke={GOLD} strokeWidth="2" />
    <path d="M 50 170 Q 60 140 85 90" stroke={GOLD} strokeWidth="1" />
    <path d="M 50 150 Q 70 120 90 70" stroke={GOLD} strokeWidth="1" />
    <path d="M 50 130 Q 75 100 85 50" stroke={GOLD} strokeWidth="1" />
    <path d="M 50 160 Q 40 130 15 100" stroke={GOLD} strokeWidth="1" />
    <path d="M 50 140 Q 35 110 10 80" stroke={GOLD} strokeWidth="1" />
    <path d="M 50 120 Q 30 90 15 60" stroke={GOLD} strokeWidth="1" />
  </svg>
);

const GoldenPlumesIntro = ({ onOpen }) => {
  const { t } = useLanguage();
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: 100 }} // Envelope slide down
      transition={{ duration: 1, ease: 'easeInOut' }}
      style={{ height: '100vh', width: '100%', backgroundColor: '#FDFBF7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '600px', height: '60%', border: `1px solid ${GOLD}`, backgroundColor: WHITE, boxShadow: '0 20px 50px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <GoldenFeather style={{ position: 'absolute', top: -30, left: -30, transform: 'rotate(-45deg)', opacity: 0.8 }} width={150} height={300} />
        <GoldenFeather style={{ position: 'absolute', bottom: -30, right: -30, transform: 'rotate(135deg)', opacity: 0.8 }} width={150} height={300} />

        <div style={{ border: `1px solid ${GOLD}`, padding: '40px', backgroundColor: WHITE, zIndex: 10, textAlign: 'center' }}>
          <p style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: 3, color: GOLD, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '20px' }}>{t('invitation.label')}</p>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: GOLD, color: WHITE }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpen}
            style={{ padding: '10px 30px', border: `1px solid ${GOLD}`, backgroundColor: 'transparent', color: GOLD, textTransform: 'uppercase', letterSpacing: 2, cursor: 'pointer', fontFamily: "'Montserrat', sans-serif", transition: 'all 0.3s' }}
          >
            Open
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
};

export default function GoldenPlumesTemplate({ data }) {
  const [opened, setOpened] = useState(false);
  const { language, t } = useLanguage();
  const params = useParams();
  const invRef = params['*'] || params.id || (params.slugPrefix && params.slugName ? `${params.slugPrefix}/${params.slugName}` : '');

  const { day, month, year } = parseDate(data?.date);
  const monthName = (MONTH_NAMES[language] || MONTH_NAMES.en)[month - 1];

  // RSVP
  const [form, setForm] = useState({ name: '', guests: '1' });
  const [rsvpDone, setRsvpDone] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  const handleRsvp = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setRsvpLoading(true);
    try {
      await db.addRSVP(invRef, { name: form.name, wish: `Guests: ${form.guests}`, status: 'attending' });
      setRsvpDone(true);
    } catch { }
    setRsvpLoading(false);
  };

  return (
    <div style={{ backgroundColor: WHITE, color: '#333', fontFamily: "'Lora', serif", minHeight: '100vh', overflowX: 'hidden' }}>
      <AnimatePresence mode="wait">
        {!opened ? (
          <GoldenPlumesIntro key="intro" onOpen={() => setOpened(true)} />
        ) : (
          <motion.main
            key="main"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            style={{ padding: '40px 20px', maxWidth: '700px', margin: '0 auto', position: 'relative' }}
          >
            <div style={{ position: 'absolute', top: 20, left: 20, right: 20, bottom: 20, border: `1px solid ${GOLD}`, pointerEvents: 'none' }} />

            <GoldenFeather style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-30deg)', opacity: 0.6 }} width={120} height={240} />
            <GoldenFeather style={{ position: 'absolute', top: 0, right: 0, transform: 'rotate(30deg) scaleX(-1)', opacity: 0.6 }} width={120} height={240} />
            <GoldenFeather style={{ position: 'absolute', bottom: 0, left: 0, transform: 'rotate(-150deg)', opacity: 0.6 }} width={120} height={240} />
            <GoldenFeather style={{ position: 'absolute', bottom: 0, right: 0, transform: 'rotate(150deg) scaleX(-1)', opacity: 0.6 }} width={120} height={240} />

            <div style={{ textAlign: 'center', paddingTop: '100px', position: 'relative', zIndex: 10 }}>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.9rem', letterSpacing: 4, textTransform: 'uppercase', color: GOLD, marginBottom: '20px' }}>{t('invitation.calendar') || 'Wedding Date'}</p>

              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '3.5rem', color: GOLD, lineHeight: 1.2, marginBottom: '20px' }}>
                {data?.groomName || 'BRIDE'}<br /><span style={{ fontSize: '0.6em', color: '#333' }}>AND</span><br />{data?.brideName || 'GROOM'}
              </h1>

              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.8rem', letterSpacing: 3, textTransform: 'uppercase', marginBottom: '60px', color: '#666' }}>
                Invite you to join the celebration of their marriage
              </p>

              {/* DETAILS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', marginBottom: '80px', color: '#555' }}>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{monthName} {day}, {year}</p>
                <div style={{ width: '30px', height: '1px', backgroundColor: GOLD }} />
                <p style={{ fontSize: '1.1rem' }}>{data?.time || '5:00 PM'}</p>
                <div style={{ width: '30px', height: '1px', backgroundColor: GOLD }} />
                <p style={{ fontSize: '1.1rem' }}>{data?.location || 'Place, Address'}</p>
              </div>

              {/* WELCOME */}
              <div style={{ marginBottom: '80px', maxWidth: '400px', margin: '0 auto 80px' }}>
                <p style={{ fontSize: '1.1rem', fontStyle: 'italic', lineHeight: 1.8, color: '#777' }}>
                  {t('invitation.speech') || "We are so thrilled to share this special moment with our closest friends and family."}
                </p>
              </div>

              {/* RSVP */}
              <div style={{ marginBottom: '80px' }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', color: GOLD, marginBottom: '30px' }}>RSVP</h2>
                {rsvpDone ? (
                  <p style={{ color: '#555', fontSize: '1.1rem', fontStyle: 'italic' }}>Thank you. We look forward to seeing you.</p>
                ) : (
                  <form onSubmit={handleRsvp} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '300px', margin: '0 auto' }}>
                    <input type="text" required placeholder="Guest Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ padding: '12px', border: 'none', borderBottom: `1px solid ${GOLD}`, backgroundColor: 'transparent', color: '#333', fontFamily: "'Montserrat', sans-serif", outline: 'none', textAlign: 'center' }} />
                    <select value={form.guests} onChange={e => setForm({ ...form, guests: e.target.value })} style={{ padding: '12px', border: 'none', borderBottom: `1px solid ${GOLD}`, backgroundColor: 'transparent', color: '#333', fontFamily: "'Montserrat', sans-serif", outline: 'none', textAlign: 'center', appearance: 'none' }}>
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                      <option value="3">3 Guests</option>
                      <option value="4+">4+ Guests</option>
                    </select>
                    <button type="submit" disabled={rsvpLoading} style={{ padding: '15px', marginTop: '20px', backgroundColor: 'transparent', color: GOLD, border: `1px solid ${GOLD}`, fontFamily: "'Montserrat', sans-serif", letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s' }} onMouseEnter={e => { e.target.style.backgroundColor = GOLD; e.target.style.color = WHITE; }} onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = GOLD; }}>
                      {rsvpLoading ? 'Sending...' : 'Confirm'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
