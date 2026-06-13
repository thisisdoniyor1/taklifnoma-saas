import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import envelopeImg from '../assets/realistic_pink_envelope.png';

export default function CoverPage({ data, onOpen, isThumbnail = false }) {
  const [opening, setOpening] = useState(false);
  const { language } = useLanguage();

  const handleClick = () => {
    if (isThumbnail || opening) return;
    setOpening(true);
    setTimeout(onOpen, 800);
  };

  const LABELS = {
    en:      { invite: 'You have an invitation', open: 'Click to Open' },
    ru:      { invite: 'У вас есть приглашение',  open: 'Нажмите, чтобы открыть' },
    uz_cyrl: { invite: 'Сизга таклифнома бор',    open: 'Очиш учун тугмани босинг' },
    tj:      { invite: 'Ба шумо даъватнома хаст', open: 'Барои кушодан пахш кунед' },
  };
  const { invite } = LABELS[language] || LABELS.en;

  const coverStyle = {
    backgroundImage: `url(${envelopeImg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#ebdbe0',
  };

  if (isThumbnail) {
    const { invite: inviteLabel, open: openLabel } = LABELS[language] || LABELS.en;
    return (
      <div style={{
        position: 'absolute',
        inset: 0,
        ...coverStyle,
      }}>
        <motion.div key={language} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ width: '100%', height: '100%', position: 'relative' }}>
          {/* You have an invitation — same style as full opening page */}
          <div style={{
            position: 'absolute',
            top: '24%',
            left: 0,
            right: 0,
            textAlign: 'center',
            width: '100%',
            padding: '0 20px',
          }}>
            <p style={{
              margin: 0,
              fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
              fontSize: '2.4rem',
              fontWeight: 500,
              fontStyle: 'italic',
              letterSpacing: '0.02em',
              color: '#6a4050',
              textShadow: '0 1px 4px rgba(255,255,255,0.8), 0 2px 10px rgba(255,255,255,0.5)',
            }}>
              {(() => {
                const splits = {
                  en:      ['You have an', 'invitation'],
                  ru:      ['У вас есть', 'приглашение'],
                  uz_cyrl: ['Сизга', 'таклифнома бор'],
                  tj:      ['Ба шумо', 'даъватнома хаст'],
                };
                const [line1, line2] = splits[language] || splits.en;
                return <>{line1}<br />{line2}</>;
              })()}
            </p>
          </div>

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
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#b05470',
              border: '1.2px solid rgba(176,84,112,0.5)',
              borderRadius: '20px',
              padding: '10px 28px',
              backgroundColor: 'rgba(253,240,244,0.92)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 16px rgba(176,84,112,0.2)',
              display: 'inline-block',
              whiteSpace: 'nowrap',
            }}>
              {openLabel}
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      key={language}
      onClick={handleClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03, transition: { duration: 0.65, ease: "easeInOut" } }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5000,
        cursor: opening ? 'default' : 'pointer',
        userSelect: 'none',
        ...coverStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      <AnimatePresence>
        {!opening && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.4 } }}
            transition={{ duration: 1.0, delay: 0.3 }}
            style={{
              position: 'absolute',
              top: '16%',
              textAlign: 'center',
              width: '100%',
              padding: '0 20px',
              pointerEvents: 'none'
            }}
          >
            {/* You Have an Invitation Text */}
            <p style={{
              fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
              fontSize: '2.3rem',
              fontWeight: 500,
              fontStyle: 'italic',
              letterSpacing: '0.02em',
              color: '#6a4050',
              textShadow: '0 1px 4px rgba(255,255,255,0.8), 0 2px 10px rgba(255,255,255,0.5)',
              margin: 0,
              lineHeight: 1.3,
            }}>
              {(() => {
                const splits = {
                  en:      ['You have an', 'invitation'],
                  ru:      ['У вас есть', 'приглашение'],
                  uz:      ['Sizga', 'taklifnoma bor'],
                  uz_cyrl: ['Сизга', 'таклифнома бор'],
                  tj:      ['Барои шумо', 'даъватнома ҳаст'],
                };
                const [line1, line2] = splits[language] || splits.en;
                return <>{line1}<br />{line2}</>;
              })()}
            </p>
          </motion.div>
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
            {/* Click to Open Button */}
            <span style={{
              fontFamily: "'Lato', Arial, sans-serif",
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#b05470',
              border: '1.2px solid rgba(176,84,112,0.35)',
              borderRadius: '20px',
              padding: '10px 24px',
              backgroundColor: 'rgba(253,240,244,0.72)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 12px rgba(176,84,112,0.06)',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              lineHeight: 1.4,
              maxWidth: '220px',
            }}>
              {LABELS[language]?.open || LABELS.en.open}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
