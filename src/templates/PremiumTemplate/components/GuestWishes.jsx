import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';


export default function GuestWishes({ data, theme }) {
  const { t } = useLanguage();
  const rsvps = data?.rsvps || [];
  const wishesToShow = rsvps.filter(r => r.wish);
  const activeTheme = theme || {
    accent: '#c9a84c',
    sectionBg: '#f8f4eb',
    surface: '#ffffff',
    text: '#1d1913',
    mutedText: '#5f5646',
    border: 'rgba(201, 168, 76, 0.18)',
    borderStrong: 'rgba(201, 168, 76, 0.38)',
    line: 'rgba(201, 168, 76, 0.26)',
  };

  if (wishesToShow.length === 0) return null;

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
        className="max-w-5xl mx-auto"
      >
        <div className="text-center mb-16">
          <h2 className="mb-6" style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', fontStyle: 'italic', fontWeight: 400, color: activeTheme.text }}>
             {t('invitation.wishes') || 'Guest Wishes'}
          </h2>
          <div className="w-16 h-px mx-auto" style={{ backgroundColor: activeTheme.line }}></div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {wishesToShow.map((wish, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              className="border p-8 relative"
              style={{ backgroundColor: activeTheme.surface, borderColor: activeTheme.border }}
            >
              <div className="absolute top-3 left-3 w-5 h-5 border-t border-l" style={{ borderColor: activeTheme.borderStrong }}></div>
              <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r" style={{ borderColor: activeTheme.borderStrong }}></div>
              <p className="italic leading-relaxed mb-8" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', lineHeight: 1.8, color: activeTheme.mutedText }}>
                "{wish.wish}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-6 h-px" style={{ backgroundColor: activeTheme.accent }}></div>
                <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: activeTheme.accent }}>{wish.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
