import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { db } from '../../../lib/db';
import Scene from './Scene';
import Countdown from './Countdown';
import Venue from './Venue';
import { getWelcomeText } from '../utils/transliterate';
const CREAM = '#f8f5f0';
const SAGE = '#8a9e7a';
const DARK_SAGE = '#5c7048';

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

const MainContent = ({ data }) => {
  const { language, t } = useLanguage();
  const params = useParams();
  const invRef = params['*'] || params.id || '';

  const [wishes, setWishes] = useState([]);
  const [form, setForm] = useState({ name: '', wish: '' });
  const [rsvpDone, setRsvpDone] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    if (!invRef) return;
    const fetchWishes = async () => {
      try {
        const rsvps = await db.getRSVPs(invRef);
        setWishes(rsvps.filter(r => r.wish).slice(0, 10));
      } catch (err) {}
    };
    fetchWishes();
  }, [invRef]);

  const handleRsvp = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setRsvpLoading(true);
    try {
      await db.addRSVP(invRef, { name: form.name, wish: form.wish, status: 'attending' });
      setRsvpDone(true);
      const rsvps = await db.getRSVPs(invRef);
      setWishes(rsvps.filter(r => r.wish).slice(0, 10));
    } catch {}
    setRsvpLoading(false);
  };

  const isPreview = !invRef || data?.isPreview;
  let displayWishes = wishes;
  if (isPreview && wishes.length === 0) {
    displayWishes = DUMMY_WISHES_BY_LANG[language] || DUMMY_WISHES_BY_LANG.en;
  }

  const T = {
    uz_cyrl: {
      welcome: 'Xush kelibsiz!',
      welcomeSub: 'Sizni to‘yimizda ko‘rishdan memnunmiz',
      wishesTitle: 'Mehmonlar tilaklari',
      noWishes: 'Hozircha tilaklar yo‘q.',
      rsvpTitle: 'Tilaklaringizni yuboring',
      rsvpSubtitle: 'Nikoh kunimiz uchun o‘z tabriklaringizni qoldiring',
      namePlaceholder: 'Ismingiz',
      wishPlaceholder: 'Tilaklaringiz',
      confirm: 'TILAKNI YUBORISH',
      sending: 'YUBORILMOQDA...',
      thanks: 'Rahmat! Tilagingiz qabul qilindi.',
      successMsg: "Muvaffaqiyatli! Tilagingiz yuborildi.",
    },
    tj: {
      welcome: 'Хуш омадед!',
      welcomeSub: 'Мо аз дидани шумо дар тӯйи мо шодем',
      wishesTitle: 'Таманниёти меҳмонон',
      noWishes: 'Ҳоло таманниёт нест.',
      rsvpTitle: 'Таманниёти худро нависед',
      rsvpSubtitle: 'Табрикоти худро барои рӯзи тӯи мо бигузоред',
      namePlaceholder: 'Номи шумо',
      wishPlaceholder: 'Таманниёти шумо',
      confirm: 'ИРСОЛИ ТАМАННИЁТ',
      sending: 'ИРСОЛ...',
      thanks: 'Ташаккур! Таманниёти шумо қабул шуд.',
      successMsg: "Бомуваффақият! Таманниёти шумо ирсол шуд.",
    },
    ru: {
      welcome: 'Добро пожаловать!',
      welcomeSub: 'Мы рады видеть вас на нашей свадьбе',
      wishesTitle: 'Пожелания гостей',
      noWishes: 'Пока нет пожеланий.',
      rsvpTitle: 'Напишите свои пожелания',
      rsvpSubtitle: 'Оставьте свои поздравления для нашего особенного дня',
      namePlaceholder: 'Ваше имя',
      wishPlaceholder: 'Оставьте пожелание',
      confirm: 'ОТПРАВИТЬ ПОЖЕЛАНИЕ',
      sending: 'ОТПРАВКА...',
      thanks: 'Спасибо! Ваше пожелание получено.',
      successMsg: "Успешно! Ваше пожелание отправлено.",
    },
    en: {
      welcome: 'Welcome!',
      welcomeSub: 'We are delighted to have you at our wedding',
      wishesTitle: 'Guest Wishes',
      noWishes: 'No wishes yet.',
      rsvpTitle: 'Write Your Wishes',
      rsvpSubtitle: 'Leave your congratulations and wishes for our special day',
      namePlaceholder: 'Your Full Name',
      wishPlaceholder: 'Share a message or wish',
      confirm: 'SEND WISH',
      sending: 'SENDING...',
      thanks: 'Thank you! Your wish has been received.',
      successMsg: "Success! Your wish has been sent.",
    },
  };

  const tr = T[language] || T.en;

  return (
    <motion.div
      key={language}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ backgroundColor: CREAM }}
    >
      {/* 1. Watercolor Scene */}
      <Scene data={data} />

      {/* 1.5 Welcome Section */}
      <section style={{
        backgroundColor: CREAM,
        padding: '100px 24px 60px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div style={{ width: '60px', height: '1px', background: SAGE, margin: '0 auto 30px' }} />
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.25rem',
            fontStyle: 'italic',
            color: '#6b5e52',
            maxWidth: '300px',
            margin: '0 auto',
            lineHeight: 1.4,
          }}>
            {getWelcomeText(data?.welcomeText, language, t)}
          </p>
          <div style={{ width: '60px', height: '1px', background: SAGE, margin: '30px auto 0' }} />
        </motion.div>
      </section>

      {/* 2. Date Section with Heart-shaped Calendar */}
      <section style={{
        backgroundColor: CREAM,
        padding: '60px 24px 80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '30px',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}
        >
          {/* Day of week */}
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '0.85rem',
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: '#9a8d80',
            marginBottom: '10px',
          }}>
            {(() => {
              const parts = String(data?.date || '12.09.2026').split('.');
              const d = new Date(`${parts[2] || 2026}-${(parts[1] || '09').padStart(2,'0')}-${(parts[0] || '12').padStart(2,'0')}`);
              const days = {
                uz_cyrl: ['Yakshanba','Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba'],
                tj: ['Якшанбе','Душанбе','Сешанбе','Чоршанбе','Панҷшанбе','Ҷумъа','Шанбе'],
                ru: ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'],
                en: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
              };
              return (days[language] || days.en)[d.getDay()] || '';
            })()}
          </span>

          {/* Big styled date */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px' }}>
            {(() => {
              const parts = String(data?.date || '12.09.2026').split('.');
              const months = {
                uz_cyrl: ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'],
                tj: ['Январ','Феврал','Март','Апрел','Май','Июн','Июл','Август','Сентябр','Октябр','Ноябр','Декабр'],
                ru: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
                en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
              };
              const monthList = months[language] || months.en;
              const day = parts[0] || '12';
              const monthName = monthList[(parseInt(parts[1]) || 9) - 1] || '';
              const year = parts[2] || '2026';
              return (
                <>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 'clamp(3.5rem, 12vw, 5.5rem)',
                    fontWeight: 300,
                    color: '#3d3028',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}>{day}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0px' }}>
                    <span style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
                      fontStyle: 'italic',
                      color: '#6b5e52',
                      lineHeight: 1.2,
                    }}>{monthName}</span>
                    <span style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '0.9rem',
                      letterSpacing: '0.25em',
                      color: '#9a8d80',
                    }}>{year}</span>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Calendar Grid */}
          <div style={{
            padding: '24px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
            border: '1px solid rgba(184,170,138,0.15)',
            width: '100%',
            maxWidth: '300px',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '8px',
              textAlign: 'center',
            }}>
              {['D','L','M','M','J','V','S'].map((d, i) => (
                <span key={i} style={{ fontSize: '0.7rem', color: SAGE, fontWeight: 800 }}>{d}</span>
              ))}
              {(() => {
                const parts = String(data?.date || '12.09.2026').split('.');
                const targetDay = parseInt(parts[0]) || 12;
                const days = [];
                for(let i=1; i<=31; i++) {
                  const isWedding = i === targetDay;
                  days.push(
                    <div key={i} style={{
                      position: 'relative',
                      width: '32px', height: '32px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto',
                    }}>
                      {isWedding && (
                        <div style={{
                          position: 'absolute', inset: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          zIndex: 0,
                        }}>
                          <svg viewBox="0 0 24 24" width="70" height="70" fill={SAGE}>
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </div>
                      )}
                      <span style={{
                        fontSize: '0.9rem',
                        fontFamily: "'Cormorant Garamond', serif",
                        color: isWedding ? '#ffffff' : '#3d3028',
                        position: 'relative',
                        zIndex: 1,
                        fontWeight: isWedding ? 700 : 400,
                      }}>{i}</span>
                    </div>
                  );
                }
                return days;
              })()}
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. Venue Section */}
      <Venue data={data} />

      {/* 4. Countdown Section */}
      <Countdown data={data} />

      {/* 5. Guest Wishes Section */}
      <section style={{
        backgroundColor: CREAM,
        padding: '80px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        textAlign: 'center',
        borderTop: '1px solid rgba(184,170,138,0.3)',
      }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '2rem',
          fontStyle: 'italic',
          fontWeight: 400,
          color: '#3d3028',
          margin: 0,
        }}>
          {tr.wishesTitle}
        </h2>
        <div style={{ width: '40px', height: '0.5px', background: '#b8aa8a' }} />

        {displayWishes.length > 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            width: '100%',
            maxWidth: '480px',
          }}>
            {displayWishes.map((w, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                style={{
                  padding: '24px',
                  background: '#ffffff',
                  borderLeft: `4px solid ${SAGE}`,
                  textAlign: 'left',
                  borderRadius: '0 8px 8px 0',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                }}
              >
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.05rem',
                  fontStyle: 'italic',
                  color: '#5a4e44',
                  margin: '0 0 10px',
                  lineHeight: 1.6,
                }}>
                  "{w.wish}"
                </p>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '0.85rem',
                  color: SAGE,
                  fontWeight: 600,
                  margin: 0,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}>
                  — {w.name}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: '1.1rem',
            color: '#9a8d80',
            margin: 0,
          }}>
            {tr.noWishes}
          </p>
        )}
      </section>

      {/* 6. RSVP Form Section */}
      <section style={{
        backgroundColor: '#f0ece4',
        padding: '80px 24px 100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '30px',
        textAlign: 'center',
        minHeight: '400px',
        justifyContent: 'center',
      }}>
        <AnimatePresence mode="wait">
          {!rsvpDone ? (
            <motion.div
              key="form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '2rem',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: '#3d3028',
                  margin: 0,
                }}>
                  {tr.rsvpTitle}
                </h2>
                <div style={{ width: '40px', height: '0.5px', background: '#b8aa8a', marginBottom: '10px' }} />
              </div>

              <form
                onSubmit={handleRsvp}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: DARK_SAGE, opacity: 0.85 }}>
                    {tr.namePlaceholder}
                  </label>
                  <input
                    type="text"
                    placeholder=""
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    style={{
                      padding: '16px 20px',
                      border: '1px solid rgba(184,170,138,0.4)',
                      borderRadius: '12px',
                      background: '#ffffff',
                      outline: 'none',
                      fontSize: '1rem',
                      fontFamily: "'Cormorant Garamond', serif",
                      color: '#3d3028',
                      transition: 'border-color 0.3s ease',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: DARK_SAGE, opacity: 0.85 }}>
                    {tr.wishPlaceholder}
                  </label>
                  <textarea
                    placeholder=""
                    rows="4"
                    value={form.wish}
                    onChange={e => setForm({ ...form, wish: e.target.value })}
                    style={{
                      padding: '16px 20px',
                      border: '1px solid rgba(184,170,138,0.4)',
                      borderRadius: '12px',
                      background: '#ffffff',
                      outline: 'none',
                      resize: 'none',
                      fontSize: '1rem',
                      fontFamily: "'Cormorant Garamond', serif",
                      color: '#3d3028',
                      transition: 'border-color 0.3s ease',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={rsvpLoading}
                  style={{
                    padding: '18px',
                    backgroundColor: SAGE,
                    color: '#ffffff',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    fontFamily: "'Cormorant Garamond', serif",
                    cursor: 'pointer',
                    opacity: rsvpLoading ? 0.7 : 1,
                    boxShadow: '0 6px 20px rgba(90,112,72,0.2)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {rsvpLoading ? tr.sending : tr.confirm}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
                padding: '40px', background: '#ffffff', borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.1)', border: `1px solid ${SAGE}44`,
                maxWidth: '400px', width: '100%',
              }}
            >
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                backgroundColor: SAGE, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#ffffff', marginBottom: '10px',
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.8rem', fontStyle: 'italic', color: '#3d3028', margin: 0,
              }}>
                {tr.successMsg}
              </h3>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.1rem', color: '#6b5e52', margin: 0,
              }}>
                {tr.thanks}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '60px 20px 40px',
        textAlign: 'center',
        backgroundColor: DARK_SAGE,
        color: 'rgba(255,255,255,0.8)',
        borderTop: `1.5px solid ${SAGE}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', maxWidth: '400px', marginBottom: '20px' }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '2rem',
            fontStyle: 'italic',
            color: '#ffffff',
            margin: 0
          }}>
            {data?.groomName || 'Nicolás'} & {data?.brideName || 'Julia'}
          </h2>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1rem',
            lineHeight: 1.6,
            opacity: 0.9
          }}>
            {language === 'en' ? 'We are honored to celebrate this day surrounded by the people we love most.' : 
             language === 'ru' ? 'Для нас большая честь праздновать этот день в окружении самых близких людей.' : 
             language === 'tj' ? 'Ҷашн гирифтани ин рӯз дар иҳотаи наздиктарин инсонҳоямон барои мо боиси ифтихор аст.' : 
             language === 'uz_cyrl' ? 'Bu kunni eng yaqin insonlarimiz davrasida nishonlash biz uchun sharafdir.' : 
             'Bu kunni eng yaqin insonlarimiz davrasida nishonlash biz uchun sharafdir.'}
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
           language === 'uz_cyrl' ? 'O‘zingizning raqamli taklifnomangizni yarating' : 
           "O'zingizning raqamli taklifnomangizni yarating"}
        </div>
      </footer>
    </motion.div>
  );
};

export default MainContent;
