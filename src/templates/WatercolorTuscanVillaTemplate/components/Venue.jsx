import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import venueImg from '../assets/tuscany_venue.png';
import { MapPin } from 'lucide-react';

const SAGE = '#8a9e7a';
const DARK_SAGE = '#6b7c5a';

const TR = {
  uz: {
    label: "Manzil",
    googleMaps: "Google Xarita",
    appleMaps: "Apple Xarita",
    address: "«Foreli» to’yxonasi, Xujand"
  },
  uz_cyrl: {
    label: "Manzil",
    googleMaps: "Google Xarita",
    appleMaps: "Apple Xarita",
    address: "«Forel» to‘yxonasi, Xo‘jand"
  },
  tj: {
    label: "Манзил",
    googleMaps: "Google Харита",
    appleMaps: "Apple Харита",
    address: "Тӯйхонаи «Форел», Хуҷанд"
  },
  ru: {
    label: "Место",
    googleMaps: "Google Карты",
    appleMaps: "Apple Карты",
    address: "Ресторан «Форель», Худжанд"
  },
  en: {
    label: "Location",
    googleMaps: "Google Maps",
    appleMaps: "Apple Maps",
    address: "Wedding house Forel, Khujand"
  },
};

const Venue = ({ data }) => {
  const { language } = useLanguage();
  const tr = TR[language] || TR.en;

  const defaultLocation = tr.address || 'Wedding house Forel, Khujand';
  const location = data?.location && data.location !== 'Wedding house Forel, Khujand' ? data.location : defaultLocation;
  const locationUrl = data?.locationUrl || `https://maps.google.com/?q=${encodeURIComponent(location)}`;
  const appleMapsUrl = `https://maps.apple.com/?q=${encodeURIComponent(location)}`;

  return (
    <div style={{
      width: '100%', backgroundColor: SAGE,
      padding: '60px 24px 70px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(107,124,90,0.3) 0%, rgba(90,107,75,0.5) 100%)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 4px, transparent 4px, transparent 10px)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '6px', background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 4px, transparent 4px, transparent 10px)' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
        style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%' }}
      >
        {/* Section Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem',
            letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)',
            fontWeight: 500,
          }}>
            {tr.label}
          </span>
        </div>

        {/* Ornate Frame + Image */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '340px', padding: '4px' }}>
          <div style={{
            position: 'relative', border: '3px solid rgba(255,255,255,0.5)', borderRadius: '4px',
            padding: '12px', background: 'rgba(245,240,235,0.92)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.3)',
          }}>
            {[{ top: '-2px', left: '-2px' }, { top: '-2px', right: '-2px' }, { bottom: '-2px', left: '-2px' }, { bottom: '-2px', right: '-2px' }].map((pos, i) => (
              <div key={i} style={{
                position: 'absolute', width: '14px', height: '14px',
                background: SAGE, borderRadius: '50%', ...pos, boxShadow: '0 0 0 3px rgba(255,255,255,0.4)',
              }} />
            ))}
            <div style={{ border: '1px solid rgba(138,158,122,0.4)', borderRadius: '2px', overflow: 'hidden' }}>
              <img src={venueImg} alt="Venue" style={{ width: '100%', display: 'block', aspectRatio: '4/3', objectFit: 'cover' }} />
            </div>
          </div>
        </div>

        {/* Venue Name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '2.2rem', fontStyle: 'italic',
            fontWeight: 400, color: '#ffffff', margin: 0, letterSpacing: '0.05em',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px'
          }}>
            {location}
          </h2>
          {data?.time && (
            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.9rem', color: '#ffffff', letterSpacing: '0.15em', fontWeight: 600, marginTop: '4px' }}>
              {language === 'en' ? 'TIME: ' : language === 'ru' ? 'ВРЕМЯ: ' : language === 'tj' ? 'ВАҚТ: ' : 'VAQTI: '}{data.time}
            </p>
          )}
        </div>

        {/* Map buttons */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
          <motion.a
            href={locationUrl}
            target="_blank" rel="noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 1.15 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 28px', backgroundColor: 'rgba(245,240,235,1)', color: DARK_SAGE,
              borderRadius: '35px', textDecoration: 'none',
              fontFamily: "'Cormorant Garamond', serif", fontSize: '0.9rem', fontWeight: 700,
              letterSpacing: '0.05em', boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              transition: 'background-color 0.3s ease',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            {tr.googleMaps}
          </motion.a>
          <motion.a
            href={appleMapsUrl} target="_blank" rel="noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 1.15 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 28px', backgroundColor: 'rgba(245,240,235,1)', color: DARK_SAGE,
              borderRadius: '35px', textDecoration: 'none',
              fontFamily: "'Cormorant Garamond', serif", fontSize: '0.9rem', fontWeight: 700,
              letterSpacing: '0.05em', boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              transition: 'background-color 0.3s ease',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            {tr.appleMaps}
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
};

export default Venue;
