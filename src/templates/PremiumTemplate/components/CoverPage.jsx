import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { getTemplateTheme } from '../../../lib/templates';


export default function CoverPage({ onOpen, data, templateId }) {
  const { t } = useLanguage();
  const groomInitial = data?.groomName?.charAt(0) || 'D';
  const brideInitial = data?.brideName?.charAt(0) || 'I';
  const theme = getTemplateTheme(templateId);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 1.2, ease: 'easeInOut' }}
      className="relative w-full flex flex-col items-center justify-center overflow-hidden device-cover-page"
      style={{ minHeight: '100dvh', backgroundColor: theme.bg, backgroundImage: theme.coverGradient }}
    >
      <div className="absolute -top-20 left-[-10%] h-56 w-56 rounded-full blur-3xl" style={{ backgroundColor: theme.previewGlowA }}></div>
      <div className="absolute bottom-[-12%] right-[-8%] h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: theme.previewGlowB }}></div>
      {/* Corner borders */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-8 w-16 h-16 border-t border-l" style={{ borderColor: theme.borderStrong }}></div>
        <div className="absolute top-8 right-8 w-16 h-16 border-t border-r" style={{ borderColor: theme.borderStrong }}></div>
        <div className="absolute bottom-8 left-8 w-16 h-16 border-b border-l" style={{ borderColor: theme.borderStrong }}></div>
        <div className="absolute bottom-8 right-8 w-16 h-16 border-b border-r" style={{ borderColor: theme.borderStrong }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.4 }}
        className="text-center px-8 max-w-2xl mx-auto z-10 flex flex-col items-center"
      >
        <p className="text-[10px] uppercase tracking-[0.5em] mb-8 font-medium" style={{ color: theme.accent }}>
          {t('invitation.label') || 'You have an Invitation'}
        </p>

        <div className="w-10 h-px mb-8" style={{ backgroundColor: theme.line }}></div>

        <h1
          className="leading-none mb-12"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(4.5rem, 12vw, 9rem)',
            color: theme.text
          }}
        >
          {groomInitial}<span style={{ color: theme.accent }}>&</span>{brideInitial}
        </h1>

        <motion.button
          whileHover={{ backgroundColor: theme.accent, color: theme.buttonText }}
          whileTap={{ scale: 0.97 }}
          onClick={onOpen}
          className="px-12 py-3.5 border uppercase tracking-[0.35em] text-[10px] font-semibold transition-all duration-200 cursor-pointer"
          style={{ borderColor: theme.accent, color: theme.accent }}
        >
          {t('invitation.open') || 'Click To Open'}
        </motion.button>
      </motion.div>
    </motion.section>
  );
}
