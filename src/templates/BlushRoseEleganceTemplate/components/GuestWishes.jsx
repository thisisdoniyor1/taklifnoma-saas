import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';

const ROSE   = '#b05470';
const PINK   = '#d4849a';
const MAUVE  = '#7d4059';
const INK    = '#3b1a28';
const BLUSH  = '#fdf0f4';

const SECTION_TITLES = {
  en: "Guests' Wishes",
  ru: "Пожелания гостей",
  uz_cyrl: "Mehmonlar tilaklari",
  tj: "Таманниёти меҳмонон"
};

const DEFAULT_WISHES = {
  en: [
    { name: "John & Sarah", wish: "Wishing you a lifetime of love and happiness! May your journey together be filled with joy and sweet memories." },
    { name: "The Millers", wish: "So honored to share in your special day. Wishing you a beautiful future together filled with laughter." },
    { name: "David & Lily", wish: "May your love grow stronger with each passing year. Congratulations on this beautiful union!" }
  ],
  ru: [
    { name: "Иван и Мария", wish: "Желаем вам бесконечной любви, семейного тепла и счастья! Пусть каждый день совместной жизни будет полон радости." },
    { name: "Семья Петровых", wish: "Для нас большая честь разделить этот праздничный день с вами! Желаем вашей молодой семье гармонии и благополучия." },
    { name: "Дмитрий и Анна", wish: "Пусть ваша любовь крепнет с каждым годом! Счастливого и долгого совместного пути!" }
  ],
  uz_cyrl: [
    { name: "Farhod va Shahnoza", wish: "Sizlarga bir umrlik baxt va muhabbat tilaymiz! Hayotingiz quvonch va go‘zal lahzalarga boy bo‘lsin." },
    { name: "Karimovlar oilasi", wish: "Ushbu quvonchli kuningizda siz bilan birga bo‘lganimizdan juda shodmiz! Oilangiz mustahkam va fayzli bo‘lsin!" },
    { name: "Dilshod va Gulnoza", wish: "Sevingiz kundan-kunga mustahkamlanib borsin! Yangi hayotingiz baxtli va omadli bo‘lsin!" }
  ],
  tj: [
    { name: "Фарҳод ва Шаҳноза", wish: "Бароятон хушбахтӣ ва муҳаббати ҷовидона хоҳонем! Бигзор ҳаёти якҷояи шумо пур аз шодиву хотираҳои ширин бошад." },
    { name: "Оилаи Каримовҳо", wish: "Хеле шодем, ки ин рӯзи хосро бо шумо ҷашн мегирем! Ба оилаи ҷавонатон файзу баракат ва саодат орзумандем." },
    { name: "Дилшод ва Гулноза", wish: "Бигзор муҳаббати шумо рӯз то рӯз мустаҳкамтар шавад! Оғози ҳаёти нав муборак бошад!" }
  ]
};

const NO_WISHES_TEXT = {
  en: "No wishes yet. Be the first to leave a wish!",
  ru: "Пока нет пожеланий. Будьте первым, кто оставит пожелание!",
  uz: "Hozircha tilaklar yo‘q. Birinchi bo‘lib tilak qoldiring!",
  uz_cyrl: "Ҳозирча тилаклар йўқ. Биринчи бўлиб тилак қолдиринг!",
  tj: "Ҳоло таманниёт нест. Аввалин шуда таманно нависед!"
};

export default function GuestWishes({ rsvps, isRealInvitation }) {
  const { language } = useLanguage();
  
  const getRealWishes = (items) => Array.isArray(items) ? items.filter(r => r.wish && r.wish.trim()) : [];
  const [localWishes, setLocalWishes] = useState(() => getRealWishes(rsvps));

  useEffect(() => {
    setLocalWishes(getRealWishes(rsvps));
  }, [rsvps]);

  useEffect(() => {
    const handleNewWish = (e) => {
      const newRsvp = e.detail;
      if (newRsvp && newRsvp.wish && newRsvp.wish.trim()) {
        setLocalWishes(prev => [newRsvp, ...prev]);
      }
    };
    window.addEventListener('rsvp-submitted', handleNewWish);
    return () => window.removeEventListener('rsvp-submitted', handleNewWish);
  }, []);

  const currentLang = DEFAULT_WISHES[language] ? language : 'en';
  const wishesToShow = isRealInvitation 
    ? localWishes 
    : (localWishes.length > 0 ? localWishes : DEFAULT_WISHES[currentLang]);
  const sectionTitle = SECTION_TITLES[language] || SECTION_TITLES.en;

  return (
    <section style={{ padding: '4rem 1.5rem', backgroundColor: '#fff', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative dividers */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(176,84,112,0.22), transparent)' }} />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1 }}
        style={{ maxWidth: 760, margin: '0 auto' }}
      >
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            fontSize: 'clamp(1.5rem, 4vw, 1.9rem)',
            fontStyle: 'italic',
            fontWeight: 400,
            color: INK,
            marginBottom: 12,
          }}>
            {sectionTitle}
          </h2>
          <div style={{ width: 50, height: 1, background: 'linear-gradient(90deg, transparent, #b05470, transparent)', margin: '0 auto' }} />
        </div>

        {/* Wishes Grid */}
        {wishesToShow.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 16,
          }}>
            {wishesToShow.slice(0, 6).map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(176,84,112,0.1)' }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              style={{
                backgroundColor: '#fdf8fa',
                border: '1px solid rgba(176,84,112,0.12)',
                borderRadius: 8,
                padding: '1.5rem 1.25rem 1.25rem',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 6px 20px rgba(176,84,112,0.03)',
                minHeight: 150,
                boxSizing: 'border-box',
                transition: 'box-shadow 0.3s, transform 0.3s',
              }}
            >
              {/* Translucent quote marks */}
              <span style={{
                position: 'absolute',
                top: 4,
                left: 10,
                fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
                fontSize: '3.5rem',
                color: 'rgba(176,84,112,0.08)',
                lineHeight: 1,
                userSelect: 'none',
                pointerEvents: 'none'
              }}>
                “
              </span>

              {/* Wish content */}
              <p style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '1.05rem',
                fontStyle: 'italic',
                color: '#5a3d47',
                lineHeight: 1.5,
                margin: '0 0 1.25rem',
                position: 'relative',
                zIndex: 1,
              }}>
                {item.wish}
              </p>

              {/* Author info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
                <div style={{ width: 16, height: 1, backgroundColor: PINK }} />
                <span style={{
                  fontFamily: "'Lato', Arial, sans-serif",
                  fontSize: '0.62rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: ROSE,
                  fontWeight: 700,
                }}>
                  {item.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '1.25rem',
              color: '#8b7a80',
              fontStyle: 'italic',
              margin: 0
            }}>
              {NO_WISHES_TEXT[language] || NO_WISHES_TEXT.en}
            </p>
          </div>
        )}
      </motion.div>
    </section>
  );
}
