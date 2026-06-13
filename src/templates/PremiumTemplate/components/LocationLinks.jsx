import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { translateLocation } from '../../WatercolorTuscanVillaTemplate/utils/transliterate';

export default function LocationLinks({ data, theme }) {
  const { t, language } = useLanguage();
  const rawAddress = data?.location || "Wedding house Forel, Khujand";
  const address = translateLocation(rawAddress, language) || rawAddress;
  const activeTheme = theme || {
    accent: '#c9a84c',
    bg: '#ffffff',
    surface: '#ffffff',
    text: '#1d1913',
    line: 'rgba(201, 168, 76, 0.26)',
    buttonText: '#ffffff',
  };

  return (
    <section className="py-28 px-4 relative" style={{ backgroundColor: activeTheme.surface }}>
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${activeTheme.line}, transparent)` }}
      ></div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1 }}
        className="max-w-lg mx-auto text-center"
      >
        <MapPin className="w-5 h-5 mx-auto mb-6" style={{ color: activeTheme.accent }} />
        <h2 className="mb-4" style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', fontStyle: 'italic', fontWeight: 400, color: activeTheme.text }}>
          {t('invitation.location') || 'Location'}
        </h2>
        <div className="w-16 h-px mx-auto mb-10" style={{ backgroundColor: activeTheme.line }}></div>
        <p className="mb-14 leading-relaxed mx-auto max-w-sm font-sans text-2xl font-bold uppercase tracking-widest" style={{ color: activeTheme.text }}>
          {address}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
            target="_blank" rel="noopener noreferrer"
            whileHover={{ scale: 1.03, backgroundColor: activeTheme.accent, color: activeTheme.buttonText }}
            whileTap={{ scale: 0.97 }}
            className="px-10 py-3.5 border uppercase tracking-[0.3em] text-[10px] font-semibold transition-all duration-200 text-center"
            style={{ borderColor: activeTheme.accent, color: activeTheme.accent }}
          >
            Google Maps
          </motion.a>
          <motion.a
            href={`http://maps.apple.com/?q=${encodeURIComponent(address)}`}
            target="_blank" rel="noopener noreferrer"
            whileHover={{ scale: 1.03, backgroundColor: activeTheme.text, color: activeTheme.bg }}
            whileTap={{ scale: 0.97 }}
            className="px-10 py-3.5 border uppercase tracking-[0.3em] text-[10px] font-semibold transition-all duration-200 text-center"
            style={{ borderColor: activeTheme.text, color: activeTheme.text }}
          >
            Apple Maps
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}
