import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

import defaultMusicFile from '../music/AUDIO-2026-06-03-19-11-34.mp3';

// Default romantic wedding background music
const DEFAULT_MUSIC = defaultMusicFile;

const LANGUAGES = [
  { code: 'uz_cyrl', label: 'UZ', name: 'O‘zbekcha 🇺🇿' },
  { code: 'tj',      label: 'TJ', name: 'Тоҷикӣ 🇹🇯'  },
  { code: 'ru',      label: 'RU', name: 'Русский 🇷🇺'  },
  { code: 'en',      label: 'EN', name: 'English 🇬🇧'  },
];

/**
 * FloatingControls — drop-in floating music + language switcher
 * for any invitation template.
 *
 * Props:
 *  - musicUrl  : optional custom music URL (falls back to DEFAULT_MUSIC)
 *  - accentColor: optional button background color (default dark sage)
 */
const FloatingControls = ({ musicUrl, accentColor = 'rgba(60,60,60,0.82)' }) => {
  const { language, setLanguage } = useLanguage();
  const [isPlaying, setIsPlaying]   = useState(false);
  const [dropOpen, setDropOpen]     = useState(false);
  const audioRef = useRef(null);

  const src = musicUrl || DEFAULT_MUSIC;

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(p => !p);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const close = () => setDropOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  // Autoplay music when user opens invitation cover/envelope
  useEffect(() => {
    const handleOpen = () => {
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {});
      }
    };
    window.addEventListener('open-invitation', handleOpen);
    return () => window.removeEventListener('open-invitation', handleOpen);
  }, []);

  const btnStyle = {
    width: 44, height: 44,
    borderRadius: '50%',
    backgroundColor: accentColor,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.18)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 18px rgba(0,0,0,0.22)',
    pointerEvents: 'auto',
    color: '#fff',
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '0.8rem',
    fontWeight: 700,
  };

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="metadata" />

      <div style={{
        position: 'fixed',
        top: 20,
        right: 20,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '12px',
        zIndex: 99999,
        pointerEvents: 'none',
      }}>
        {/* ── Music button ── */}
        <motion.button
          onClick={toggleMusic}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.93 }}
          style={btnStyle}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isPlaying ? (
              /* Pause icon */
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <rect x="6" y="4" width="4" height="16" fill="#fff" stroke="none"/>
                <rect x="14" y="4" width="4" height="16" fill="#fff" stroke="none"/>
              </svg>
            ) : (
              /* Music note icon */
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3" fill="#fff"/>
                <circle cx="18" cy="16" r="3" fill="#fff"/>
              </svg>
            )}
          </div>
        </motion.button>

        {/* ── Language switcher ── */}
        <div style={{ position: 'relative', pointerEvents: 'auto' }}>
          <motion.button
            onClick={(e) => { e.stopPropagation(); setDropOpen(o => !o); }}
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.93 }}
            style={btnStyle}
          >
            {LANGUAGES.find(l => l.code === language)?.label ?? 'UZ'}
          </motion.button>

          <AnimatePresence>
            {dropOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.92 }}
                transition={{ duration: 0.18 }}
                style={{
                  position: 'absolute',
                  top: 52, right: 0,
                  backgroundColor: 'rgba(30,30,30,0.94)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12,
                  padding: 6,
                  display: 'flex', flexDirection: 'column', gap: 3,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.28)',
                  zIndex: 10000,
                  minWidth: 148,
                }}
              >
                {LANGUAGES.map(({ code, name }, i, arr) => (
                  <button
                    key={code}
                    onClick={() => { setLanguage(code); setDropOpen(false); }}
                    style={{
                      padding: '9px 14px',
                      backgroundColor: language === code ? 'rgba(255,255,255,0.14)' : 'transparent',
                      border: 'none',
                      borderRadius: i === 0 ? '8px 8px 2px 2px' : i === arr.length - 1 ? '2px 2px 8px 8px' : 2,
                      borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                      color: '#fff',
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '0.88rem',
                      fontWeight: language === code ? 700 : 400,
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'background 0.15s',
                    }}
                  >
                    {name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default FloatingControls;
