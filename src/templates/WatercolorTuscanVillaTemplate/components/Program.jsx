import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';

const CREAM = '#f8f5f0';

const DEFAULT_SCHEDULE = {
  uz: [
    { time: '12:00', title: 'Kelish & Kutib olish', desc: "Fincada xush kelibsiz ichimligi va qabul" },
    { time: '14:00', title: 'Nikoh marosimi', desc: "Kunning eng muhim lahzasi" },
    { time: '15:00', title: 'Appetayzlar & Ziyofat', desc: "Ochiq havoda dasturxon" },
    { time: '20:00', title: 'Bazm', desc: "Tongga qadar o'yin-kulgu!" },
  ],
  uz_cyrl: [
    { time: '12:00', title: 'Келиш & Кутиб олиш', desc: "Финкада хуш келибсиз ичимлиги ва қабул" },
    { time: '14:00', title: 'Никоҳ маросими', desc: "Куннинг энг муҳим лаҳзаси" },
    { time: '15:00', title: 'Аппетайзлар & Зиёфат', desc: "Очиқ ҳавода дастурхон" },
    { time: '20:00', title: 'Базм', desc: "Тонгга қадар ўйин-кулгу!" },
  ],
  tj: [
    { time: '12:00', title: 'Расидан & Хуш омадед', desc: "Мошруботи хуш омадед дар Финка" },
    { time: '14:00', title: 'Маросими арӯсӣ', desc: "Лаҳзаи муҳимтарини рӯз" },
    { time: '15:00', title: 'Хӯрокҳои сабук & Зиёфат', desc: "Дастархон дар ҳавои кушод" },
    { time: '20:00', title: 'Ҷашн', desc: "Раксу суруд то субҳ!" },
  ],
  ru: [
    { time: '12:00', title: 'Прибытие & Welcome Drink', desc: "Встреча гостей с бокалом шампанского" },
    { time: '14:00', title: 'Церемония', desc: "Самый особенный момент дня" },
    { time: '15:00', title: 'Закуски & Банкет', desc: "Праздничный стол под открытым небом" },
    { time: '20:00', title: 'Вечеринка', desc: "Танцуем до рассвета!" },
  ],
  en: [
    { time: '12:00', title: 'Arrival & Welcome Drink', desc: "Reception and welcome drinks at the finca" },
    { time: '14:00', title: 'Ceremony', desc: "The most special moment of the day" },
    { time: '15:00', title: 'Appetizers & Banquet', desc: "Enjoy our menu in the open air" },
    { time: '20:00', title: 'Party', desc: "Let's dance till dawn!" },
  ],
};

const TITLES = {
  uz:      { heading: "Kun dasturi", sub: "Siz uchun tayyorlagan narsalarimiz" },
  uz_cyrl: { heading: "Кун дастури", sub: "Сиз учун тайёрлаган нарсаларимиз" },
  tj:      { heading: "Барномаи рӯз", sub: "Он чизе ки барои шумо омода кардаем" },
  ru:      { heading: "Программа дня", sub: "Что мы приготовили для вас" },
  en:      { heading: "Day Program", sub: "What we have prepared for you" },
};

const Program = ({ data }) => {
  const { language } = useLanguage();
  const items = data?.schedule || DEFAULT_SCHEDULE[language] || DEFAULT_SCHEDULE.en;
  const title = TITLES[language] || TITLES.en;

  return (
    <div style={{ width: '100%', backgroundColor: CREAM, position: 'relative', overflow: 'hidden' }}>
      {/* Top botanical SVG decoration */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '130px', zIndex: 0 }}>
        <svg viewBox="0 0 400 130" width="100%" height="130" preserveAspectRatio="xMidYMin slice">
          <ellipse cx="200" cy="-10" rx="220" ry="80" fill="rgba(180,200,170,0.2)" />
          <ellipse cx="50" cy="20" rx="80" ry="50" fill="rgba(190,180,210,0.15)" />
          <ellipse cx="360" cy="15" rx="90" ry="55" fill="rgba(180,200,170,0.15)" />
          <path d="M30 0 Q50 30 40 60 Q30 90 50 120" stroke="rgba(130,160,110,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M370 0 Q350 30 360 60 Q370 90 350 120" stroke="rgba(130,160,110,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M40 40 Q20 30 15 50 Q30 60 40 40Z" fill="rgba(130,160,110,0.25)" />
          <path d="M45 65 Q25 55 22 75 Q35 82 45 65Z" fill="rgba(130,160,110,0.2)" />
          <path d="M360 40 Q380 30 385 50 Q370 60 360 40Z" fill="rgba(130,160,110,0.25)" />
          <path d="M355 65 Q375 55 378 75 Q365 82 355 65Z" fill="rgba(130,160,110,0.2)" />
        </svg>
      </div>

      {/* Bottom botanical SVG decoration */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '130px', zIndex: 0 }}>
        <svg viewBox="0 0 400 130" width="100%" height="130" preserveAspectRatio="xMidYMax slice">
          <ellipse cx="200" cy="140" rx="220" ry="80" fill="rgba(180,200,170,0.2)" />
          <path d="M30 130 Q50 100 40 70 Q30 40 50 10" stroke="rgba(130,160,110,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M370 130 Q350 100 360 70 Q370 40 350 10" stroke="rgba(130,160,110,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M40 90 Q20 100 15 80 Q30 70 40 90Z" fill="rgba(130,160,110,0.25)" />
          <path d="M360 90 Q380 100 385 80 Q370 70 360 90Z" fill="rgba(130,160,110,0.25)" />
          <path d="M50 65 Q25 75 22 55 Q35 48 50 65Z" fill="rgba(130,160,110,0.2)" />
          <path d="M350 65 Q375 75 378 55 Q365 48 350 65Z" fill="rgba(130,160,110,0.2)" />
        </svg>
      </div>

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '80px 32px 80px', gap: '10px', textAlign: 'center',
        maxWidth: '480px', margin: '0 auto',
      }}>
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginBottom: '16px' }}
        >
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontStyle: 'italic',
            fontWeight: 400, color: '#3d3028', margin: 0, letterSpacing: '0.03em',
          }}>
            {title.heading}
          </h2>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '0.7rem',
            letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9a8d80',
          }}>
            {title.sub}
          </span>
          <div style={{ width: '40px', height: '0.5px', background: '#b8aa8a', marginTop: '8px' }} />
        </motion.div>

        {/* Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', textAlign: 'center' }}>
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', position: 'relative' }}
            >
              {i > 0 && (
                <div style={{
                  position: 'absolute', top: '-28px', left: '50%', transform: 'translateX(-50%)',
                  width: '0.5px', height: '20px', background: 'rgba(184,170,138,0.5)',
                }} />
              )}
              <span style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: '0.75rem',
                letterSpacing: '0.25em', textTransform: 'uppercase', color: '#8a9e7a', fontWeight: 600,
              }}>
                {item.time}h
              </span>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', fontStyle: 'italic',
                fontWeight: 400, color: '#3d3028', margin: 0, letterSpacing: '0.02em',
              }}>
                {item.title}
              </h3>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: '0.9rem',
                color: '#8a7d72', margin: 0, lineHeight: 1.5, fontStyle: 'italic',
              }}>
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Program;
