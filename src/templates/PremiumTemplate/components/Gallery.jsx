import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';


export default function Gallery({ theme }) {
  const { t } = useLanguage();
  const activeTheme = theme || {
    accent: '#c9a84c',
    surfaceAlt: '#fcf8ef',
    galleryCardBg: '#fff9ef',
    galleryLabelBg: 'rgba(201, 168, 76, 0.08)',
    line: 'rgba(201, 168, 76, 0.26)',
  };

  return (
    <section className="py-28 px-4 relative" style={{ backgroundColor: activeTheme.surfaceAlt }}>
       <div
         className="absolute top-0 left-0 right-0 h-px"
         style={{ background: `linear-gradient(to right, transparent, ${activeTheme.line}, transparent)` }}
       ></div>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="aspect-[3/4] border flex items-center justify-center uppercase tracking-widest text-[10px]"
              style={{
                background: `linear-gradient(180deg, ${activeTheme.galleryCardBg} 0%, ${activeTheme.surfaceAlt} 100%)`,
                borderColor: activeTheme.galleryLabelBg,
                color: activeTheme.accent,
              }}
            >
              {t('invitation.gallery') || 'Photo'} {i}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
