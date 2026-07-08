import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { localizedName, getWelcomeText } from '../../WatercolorTuscanVillaTemplate/utils/transliterate';
import CalendarCard from './CalendarCard';
import LocationLinks from './LocationLinks';
import Countdown from './Countdown';
import GuestWishes from './GuestWishes';
import RSVP from './RSVP';
import Footer from './Footer';
import heroBg from '../assets/pink_floral_hero_bg.png';

// ── Pink palette shared across all sections ──────────────────────────────────
const ROSE   = '#b05470';
const PINK   = '#d4849a';
const MAUVE  = '#7d4059';
const BLUSH  = '#fdf0f4';
const INK    = '#3b1a28';

const PinkDivider = () => (
  <div style={{
    width: 60, height: 1,
    background: 'linear-gradient(90deg, transparent, #b05470, transparent)',
    margin: '0 auto',
  }} />
);

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show:   { opacity: 1, y: 0, transition: { duration: 1.1, ease: 'easeOut' } },
};

export default function MainInvitation({ data }) {
  const { t, language } = useLanguage();

  return (
    <motion.div
      key={language}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{ width: '100%', background: BLUSH }}
    >
      <style>{`
        @media (min-width: 1024px) {
          body.preview-open .countdown-wrapper {
            flex-wrap: nowrap !important;
            gap: 8px !important;
          }
          body.preview-open .countdown-wrapper > div > div {
            width: 68px !important;
            height: 68px !important;
            border-radius: 0.75rem !important;
          }
          body.preview-open .countdown-wrapper > div > div > span {
            font-size: 1.4rem !important;
          }
          body.preview-open .countdown-title {
            font-size: 1.45rem !important;
            margin-bottom: 1.5rem !important;
          }
          body.preview-open .wedding-time-text {
            font-size: 1.15rem !important;
          }
        }
      `}</style>
      {/* ── SECTION 1: Hero — names + couple photo over pink venue bg ─────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '5rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background image */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }} />
        {/* Blush overlay so text stays readable */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(180deg, rgba(253,240,244,0.78) 0%, rgba(253,240,244,0.62) 50%, rgba(253,240,244,0.82) 100%)',
        }} />

        {/* Corner decorations */}
        {[
          { top: '2rem', left: '2rem', borderTop: `1.5px solid rgba(176,84,112,0.28)`, borderLeft: `1.5px solid rgba(176,84,112,0.28)` },
          { top: '2rem', right: '2rem', borderTop: `1.5px solid rgba(176,84,112,0.28)`, borderRight: `1.5px solid rgba(176,84,112,0.28)` },
          { bottom: '2rem', left: '2rem', borderBottom: `1.5px solid rgba(176,84,112,0.28)`, borderLeft: `1.5px solid rgba(176,84,112,0.28)` },
          { bottom: '2rem', right: '2rem', borderBottom: `1.5px solid rgba(176,84,112,0.28)`, borderRight: `1.5px solid rgba(176,84,112,0.28)` },
        ].map((s, i) => (
          <div key={i} style={{ position: 'absolute', width: '2.5rem', height: '2.5rem', zIndex: 2, pointerEvents: 'none', ...s }} />
        ))}

        <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Removed eyebrow and divider as requested */}

          {/* Removed couple portrait as requested */}

          {/* Names */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
            style={{
              fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(3.1rem, 9.5vw, 4.4rem)',
              color: INK,
              lineHeight: 1.08,
              margin: 0,
              letterSpacing: '0.01em',
            }}
          >
            {localizedName(data?.groomName || 'Groom', language)}
            <span style={{
              display: 'block',
              fontSize: 'clamp(1.1rem, 3.2vw, 1.6rem)',
              fontStyle: 'normal',
              letterSpacing: '0.28em',
              color: PINK,
              margin: '10px 0',
              fontWeight: 300,
            }}>
              &amp;
            </span>
            {localizedName(data?.brideName || 'Bride', language)}
          </motion.h1>

          {data?.date && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 1 }}
              style={{
                marginTop: 20,
                fontFamily: "'Lato', 'Montserrat', Arial, sans-serif",
                fontSize: '0.62rem',
                letterSpacing: '0.3em',
                color: PINK,
                textTransform: 'uppercase',
              }}
            >
              {data.date}
            </motion.p>
          )}
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          style={{ position: 'absolute', bottom: '5.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.7rem' }}
        >
          <motion.span
            animate={{ y: [0, 8, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontFamily: "'Lato', Arial, sans-serif", fontSize: '0.6rem', letterSpacing: '0.5em', textTransform: 'uppercase', color: PINK, fontWeight: 600, opacity: 0.7 }}
          >
            {t('invitation.scroll')}
          </motion.span>
          <motion.svg
            animate={{ y: [0, 10, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            width="18" height="28" viewBox="0 0 16 26" fill="none"
          >
            <line x1="8" y1="0" x2="8" y2="18" stroke={ROSE} strokeWidth="1.2" />
            <polyline points="2,13 8,20 14,13" fill="none" stroke={ROSE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </motion.div>
      </section>

      {/* ── SECTION 2: Welcome speech ──────────────────────────────────────── */}
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '5rem 1.5rem', backgroundColor: '#fff', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(176,84,112,0.25), transparent)' }} />
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-120px' }}
          style={{ maxWidth: '32rem', margin: '0 auto' }}
        >
          <PinkDivider />
          <div style={{ marginTop: 32 }} />
          <p style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(1.05rem, 2.2vw, 1.2rem)',
            lineHeight: 2,
            color: '#6a4050',
            letterSpacing: '0.01em',
          }}>
            {getWelcomeText(data?.welcomeText, language, t)}
          </p>
          <div style={{ marginTop: 32 }} />
          <PinkDivider />
        </motion.div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(176,84,112,0.25), transparent)' }} />
      </section>

      <CalendarCard date={data?.date} />
      <LocationLinks location={data?.location} locationUrl={data?.locationUrl} time={data?.time} />

      {/* ── Countdown ───────────────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1rem', backgroundColor: '#fff', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(176,84,112,0.2), transparent)' }} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div style={{ marginBottom: 24 }}>
            <PinkDivider />
          </div>
          <h2 className="countdown-title" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', color: INK, margin: '0 0 2.5rem', fontWeight: 400 }}>
            {t('invitation.counting')}
          </h2>
          <Countdown date={data?.date} time={data?.time} />
          <div style={{ marginTop: 40 }}>
            <PinkDivider />
          </div>
        </motion.div>
      </section>

      <GuestWishes rsvps={data?.rsvps} />
      <RSVP />
      <Footer groomName={data?.groomName} brideName={data?.brideName} />
    </motion.div>
  );
}
