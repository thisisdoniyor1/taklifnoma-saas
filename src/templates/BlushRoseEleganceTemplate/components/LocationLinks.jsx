import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import palaceImg from '../assets/drawn_pink_palace.png';
import { translateLocation } from '../../WatercolorTuscanVillaTemplate/utils/transliterate';

const ROSE  = '#b05470';
const PINK  = '#d4849a';
const MAUVE = '#7d4059';
const INK   = '#3b1a28';

const VENUE_SUBTITLE = {
  en: 'A Royal Ceremony Venue',
  ru: 'Королевский зал торжеств',
  uz_cyrl: 'Shohona marosim maskani',
  tj: 'Макони боҳашамати маросим',
};

export default function LocationLinks({ location, locationUrl, time }) {
  const { t, language } = useLanguage();
  const timeLabels = {
    en: 'Time',
    ru: 'Время',
    uz_cyrl: 'Vaqt',
    tj: 'Вақт'
  };
  const timeLabel = timeLabels[language] || 'Time';
  const displayName = translateLocation(location, language) || t('invitation.location');
  const googleMapsUrl = locationUrl || `https://maps.google.com/?q=${encodeURIComponent(location || displayName)}`;
  const appleMapsUrl = `http://maps.apple.com/?q=${encodeURIComponent(location || displayName)}`;

  return (
    <section style={{ padding: '5rem 1.5rem', backgroundColor: '#fff', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(176,84,112,0.22), transparent)' }} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1 }}
        style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}
      >
        {/* Title */}
        <h2 style={{
          fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
          fontSize: 'clamp(1.8rem, 5vw, 2.4rem)',
          fontStyle: 'italic',
          fontWeight: 400,
          color: INK,
          marginBottom: 16,
        }}>
          {t('invitation.location')}
        </h2>

        {/* Pink divider */}
        <div style={{ width: 50, height: 1, background: 'linear-gradient(90deg, transparent, #b05470, transparent)', margin: '0 auto 28px' }} />

        {/* Castle SVG illustration */}
        <div style={{ marginBottom: 24 }}>
          <img
            src={palaceImg}
            alt="Venue"
            style={{
              width: '100%',
              maxWidth: '320px',
              height: 'auto',
              borderRadius: '8px',
              display: 'block',
              margin: '0 auto',
              boxShadow: '0 12px 30px rgba(176,84,112,0.15)'
            }}
          />
        </div>

        {/* Address and time info block */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          marginBottom: 40,
          padding: '0 10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <MapPin size={24} color={ROSE} style={{ flexShrink: 0 }} />
            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(1.45rem, 5vw, 1.9rem)',
              fontWeight: 700,
              color: INK,
              lineHeight: 1.3,
              margin: 0,
              textAlign: 'center',
            }}>
              {displayName}
            </p>
          </div>

          {time && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Clock size={22} color={ROSE} style={{ flexShrink: 0 }} />
              <p 
                className="wedding-time-text"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(1.25rem, 4.4vw, 1.65rem)',
                  fontWeight: 600,
                  color: MAUVE,
                  lineHeight: 1.4,
                  margin: 0,
                  textAlign: 'center',
                }}
              >
                {timeLabel}: {time}
              </p>
            </div>
          )}
        </div>

        {/* Map buttons — side by side, single line */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'center', flexWrap: 'nowrap' }}>
          <motion.a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              flex: 1,
              maxWidth: 180,
              padding: '13px 16px',
              background: `linear-gradient(135deg, ${ROSE} 0%, #c96880 45%, ${MAUVE} 100%)`,
              color: '#fff',
              textDecoration: 'none',
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              boxShadow: '0 6px 20px rgba(201,168,76,0.4), 0 2px 6px rgba(0,0,0,0.12)',
              borderRadius: 2,
              whiteSpace: 'nowrap',
            }}
          >
            <Navigation size={13} />
            {t('invitation.google_maps') || 'Google Maps'}
          </motion.a>

          <motion.a
            href={appleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              flex: 1,
              maxWidth: 180,
              padding: '13px 16px',
              background: `linear-gradient(135deg, ${ROSE} 0%, #c96880 45%, ${MAUVE} 100%)`,
              color: '#fff',
              textDecoration: 'none',
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              boxShadow: '0 6px 20px rgba(176,84,112,0.2), 0 2px 6px rgba(0,0,0,0.12)',
              border: 'none',
              borderRadius: 2,
              whiteSpace: 'nowrap',
            }}
          >
            <MapPin size={13} color="#fff" />
            {t('invitation.apple_maps') || 'Apple Maps'}
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}
