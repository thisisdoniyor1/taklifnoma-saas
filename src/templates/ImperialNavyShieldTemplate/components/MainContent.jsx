import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { db } from '../../../lib/db';
import { useParams } from 'react-router-dom';
import { translateLocation, localizedName, getWelcomeText } from '../../WatercolorTuscanVillaTemplate/utils/transliterate';

// Asset imports
import palaceImg from '../../../assets/royal_navy/palace.png';
import ringsImg from '../../../assets/royal_navy/rings.png';
import Intro from './Intro';
import { MapPin, Clock } from 'lucide-react';

const IVORY_BACKGROUND = '#fbf9fa';
const NAVY = '#1a2b4b';

const DUMMY_WISHES_BY_LANG = {
  uz_cyrl: [
    { name: 'Shavkat va Gulnora', wish: 'Baxtli bo‘linglar! Qo‘sha qaringlar, oilaviy xotirjamlik tilaymiz.' },
    { name: 'Dilshod oilasi bilan', wish: 'To‘ylar muborak! Yoshlar baxtli bo‘lsin, shirindan-shakar farzandlar ko‘ringlar.' }
  ],
  tj: [
    { name: 'Фарҳод ва Мадина', wish: 'Хушбахт бошед! Зиндагии ширин ва хушбахтӣ таманно дорем.' },
    { name: 'Алиҷон', wish: 'Тӯй муборак шавад! Бигзор ишқи шумо то абад ҷовидон бимонад.' }
  ],
  ru: [
    { name: 'Семья Ивановых', wish: 'Поздравляем с днем свадьбы! Желаем бесконечного счастья и любви.' },
    { name: 'Елена и Максим', wish: 'Совет да любовь! Пусть ваша совместная жизнь будет полна радости.' }
  ],
  en: [
    { name: 'The Smiths', wish: 'Wishing you a lifetime of love and happiness. Congratulations!' },
    { name: 'Sarah & John', wish: 'So happy for you both! May your future be as bright as this day.' }
  ]
};

const GOLD = '#d4af37';

function parseDate(s) {
  if (!s) return { day: 26, month: 2, year: 2027 };
  const [d, m, y] = String(s).split('.');
  return { day: +d || 26, month: +m || 2, year: +y || 2027 };
}

function parseTarget(s, t) {
  if (!s) return null;
  const [d, m, y] = String(s).split('.');
  return new Date(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${t || '18:00'}:00`);
}

function calcLeft(tgt) {
  if (!tgt) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const diff = Math.max(0, tgt - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

const WEEKDAYS = {
  uz: ['DU', 'SE', 'CHOR', 'PAY', 'JU', 'SHA', 'YA'],
  uz_cyrl: ['DU', 'SE', 'CHOR', 'PAY', 'JU', 'SHA', 'YAK'],
  tj: ['ДУ', 'СЕ', 'ЧОР', 'ПАЙ', 'ҶУ', 'ША', 'ЯК'],
  ru: ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'],
  en: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
};

const Section = ({ children, style = {} }) => (
  <section style={{
    padding: '60px 24px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    position: 'relative',
    ...style
  }}>
    {children}
  </section>
);

const MainContent = ({ data }) => {
  const { t, language } = useLanguage();
  const getFontFamily = () => "'Playfair Display', 'Cormorant Garamond', Georgia, serif";
  const params = useParams();
  const invRef = params['*'] || params.id || '';

  const WELCOME_FALLBACKS = {
    uz: "Biz sizni hayotimizning eng quvonchli kunida — nikoh to'yimizda ko'rishdan baxtiyor bo'lamiz.",
    uz_cyrl: "Biz sizni hayotimizning eng quvonchli kunida — nikoh to‘yimizda ko‘rishdan baxtiyor bo‘lamiz.",
    tj: "Мо сиро ба ҷашни хурсандии худ — тӯйи арӯсӣ самимона даъват менамоем.",
    ru: "Будем искренне рады видеть вас на самом радостном событии в нашей жизни — нашей свадьбе.",
    en: "We would be honored to have you join us for the celebration of our wedding day."
  };

  const TIME_LABELS = {
    uz: "Vaqti",
    uz_cyrl: "Vaqti",
    tj: "Вақт",
    ru: "Время",
    en: "Time"
  };


  const RSVP_SUBTITLES = {
    uz: "Ishtirokni tasdiqlash",
    uz_cyrl: "Ishtirokni tasdiqlash",
    tj: "Тасдиқи иштирок",
    ru: "Подтверждение участия",
    en: "Confirm attendance"
  };

  const RSVP_SUCCESS_LABELS = {
    uz: "Rahmat! Biz sizni kutamiz.",
    uz_cyrl: "Rahmat! Biz sizni kutamiz.",
    tj: "Ташаккур! Мо шуморо интизорем.",
    ru: "Спасибо! Мы ждем вас.",
    en: "Thank you! We look forward to seeing you."
  };

  const { day, month, year } = parseDate(data?.date);
  const target = useMemo(() => parseTarget(data?.date, data?.time), [data?.date, data?.time]);
  const [tl, setTl] = useState(() => calcLeft(target));

  useEffect(() => {
    const id = setInterval(() => setTl(calcLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const [form, setForm] = useState({ name: '', wish: '' });
  const [rsvpDone, setRsvpDone] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [wishes, setWishes] = useState([]);

  useEffect(() => {
    if (!invRef) return;
    const fetchWishes = async () => {
      try {
        const data = await db.getRSVPs(invRef);
        setWishes(data.filter(r => r.wish).slice(0, 10));
      } catch (err) { }
    };
    fetchWishes();
  }, [invRef]);

  useEffect(() => {
    const handleNewWish = (e) => {
      const newRsvp = e.detail;
      if (newRsvp && newRsvp.wish && newRsvp.wish.trim()) {
        setWishes((prev) => {
          if (prev.some(w => w.name === newRsvp.name && w.wish === newRsvp.wish)) return prev;
          return [newRsvp, ...prev].slice(0, 10);
        });
      }
    };
    window.addEventListener('rsvp-submitted', handleNewWish);
    return () => window.removeEventListener('rsvp-submitted', handleNewWish);
  }, []);

  const handleRsvp = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setRsvpLoading(true);
    try {
      await db.addRSVP(invRef, { name: form.name, wish: form.wish, status: 'attending' });
      setRsvpDone(true);
      // Refresh wishes after submission
      const data = await db.getRSVPs(invRef);
      setWishes(data.filter(r => r.wish).slice(0, 10));
    } catch (err) {}
    setRsvpLoading(false);
  };

  let displayWishes = wishes;
  if (!invRef && wishes.length === 0) {
    displayWishes = DUMMY_WISHES_BY_LANG[language] || DUMMY_WISHES_BY_LANG.en;
  }

  const monthNames = {
    uz: ['YANVAR', 'FEVRAL', 'MART', 'APREL', 'MAY', 'IYUN', 'IYUL', 'AVGUST', 'SENTYABR', 'OKTYABR', 'NOYABR', 'DEKABR'],
    uz_cyrl: ['YANVAR', 'FEVRAL', 'MART', 'APREL', 'MAY', 'IYUN', 'IYUL', 'AVGUST', 'SENTABR', 'OKTABR', 'NOYABR', 'DEKABR'],
    tj: ['ЯНВАР', 'ФЕВРАЛ', 'МАРТ', 'АПРЕЛ', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГУСТ', 'СЕНТЯБР', 'ОКТЯБР', 'НОЯБР', 'ДЕКАБР'],
    ru: ['ЯНВАРЬ', 'ФЕВРАЛЬ', 'МАРТ', 'АПРЕЛЬ', 'МАЙ', 'ИЮНЬ', 'ИЮЛЬ', 'АВГУСТ', 'СЕНТЯБРЬ', 'ОКТЯБРЬ', 'НОЯБРЬ', 'ДЕКАБРЬ'],
    en: ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
  };

  const getMonthName = (m, lang) => {
    const list = monthNames[lang] || monthNames.en;
    return list[m - 1] || '';
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayIndex = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const blanks = Array.from({ length: firstDayIndex }, () => null);
  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const gridCells = [...blanks, ...dayNumbers];

  return (
    <motion.div key={language} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ backgroundColor: IVORY_BACKGROUND, isolation: 'isolate' }}>
      {/* 1. INTRO SECTION (Shield with Names) */}
      <Intro data={data} isThumbnail={false} />

      {/* 2. WELCOME TEXT SECTION */}
      <Section style={{ padding: '80px 24px 40px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div style={{ width: 40, height: 1, background: GOLD, margin: '0 auto 20px' }} />
          <p style={{
            fontFamily: getFontFamily(language),
            fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
            fontStyle: 'italic',
            lineHeight: 1.8,
            color: NAVY,
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            {getWelcomeText(data?.welcomeText, language, t)}
          </p>
          <div style={{ width: 40, height: 1, background: GOLD, margin: '20px auto 0' }} />
        </motion.div>
      </Section>

      {/* 3. PREMIUM CALENDAR SECTION */}
      <Section style={{ padding: '20px 24px 0', backgroundColor: IVORY_BACKGROUND }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            width: '100%',
            maxWidth: '300px',
            margin: '0 auto',
            padding: '10px 5px',
            position: 'relative'
          }}
        >
          {/* Top Elegant Gold Divider */}
          <div style={{ width: '80px', height: '1px', background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, margin: '0 auto 20px' }} />

          <p style={{
            fontFamily: getFontFamily(language),
            fontSize: '0.85rem',
            fontWeight: 700,
            color: GOLD,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            textAlign: 'center',
            marginBottom: '12px'
          }}>
            {language === 'en' ? 'Wedding Date' : language === 'ru' ? 'Дата свадьбы' : language === 'tj' ? 'Сана' : language === 'uz_cyrl' ? 'To‘y sanasi' : "To'y sanasi"}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: '24px' }}>
            <p style={{
               fontFamily: getFontFamily(language),
               fontSize: '1.75rem',
               color: NAVY,
               fontStyle: 'italic',
               textAlign: 'center',
               margin: 0
            }}>
               {day} {getMonthName(month, language)} {year}
            </p>
            <p style={{
               fontFamily: getFontFamily(language),
               fontSize: '1.4rem',
               color: NAVY,
               fontStyle: 'italic',
               textAlign: 'center',
               margin: 0
            }}>
               {
                 {
                   en:      ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
                   ru:      ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'],
                   uz:      ['Yakshanba','Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba'],
                   uz_cyrl: ['Yakshanba','Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba'],
                   tj:      ['Якшанбе','Душанбе','Сешанбе','Чоршанбе','Панҷшанбе','Ҷумъа','Шанбе'],
                 }[language || 'en'][new Date(year, month - 1, day).getDay()]
               }
            </p>
          </div>



          {/* Weekday Labels */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
            marginBottom: '12px',
            borderBottom: `1px solid rgba(212, 175, 55, 0.25)`,
            paddingBottom: '6px'
          }}>
            {(WEEKDAYS[language] || WEEKDAYS.en).map((wd, i) => (
              <span key={i} style={{
                fontFamily: getFontFamily(language),
                fontSize: '0.72rem',
                fontWeight: 600,
                color: GOLD,
                textAlign: 'center',
                letterSpacing: '0.05em'
              }}>
                {wd.substring(0, 2)}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px'
          }}>
            {gridCells.map((d, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                {d && (
                  <>
                    {d === day && (
                      <motion.div
                        animate={{ scale: [0.95, 1.05, 0.95] }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                        style={{
                          position: 'absolute',
                          width: '36px',
                          height: '36px',
                          color: GOLD,
                          zIndex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: '1px'
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" width="100%" height="100%">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </motion.div>
                    )}
                    <span style={{
                      fontFamily: getFontFamily(language),
                      fontSize: '0.8rem',
                      fontWeight: d === day ? 700 : 400,
                      color: d === day ? GOLD : NAVY,
                      zIndex: 2,
                      position: 'relative'
                    }}>
                      {d}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Elegant Gold Divider */}
          <div style={{ width: '80px', height: '1px', background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, margin: '24px auto 0' }} />
        </motion.div>
      </Section>

      {/* 4. VENUE SECTION */}
      <Section style={{ paddingTop: '35px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 style={{
            fontFamily: getFontFamily(language),
            fontStyle: 'italic',
            fontSize: language === 'en' ? '2.5rem' : '1.5rem',
            fontWeight: 700,
            margin: '0 0 15px 0',
            color: NAVY,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <MapPin size={22} color={GOLD} style={{ flexShrink: 0 }} />
            {t('invitation.location') || (language === 'en' ? 'LOCATION' : language === 'ru' ? 'МЕСТО' : language === 'tj' ? 'МАНЗИЛ' : language === 'uz_cyrl' ? 'MANZIL' : 'Manzil')}
          </h2>

          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <img src={palaceImg} alt="Palace" style={{ width: '100%', maxWidth: '400px', marginBottom: '10px' }} />
          </div>

          <h3 style={{
            fontFamily: getFontFamily(language),
            fontSize: '1.4rem',
            fontWeight: 400,
            letterSpacing: '0.1em',
            margin: '0 0 15px 0',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <MapPin size={20} color={GOLD} />
            {translateLocation(data?.location || 'ROYAL PALACE', language)}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, color: NAVY, fontSize: '1.2rem', fontWeight: 700 }}>
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Clock size={20} color={GOLD} />
              {TIME_LABELS[language] || TIME_LABELS.en}: {data?.time || '18:00'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', gap: 12, marginTop: '25px', width: '100%', maxWidth: '360px', margin: '25px auto 0', justifyContent: 'center', flexWrap: 'nowrap' }}>
            <a href={`https://maps.apple.com/?q=${encodeURIComponent(data?.location || "OQ SAROY To'yxonasi")}`} target="_blank" rel="noreferrer" style={{
              padding: '12px 16px',
              backgroundColor: NAVY,
              color: '#ffffff',
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              boxShadow: '0 4px 15px rgba(26, 43, 75, 0.15)',
              textAlign: 'center',
              flex: 1,
              maxWidth: 180,
              whiteSpace: 'nowrap'
            }}>
              <MapPin size={14} style={{ marginRight: '6px', display: 'inline', verticalAlign: 'text-bottom' }} />
              {t('invitation.apple_maps') || 'APPLE MAPS'}
            </a>
            <a href={data?.locationUrl || "https://maps.google.com/?q=OQ+SAROY"} target="_blank" rel="noreferrer" style={{
              padding: '12px 16px',
              backgroundColor: NAVY,
              color: '#ffffff',
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              boxShadow: '0 4px 15px rgba(26, 43, 75, 0.15)',
              textAlign: 'center',
              flex: 1,
              maxWidth: 180,
              whiteSpace: 'nowrap'
            }}>
              <MapPin size={14} style={{ marginRight: '6px', display: 'inline', verticalAlign: 'text-bottom' }} />
              {t('invitation.google_maps') || 'GOOGLE MAPS'}
            </a>
          </div>
        </motion.div>
      </Section>

      <div style={{ height: '1px', width: '80%', margin: '0 auto', background: 'rgba(26, 43, 75, 0.1)' }} />

      {/* 5. COUNTDOWN SECTION */}
      <Section style={{ paddingBottom: '20px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 style={{
            fontFamily: getFontFamily(language),
            fontStyle: 'italic',
            fontSize: '1.15rem',
            fontWeight: 400,
            letterSpacing: '0.15em',
            margin: '0 auto 20px',
            color: NAVY,
            textTransform: 'uppercase',
            maxWidth: '300px',
            lineHeight: 1.4
          }}>
            {t('invitation.counting') || 'THE CELEBRATION BEGINS IN'}
          </h2>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {[
              { val: tl.days, label: language === 'en' ? 'DAYS' : language === 'ru' ? 'ДНЕЙ' : language === 'tj' ? 'РӮЗ' : language === 'uz_cyrl' ? 'KUN' : 'Kun' },
              { val: tl.hours, label: language === 'en' ? 'HOURS' : language === 'ru' ? 'ЧАСОВ' : language === 'tj' ? 'СОАТ' : language === 'uz_cyrl' ? 'SOAT' : 'Soat' },
              { val: tl.minutes, label: language === 'en' ? 'MIN' : language === 'ru' ? 'МИН' : language === 'tj' ? 'ДАҚИҚА' : language === 'uz_cyrl' ? 'DAQIQA' : 'Daqiqa' },
              { val: tl.seconds, label: language === 'en' ? 'SEC' : language === 'ru' ? 'СЕК' : language === 'tj' ? 'СОНИЯ' : language === 'uz_cyrl' ? 'SONIYA' : 'Soniya' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{
                    fontFamily: getFontFamily(language),
                    fontSize: '2.2rem',
                    color: GOLD
                  }}>
                    {String(item.val).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: NAVY, opacity: 0.5, fontStyle: 'italic' }}>{item.label}</span>
                </div>
                {i < 3 && <span style={{ fontSize: '1.5rem', color: GOLD, paddingTop: '10px' }}>:</span>}
              </div>
            ))}
          </div>

          <p style={{ fontFamily: getFontFamily(language), fontSize: '1.1rem', fontStyle: 'italic', marginBottom: '10px' }}>
            {language === 'en' ? "We look forward to celebrating with you!" : language === 'ru' ? "С нетерпением ждем встречи с вами!" : language === 'tj' ? "Мо шуморо интизорем!" : language === 'uz_cyrl' ? "Sizni intiqlik bilan kutamiz!" : "Sizni intiqlik bilan kutamiz."}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '0px' }}>
            <img src={ringsImg} alt="Rings" style={{ width: '100%', maxWidth: '280px', backgroundColor: '#fbf9fa' }} />
          </div>
        </motion.div>
      </Section>

      {/* 6. WISHES SECTION */}
      <Section style={{ backgroundColor: IVORY_BACKGROUND, paddingTop: '15px', paddingBottom: '15px' }}>
        <h2 style={{
          fontFamily: getFontFamily(language),
          fontStyle: 'italic',
          fontSize: 'clamp(1.1rem, 4.8vw, 1.5rem)',
          fontWeight: 400,
          letterSpacing: '0.1em',
          marginBottom: '30px',
          color: NAVY,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap'
        }}>
          {language === 'en' ? 'GUEST WISHES' : language === 'ru' ? 'ПОЖЕЛАНИЯ ГОСТЕЙ' : language === 'tj' ? 'ТАМАННИЁТИ МЕҲМОНОН' : language === 'uz_cyrl' ? 'MEHMONLAR TILAKLARI' : 'Mehmonlar tilaklari'}
        </h2>
        {displayWishes.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '500px' }}>
            {displayWishes.map((w, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                style={{ padding: '24px', backgroundColor: IVORY_BACKGROUND, borderLeft: `3px solid ${GOLD}`, textAlign: 'left', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              >
                <p style={{ color: NAVY, fontSize: '0.95rem', fontStyle: 'italic', marginBottom: '10px', lineHeight: 1.6 }}>"{w.wish}"</p>
                <p style={{ color: GOLD, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>— {w.name}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p style={{
            fontFamily: getFontFamily(language),
            fontStyle: 'italic',
            fontSize: '1.05rem',
            opacity: 0.6,
            color: NAVY,
            margin: '20px 0'
          }}>
            {language === 'uz' ? "Hozircha tilaklar yo'q." : language === 'uz_cyrl' ? "Hozircha tilaklar yo‘q." : language === 'tj' ? "Ҳоло таманниёт нест." : language === 'ru' ? "Пока нет пожеланий." : "No wishes yet."}
          </p>
        )}
      </Section>

      {/* 7. RSVP SECTION */}
      <Section style={{ backgroundColor: IVORY_BACKGROUND, paddingTop: '80px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{
            fontFamily: getFontFamily(language),
            fontStyle: 'italic',
            fontSize: language === 'tj' ? 'clamp(0.68rem, 3.1vw, 1.05rem)' : 'clamp(0.82rem, 3.5vw, 1.25rem)',
            fontWeight: 400,
            letterSpacing: '0.05em',
            color: NAVY,
            marginBottom: '30px',
            textTransform: 'uppercase',
            textAlign: 'center',
            maxWidth: '100%'
          }}>
            {language === 'en' ? 'Leave Your Wishes' : language === 'ru' ? 'Оставьте пожелания' : language === 'tj' ? 'Таманниёти худро бигзоред' : 'Tilaklaringizni yuboring'}
          </h2>

          {rsvpDone ? (
            <div style={{ padding: '30px', background: IVORY_BACKGROUND, border: `1px solid ${GOLD}`, borderRadius: '4px' }}>
              <p style={{ color: NAVY, fontSize: '1.1rem', fontStyle: 'italic' }}>{RSVP_SUCCESS_LABELS[language] || RSVP_SUCCESS_LABELS.en}</p>
            </div>
          ) : (
            <form onSubmit={handleRsvp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: NAVY, opacity: 0.7 }}>
                  {language === 'en' ? 'Your Name' : language === 'ru' ? 'Ваше имя' : language === 'tj' ? 'Номи шумо' : 'Ismingiz'}
                </label>
                <input
                  type="text"
                  placeholder=""
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={{ padding: '16px', border: '1px solid rgba(26, 43, 75, 0.1)', background: IVORY_BACKGROUND, outline: 'none', borderRadius: '12px', fontSize: '0.9rem' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: NAVY, opacity: 0.7 }}>
                  {language === 'en' ? 'Your Wishes' : language === 'ru' ? 'Ваши пожелания' : language === 'tj' ? 'Таманниёти шумо' : 'Tilaklaringiz'}
                </label>
                <textarea
                  placeholder=""
                  rows="4"
                  value={form.wish}
                  onChange={e => setForm({ ...form, wish: e.target.value })}
                  style={{ padding: '16px', border: '1px solid rgba(26, 43, 75, 0.1)', background: IVORY_BACKGROUND, outline: 'none', borderRadius: '12px', resize: 'none', fontSize: '0.9rem' }}
                />
              </div>
              <button
                type="submit"
                disabled={rsvpLoading}
                style={{
                  padding: '16px',
                  backgroundColor: NAVY,
                  color: '#ffffff',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 15px rgba(26, 43, 75, 0.15)',
                  cursor: 'pointer',
                  opacity: rsvpLoading ? 0.7 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                {rsvpLoading
                  ? (language === 'en' ? 'SENDING...' : language === 'ru' ? 'ОТПРАВКА...' : language === 'tj' ? 'ИРСОЛ...' : language === 'uz_cyrl' ? 'YUBORILMOQDA...' : 'YUBORILMOQDA...')
                  : (language === 'en' ? 'SEND WISH' : language === 'ru' ? 'ОТПРАВИТЬ ПОЖЕЛАНИЕ' : language === 'tj' ? 'ИРСОЛИ ТАМАННИЁТ' : language === 'uz_cyrl' ? 'TILAKNI YUBORISH' : 'TILAKNI YUBORISH')
                }
              </button>
            </form>
          )}
        </motion.div>
      </Section>

      <footer style={{
        padding: '60px 20px 40px',
        textAlign: 'center',
        backgroundColor: NAVY,
        color: '#ffffff',
        borderTop: `1.5px solid ${GOLD}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', maxWidth: '400px', marginBottom: '20px' }}>
          <h2 style={{
            fontFamily: getFontFamily(language),
            fontSize: '2rem',
            fontStyle: 'italic',
            color: GOLD,
            margin: 0
          }}>
            {localizedName(data?.groomName || 'Rustam', language)} & {localizedName(data?.brideName || 'Tahmina', language)}
          </h2>
          <p style={{
            fontFamily: getFontFamily(language),
            fontSize: '0.95rem',
            lineHeight: 1.6,
            opacity: 0.85
          }}>
            {language === 'en' ? 'We are honored to celebrate this day surrounded by the people we love most.' : 
             language === 'ru' ? 'Для нас большая честь праздновать этот день в окружении самых близких людей.' : 
             language === 'tj' ? 'Ҷашн гирифтани ин рӯз дар иҳотаи наздиктарин инсонҳоямон барои мо боиси ифтихор аст.' : 
             language === 'uz_cyrl' ? 'Bu kunni eng yaqin insonlarimiz davrasida nishonlash biz uchun sharafdir.' : 
             'Bu kunni eng yaqin insonlarimiz davrasida nishonlash biz uchun sharafdir.'}
          </p>
        </div>

        <div style={{ width: '60px', height: '1px', background: 'rgba(212, 175, 55, 0.3)', margin: '0 auto' }} />

        <div style={{ fontSize: '0.75rem', letterSpacing: '0.2em', marginTop: '10px' }}>
          © 2026 TAKLIFNOMA.VIP
        </div>
      </footer>
    </motion.div>
  );
};

export default MainContent;
