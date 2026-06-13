import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import sceneImg from '../assets/tuscany_scene.png';
import { localizedName } from '../utils/transliterate';
import { ChevronDown } from 'lucide-react';


const Scene = ({ data }) => {
  const { language } = useLanguage();

  const rawGroomName = data?.groomName || 'Nicolás';
  const rawBrideName = data?.brideName || 'Julia';
  const groomName = localizedName(rawGroomName, language);
  const brideName = localizedName(rawBrideName, language);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Full-screen illustration */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${sceneImg})`,
        backgroundSize: 'cover', backgroundPosition: 'center top', zIndex: 0,
      }} />

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(245,240,235,0.1) 0%, rgba(245,240,235,0.45) 45%, rgba(245,240,235,0.85) 75%, rgba(245,240,235,1) 100%)',
        zIndex: 1,
      }} />

      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', padding: '40px 24px 80px', textAlign: 'center',
      }}>
        <div style={{ flex: 1 }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
        >

          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(4rem, 16vw, 5.5rem)',
            fontStyle: 'italic',
            fontWeight: 400,
            color: '#3d3028',
            margin: '0',
            lineHeight: 1,
            letterSpacing: '-0.01em',
            textShadow: '0 2px 12px rgba(245,240,235,0.95)',
          }}>
            {groomName}
          </h1>

          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(1.6rem, 5vw, 2.4rem)',
            fontStyle: 'italic',
            color: '#8a7060',
            margin: '4px 0',
            display: 'block',
          }}>
            &amp;
          </span>

          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(4rem, 16vw, 5.5rem)',
            fontStyle: 'italic',
            fontWeight: 400,
            color: '#3d3028',
            margin: '0',
            lineHeight: 1,
            letterSpacing: '-0.01em',
            textShadow: '0 2px 12px rgba(245,240,235,0.95)',
          }}>
            {brideName}
          </h1>

        </motion.div>

        <div style={{ flex: 0.3 }} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ opacity: { duration: 1, delay: 1.5 }, y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } }}
          style={{ position: 'absolute', bottom: '40px', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
        >
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#8a7060', fontWeight: 600 }}>
            {language === 'en' ? 'SCROLL DOWN' : language === 'ru' ? 'ЛИСТАЙТЕ ВНИЗ' : language === 'tj' ? 'БА ПОЁН ГУЗАРЕД' : language === 'uz_cyrl' ? 'ПАСТГА СУРИНГ' : 'PASTGA SURING'}
          </span>
          <ChevronDown size={20} color="#8a7060" />
        </motion.div>
      </div>
    </div>
  );
};

export default Scene;
