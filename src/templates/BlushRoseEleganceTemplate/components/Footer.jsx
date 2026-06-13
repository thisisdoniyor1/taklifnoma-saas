import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { localizedName } from '../../WatercolorTuscanVillaTemplate/utils/transliterate';

const ROSE  = '#b05470';
const PINK  = '#d4849a';
const MAUVE = '#7d4059';
const INK   = '#3b1a28';

export default function Footer({ groomName, brideName }) {
  const { t, language } = useLanguage();

  return (
    <footer style={{
      padding: '5rem 1.5rem 6rem',
      background: `linear-gradient(135deg, ${ROSE} 0%, #c06080 50%, ${MAUVE} 100%)`,
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Soft radial glow */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* Heart ornament */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '2.5rem', height: '1px', background: 'rgba(255,255,255,0.35)' }} />
          <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
            <path d="M9 14.5 C9 14.5, 1 9, 1 4.5 C1 2.1 2.8 1 4.5 1 C6 1 7.4 1.9 9 3.5 C10.6 1.9 12 1 13.5 1 C15.2 1 17 2.1 17 4.5 C17 9 9 14.5 9 14.5 Z" fill="rgba(255,255,255,0.45)" />
          </svg>
          <div style={{ width: '2.5rem', height: '1px', background: 'rgba(255,255,255,0.35)' }} />
        </div>

        {/* Names */}
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(1.8rem, 6vw, 2.8rem)',
            color: 'rgba(255,255,255,0.96)',
          }}>
            {localizedName(groomName || 'Groom', language)}{' '}
            <span style={{ fontSize: 'clamp(1rem, 3vw, 1.6rem)', opacity: 0.7, margin: '0 0.3rem' }}>&amp;</span>{' '}
            {localizedName(brideName || 'Bride', language)}
          </span>
        </div>

        {/* Message */}
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
          lineHeight: 1.9,
          color: 'rgba(255,255,255,0.82)',
          maxWidth: '26rem',
          margin: '0 auto 2rem',
        }}>
          {t('invitation.footer_message')}
        </p>

        {/* Bottom ornament */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '2rem' }}>
          <div style={{ width: '2rem', height: '1px', background: 'rgba(255,255,255,0.35)' }} />
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.45)' }} />
          <div style={{ width: '1.2rem', height: '1px', background: 'rgba(255,255,255,0.35)' }} />
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.45)' }} />
          <div style={{ width: '2rem', height: '1px', background: 'rgba(255,255,255,0.35)' }} />
        </div>

        <div style={{ fontSize: '0.75rem', letterSpacing: '0.25em', marginTop: '10px', fontFamily: "'Cormorant Garamond', serif", textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>
          © 2026 TAKLIFNOMA.VIP
        </div>
      </motion.div>
    </footer>
  );
}
