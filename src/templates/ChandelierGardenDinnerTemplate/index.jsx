import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { CalendarDays, Check, Clock, MapPin, Navigation, Send, ChevronDown } from 'lucide-react';
import FloatingControls from '../../components/FloatingControls';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../lib/db';
import { localizedName, getWelcomeText } from '../WatercolorTuscanVillaTemplate/utils/transliterate';
import { getMapUrls } from '../../utils/mapUtils';

import heroBg from './assets/chandelier_hero_bg.png';
import coverTexture from './assets/sage_floral_texture.png';
import sageEnvelopeImg from './assets/sage_envelope_image.jpg';
import pinkWaxSeal from './assets/pink_wax_seal.svg';
import floralBg from './assets/floral_countdown.png';
import venueImg from './assets/palace.png';

const IVORY = '#fbf5f6';
const BLUSH = '#f3e4e8';
const INK = '#342b28';
const MOSS = '#686a4d';
const GOLD = '#b99a52';

const COPY = {
  en: {
    coverInvite: 'You have an invitation',
    open: 'Open invitation',
    ceremony: 'Wedding invitation',
    welcome: 'Welcome',
    dateTitle: 'Wedding Date',
    details: 'The Details',
    location: 'Location',
    locationValue: 'Wedding house Forel, Khujand',
    googleMaps: 'Google Maps',
    appleMaps: 'Apple Maps',
    countdown: 'We are counting every moment',
    days: 'Days',
    hours: 'Hours',
    minutes: 'Min',
    seconds: 'Sec',
    photo: 'Our Moment',
    wishes: 'Guest Wishes',
    noWishes: 'Be the first to leave a wish.',
    rsvp: 'RSVP',
    rsvpSub: 'Leave a Wish',
    name: 'Your name',
    wish: 'Your wish',
    confirm: 'Send Wish',
    sending: 'Sending...',
    success: 'Thank you. Your response has been received.',
    footer: 'We look forward to celebrating this beautiful moment with you. ♥',
    time: 'Time',
  },
  ru: {
    coverInvite: 'У вас есть приглашение',
    open: 'Открыть приглашение',
    ceremony: 'Свадебное приглашение',
    welcome: 'Добро пожаловать',
    dateTitle: 'Дата свадьбы',
    details: 'Детали',
    location: 'Место',
    locationValue: 'Дом торжеств Форель, Худжанд',
    googleMaps: 'Google Карты',
    appleMaps: 'Apple Карты',
    countdown: 'Считаем каждое мгновение',
    days: 'Дней',
    hours: 'Часов',
    minutes: 'Мин',
    seconds: 'Сек',
    photo: 'Наш момент',
    wishes: 'Пожелания гостей',
    noWishes: 'Будьте первым, кто оставит пожелание.',
    rsvp: 'RSVP',
    rsvpSub: 'Оставьте пожелания',
    name: 'Ваше имя',
    wish: 'Ваше пожелание',
    confirm: 'Отправить пожелание',
    sending: 'Отправка...',
    success: 'Спасибо. Ваш ответ получен.',
    footer: 'Мы с нетерпением ждём этого прекрасного момента вместе с вами. ♥',
    time: 'Время',
  },
  uz_cyrl: {
    coverInvite: 'Sizga taklifnoma bor',
    open: 'Taklifnomani ochish',
    ceremony: 'To‘y taklifnomasi',
    welcome: 'Xush kelibsiz',
    dateTitle: 'To‘y sanasi',
    details: 'Tafsilotlar',
    location: 'Manzil',
    locationValue: 'Forel to‘yxonasi, Xo‘jand',
    googleMaps: 'Google Xarita',
    appleMaps: 'Apple Xarita',
    countdown: 'Har lahzani sanayapmiz',
    days: 'Kun',
    hours: 'Soat',
    minutes: 'Daq',
    seconds: 'Son',
    photo: 'Bizning lahza',
    wishes: 'Tilaklaringizni yuboring',
    noWishes: 'Birinchi bo‘lib tilak qoldiring.',
    rsvp: 'Tilaklaringizni yuboring',
    rsvpSub: 'Tilaklaringizni yuboring',
    name: 'Ismingiz',
    wish: 'Tilaklaringiz',
    confirm: 'Tasdiqlash',
    sending: 'Yuborilmoqda...',
    success: 'Rahmat. Javobingiz qabul qilindi.',
    footer: 'Biz siz bilan bu go‘zal lahzani birga nishonlashni intiqlik bilan kutamiz. ♥',
    time: 'Vaqt',
  },
  tj: {
    coverInvite: 'БА ШУМО ДАЪВАТНОМА ХАСТ',
    open: 'Кушодани даъватнома',
    ceremony: 'Даъватномаи никоҳӣ',
    welcome: 'Хуш омадед',
    dateTitle: 'Санаи тўй',
    details: 'Тафсилот',
    location: 'Манзил',
    locationValue: 'Тӯйхонаи Форел, Хуҷанд',
    googleMaps: 'Google Харита',
    appleMaps: 'Apple Харита',
    countdown: 'Ҳар як лаҳзаро мешуморем',
    days: 'Рӯз',
    hours: 'Соат',
    minutes: 'Дақ',
    seconds: 'Сон',
    photo: 'Лаҳзаи мо',
    wishes: 'Таманниёти меҳмонон',
    noWishes: 'Аввалин шуда таманно нависед.',
    rsvp: 'Тасдиқи иштирок',
    rsvpSub: 'Иштироки худро тасдиқ кунед',
    name: 'Номи шумо',
    wish: 'Таманно нависед',
    confirm: 'Тасдиқ кунед',
    sending: 'Ирсол...',
    success: 'Ташаккур. Ҷавоби шумо қабул шуд.',
    footer: 'Мо интизори ин лаҳзаи зебои шумо ҳастем. ♥',
    time: 'Вақт',
  },
};

const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  uz_cyrl: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'],
  tj: ['Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн', 'Июл', 'Август', 'Сентябр', 'Октябр', 'Ноябр', 'Декабр'],
};

const WEEKDAYS = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  ru: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
  uz_cyrl: ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'],
  tj: ['Якшанбе', 'Душанбе', 'Сешанбе', 'Чоршанбе', 'Панҷшанбе', 'Ҷумъа', 'Шанбе'],
};

function parseDate(dateString) {
  const ds = String(dateString || '26.02.2027');
  if (ds.includes('-')) {
    const parts = ds.split('-');
    return { 
      day: Number.parseInt(parts[2], 10) || 26, 
      month: Number.parseInt(parts[1], 10) || 2, 
      year: Number.parseInt(parts[0], 10) || 2027 
    };
  }
  const parts = ds.split('.');
  const day = Number.parseInt(parts[0], 10) || 26;
  const month = Number.parseInt(parts[1], 10) || 2;
  const year = Number.parseInt(parts[2], 10) || 2027;
  return { day, month, year };
}

function getTargetDate(dateString, timeString) {
  const { day, month, year } = parseDate(dateString);
  return new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${timeString || '18:00'}:00`);
}

function getTimeLeft(targetDate) {
  const diff = Math.max(0, targetDate.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

function DecorationStyles() {
  return (
    <style>{`
      .chandelier-template {
        min-height: 100vh;
        background: ${IVORY};
        color: ${INK};
        font-family: "Cormorant Garamond", Georgia, serif;
        overflow-x: hidden;
        position: relative;
      }

      .chandelier-section {
        position: relative;
        padding: 5rem 1.35rem;
        text-align: center;
      }

      .chandelier-eyebrow {
        color: ${MOSS};
        font-family: Lato, Arial, sans-serif;
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.22em;
        text-transform: uppercase;
      }

      .chandelier-title {
        margin: 0;
        color: ${INK};
        font-size: 2.8rem;
        font-style: italic;
        font-weight: 400;
        line-height: 0.98;
      }

      .chandelier-script {
        font-size: clamp(2.2rem, 7vw, 3.5rem);
        font-style: italic;
        font-weight: 400;
        line-height: 1.1;
        margin: 0;
        color: ${INK};
      }

      .chandelier-line {
        width: 4.5rem;
        height: 1px;
        margin: 1.4rem auto;
        background: linear-gradient(90deg, transparent, ${GOLD}, transparent);
      }

      .section-card {
        width: min(100%, 23rem);
        margin: 0 auto;
        background: rgba(255,255,255,0.7);
        border: 1px solid rgba(185,154,82,0.15);
        box-shadow: 0 1.2rem 4rem rgba(102,83,76,0.08);
        backdrop-filter: blur(10px);
      }

      .ornate-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        min-height: 3rem;
        padding: 0.85rem 1.5rem;
        border-radius: 999px;
        border: none;
        background: ${MOSS};
        color: #fff;
        font-family: Lato, Arial, sans-serif;
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        text-decoration: none;
        box-shadow: 0 0.8rem 1.8rem rgba(88,90,67,0.2);
        cursor: pointer;
      }

      .glass-card {
        background: rgba(255, 255, 255, 0.4);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        padding: 3rem 2rem;
        border-radius: 4px;
        position: relative;
        z-index: 10;
        width: 100%;
        max-width: 20rem;
      }

      .hero-bg {
        position: absolute;
        inset: 0;
        background-image: url(${heroBg});
        background-size: cover;
        background-position: center;
        z-index: 1;
      }

      .hero-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, rgba(251,245,246,0.1) 0%, rgba(251,245,246,0.4) 50%, rgba(251,245,246,0.1) 100%);
        z-index: 2;
      }

      .floral-bg {
        width: 100%;
        height: 14rem;
        background-image: url(${floralBg});
        background-size: cover;
        background-position: center top;
        opacity: 0.85;
        margin-bottom: 2rem;
        border-radius: 1rem;
      }

      .cover-bg {
        position: absolute;
        inset: 0;
        background-image: url(${coverTexture});
        background-size: cover;
        background-position: center;
        z-index: 1;
      }

      .cover-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, rgba(251,245,246,0.25) 0%, rgba(251,245,246,0.15) 60%, rgba(251,245,246,0.45) 100%);
        z-index: 2;
      }

      .heart-date {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        position: relative;
        width: 5rem;
        height: 4.5rem;
        margin: 1rem auto;
      }

      .heart-date::before,
      .heart-date::after {
        content: '';
        position: absolute;
        top: 0;
        width: 2.5rem;
        height: 4rem;
        background: ${MOSS};
        border-radius: 2rem 2rem 0 0;
      }

      .heart-date::before {
        left: 50%;
        transform: rotate(-45deg);
        transform-origin: 0 100%;
      }

      .heart-date::after {
        right: 50%;
        transform: rotate(45deg);
        transform-origin: 100% 100%;
      }

      .heart-date-number {
        position: relative;
        z-index: 3;
        color: #fff;
        font-size: 1.5rem;
        font-weight: 700;
        font-family: "Cormorant Garamond", Georgia, serif;
        margin-top: 0.6rem;
      }

      .gramophone-container {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-top: 3rem;
        opacity: 0.9;
      }

      .gramophone-img {
        width: 180px;
        height: auto;
      }

      @media (max-width: 390px) {
        .chandelier-title { font-size: 2.35rem; }
        .chandelier-script { font-size: 2.2rem; }
        .chandelier-section { padding-left: 1rem; padding-right: 1rem; }
      }
    `}</style>
  );
}

const COVER_LABELS = {
  en: { invite: 'You have an invitation', open: 'Click to Open' },
  ru: { invite: 'У вас есть приглашение', open: 'Нажмите, чтобы открыть' },
  uz: { invite: 'Sizga taklifnoma bor', open: 'OCHISH UCHUN TUGMANI BOSING' },
  uz_cyrl: { invite: 'Sizga taklifnoma bor', open: 'OCHISH UCHUN TUGMANI BOSING' },
  tj: { invite: 'Ба шумо даъватнома хаст', open: 'Барои кушодан пахш кунед' }
};

function Hero({ data, isThumbnail, opened, onOpen }) {
  const { language } = useLanguage();
  const tr = COVER_LABELS[language] || COVER_LABELS.en;
  const groom = localizedName(data?.groomName || 'Rustam', language);
  const bride = localizedName(data?.brideName || 'Madina', language);

  const [opening, setOpening] = useState(false);

  const handleOpenClick = () => {
    if (isThumbnail || opening) return;
    window.dispatchEvent(new Event('open-invitation'));
    setOpening(true);
    setTimeout(() => {
      onOpen();
    }, 700);
  };

  const isClosed = !opened;

  return (
    <section 
      className="device-cover-page"
      style={{ 
        height: isThumbnail ? '100%' : '100dvh', 
        position: 'relative', 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        paddingTop: '0', 
        textAlign: 'center',
        width: '100%'
      }}
    >
      <AnimatePresence>
        {isClosed && (
          <motion.div
            onClick={handleOpenClick}
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.65, ease: 'easeInOut' } }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: isThumbnail ? 20 : 4600,
              backgroundImage: `url(${sageEnvelopeImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              cursor: opening ? 'default' : 'pointer',
              userSelect: 'none',
              pointerEvents: isThumbnail ? 'none' : 'auto'
            }}
          >
            <motion.div
              key={language}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{ width: '100%', height: '100%', position: 'relative' }}
            >
              {/* Subtle dark gradient overlay to ensure text readability */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, rgba(18, 23, 15, 0.45) 0%, rgba(18, 23, 15, 0.1) 50%, rgba(18, 23, 15, 0.45) 100%)',
                zIndex: 1
              }} />

              {/* Top Eyebrow / Invitation Text above the envelope */}
              <div
                style={{ 
                  position: 'absolute',
                  top: isThumbnail ? '22%' : '16%',
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  zIndex: 2,
                  opacity: opening ? 0 : 1,
                  transform: opening ? 'translateY(-15px)' : 'translateY(0)',
                  transition: 'opacity 0.4s ease, transform 0.4s ease',
                  padding: '0 20px'
                }}
              >
                <p style={{
                  fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                  fontSize: 'clamp(2rem, 8.5vw, 3.2rem)',
                  fontWeight: 600,
                  fontStyle: 'italic',
                  color: '#ffffff',
                  textShadow: '0 2px 10px rgba(0,0,0,0.6), 0 4px 25px rgba(0,0,0,0.4)',
                  margin: 0,
                  letterSpacing: '0.04em',
                  lineHeight: 1.3
                }}>
                  {isThumbnail ? (
                    (() => {
                      const splits = {
                        en:      ['You have an', 'invitation'],
                        ru:      ['У вас есть', 'приглашение'],
                        uz:      ['Sizga', 'taklifnoma bor'],
                        uz_cyrl: ['Sizga', 'taklifnoma bor'],
                        tj:      ['Барои шумо', 'даъватнома ҳаст'],
                      };
                      const [line1, line2] = splits[language] || splits.en;
                      return <>{line1}<br />{line2}</>;
                    })()
                  ) : (
                    tr.invite
                  )}
                </p>
              </div>

              {/* Click to open instructions below the envelope */}
              {isThumbnail ? (
                <div
                  style={{
                    position: 'absolute',
                    top: '72%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2,
                  }}
                >
                  <div style={{
                    fontFamily: "'Lato', Arial, sans-serif",
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    letterSpacing: '0.24em',
                    textTransform: 'uppercase',
                    color: '#686a4d',
                    border: '1.5px solid #b99a52',
                    borderRadius: '28px',
                    padding: '12px 36px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                    whiteSpace: 'nowrap',
                  }}>
                    {tr.open}
                  </div>
                </div>
              ) : (
                <div
                  style={{ 
                    position: 'absolute',
                    top: '74%',
                    left: '50%',
                    zIndex: 2,
                    opacity: opening ? 0 : 1,
                    transform: opening ? 'translate(-50%, 15px)' : 'translate(-50%, 0)',
                    transition: 'opacity 0.4s ease, transform 0.4s ease'
                  }}
                >
                  <button
                    type="button"
                    onClick={handleOpenClick}
                    style={{
                      fontFamily: "'Lato', Arial, sans-serif",
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      letterSpacing: '0.24em',
                      textTransform: 'uppercase',
                      color: '#686a4d',
                      border: '1.5px solid #b99a52',
                      borderRadius: '28px',
                      padding: '12px 36px',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.3s',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#b99a52';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.borderColor = '#b99a52';
                      e.currentTarget.style.boxShadow = '0 10px 28px rgba(185,154,82,0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.color = '#686a4d';
                      e.currentTarget.style.borderColor = '#b99a52';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.18)';
                    }}
                  >
                    {tr.open}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hero-bg" />
      <div className="hero-overlay" />
      
      <motion.div 
        initial={{ opacity: 0, y: 24 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 1.2, delay: opened ? 0.5 : 0 }} 
        style={{ position: 'relative', zIndex: 10, padding: '2rem' }}
      >
        <motion.div key={language} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="chandelier-script" style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 4px 12px rgba(255,255,255,0.9)' }}>{groom}</h1>
          <p style={{ margin: '0.2rem 0', color: GOLD, fontSize: '1.8rem', fontStyle: 'italic', textShadow: '0 2px 8px rgba(255,255,255,0.8)' }}>&amp;</p>
          <h1 className="chandelier-script" style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 4px 12px rgba(255,255,255,0.9)' }}>{bride}</h1>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: opened ? 1 : 0, y: opened ? [0, 8, 0] : 0 }}
        transition={{ opacity: { delay: opened ? 1.5 : 0, duration: 1 }, y: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' } }}
        style={{ position: 'absolute', bottom: '2rem', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 10, pointerEvents: 'none' }}
      >
        <motion.div key={language} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <span className="chandelier-eyebrow" style={{ color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            {language === 'en' ? 'SCROLL DOWN' : language === 'ru' ? 'ЛИСТАЙТЕ ВНИЗ' : language === 'tj' ? 'БА ПОЁН ГУЗАРЕД' : language === 'uz_cyrl' ? 'PASTGA SURING' : 'PASTGA SURING'}
          </span>
          <ChevronDown size={28} color="#fff" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))' }} strokeWidth={2.5} />
        </motion.div>
      </motion.div>
    </section>
  );
}
function Welcome({ data }) {
  const { language, t } = useLanguage();
  const text = getWelcomeText(data?.welcomeText, language, t);

  return (
    <section className="chandelier-section" style={{ paddingTop: '5rem' }}>
      <motion.div className="section-card" initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.75 }} style={{ padding: '3rem 2rem', borderRadius: '2rem' }}>
        <div className="chandelier-line" style={{ marginBottom: '1.5rem' }} />
        <p style={{ margin: 0, color: '#6c5d57', fontSize: '1.3rem', lineHeight: 1.7, fontStyle: 'italic' }}>{text}</p>
        <div className="chandelier-line" style={{ marginTop: '1.5rem' }} />
      </motion.div>
    </section>
  );
}

function DateSection({ data }) {
  const { language } = useLanguage();
  const tr = COPY[language] || COPY.en;
  const { day, month, year } = parseDate(data?.date);
  const date = getTargetDate(data?.date, data?.time);
  const monthName = (MONTHS[language] || MONTHS.en)[month - 1];
  const weekday = (WEEKDAYS[language] || WEEKDAYS.en)[date.getDay()];

  return (
    <section className="chandelier-section" style={{ paddingTop: '3rem' }}>
      <p className="chandelier-eyebrow" style={{ margin: '0 0 1.5rem', fontSize: '1rem' }}>{tr.dateTitle}</p>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.75 }} className="section-card" style={{ borderRadius: '2rem', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CalendarDays size={32} color={GOLD} strokeWidth={1.2} />
        <p style={{ margin: '1.2rem 0 0', fontSize: '2.2rem', fontFamily: "'Playfair Display', serif", color: '#665954', fontStyle: 'italic' }}>{monthName} {year}</p>
        <p className="chandelier-eyebrow" style={{ margin: '0.8rem 0', letterSpacing: '0.15em' }}>{weekday}</p>
        <div style={{ margin: '1.2rem auto 0', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem', maxWidth: '18rem' }}>
          {Array.from({ length: 31 }, (_, index) => index + 1).map((value) => (
            value === day ? (
              <div key={value} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '2.2rem' }}>
                <svg viewBox="0 0 32 30" width="32" height="30" style={{ filter: 'drop-shadow(0 2px 4px rgba(104,106,77,0.4))' }}>
                  <path d="M16 27 C16 27, 2 17, 2 9 C2 4.5 5.5 2 9 2 C11.5 2 13.8 3.4 16 6 C18.2 3.4 20.5 2 23 2 C26.5 2 30 4.5 30 9 C30 17 16 27 16 27 Z" fill={MOSS} />
                  <text x="16" y="17" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="Cormorant Garamond, Georgia, serif">{value}</text>
                </svg>
              </div>
            ) : (
              <span key={value} style={{
                height: '2rem',
                display: 'grid',
                placeItems: 'center',
                color: '#6b5e58',
                fontSize: '0.9rem',
                fontWeight: 400,
              }}>
                {value}
              </span>
            )
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function Countdown({ data }) {
  const { language, t } = useLanguage();
  const tr = COPY[language] || COPY.en;
  const target = useMemo(() => getTargetDate(data?.date, data?.time), [data?.date, data?.time]);
  const [left, setLeft] = useState(() => getTimeLeft(target));

  useEffect(() => {
    const timer = window.setInterval(() => setLeft(getTimeLeft(target)), 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  const pieces = [
    [left.days, tr.days],
    [left.hours, tr.hours],
    [left.minutes, tr.minutes],
    [left.seconds, tr.seconds],
  ];

  return (
    <section className="chandelier-section" style={{ paddingTop: '4rem' }}>
      <div className="floral-bg" />
      <p className="chandelier-eyebrow" style={{ margin: '0 0 2rem', fontSize: '1rem' }}>{t('invitation.counting') || tr.countdown}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.7rem', maxWidth: '23rem', margin: '0 auto' }}>
        {pieces.map(([value, label]) => (
          <motion.div key={label} className="section-card" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ padding: '1.2rem 0.5rem', borderRadius: '1.2rem' }}>
            <strong style={{ display: 'block', fontSize: '2rem', fontWeight: 400, color: INK }}>{String(value).padStart(2, '0')}</strong>
            <span style={{ display: 'block', marginTop: '0.4rem', color: MOSS, fontFamily: 'Lato, Arial, sans-serif', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function PhotoSection({ data }) {
  const { language } = useLanguage();
  const tr = COPY[language] || COPY.en;
  const photo = data?.image_url || data?.imageUrl;

  if (!photo) return null;

  return (
    <section className="chandelier-section">
      <p className="chandelier-eyebrow" style={{ margin: '0 0 1.5rem' }}>{tr.photo}</p>
      <motion.div className="section-card" initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ borderRadius: '2rem', padding: '1rem' }}>
        <img src={photo} alt={tr.photo} style={{ display: 'block', width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: '1.4rem', filter: 'saturate(0.9) contrast(0.96)' }} />
      </motion.div>
    </section>
  );
}

function Venue({ data }) {
  const { language } = useLanguage();
  const tr = COPY[language] || COPY.en;
  
  // Translation logic for the specific address requested by user
  const rawLocation = data?.location || 'Wedding house Forel, Khujand';
  const location = ((rawLocation.toLowerCase().includes('farel') || rawLocation.toLowerCase().includes('forel')) && rawLocation.toLowerCase().includes('khujand')) 
    ? tr.locationValue 
    : rawLocation;

  const { googleMaps: googleUrl, appleMaps: appleUrl } = getMapUrls(location, data?.locationUrl);

  return (
    <section className="chandelier-section">
      <p className="chandelier-eyebrow" style={{ margin: '0 0 1.5rem', fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', textTransform: 'capitalize' }}>{tr.location}</p>
      <motion.div className="section-card" initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ borderRadius: '2rem', padding: '3rem 2rem', position: 'relative', overflow: 'hidden' }}>
        {/* Ornate Frame Overlay */}
        <div style={{ position: 'absolute', inset: '1rem', border: '2px solid rgba(185,154,82,0.15)', borderRadius: '1.5rem', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: '1.5rem', border: '1px solid rgba(185,154,82,0.1)', borderRadius: '1.2rem', pointerEvents: 'none' }} />
        
        <div style={{ marginBottom: '2rem', borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(185,154,82,0.15)' }}>
          <img src={venueImg} alt="Venue" style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: '4/3', objectFit: 'cover' }} />
        </div>
        
        <div style={{ margin: '0 auto 0.5rem', display: 'flex', justifyContent: 'center' }}>
          <MapPin size={28} color={GOLD} strokeWidth={1.4} />
        </div>
        <p style={{ margin: '0 auto 1.5rem', color: '#665954', fontSize: '1.6rem', lineHeight: 1.4, maxWidth: '18rem', fontStyle: 'italic' }}>{location}</p>
        {data?.time && (
          <p style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', margin: '0 auto 2rem', color: MOSS, fontFamily: 'Lato, Arial, sans-serif', fontSize: '1.1rem', fontWeight: 800 }}>
            <Clock size={18} /> {tr.time}: {data.time}
          </p>
        )}
        <div style={{ display: 'flex', gap: '0.8rem', flexDirection: 'row', justifyContent: 'center' }}>
          <a className="ornate-button" href={googleUrl} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '0.5rem 1rem', minHeight: '2.4rem', whiteSpace: 'nowrap' }}><Navigation size={16} />{tr.googleMaps}</a>
          <a className="ornate-button" href={appleUrl} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '0.5rem 1rem', minHeight: '2.4rem', whiteSpace: 'nowrap' }}><Navigation size={16} />{tr.appleMaps}</a>
        </div>
      </motion.div>
    </section>
  );
}

const DUMMY_WISHES = [
  { name: 'Aziz & Malika', wish: 'Wishing you a lifetime of love and happiness together!' },
  { name: 'Sardor', wish: 'May your journey together be filled with joy and laughter. Congratulations!' },
  { name: 'Dilorom opa', wish: 'So happy for you both. A beautiful couple deserves a beautiful life. ♥' },
];

function WishesAndRsvp({ data, isThumbnail }) {
  const { language, t } = useLanguage();
  const params = useParams();
  const tr = COPY[language] || COPY.en;
  const invitationRef = params['*'] || params.id || '';
  const [wishes, setWishes] = useState(
    !invitationRef || isThumbnail
      ? DUMMY_WISHES
      : Array.isArray(data?.rsvps) ? data.rsvps.filter((item) => item.wish).slice(0, 8) : []
  );
  const [form, setForm] = useState({ name: '', wish: '' });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!invitationRef) return;
    db.getRSVPs(invitationRef)
      .then((items) => setWishes((items || []).filter((item) => item.wish).slice(0, 8)))
      .catch(() => {});
  }, [invitationRef]);

  useEffect(() => {
    const handleNewWish = (e) => {
      const newRsvp = e.detail;
      if (newRsvp && newRsvp.wish && newRsvp.wish.trim()) {
        setWishes((prev) => {
          if (prev.some(w => w.name === newRsvp.name && w.wish === newRsvp.wish)) return prev;
          // Filter out dummy wishes if any still exist
          const filteredPrev = prev.filter(w => w.name !== 'John' && w.name !== 'Sardor');
          return [newRsvp, ...filteredPrev].slice(0, 8);
        });
      }
    };
    window.addEventListener('rsvp-submitted', handleNewWish);
    return () => window.removeEventListener('rsvp-submitted', handleNewWish);
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !invitationRef) return;
    setLoading(true);
    try {
      await db.addRSVP(invitationRef, { name: form.name.trim(), wish: form.wish.trim(), status: 'attending' });
      const items = await db.getRSVPs(invitationRef);
      setWishes((items || []).filter((item) => item.wish).slice(0, 8));
      setDone(true);
    } catch {
      setDone(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="chandelier-section">
        <p className="chandelier-eyebrow" style={{ margin: '0 0 1.5rem', fontSize: '1.2rem' }}>{tr.wishes}</p>
        <div style={{ display: 'grid', gap: '1rem', maxWidth: '23rem', margin: '0 auto' }}>
          {wishes.length > 0 ? wishes.map((wish, index) => (
            <motion.div key={`${wish.name}-${index}`} className="section-card" initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ borderRadius: '1.2rem', padding: '1.5rem', textAlign: 'left' }}>
              <p style={{ margin: '0 0 0.8rem', color: '#5e534f', fontSize: '1.15rem', lineHeight: 1.5, fontStyle: 'italic' }}>"{wish.wish}"</p>
              <strong style={{ color: MOSS, fontFamily: 'Lato, Arial, sans-serif', fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{wish.name}</strong>
            </motion.div>
          )) : (
            <p style={{ color: '#7a6d67', margin: 0, fontSize: '1.2rem', fontStyle: 'italic' }}>{tr.noWishes}</p>
          )}
        </div>
      </section>
      
      <section className="chandelier-section" style={{ paddingTop: '4rem' }}>
        <motion.div className="section-card" initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ borderRadius: '2rem', padding: '2.5rem 2rem' }}>
          {!done ? (
            <form onSubmit={submit} style={{ display: 'grid', gap: '1.2rem' }}>
              <h2 className="chandelier-title" style={{ fontSize: '2.2rem' }}>{tr.rsvpSub}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
                <label style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: MOSS, opacity: 0.85 }}>{tr.name}</label>
                <input required value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} placeholder="" style={fieldStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
                <label style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: MOSS, opacity: 0.85 }}>{tr.wish}</label>
                <textarea rows={4} value={form.wish} onChange={(event) => setForm((value) => ({ ...value, wish: event.target.value }))} placeholder="" style={{ ...fieldStyle, resize: 'none' }} />
              </div>
              <button type="submit" className="ornate-button" disabled={loading} style={{ width: '100%' }}>
                <Send size={16} /> {loading ? tr.sending : tr.confirm}
              </button>
            </form>
          ) : (
            <div style={{ display: 'grid', justifyItems: 'center', gap: '1.2rem', padding: '1.5rem 0' }}>
              <span style={{ width: '4rem', height: '4rem', borderRadius: '50%', display: 'grid', placeItems: 'center', background: MOSS, color: '#fff' }}>
                <Check size={32} />
              </span>
              <p style={{ margin: 0, color: '#5e534f', fontSize: '1.5rem', lineHeight: 1.4, fontStyle: 'italic' }}>{tr.success}</p>
            </div>
          )}
        </motion.div>
      </section>
    </>
  );
}

const fieldStyle = {
  width: '100%',
  border: '1px solid rgba(185,154,82,0.25)',
  borderRadius: '1rem',
  padding: '1rem 1.2rem',
  background: 'rgba(255,255,255,0.9)',
  color: INK,
  font: '600 1rem Lato, Arial, sans-serif',
  outline: 'none',
};

function MainContent({ data, isThumbnail, opened }) {
  const { language } = useLanguage();
  const tr = COPY[language] || COPY.en;

  if (!opened && !isThumbnail) return null;

  return (
    <motion.div
      key={language}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Welcome data={data} />
      <DateSection data={data} />
      <Countdown data={data} />
      <PhotoSection data={data} />
      <Venue data={data} />
      <WishesAndRsvp data={data} isThumbnail={isThumbnail} />
      <footer style={{
        padding: '60px 20px 40px',
        textAlign: 'center',
        background: `linear-gradient(135deg, ${MOSS} 0%, #4a4d35 100%)`,
        color: 'rgba(255,255,255,0.8)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', maxWidth: '400px', marginBottom: '20px' }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '2.5rem',
            fontStyle: 'italic',
            color: '#ffffff',
            margin: 0
          }}>
            {localizedName(data?.groomName || 'Rustam', language)} & {localizedName(data?.brideName || 'Madina', language)}
          </h2>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.1rem',
            lineHeight: 1.6,
            opacity: 0.9,
            margin: 0,
            letterSpacing: '0.05em'
          }}>
            {tr.footer}
          </p>
        </div>

        <div style={{ width: '60px', height: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 auto' }} />

        <div style={{ fontSize: '0.75rem', letterSpacing: '0.25em', marginTop: '10px', fontFamily: "'Cormorant Garamond', serif", textTransform: 'uppercase' }}>
          © 2026 TAKLIFNOMA.VIP
        </div>
        <div style={{ fontSize: '0.65rem', opacity: 0.7, letterSpacing: '0.1em', fontFamily: "'Lato', Arial, sans-serif" }}>
          {language === 'en' ? 'Create your own digital invitation' : 
           language === 'ru' ? 'Создайте свое цифровое приглашение' : 
           language === 'tj' ? 'Даъватномаи электронии худро созед' : 
           language === 'uz' ? 'O‘zingizning raqamli taklifnomangizni yarating' : 
           "O'zingizning raqamli taklifnomangizni yarating"}
        </div>
      </footer>
    </motion.div>
  );
}

const ChandelierGardenDinnerTemplate = ({ data, isThumbnail }) => {
  const [opened, setOpened] = useState(false);

  return (
    <div 
      className="chandelier-template premium-template-root" 
      style={{ 
        overflow: opened ? 'auto' : 'hidden', 
        minHeight: isThumbnail ? '100%' : '100dvh',
        height: isThumbnail ? '100%' : (opened ? 'auto' : '100dvh') 
      }}
    >
      <DecorationStyles />
      {!isThumbnail && <FloatingControls musicUrl={data?.musicUrl} accentColor="rgba(104,106,77,0.88)" />}
      
      <Hero data={data} isThumbnail={isThumbnail} opened={opened} onOpen={() => setOpened(true)} />
      <MainContent data={data} isThumbnail={isThumbnail} opened={opened} />
    </div>
  );
};

export default ChandelierGardenDinnerTemplate;
