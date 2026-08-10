import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import envelopeCover from '../assets/tuscany_envelope_portrait.png';

const LABELS = {
  uz: { invite: 'Sizga taklifnoma bor', open: 'Ochish uchun tugmani bosing' },
  uz_cyrl: { invite: 'Sizga taklifnoma bor', open: 'Ochish uchun tugmani bosing' },
  tj: { invite: 'Барои шумо даъватнома аст', open: 'Барои кушодан пахш кунед' },
  ru: { invite: 'У вас есть приглашение', open: 'Нажмите, чтобы открыть' },
  en: { invite: 'You have an invitation', open: 'Click to Open' },
};

const Cover = ({ data, onOpen, isThumbnail }) => {
  const { language } = useLanguage();
  const [opening, setOpening] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const tr = LABELS[language] || LABELS.en;

  const handleClick = () => {
    if (opening) return;
    window.dispatchEvent(new Event('open-invitation'));
    setOpening(true);
    setTimeout(() => onOpen && onOpen(), 800);
  };

  const coverStyle = {
    backgroundImage: `url(${envelopeCover})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#f5f0e8',
  };

  if (isThumbnail) {
    return (
      <motion.div
        key={language}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          inset: 0,
          ...coverStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <p style={{
          position: 'absolute',
          top: '25%',
          left: 0, right: 0,
          textAlign: 'center',
          margin: 0,
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '1.7rem',
          fontStyle: 'italic',
          fontWeight: 500,
          letterSpacing: '0.08em',
          color: '#3d2a1e',
          textShadow: '0 1px 8px rgba(255,255,255,0.8), 0 2px 16px rgba(255,255,255,0.6)',
          lineHeight: 1.3,
        }}>
          {(() => {
            const splits = {
              en:      ['You have an', 'invitation'],
              ru:      ['У вас есть', 'приглашение'],
              uz:      ['Sizga', 'taklifnoma bor'],
              uz_cyrl: ['Sizga', 'taklifnoma bor'],
              tj:      ['Барои шумо', 'даъватнома аст'],
            };
            const [line1, line2] = splits[language] || splits.en;
            return <>{line1}<br />{line2}</>;
          })()}
        </p>

        {/* Click to Open button */}
        <div style={{
          position: 'absolute',
          top: '72%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}>
          <span style={{
            fontFamily: "'Lato', Arial, sans-serif",
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: '#5c7048',
            border: '1.2px solid rgba(138,158,122,0.6)',
            borderRadius: '28px',
            padding: '10px 28px',
            backgroundColor: 'rgba(248,245,240,0.92)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 16px rgba(138,158,122,0.2)',
            display: 'inline-block',
            whiteSpace: 'nowrap',
          }}>
            {tr.open}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      onClick={handleClick}
      initial={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.03, transition: { duration: 0.65, ease: "easeInOut" } }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5000,
        cursor: opening ? 'default' : 'pointer',
        pointerEvents: opening ? 'none' : 'auto',
        userSelect: 'none',
        ...coverStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <motion.div
        key={language}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', height: '100%', position: 'relative' }}
      >
        <AnimatePresence>
          {!opening && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.4 } }}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{
                position: 'absolute',
                top: '16%',
                left: 0, right: 0,
                textAlign: 'center',
                margin: 0,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '2.0rem',
                fontStyle: 'italic',
                fontWeight: 500,
                letterSpacing: '0.02em',
                color: '#5c7048',
                pointerEvents: 'none',
                textShadow: '0 1px 6px rgba(255,255,255,0.7), 0 2px 12px rgba(255,255,255,0.4)',
                lineHeight: 1.3,
              }}
            >
              {(() => {
                const splits = {
                  en:      ['You have an', 'invitation'],
                  ru:      ['У вас есть', 'приглашение'],
                  uz:      ['Sizga', 'taklifnoma bor'],
                  uz_cyrl: ['Sizga', 'taklifnoma bor'],
                  tj:      ['Барои шумо', 'даъватнома аст'],
                };
                const [line1, line2] = splits[language] || splits.en;
                return <>{line1}<br />{line2}</>;
              })()}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!opening && (
            <motion.div
              initial={{ opacity: 0, y: 20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%', transition: { duration: 0.4 } }}
              transition={{ duration: 1.0, delay: 0.8 }}
              style={{
                position: 'absolute',
                top: '74%',
                left: '50%',
                zIndex: 5100,
                pointerEvents: 'none',
                display: 'flex',
                justifyContent: 'center',
                width: 'max-content'
              }}
            >
              {/* click to open premium button */}
              <span style={{
                fontFamily: "'Lato', Arial, sans-serif",
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: '#5c7048',
                border: '1.2px solid rgba(138,158,122,0.45)',
                borderRadius: '30px',
                padding: '8px 22px',
                backgroundColor: 'rgba(248,245,240,0.82)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 12px rgba(138,158,122,0.1)',
                display: 'inline-block',
              }}>
                {tr.open}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default Cover;
