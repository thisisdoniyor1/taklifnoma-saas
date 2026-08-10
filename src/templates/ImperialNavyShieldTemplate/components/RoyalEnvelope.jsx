import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';

// Blue textured background for the navy theme
import coverBg from '../../../assets/embossed_envelope_blue.png';

const LABELS = {
  en: { invite: 'You have an invitation', open: 'Click to open' },
  ru: { invite: 'У вас есть приглашение', open: 'Нажмите, чтобы открыть' },
  uz_cyrl: { invite: 'Sizga taklifnoma bor', open: 'Ochish uchun bosing' },
  tj: { invite: 'Барои шумо даъватнома аст', open: 'Барои кушодан пахш кунед' },
  uz: { invite: 'Sizga taklifnoma bor', open: 'Ochish uchun bosing' }
};

const GOLD = '#d4af37';
const NAVY = '#0f172a';

const RoyalEnvelope = ({ onOpen, children, isThumbnail = false }) => {
  const { language } = useLanguage();
  const [opening, setOpening] = useState(false);
  const tr = LABELS[language] || LABELS.en;

  const handleOpen = () => {
    if (isThumbnail || opening) return;
    setOpening(true);
    window.setTimeout(onOpen, 1000); 
  };

  const fullScreenStyle = {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url(${coverBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  const overlayStyle = {
    position: 'absolute', inset: 0,
    background: `linear-gradient(to bottom, rgba(15,23,42,0.85) 0%, rgba(26,43,75,0.4) 38%, rgba(26,43,75,0.5) 60%, rgba(15,23,42,0.95) 100%)`
  };

  const content = (
    <>
      <div style={{
        position: 'relative', zIndex: 1,
        visibility: opening ? 'visible' : 'hidden',
        height: '100%'
      }}>
        {children}
      </div>

      <motion.div
        animate={opening ? { clipPath: 'circle(0% at 50% 50%)' } : { clipPath: 'circle(150% at 50% 50%)' }}
        transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: isThumbnail ? 'absolute' : 'fixed',
          inset: 0,
          zIndex: isThumbnail ? 1 : 5000,
          overflow: 'hidden',
          backgroundColor: NAVY,
          pointerEvents: opening ? 'none' : 'auto',
          ...fullScreenStyle
        }}
      >
        <div style={overlayStyle} />

        {/* CENTRAL CONTENT */}
        <motion.div
          animate={{ opacity: opening ? 0 : 1, scale: opening ? 1.1 : 1 }}
          transition={{ duration: 0.5, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          {/* "You have an invitation" text */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ textAlign: 'center', padding: '0 2rem' }}
          >
            <p style={{
              fontFamily: '"Playfair Display", "Cormorant Garamond", Georgia, serif',
              fontSize: isThumbnail ? '1.8rem' : 'clamp(2.5rem, 8vw, 4rem)',
              fontStyle: 'italic',
              fontWeight: 300,
              color: '#ffffff',
              textShadow: '0 4px 20px rgba(0,0,0,0.6)',
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: '0.02em'
            }}>
              {tr.invite}
            </p>
            <div style={{
              width: '40px', height: '1.5px',
              background: GOLD,
              margin: '1.5rem auto 1.2rem',
              boxShadow: '0 2px 8px rgba(212,175,55,0.4)'
            }} />
          </motion.div>

          {/* Button */}
          {!isThumbnail && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.4 }}
              style={{ pointerEvents: 'auto' }}
            >
              <motion.button
                onClick={handleOpen}
                whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(212,175,55,0.25)' }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '14px 42px',
                  borderRadius: '40px',
                  border: '1px solid rgba(212,175,55,0.6)',
                  background: 'rgba(15,23,42,0.6)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  color: GOLD,
                  fontFamily: 'Lato, Arial, sans-serif',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  transition: 'background 0.3s',
                }}
              >
                {tr.open}
              </motion.button>

              <motion.div
                animate={{ y: [0, 6, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M19 12l-7 7-7-7"/>
                </svg>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </>
  );

  return (
    <>
      <div style={{
        position: 'relative', zIndex: 1,
        visibility: opening ? 'visible' : 'hidden',
        height: '100%'
      }}>
        {children}
      </div>

      <div
        style={{
          position: isThumbnail ? 'absolute' : 'fixed',
          inset: 0,
          zIndex: isThumbnail ? 1 : 5000,
          overflow: 'hidden',
          backgroundColor: NAVY,
          pointerEvents: opening ? 'none' : 'auto'
        }}
      >
        {content}
      </div>
    </>
  );
};

export default RoyalEnvelope;
