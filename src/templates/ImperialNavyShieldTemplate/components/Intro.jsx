import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { localizedName } from '../../WatercolorTuscanVillaTemplate/utils/transliterate';
import shapeImg from '../../../assets/tm4/tem4.png';

const IVORY_BACKGROUND = '#fbf9fa';

const Intro = ({ data, isThumbnail }) => {
  const { language } = useLanguage();
  const groomName = localizedName(data?.groomName || 'Sardor', language);
  const brideName = localizedName(data?.brideName || 'Madina', language);
  
  const isLaptopPreview = typeof window !== 'undefined' && window.innerWidth >= 1024;
  const scaleFactor = isThumbnail
    ? (isLaptopPreview ? 3.1 : 3.6)
    : (isLaptopPreview ? 1.65 : 1.95);

  const dateParts = (data?.date || '27.12.2026').split('.');
  const day = dateParts[0] || '27';
  const month = dateParts[1] || '12';
  const year = dateParts[2]?.slice(-2) || '26';

  const getFontFamily = (lang) => (lang === 'uz_cyrl' || lang === 'tj') ? 'Georgia, serif' : "'Playfair Display', serif";

  return (
    <motion.div
      key={language}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        width: '100%',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: IVORY_BACKGROUND,
        padding: 0,
        position: 'relative',
        overflow: isThumbnail ? 'visible' : 'hidden',
        isolation: 'isolate'
      }}
    >
      {/* "You have an invitation" text for thumbnail */}
      {isThumbnail && (
        <div style={{
          position: 'absolute',
          top: '7%',
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 10,
          padding: '0 20px',
        }}>
          <p style={{
            fontFamily: getFontFamily(language),
            fontSize: '2.5rem',
            fontWeight: 600,
            fontStyle: 'italic',
            letterSpacing: '0.08em',
            color: '#1a2b4b',
            textShadow: '0 1px 6px rgba(255,255,255,0.9)',
            margin: 0,
            lineHeight: 1.3,
          }}>
            {language === 'en' ? <>You have an<br />invitation</>
              : language === 'ru' ? <>У вас есть<br />приглашение</>
              : language === 'tj' ? <>Ба шумо<br />даъватнома хаст</>
              : language === 'uz_cyrl' ? <>Сизга<br />таклифнома бор</>
              : <>Sizga<br />taklifnoma bor</>}
          </p>
        </div>
      )}

      {/* Click to Open button for thumbnail */}
      {isThumbnail && (
        <div style={{
          position: 'absolute',
          top: '74%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
        }}>
          <span style={{
            fontFamily: "'Lato', Arial, sans-serif",
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#1a2b4b',
            border: '1.5px solid #D4AF37',
            borderRadius: '28px',
            padding: '10px 28px',
            backgroundColor: 'rgba(255,255,255,0.92)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            display: 'inline-block',
            whiteSpace: 'nowrap',
          }}>
            {language === 'en' ? 'Click to Open'
              : language === 'ru' ? 'Нажмите, чтобы открыть'
              : language === 'tj' ? 'Барои кушодан пахш кунед'
              : language === 'uz_cyrl' ? 'Очиш учун босинг'
              : 'Ochish uchun bosing'}
          </span>
        </div>
      )}

      <div style={{
        position: 'relative',
        width: 'min(100dvw, calc(100dvh * 393 / 852))',
        height: 'min(100dvh, calc(100dvw * 852 / 393))',
        maxWidth: '480px',
        maxHeight: '850px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Wrapper to prevent GPU checkerboard rendering bug on mobile */}
        <div style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.15))',
          pointerEvents: 'none',
          transform: `scale(${scaleFactor})`
        }}>
          <img 
            src={shapeImg} 
            alt="Ornate Frame" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              filter: 'brightness(1.15) contrast(1.1)'
            }} 
          />
        </div>

        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          color: '#fff',
          width: '100%',
          height: '70%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isThumbnail ? '15px' : '30px',
          padding: '0 40px',
          marginTop: '0px'
        }}>
          {/* Couple Names - BIGGER */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <h1 style={{ 
              fontFamily: getFontFamily(language), 
              fontStyle: 'italic',
              fontSize: isThumbnail ? '1.5rem' : '2.4rem',
              margin: 0,
              fontWeight: 400,
              letterSpacing: '0.1em',
              lineHeight: 1.2,
              color: '#ffffff',
              textTransform: 'uppercase'
            }}>
              {groomName}
            </h1>
            <span style={{ 
              fontFamily: getFontFamily(language), 
              fontStyle: 'italic',
              fontSize: isThumbnail ? '0.8rem' : '1.1rem',
              margin: '10px 0',
              fontWeight: 400,
              letterSpacing: '0.1em',
              color: '#ffffff',
              textTransform: 'uppercase'
            }}>
              {language === 'en' ? 'and' : language === 'ru' ? 'и' : language === 'tj' ? 'ва' : language === 'uz_cyrl' ? 'ва' : 'va'}
            </span>
            <h1 style={{ 
              fontFamily: getFontFamily(language), 
              fontStyle: 'italic',
              fontSize: isThumbnail ? '1.5rem' : '2.4rem',
              margin: 0,
              fontWeight: 400,
              letterSpacing: '0.1em',
              lineHeight: 1.2,
              color: '#ffffff',
              textTransform: 'uppercase'
            }}>
              {brideName}
            </h1>
          </div>

          {/* Announcement Text */}
          <p style={{ 
            fontFamily: getFontFamily(language), 
            fontSize: isThumbnail ? '0.6rem' : '0.95rem',
            lineHeight: 1.5,
            margin: '0',
            maxWidth: '180px',
            fontWeight: 400,
            color: '#ffffff'
          }}>
            {language === 'en' ? (
              <>Joyful news:<br />we are getting married!</>
            ) : language === 'ru' ? (
              <>Радостная новость:<br />мы женимся!</>
            ) : language === 'tj' ? (
              <>Хабари хуш:<br />мо оиладор мешавем!</>
            ) : language === 'uz_cyrl' ? (
              <>Қувончли янгилик:<br />биз турмуш қурамиз!</>
            ) : (
              <>Quvonchli yangilik:<br />biz turmush quramiz!</>
            )}
          </p>

          {/* Date with Gold Dots - SMALLER */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: isThumbnail ? '1px' : '4px'
          }}>
            {[day, month, year].map((part, i) => (
              <React.Fragment key={i}>
                <span style={{ 
                  fontFamily: getFontFamily(language), 
                  fontSize: isThumbnail ? '1.2rem' : '1.8rem',
                  fontWeight: 400,
                  lineHeight: 1,
                  color: '#ffffff'
                }}>
                  {part}
                </span>
                {i < 2 && <div style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#d4af37' }} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      {!isThumbnail && (
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            bottom: '4vh',
            textAlign: 'center',
            color: '#1a2b4b',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ 
            fontFamily: "'Montserrat', sans-serif", 
            fontSize: '0.75rem', 
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            fontWeight: 700,
            opacity: 0.5
          }}>
            {language === 'en' ? 'SCROLL DOWN' : language === 'ru' ? 'ЛИСТАЙТЕ ВНИЗ' : language === 'tj' ? 'БА ПОЁН ГУЗАРЕД' : language === 'uz_cyrl' ? 'ПАСТГА СУРИНГ' : 'PASTGA SURING'}
          </span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.6 }}>
            <path d="M7 13l5 5 5-5" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Intro;
