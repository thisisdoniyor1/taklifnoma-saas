import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Music, Calendar, MapPin,
  Send, Globe, Zap,
  Shield,
  Instagram, MessageCircle, ChevronDown
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { slowScroll, smoothScrollToTop } from '../utils/scroll';
import Templates from './Templates';
import BrandLogo from '../components/BrandLogo';

/* ── Modern Reveal Wrapper ── */
const Reveal = ({ children, delay = 0, style = {} }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  );
};

/* ── Modern Section Label ── */
const Label = ({ children, centered }) => (
  <div className={`flex items-center gap-2 mb-6 ${centered ? 'justify-center' : ''}`}>
    <div className="w-8 h-[2px] bg-gold-500 rounded-full" />
    <p className="text-[11px] font-extrabold uppercase tracking-[3px] text-emerald-900 font-sans">
      {children}
    </p>
  </div>
);

/* ── Modern Heading ── */
const H2 = ({ children, light = false, style = {} }) => (
  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.05] tracking-tight mb-8" style={{ color: light ? '#FFFFFF' : '#064E3B', ...style }}>
    {children}
  </h2>
);

const FaqItem = ({ q, a }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!q) return null;
  return (
    <div className={`group mb-3 rounded-2xl bg-white border transition-all duration-300 overflow-hidden ${isOpen ? 'border-gold-500/50 shadow-[0_8px_30px_rgba(6,78,59,0.06)]' : 'border-emerald-900/10 hover:border-gold-500/30'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center text-left focus:outline-none p-3 sm:p-4"
      >
        <h3 className="text-sm font-bold text-emerald-950 group-hover:text-gold-600 transition-colors font-sans pr-4 normal-case tracking-normal">
          {q}
        </h3>
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex shrink-0 items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-180 bg-gold-500 text-white shadow-md shadow-gold-500/30' : 'bg-emerald-50 text-emerald-900/40 group-hover:bg-gold-50 group-hover:text-gold-500'}`}>
          <ChevronDown size={16} />
        </div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
      >
        <p className="pb-3 px-3 sm:pb-4 sm:px-4 text-emerald-900/60 font-medium leading-relaxed normal-case tracking-normal text-[13px] sm:text-sm">
          {a}
        </p>
      </motion.div>
    </div>
  );
};

export default function Home() {
  const { t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    if (location.hash !== '#templates') {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      slowScroll('templates');
    }, 90);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [location.hash]);

  const features = [
    { icon: <MapPin size={24} />, title: t('features.items.maps.title'), desc: t('features.items.maps.desc') },
    { icon: <MessageCircle size={24} />, title: t('features.items.rsvp.title'), desc: t('features.items.rsvp.desc') },
    { icon: <Music size={24} />, title: t('features.items.music.title'), desc: t('features.items.music.desc') },
    { icon: <Globe size={24} />, title: t('features.items.language.title'), desc: t('features.items.language.desc') },
    { icon: <Zap size={24} />, title: t('features.items.speed.title'), desc: t('features.items.speed.desc') },
    { icon: <Shield size={24} />, title: t('features.items.secure.title'), desc: t('features.items.secure.desc') },
  ];

  return (
    <div className="bg-[#F8FAF9] font-sans selection:bg-gold-500 selection:text-white">
      {/* ═══════════════════════
          HERO
      ═══════════════════════ */}
      <section className="min-h-screen py-20 relative flex flex-col items-center justify-center overflow-hidden">
        <div className="grid-bg opacity-30" />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-100/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-100/20 blur-[130px] rounded-full" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          {/* Tagline removed as requested */}

          <Reveal delay={0.1}>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-10 text-emerald-950 break-words hyphens-auto">
              {t('hero.title')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 to-emerald-950 font-sans break-words inline-block max-w-full">{t('hero.titleAccent')}</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="max-w-xl mx-auto text-lg text-emerald-900/50 font-medium mb-12 leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 0 24px rgba(16,185,129,0.28)" }}
                whileTap={{ scale: 0.98, boxShadow: "0 0 30px 5px rgba(16, 185, 129, 0.6)" }}
                onClick={() => slowScroll('templates')}
                className="luxury-button !h-11 sm:!h-14 !px-6 sm:!px-10 text-[9px] sm:text-[11px] font-bold tracking-[2px] sm:tracking-widest uppercase transition-shadow"
              >
                {t('hero.cta')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => slowScroll('features')}
                className="ghost-button !h-11 sm:!h-14 !px-6 sm:!px-10 text-[9px] sm:text-[11px] font-bold tracking-[2px] sm:tracking-widest uppercase border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-500"
              >
                {t('hero.secondaryCta')}
              </motion.button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════
          TEMPLATES
      ═══════════════════════ */}
      <section id="templates" className="scroll-mt-32 py-14 sm:py-20 lg:py-32 bg-white lazy-render">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10 sm:mb-16 flex flex-col items-center text-center">
          <Label centered>{t('templates.label')}</Label>
          <H2>{t('templates.title')}</H2>
        </div>
        <Templates />
      </section>

      {/* ═══════════════════════
          FEATURES
      ═══════════════════════ */}
      <section id="features" className="scroll-mt-32 py-14 sm:py-20 lg:py-32 relative bg-[#F8FAF9] overflow-hidden uppercase tracking-[3px] lazy-render">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-20 items-end mb-12 sm:mb-24">
            <div>
              <Label>{t('features.label')}</Label>
              <H2>{t('features.title')}</H2>
            </div>
            <p className="text-emerald-900/40 font-medium lowercase tracking-normal text-base sm:text-lg max-w-2xl mb-8 sm:mb-12">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
             {features.map((f, i) => (
               <Reveal key={i} delay={i * 0.1}>
                 <motion.div 
                   whileHover={{ y: -5, scale: 1.02 }}
                   transition={{ type: "spring", stiffness: 400, damping: 25 }}
                   className="p-8 sm:p-10 bg-white border border-emerald-900/10 rounded-3xl hover:border-emerald-950 transition-all shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(6,78,59,0.1)] group"
                 >
                    <div className="w-12 h-12 bg-white text-emerald-700 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-950 group-hover:text-white transition-colors border border-emerald-900/10 group-hover:border-emerald-950">
                       {f.icon}
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-emerald-950 mb-3 tracking-[-0.02em] font-sans">{f.title}</h3>
                    <p className="text-emerald-900/50 font-medium leading-relaxed lowercase tracking-normal text-sm">{f.desc}</p>
                 </motion.div>
               </Reveal>
             ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════
          FAQ
      ═══════════════════════ */}
      <section id="faq" className="scroll-mt-32 py-14 sm:py-20 lg:py-32 relative bg-[#FDFCF8] overflow-hidden uppercase tracking-[3px] lazy-render">
        {/* Luxury Backdrop Assets */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/30 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-[-10%] w-[600px] h-[600px] bg-gold-100/20 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 sm:mb-20">
            <H2>{t('faq.label') || "FAQ"}</H2>
            <p className="text-emerald-900/40 font-medium lowercase tracking-normal text-base sm:text-lg max-w-xl mx-auto mt-6">
              Got questions? We've got answers.
            </p>
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <FaqItem key={i} q={t(`faq.q${i}`)} a={t(`faq.a${i}`)} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════
          FOOTER
      ═══════════════════════ */}
      <footer className="py-12 bg-emerald-950 text-white uppercase tracking-[4px] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
          {/* Brand & Socials */}
          <div className="flex flex-col gap-6 md:gap-8">
            <BrandLogo
              asLink={false}
              badgeClassName="border-white/10 bg-white/95 shadow-none"
              wordmarkClassName="text-white"
            />
            {/* Socials - laptop version (md and up) */}
            <div className="hidden md:flex gap-3">
              <a href="https://www.instagram.com/taklifnoma.vip/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noreferrer" className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:border-transparent transition-all duration-500 group">
                <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-100 group-hover:text-white" />
              </a>
              <a href="https://wa.me/992985140212?text=Salom!%20Yordam%20kerak%20edi" target="_blank" rel="noreferrer" className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gradient-to-br hover:from-[#25D366] hover:to-[#128C7E] hover:border-transparent hover:shadow-[0_0_15px_rgba(37,211,102,0.45)] transition-all duration-500 group" title="Support">
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-100 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Desktop/Mobile links container */}
          <div className="grid grid-cols-2 md:contents gap-12">
            {/* Quick Links */}
            <div className="flex flex-col gap-3">
              <p className="text-[10px] text-white font-extrabold mb-2 opacity-30 tracking-[1.5px]">{t('footer.navigation')}</p>
              <button onClick={() => smoothScrollToTop()} className="text-[9px] font-bold text-left text-emerald-100/40 hover:text-emerald-400 transition-colors uppercase tracking-[1px]">{t('nav.home')}</button>
              <button onClick={() => slowScroll('templates')} className="text-[9px] font-bold text-left text-emerald-100/40 hover:text-emerald-400 transition-colors uppercase tracking-[1px]">{t('nav.templates')}</button>
              <button onClick={() => slowScroll('features')} className="text-[9px] font-bold text-left text-emerald-100/40 hover:text-emerald-400 transition-colors uppercase tracking-[1px]">{t('nav.features')}</button>
              <button onClick={() => slowScroll('faq')} className="text-[9px] font-bold text-left text-emerald-100/40 hover:text-emerald-400 transition-colors uppercase tracking-[1px]">{t('nav.faq') || 'FAQ'}</button>
              <a href="https://wa.me/992985140212?text=Salom!%20Yordam%20kerak%20edi" target="_blank" rel="noreferrer" className="text-[9px] font-bold text-left text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-[1px] flex items-center gap-1.5 mt-1">
                <span>💬 {t('nav.support') || 'Qo‘llab-quvvatlash'}</span>
              </a>
            </div>

            {/* Legal Links & Socials */}
            <div className="flex flex-col gap-3">
              <p className="text-[10px] text-white font-extrabold mb-2 opacity-30 tracking-[1.5px]">{t('footer.legal')}</p>
              <a href="/privacy" className="text-[9px] font-bold text-emerald-100/40 hover:text-emerald-400 transition-colors uppercase tracking-[1px]">{t('footer.privacy')}</a>
              <a href="/terms" className="text-[9px] font-bold text-emerald-100/40 hover:text-emerald-400 transition-colors uppercase tracking-[1px]">{t('footer.terms')}</a>
              
              <div className="flex md:hidden gap-3 mt-4 sm:mt-6">
                <a href="https://www.instagram.com/taklifnoma.vip/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noreferrer" className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:border-transparent transition-all duration-500 group">
                  <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-100 group-hover:text-white" />
                </a>
                <a href="https://wa.me/992985140212?text=Salom!%20Yordam%20kerak%20edi" target="_blank" rel="noreferrer" className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gradient-to-br hover:from-[#25D366] hover:to-[#128C7E] hover:border-transparent hover:shadow-[0_0_15px_rgba(37,211,102,0.45)] transition-all duration-500 group">
                  <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-100 group-hover:text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-white/5 text-center text-white/10 text-[8px] font-bold uppercase tracking-[2px] relative z-10">
          {t('footer.copyright')}
        </div>
      </footer>
    </div>
  );
}
