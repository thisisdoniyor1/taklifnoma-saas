import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';


const WEEK_DAYS_BY_LANG = {
  en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  uz_cyrl: ['Ду', 'Се', 'Чо', 'Па', 'Жу', 'Ша', 'Як'],
  tj: ['Дш', 'Сш', 'Чш', 'Пш', 'Ҷм', 'Шн', 'Як'],
};

const JUNE_BY_LANG = {
  en: 'June',
  ru: 'Июнь',
  uz_cyrl: 'Июнь',
  tj: 'Июн',
};

export default function CalendarCard({ data, theme }) {
  const { language } = useLanguage();
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  const activeTheme = theme || {
    accent: '#c9a84c',
    accentSoft: 'rgba(201, 168, 76, 0.14)',
    sectionBg: '#f8f4eb',
    surface: '#ffffff',
    text: '#1d1913',
    mutedText: '#5f5646',
    softText: '#94866a',
    border: 'rgba(201, 168, 76, 0.18)',
    borderStrong: 'rgba(201, 168, 76, 0.38)',
    line: 'rgba(201, 168, 76, 0.26)',
  };

  const lang = language || 'en';
  const weekDays = WEEK_DAYS_BY_LANG[lang] || WEEK_DAYS_BY_LANG.en;
  const juneLabel = JUNE_BY_LANG[lang] || JUNE_BY_LANG.en;

  // Extract day from date string (e.g. "15.06.2026")
  let WEDDING_DATE = 24;
  let displayMonth = juneLabel;
  let displayYear = '2026';

  if (data?.date) {
    const parts = data.date.split('.');
    if (parts.length === 3) {
      WEDDING_DATE = parseInt(parts[0]) || 24;
      displayYear = parts[2] || '2026';
    }
  }

  return (
    <section className="py-28 px-4 relative" style={{ backgroundColor: activeTheme.sectionBg }}>
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${activeTheme.line}, transparent)` }}
      ></div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1 }}
        className="max-w-sm mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="mb-6" style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontStyle: 'italic', fontWeight: 400, color: activeTheme.text }}>
            {WEDDING_DATE} · {displayMonth} · {displayYear}
          </h2>
          <div className="w-16 h-px mx-auto" style={{ backgroundColor: activeTheme.line }}></div>
        </div>
        <div className="border p-8 relative" style={{ borderColor: activeTheme.border, backgroundColor: activeTheme.surface }}>
          <div className="absolute top-3 left-3 w-5 h-5 border-t border-l" style={{ borderColor: activeTheme.borderStrong }}></div>
          <div className="absolute top-3 right-3 w-5 h-5 border-t border-r" style={{ borderColor: activeTheme.borderStrong }}></div>
          <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l" style={{ borderColor: activeTheme.borderStrong }}></div>
          <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r" style={{ borderColor: activeTheme.borderStrong }}></div>
          <h3 className="text-center mb-8 tracking-[0.3em] uppercase text-sm" style={{ fontWeight: 500, color: activeTheme.accent }}>
            {displayMonth} {displayYear}
          </h3>
          <div className="grid grid-cols-7 gap-1 mb-4 text-center">
            {weekDays.map((day, i) => (
              <div key={`wd-${i}`} className="text-[10px] font-bold uppercase tracking-widest" style={{ color: activeTheme.softText }}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.95rem', color: activeTheme.mutedText }}>
            {daysInMonth.map((date) => (
              <div key={date} className="flex justify-center items-center h-9 w-9 mx-auto relative cursor-default">
                {date === WEDDING_DATE ? (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1.5, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', bounce: 0.4, delay: 0.6 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <svg viewBox="0 0 24 24" className="w-12 h-12 stroke-[0.8] opacity-80" style={{ fill: activeTheme.accentSoft, stroke: activeTheme.accent }}>
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span className="absolute z-10 font-bold text-[10px] translate-y-[-2px]" style={{ color: activeTheme.text }}>{date}</span>
                  </motion.div>
                ) : (
                  <span>{date}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
