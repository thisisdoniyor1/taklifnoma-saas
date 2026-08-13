import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';


export default function Footer({ data, theme }) {
  const { t } = useLanguage();
  const groomName = data?.groomName || 'Rustam';
  const brideName = data?.brideName || 'Tahmina';
  const activeTheme = theme || {
    accent: '#c9a84c',
    sectionBg: '#f8f4eb',
    text: '#1d1913',
    mutedText: '#5f5646',
    line: 'rgba(201, 168, 76, 0.26)',
  };

  return (
    <footer className="py-24 px-4 text-center relative" style={{ backgroundColor: activeTheme.sectionBg }}>
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${activeTheme.line}, transparent)` }}
      ></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="flex flex-col items-center justify-center mx-auto mb-10">
          <span className="italic text-3xl font-light" style={{ fontFamily: "'Playfair Display', serif", color: activeTheme.text }}>
            {groomName} <span className="text-xl not-italic opacity-60 mx-1"> & </span> {brideName}
          </span>
        </div>
        <p className="max-w-sm mx-auto leading-relaxed mb-12" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '1rem', lineHeight: 1.9, color: activeTheme.mutedText }}>
          {t('invitation.footer_message') || 'We are honored to celebrate this day surrounded by the people we love most.'}
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="w-10 h-px" style={{ backgroundColor: activeTheme.line }}></div>
          <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: activeTheme.accent }}></div>
          <div className="w-10 h-px" style={{ backgroundColor: activeTheme.line }}></div>
        </div>
      </motion.div>
    </footer>
  );
}
