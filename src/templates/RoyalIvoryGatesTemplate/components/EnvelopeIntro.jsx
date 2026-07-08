import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import gatesImg from '../assets/royal_gates_cover.png';

const TR = {
  uz_cyrl: {
    enter: "ОЧИШ УЧУН\nТУГМАНИ БОСИНГ",
    title: "СИЗГА ТАКЛИФНОМА БОР"
  },
  tj: {
    enter: "БАРОИ КУШОДАН ПАХШ КУНЕД",
    title: "БА ШУМО ДАЪВАТНОМА ХАСТ"
  },
  ru: {
    enter: "НАЖМИТЕ, ЧТОБЫ ОТКРЫТЬ",
    title: "У ВАС ЕСТЬ ПРИГЛАШЕНИЕ"
  },
  en: {
    enter: "CLICK TO OPEN",
    title: "YOU HAVE AN INVITATION"
  },
};

export default function EnvelopeIntro({ onOpen, isThumbnail = false }) {
  const { language } = useLanguage();
  const [opening, setOpening] = useState(false);
  const tr = TR[language] || TR.en;

  const handleOpen = useCallback(() => {
    if (opening || isThumbnail) return;
    setOpening(true);
    setTimeout(onOpen, 1000);
  }, [opening, isThumbnail, onOpen]);

  const gateStyle = {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url(${gatesImg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#fffdf8',
  };

  const content = (
    <motion.div key={language} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#fffdf8' }}>

      {/* LEFT GATE */}
      <motion.div
        animate={opening ? { x: '-100%', opacity: 0 } : { x: 0, opacity: 1 }}
        transition={{ duration: 1.3, ease: [0.4, 0, 0.2, 1] }}
        style={{
          ...gateStyle,
          zIndex: 10,
          clipPath: 'inset(0 50% 0 0)',
        }}
      />

      {/* RIGHT GATE */}
      <motion.div
        animate={opening ? { x: '100%', opacity: 0 } : { x: 0, opacity: 1 }}
        transition={{ duration: 1.3, ease: [0.4, 0, 0.2, 1] }}
        style={{
          ...gateStyle,
          zIndex: 10,
          clipPath: 'inset(0 0 0 50%)',
        }}
      />

      {/* OVERLAY TEXT - EXTRA LIGHT (WHITE) WITH SHADOW */}
      <div style={{
        position: 'absolute',
        top: isThumbnail ? '25%' : '23%',
        left: 0, right: 0,
        zIndex: 25,
        textAlign: 'center',
        padding: '0 24px',
        pointerEvents: 'none'
      }}>
        <motion.div
          animate={opening ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(0.9rem, 4.2vw, 1.2rem)',
            letterSpacing: '0.1em',
            color: '#ffffff',
            fontWeight: 800,
            lineHeight: 1.4,
            maxWidth: '220px',
            margin: '0 auto',
            background: 'linear-gradient(135deg, #fbe8a6 0%, #D4AF37 50%, #b8921a 100%)',
            border: '0.8px solid rgba(255, 215, 0, 0.5)',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
            textShadow: '0 1.5px 3px rgba(0, 0, 0, 0.45)',
            borderRadius: '12px',
            padding: '6px 16px',
            display: 'inline-block',
            textTransform: 'uppercase',
          }}>
            {tr.title}
          </p>
          <div style={{
            width: '50px', // Wider line
            height: '1.5px', // Slightly thicker
            background: '#D4AF37',
            boxShadow: '0 1px 2px rgba(255,255,255,0.8)',
            margin: '22px auto 0'
          }} />
        </motion.div>
      </div>

      {/* SMALLER GOLD CAPSULE BUTTON */}
      <div style={{
        position: 'absolute',
        top: '72%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 30,
        pointerEvents: isThumbnail ? 'none' : 'auto'
      }}>
        {isThumbnail ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '11px 30px',
            background: 'linear-gradient(135deg, #fbe8a6 0%, #D4AF37 50%, #b8921a 100%)',
            color: '#1a1a1a',
            borderRadius: '30px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.4)',
            fontFamily: "'Playfair Display', serif",
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            minWidth: '130px',
            whiteSpace: 'nowrap',
          }}>
            {tr.enter}
          </div>
        ) : (
          <motion.button
            onClick={handleOpen}
            animate={opening ? { scale: 0.8, opacity: 0 } : { scale: 1, opacity: 1 }}
            whileHover={!opening ? { scale: 1.05 } : {}}
            whileTap={!opening ? { scale: 0.95 } : {}}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '11px 30px',
              background: 'linear-gradient(135deg, #fbe8a6 0%, #D4AF37 50%, #b8921a 100%)',
              color: '#1a1a1a',
              borderRadius: '30px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12), inset 0 1px 2px rgba(255,255,255,0.4)',
              fontFamily: "'Playfair Display', serif",
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              minWidth: '130px',
              whiteSpace: 'pre-line',
              lineHeight: '1.4',
              textAlign: 'center'
            }}
          >
            <span>{tr.enter}</span>
          </motion.button>
        )}
      </div>

      {/* GLOBAL SHIMMER */}
      {!opening && (
        <motion.div
          animate={{ x: ['-100%', '300%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
          style={{
            position: 'absolute',
            top: 0, left: 0, width: '40%', height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            transform: 'skewX(-20deg)',
            zIndex: 16,
            pointerEvents: 'none'
          }}
        />
      )}
    </motion.div>
  );

  if (isThumbnail) {
    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {content}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5000,
        backgroundColor: '#fffdf8',
        overflow: 'hidden'
      }}
    >
      {content}
    </motion.div>
  );
}
