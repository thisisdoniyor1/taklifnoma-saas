import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';

const ROSE  = '#b05470';
const PINK  = '#d4849a';
const INK   = '#3b1a28';

function parseTarget(dateStr, timeStr) {
  if (!dateStr) return null;
  const [d, m, y] = String(dateStr).split('.');
  const time = timeStr || '18:00';
  return new Date(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}T${time}:00`);
}

function calcTimeLeft(target) {
  if (!target) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function Countdown({ date, time }) {
  const { t } = useLanguage();
  const target = useMemo(() => parseTarget(date, time), [date, time]);
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(target));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const blocks = [
    { label: t('invitation.days'),    value: timeLeft.days    },
    { label: t('invitation.hours'),   value: timeLeft.hours   },
    { label: t('invitation.minutes'), value: timeLeft.minutes },
    { label: t('invitation.seconds'), value: timeLeft.seconds },
  ];

  return (
    <div className="countdown-wrapper" style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(10px, 4vw, 18px)', flexWrap: 'wrap' }}>
      {blocks.map((block, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          {/* Number card */}
          <div style={{
            position: 'relative',
            width: 'clamp(70px, 18vw, 90px)',
            height: 'clamp(70px, 18vw, 90px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(160deg, #fff9fb 0%, #fdf0f4 100%)',
            border: '1px solid rgba(176,84,112,0.28)',
            borderRadius: '1rem',
            boxShadow: '0 8px 24px rgba(176,84,112,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
          }}>
            {/* Top rose line */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, transparent, ${ROSE}, transparent)`,
              borderRadius: '1rem 1rem 0 0',
            }} />

            <motion.span
              key={block.value}
              initial={{ opacity: 0.3, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                fontSize: 'clamp(1.7rem, 5vw, 2.4rem)',
                fontWeight: 400,
                color: INK,
                lineHeight: 1,
                letterSpacing: '-0.01em',
              }}
            >
              {String(block.value).padStart(2, '0')}
            </motion.span>
          </div>

          {/* Label */}
          <span style={{
            marginTop: 10,
            fontFamily: "'Lato', 'Montserrat', Arial, sans-serif",
            fontSize: '0.58rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: PINK,
            fontWeight: 700,
          }}>
            {block.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
