import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { Clock } from 'lucide-react';

const ROSE  = '#b05470';
const PINK  = '#d4849a';
const MAUVE = '#7d4059';
const INK   = '#3b1a28';

const MONTH_NAMES = {
  en:      ['January','February','March','April','May','June','July','August','September','October','November','December'],
  ru:      ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
  uz:      ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'],
  uz_cyrl: ['Январ','Феврал','Март','Апрел','Май','Июн','Июл','Август','Сентабр','Октабр','Ноябр','Декабр'],
  tj:      ['Январ','Феврал','Март','Апрел','Май','Июн','Июл','Август','Сентябр','Октябр','Ноябр','Декабр'],
};

const WEEK_DAYS = {
  en:      ['M','T','W','T','F','S','S'],
  ru:      ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],
  uz:      ['Du','Se','Ch','Pa','Ju','Sh','Ya'],
  uz_cyrl: ['Ду','Се','Чо','Па','Жу','Ша','Як'],
  tj:      ['Дш','Сш','Чш','Пш','Ҷм','Шн','Як'],
};

const WEEKDAY_FULL = {
  en:      ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
  ru:      ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'],
  uz_cyrl: ['Якшанба','Душанба','Сешанба','Чоршанба','Пайшанба','Жума','Шанба'],
  tj:      ['Якшанбе','Душанбе','Сешанбе','Чоршанбе','Панҷшанбе','Ҷумъа','Шанбе'],
};

function parseDate(dateStr) {
  if (!dateStr) return { day: 26, month: 2, year: 2027 };
  const [d, m, y] = String(dateStr).split('.');
  return { day: parseInt(d, 10) || 26, month: parseInt(m, 10) || 2, year: parseInt(y, 10) || 2027 };
}

export default function CalendarCard({ date, time }) {
  const { t, language } = useLanguage();
  const { day, month, year } = parseDate(date);

  const dateObj      = new Date(year, month - 1, day);
  const weekdayFull  = (WEEKDAY_FULL[language] || WEEKDAY_FULL.en)[dateObj.getDay()];
  const monthName    = (MONTH_NAMES[language]  || MONTH_NAMES.en)[month - 1];
  const weekDays     = WEEK_DAYS[language]  || WEEK_DAYS.en;

  const daysInMonth  = new Date(year, month, 0).getDate();
  const firstDayOfWeek = (new Date(year, month - 1, 1).getDay() + 6) % 7; // Mon = 0
  const cells = Array.from({ length: firstDayOfWeek + daysInMonth }, (_, i) =>
    i < firstDayOfWeek ? null : i - firstDayOfWeek + 1
  );

  return (
    <section style={{ padding: '5rem 1.5rem', backgroundColor: '#fdf5f8', position: 'relative', textAlign: 'center' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(176,84,112,0.22), transparent)' }} />

      {/* Eyebrow */}
      <p style={{ fontFamily: "'Lato', Arial, sans-serif", fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: ROSE, margin: '0 0 1.4rem' }}>
        {t('invitation.calendar')}
      </p>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1 }}
        style={{ maxWidth: '22rem', margin: '0 auto' }}
      >
        {/* Date headline */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            fontSize: 'clamp(1.8rem, 6vw, 2.6rem)',
            fontStyle: 'italic',
            fontWeight: 400,
            color: INK,
            margin: '0 0 0.5rem',
          }}>
            {day} {monthName} {year}
          </h2>
          <p style={{ fontFamily: "'Lato', Arial, sans-serif", fontSize: '0.6rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: PINK, margin: '0 0 1rem', fontWeight: 600 }}>
            {weekdayFull}
          </p>
          <div style={{ width: 56, height: 1, background: 'linear-gradient(90deg, transparent, #b05470, transparent)', margin: '0 auto' }} />
        </div>

        {/* Calendar grid card */}
        <div style={{
          border: '1px solid rgba(176,84,112,0.2)',
          borderRadius: '1.2rem',
          padding: '2rem 1.5rem',
          background: 'rgba(255,255,255,0.85)',
          boxShadow: '0 10px 40px rgba(176,84,112,0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Top accent line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${ROSE}, transparent)`, borderRadius: '1.2rem 1.2rem 0 0' }} />

          {/* Inner corner brackets */}
          <div style={{ position: 'absolute', top: '0.8rem', left: '0.8rem', width: '1.2rem', height: '1.2rem', borderTop: '1px solid rgba(176,84,112,0.3)', borderLeft: '1px solid rgba(176,84,112,0.3)' }} />
          <div style={{ position: 'absolute', top: '0.8rem', right: '0.8rem', width: '1.2rem', height: '1.2rem', borderTop: '1px solid rgba(176,84,112,0.3)', borderRight: '1px solid rgba(176,84,112,0.3)' }} />
          <div style={{ position: 'absolute', bottom: '0.8rem', left: '0.8rem', width: '1.2rem', height: '1.2rem', borderBottom: '1px solid rgba(176,84,112,0.3)', borderLeft: '1px solid rgba(176,84,112,0.3)' }} />
          <div style={{ position: 'absolute', bottom: '0.8rem', right: '0.8rem', width: '1.2rem', height: '1.2rem', borderBottom: '1px solid rgba(176,84,112,0.3)', borderRight: '1px solid rgba(176,84,112,0.3)' }} />

          <h3 style={{ textAlign: 'center', marginBottom: '1.2rem', color: ROSE, letterSpacing: '0.22em', textTransform: 'uppercase', fontSize: '0.72rem', fontFamily: "'Lato', Arial, sans-serif", fontWeight: 700 }}>
            {monthName} · {year}
          </h3>

          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.2rem', marginBottom: '0.6rem', textAlign: 'center' }}>
            {weekDays.map((d, i) => (
              <div key={i} style={{ fontSize: '0.6rem', fontWeight: 700, color: PINK, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Lato', Arial, sans-serif" }}>{d}</div>
            ))}
          </div>

          {/* Day numbers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.3rem', textAlign: 'center' }}>
            {cells.map((cellDay, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '2.2rem' }}>
                {cellDay === null ? null : cellDay === day ? (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', bounce: 0.4, delay: 0.5 }}
                    style={{
                      position: 'relative',
                      width: '42px',
                      height: '42px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg viewBox="0 0 32 30" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 2px 5px rgba(176,84,112,0.4))' }}>
                      <path d="M16 27 C16 27, 2 17, 2 9 C2 4.5 5.5 2 9 2 C11.5 2 13.8 3.4 16 6 C18.2 3.4 20.5 2 23 2 C26.5 2 30 4.5 30 9 C30 17 16 27 16 27 Z" fill={ROSE} />
                    </svg>
                    <span style={{
                      position: 'absolute',
                      zIndex: 10,
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      transform: 'translateY(-1px)',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                    }}>
                      {cellDay}
                    </span>
                  </motion.div>
                ) : (
                  <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.9rem', color: '#7a6070', fontWeight: 400 }}>
                    {cellDay}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Time badge */}
          {time && (
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, transparent, rgba(176,84,112,0.2))' }} />
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 1.1rem', borderRadius: '999px', border: `1px solid rgba(176,84,112,0.3)`, background: 'rgba(176,84,112,0.06)' }}>
                <Clock size={14} color={ROSE} />
                <span style={{ fontFamily: "'Lato', Arial, sans-serif", fontSize: '0.78rem', fontWeight: 800, color: MAUVE, letterSpacing: '0.12em' }}>{time}</span>
              </div>
              <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, rgba(176,84,112,0.2), transparent)' }} />
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
