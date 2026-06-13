import { motion } from 'framer-motion';
import { useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import CalendarCard from './CalendarCard';
import LocationLinks from './LocationLinks';
import Gallery from './Gallery';
import Countdown from './Countdown';
import GuestWishes from './GuestWishes';
import RSVP from './RSVP';
import Footer from './Footer';
import { getTemplateTheme } from '../../../lib/templates';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 1.1, ease: 'easeOut' } }
};

export default function MainInvitation({ data, templateId }) {
  const { t } = useLanguage();
  const theme = getTemplateTheme(templateId);

  // 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const groomName = data?.groomName || 'Doniyor';
  const brideName = data?.brideName || 'Iroda';
  const welcomeText = t('invitation.speech');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="w-full"
      style={{ backgroundColor: theme.bg }}
    >
      {/* SECTION 1: Names */}
      <section
        className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden"
        style={{ backgroundColor: theme.bg, backgroundImage: theme.heroGradient }}
      >
        <div className="absolute top-[-6rem] left-[-3rem] h-52 w-52 rounded-full blur-3xl" style={{ backgroundColor: theme.previewGlowA }}></div>
        <div className="absolute bottom-[-8rem] right-[-4rem] h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: theme.previewGlowB }}></div>
        <div className="absolute top-10 left-10 w-12 h-12 border-t border-l pointer-events-none" style={{ borderColor: theme.borderStrong }}></div>
        <div className="absolute top-10 right-10 w-12 h-12 border-t border-r pointer-events-none" style={{ borderColor: theme.borderStrong }}></div>
        <div className="absolute bottom-10 left-10 w-12 h-12 border-b border-l pointer-events-none" style={{ borderColor: theme.borderStrong }}></div>
        <div className="absolute bottom-10 right-10 w-12 h-12 border-b border-r pointer-events-none" style={{ borderColor: theme.borderStrong }}></div>

        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
            borderColor: theme.border,
            backgroundColor: theme.heroPanelBg
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          className="z-10 backdrop-blur-[2px] p-12 rounded-full border cursor-pointer shadow-[0_25px_80px_-50px_rgba(15,23,42,0.35)]"
        >
          <div className="relative" style={{ transform: "translateZ(50px)" }}>
            <h1
              className="leading-none text-center"
              style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(2.2rem, 8vw, 5rem)', color: theme.text }}
            >
              {groomName}
              <span className="block my-2" style={{ fontSize: 'clamp(1.2rem, 3.5vw, 2rem)', fontStyle: 'normal', letterSpacing: '0.2em', color: theme.accent }}>
                &
              </span>
              {brideName}
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <motion.span
            animate={{ y: [0, 8, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="text-[10px] uppercase tracking-[0.55em] font-medium"
            style={{ color: theme.softText }}
          >
            {t('invitation.scroll') || 'Scroll down'}
          </motion.span>
          <motion.svg
            animate={{ y: [0, 10, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            width="18" height="28" viewBox="0 0 16 26" fill="none"
          >
            <line x1="8" y1="0" x2="8" y2="18" style={{ stroke: theme.accent }} strokeWidth="1.2" />
            <polyline points="2,13 8,20 14,13" fill="none" style={{ stroke: theme.accent }} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </motion.div>
      </section>

      {/* SECTION 2: Welcome Speech */}
      <section
        className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 py-28 relative"
        style={{ backgroundColor: theme.sectionBg, backgroundImage: theme.sectionGradient }}
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-120px' }}
          className="max-w-lg mx-auto z-10 px-4 md:px-0"
        >
          <h2
            className="mb-10 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(2.8rem, 7vw, 4.5rem)', color: theme.text }}
          >
            {t('invitation.welcome') || 'Welcome'}
          </h2>
          <div className="w-16 h-px mx-auto mb-10 opacity-40" style={{ backgroundColor: theme.accent }}></div>
          <p
            className="leading-relaxed mx-auto px-4 md:px-0"
            style={{ 
              fontFamily: "'Playfair Display', serif", 
              fontStyle: 'italic', 
              fontWeight: 400, 
              fontSize: 'clamp(1.1rem, 2.2vw, 1.25rem)', 
              lineHeight: '2',
              letterSpacing: '0.01em',
              color: theme.mutedText
            }}
          >
            {welcomeText}
          </p>
        </motion.div>
      </section>

      <CalendarCard data={data} theme={theme} />
      <LocationLinks data={data} theme={theme} />
      <Gallery theme={theme} />

      {/* Countdown Section */}
      <section className="py-20 px-4 text-center" style={{ backgroundColor: theme.bg }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <h2 
            className="mb-12" 
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '1.8rem', color: theme.text }}
          >
            {t('invitation.counting') || 'We are counting every second'}
          </h2>
          <Countdown data={data} theme={theme} />
        </motion.div>
      </section>

      <GuestWishes data={data} theme={theme} />
      <RSVP theme={theme} />
      <Footer data={data} theme={theme} />
    </motion.div>
  );
}
