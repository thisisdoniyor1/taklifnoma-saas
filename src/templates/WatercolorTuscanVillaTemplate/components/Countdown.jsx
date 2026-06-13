import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import coupleStandingImg from '../assets/tuscany_couple_standing_v5.png';

const TR = {
  uz: {
    countdown: "Har lahzani sanayapmiz",
    days: 'KUN', hours: 'SOAT', min: 'DAQ', sec: 'SON',
  },
  uz_cyrl: {
    countdown: "Ҳар лаҳзани санаяпмиз",
    days: 'КУН', hours: 'СОАТ', min: 'ДАҚ', sec: 'СОН',
  },
  tj: {
    countdown: "Ҳар як лаҳзаро мешуморем",
    days: 'РӮЗ', hours: 'СОАТ', min: 'ДАҚ', sec: 'ТОН',
  },
  ru: {
    countdown: "Считаем каждое мгновение",
    days: 'ДНЕЙ', hours: 'ЧАСОВ', min: 'МИН', sec: 'СЕК',
  },
  en: {
    countdown: "We are counting every moment",
    days: 'DAYS', hours: 'HOURS', min: 'MIN', sec: 'SEC',
  },
};

function parseDate(s) {
  const parts = String(s || '').split('.');
  return { day: parseInt(parts[0]) || 1, month: parseInt(parts[1]) || 9, year: parseInt(parts[2]) || 2026 };
}
function parseTarget(dateStr, timeStr) {
  const { day, month, year } = parseDate(dateStr);
  return new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${timeStr || '18:00'}:00`);
}
function calcLeft(target) {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

const Countdown = ({ data }) => {
  const { t, language } = useLanguage();
  const tr = TR[language] || TR.en;

  const target = useMemo(() => parseTarget(data?.date, data?.time), [data?.date, data?.time]);
  const [tl, setTl] = useState(() => calcLeft(target));

  useEffect(() => {
    const id = setInterval(() => setTl(calcLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#f4efea',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Top purple watercolor smear */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '80px',
        background: 'linear-gradient(180deg, rgba(180,170,200,0.4) 0%, rgba(180,170,200,0.15) 60%, transparent 100%)',
        zIndex: 0,
      }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '90px', overflow: 'hidden', zIndex: 0, opacity: 0.5 }}>
        <svg viewBox="0 0 400 90" width="100%" height="90" preserveAspectRatio="xMidYMin slice">
          <ellipse cx="200" cy="-20" rx="220" ry="70" fill="rgba(160,148,190,0.35)" />
          <ellipse cx="80" cy="0" rx="100" ry="40" fill="rgba(140,160,180,0.25)" />
          <ellipse cx="320" cy="5" rx="110" ry="45" fill="rgba(160,148,190,0.2)" />
        </svg>
      </div>

      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '80px 24px 60px', gap: '30px', textAlign: 'center',
      }}>
        {/* Countdown label */}
        <motion.div
          initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
        >
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(1rem, 4.8vw, 1.8rem)',
            fontStyle: 'italic',
            fontWeight: 400,
            color: '#3d3028',
            margin: 0,
            letterSpacing: '0.05em',
            lineHeight: 1.2,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap'
          }}>
            {t('invitation.counting') || 'THE CELEBRATION BEGINS IN'}
          </h2>
          <div style={{ width: '40px', height: '0.5px', background: '#9a8d80', opacity: 0.5 }} />
        </motion.div>

        {/* Countdown numbers */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}
          style={{ display: 'flex', justifyContent: 'center', gap: '14px', alignItems: 'flex-start' }}
        >
          {[
            { val: tl.days, label: tr.days },
            { val: tl.hours, label: tr.hours },
            { val: tl.minutes, label: tr.min },
            { val: tl.seconds, label: tr.sec },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(2.2rem, 7vw, 3rem)', fontWeight: 300,
                  color: '#3d3028', lineHeight: 1, letterSpacing: '-0.02em',
                }}>
                  {String(item.val).padStart(2, '0')}
                </span>
                <span style={{
                  fontFamily: "'Cormorant Garamond', serif", fontSize: '0.6rem',
                  letterSpacing: '0.1em', color: '#7a6e62', marginTop: '4px', opacity: 0.8,
                }}>
                  {item.label}
                </span>
              </div>
              {i < 3 && <span style={{ fontSize: '1.4rem', color: '#8a7060', opacity: 0.4, paddingTop: '2px' }}>:</span>}
            </div>
          ))}
        </motion.div>

        {/* Illustrations Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', marginTop: '10px' }}>
          {/* New Standing Couple Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.2 }}
            style={{ width: '100%', maxWidth: '300px' }}
          >
            <img src={coupleStandingImg} alt="Couple standing" style={{ width: '100%', mixBlendMode: 'multiply' }} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Countdown;
