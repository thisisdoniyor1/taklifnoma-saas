import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Intro from './components/Intro';
import MainContent from './components/MainContent';
import FloatingControls from '../../components/FloatingControls';
import { useLanguage } from '../../context/LanguageContext';
import fingerprintHeart from './assets/fingerprint_heart.png';

const IVORY_BACKGROUND = '#fbf9fa';

const COVER_LABELS = {
  en: { received: 'You Have', invite: 'An Invitation', open: 'Click to Open' },
  ru: { received: 'ВАМ ПРИШЛО', invite: 'Приглашение', open: 'НАЖМИТЕ, ЧТОБЫ ОТКРЫТЬ' },
  uz: { received: 'SIZGA', invite: 'Taklifnoma bor', open: 'ОЧИШ УЧУН ТУГМАНИ БОСИНГ' },
  uz_cyrl: { received: 'SIZGA', invite: 'Taklifnoma bor', open: 'OCHISH UCHUN TUGMANI BOSING' },
  tj: { received: 'БА ШУМО', invite: 'Даъватнома хаст', open: 'БАРОИ КУШОДАН ПАХШ КУНЕД' }
};

function NavyBookCover({ data, onOpen, isThumbnail = false }) {
  const { language } = useLanguage();
  const tr = COVER_LABELS[language] || COVER_LABELS.en;
  const [opening, setOpening] = useState(false);

  const handleClick = () => {
    if (opening || isThumbnail) return;
    window.dispatchEvent(new Event('open-invitation'));
    setOpening(true);
    setTimeout(() => {
      onOpen && onOpen();
    }, 450);
  };

  return (
    <motion.div
      onClick={handleClick}
      initial={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.65, ease: [0.4, 0, 0.2, 1] } }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: isThumbnail ? 1 : 50,
        pointerEvents: isThumbnail || opening ? 'none' : 'auto',
        cursor: isThumbnail ? 'default' : 'pointer',
        background: 'radial-gradient(circle at center, #1b315b 0%, #0a1324 100%)', // Rich dark blue gradient
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isThumbnail ? '20px' : '8dvh 20px 8dvh',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Background details: Subtle grid pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        backgroundPosition: 'center',
        opacity: opening ? 0 : 0.65,
        transition: 'opacity 0.35s ease',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      {/* Classical double-line border details */}
      <div style={{
        position: 'absolute',
        inset: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        opacity: opening ? 0 : 1,
        transition: 'opacity 0.35s ease',
        pointerEvents: 'none',
        zIndex: 2
      }} />
      <div style={{
        position: 'absolute',
        inset: '22px',
        border: '1px solid rgba(255, 255, 255, 0.04)',
        borderRadius: '6px',
        opacity: opening ? 0 : 1,
        transition: 'opacity 0.35s ease',
        pointerEvents: 'none',
        zIndex: 2
      }} />

      <motion.div
        key={language}
        initial={{ opacity: 0 }}
        animate={{ opacity: opening ? 0 : 1 }}
        transition={{ duration: opening ? 0.35 : 0.5 }}
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isThumbnail ? '20px' : '4.5vh',
          zIndex: 3
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0', pointerEvents: 'none', zIndex: 3 }}>
          <h2 style={{
            fontFamily: "'Pinyon Script', 'Cormorant Garamond', cursive, serif",
            fontSize: isThumbnail ? '3rem' : 'clamp(3rem, 11vw, 4.5rem)',
            fontWeight: 400,
            fontStyle: 'normal',
            color: '#ffffff',
            margin: 0,
            lineHeight: 1.15,
            textShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}>
            {`${tr.received} ${tr.invite}`}
          </h2>
        </div>

        {/* White Fingerprint Heart Shape in the middle */}
        <div style={{
          position: 'relative',
          width: isThumbnail ? '160px' : '180px',
          height: isThumbnail ? '160px' : '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          margin: isThumbnail ? '0px' : '2vh 0',
          zIndex: 3
        }}>
          <img
            src={fingerprintHeart}
            alt="Fingerprint Heart"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 12px rgba(255,255,255,0.15))'
            }}
          />
        </div>

        {/* Button and bottom texts styled as a premium white glass button */}
        {isThumbnail ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', zIndex: 3, marginTop: '20px' }}>
            <div style={{
              padding: '0.75rem 2.2rem',
              borderRadius: '24px',
              border: '1.5px solid rgba(255, 255, 255, 0.75)',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
              fontFamily: "'Outfit', 'Lato', sans-serif",
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              whiteSpace: 'nowrap',
            }}>
              {tr.open}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', zIndex: 3, marginTop: '6dvh' }}>
            <button
              type="button"
              style={{
                padding: '0.75rem 2.2rem',
                borderRadius: '24px',
                border: '1.5px solid rgba(255, 255, 255, 0.75)',
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#ffffff',
                fontFamily: "'Outfit', 'Lato', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#0a1324';
                e.currentTarget.style.borderColor = '#ffffff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.75)';
              }}
            >
              {tr.open}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

const ImperialNavyShieldTemplate = ({ data, isThumbnail }) => {
  const { language } = useLanguage();
  const [opened, setOpened] = useState(false);

  return (
    <div style={{ 
      width: '100%', 
      minHeight: isThumbnail ? '100%' : '100dvh',
      height: isThumbnail ? '100%' : (opened ? 'auto' : '100dvh'),
      backgroundColor: IVORY_BACKGROUND, 
      fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif", 
      color: '#1a2b4b',
      position: 'relative',
      isolation: 'isolate',
      overflow: isThumbnail ? 'hidden' : (opened ? 'visible' : 'hidden')
    }}>
      {/* Universal Floating Controls (Music + Language) */}
      {!isThumbnail && (
        <FloatingControls 
          musicUrl={data?.musicUrl} 
          accentColor="rgba(26, 43, 75, 0.88)" 
        />
      )}

      {/* Main page content (renders behind the cover when closed) */}
      {!opened ? (
        <Intro data={data} isThumbnail={isThumbnail} />
      ) : (
        <MainContent key="main" data={data} />
      )}

      {/* Book Cover Overlay */}
      <AnimatePresence>
        {!opened && (
          <NavyBookCover key="book-cover" data={data} onOpen={() => setOpened(true)} isThumbnail={isThumbnail} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImperialNavyShieldTemplate;
