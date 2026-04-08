import React, { useState, useEffect, useRef } from 'react';
import {
  Heart, Music, Calendar, MapPin, Check,
  ChevronRight, Star, Send, Globe, Zap,
  Shield, ArrowRight, Copy, Sparkles, Layers,
  BarChart3, Smartphone, Laptop, Tablet,
  Instagram, MessageCircle
} from 'lucide-react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useInvitation } from '../context/InvitationContext';
import { slowScroll } from '../utils/scroll';
import Templates from './Templates';

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
const Label = ({ children }) => (
  <div className="flex items-center gap-2 mb-6">
    <div className="w-8 h-[2px] bg-gold-500 rounded-full" />
    <p className="text-[11px] font-extrabold uppercase tracking-[3px] text-emerald-900 font-sans">
      {children}
    </p>
  </div>
);

/* ── Modern Heading ── */
const H2 = ({ children, light = false, style = {} }) => (
  <h2 className="text-[clamp(2.4rem,6vw,4.2rem)] font-extrabold leading-[1.05] tracking-tight mb-8" style={{ color: light ? '#FFFFFF' : '#064E3B', ...style }}>
    {children}
  </h2>
);

export default function Home() {
  const { t } = useLanguage();
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTestimonialIdx(i => (i + 1) % 3), 5000);
    return () => clearInterval(id);
  }, []);

  const features = [
    { icon: <MapPin size={24} />, title: t('features.items.maps.title'), desc: t('features.items.maps.desc') },
    { icon: <Music size={24} />, title: t('features.items.media.title'), desc: t('features.items.media.desc') },
    { icon: <Calendar size={24} />, title: t('features.items.rsvp.title'), desc: t('features.items.rsvp.desc') },
    { icon: <Globe size={24} />, title: t('features.items.language.title'), desc: t('features.items.language.desc') },
    { icon: <Zap size={24} />, title: t('features.items.speed.title'), desc: t('features.items.speed.desc') },
    { icon: <Shield size={24} />, title: t('features.items.secure.title'), desc: t('features.items.secure.desc') },
  ];

  return (
    <div className="bg-[#F8FAF9] font-sans selection:bg-gold-500 selection:text-white">
      {/* ═══════════════════════
          HERO
      ═══════════════════════ */}
      <section className="min-h-screen pt-40 pb-20 relative flex flex-col items-center justify-center overflow-hidden">
        <div className="grid-bg opacity-30" />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-100/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-100/20 blur-[130px] rounded-full" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-emerald-900/10 shadow-sm mb-12">
               <div className="w-2 h-2 bg-gold-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-bold uppercase tracking-[2px] text-emerald-900/50">{t('hero.tagline')}</span>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="text-[clamp(3rem,8vw,6rem)] font-extrabold leading-[1] tracking-[-0.05em] mb-10 text-emerald-950">
              {t('hero.title')} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 to-emerald-950 font-sans">{t('hero.titleAccent')}</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="max-w-xl mx-auto text-lg text-emerald-900/50 font-medium mb-12 leading-relaxed">
               {t('hero.subtitle')}
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
               <motion.button 
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.98, boxShadow: "0 0 30px 5px rgba(16, 185, 129, 0.4)" }}
                 onClick={() => slowScroll('templates')} 
                 className="luxury-button !h-14 !px-10 text-[11px] font-bold tracking-widest uppercase transition-shadow"
               >
                  {t('hero.cta')}
               </motion.button>
               <motion.button 
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={() => slowScroll('features')} 
                 className="ghost-button !h-14 !px-10 text-[11px] font-bold tracking-widest uppercase border-gold-500/30 text-gold-600 hover:bg-gold-50 hover:border-gold-500"
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
      <section id="templates" className="py-32 bg-white">
         <div className="max-w-7xl mx-auto px-6 mb-20 text-center">
            <Label>{t('templates.label')}</Label>
            <H2>{t('templates.title')}</H2>
         </div>
         <Templates />
      </section>

      {/* ═══════════════════════
          FEATURES
      ═══════════════════════ */}
      <section id="features" className="py-32 relative bg-[#F8FAF9] overflow-hidden uppercase tracking-[3px]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-end mb-24">
             <div>
                <Label>{t('features.label')}</Label>
                <H2>{t('features.title')}</H2>
             </div>
             <p className="text-emerald-900/40 font-medium lowercase tracking-normal text-lg max-w-sm mb-12">
                {t('features.subtitle')}
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {features.map((f, i) => (
               <Reveal key={i} delay={i * 0.1}>
                 <motion.div 
                   whileHover={{ y: -5, scale: 1.005 }}
                   transition={{ type: "spring", stiffness: 400, damping: 25 }}
                   className="p-10 border border-gold-500/10 rounded-[32px] hover:border-gold-500/30 transition-all hover:bg-white glass-card shadow-none hover:shadow-[0_40px_80px_-20px_rgba(212,175,55,0.15)] group"
                 >
                    <div className="w-14 h-14 bg-gold-50 text-gold-500 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-gold-500 group-hover:text-white transition-colors border border-gold-500/20">
                       {f.icon}
                    </div>
                    <h3 className="text-lg font-extrabold text-emerald-950 mb-4 tracking-[-0.02em] font-sans">{f.title}</h3>
                    <p className="text-emerald-900/40 font-medium leading-relaxed lowercase tracking-normal text-sm">{f.desc}</p>
                 </motion.div>
               </Reveal>
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
            <div>
               <p className="text-xl font-extrabold tracking-[-0.05em] mb-4 uppercase text-white/90">Taklifnoma<span className="text-gold-500">.vip</span></p>
               <p className="text-emerald-100/30 text-[9px] font-bold uppercase tracking-widest max-w-xs leading-loose mb-6">
                  {t('footer.tagline')}
               </p>
               <div className="flex gap-4">
                  <a href="#" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 transition-all duration-500 group">
                     <Instagram size={16} className="text-emerald-100 group-hover:text-white" />
                  </a>
                  <a href="#" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 transition-all duration-500 group">
                     <Send size={16} className="text-emerald-100 group-hover:text-white" />
                  </a>
                  <a href="#" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 transition-all duration-500 group">
                     <MessageCircle size={16} className="text-emerald-100 group-hover:text-white" />
                  </a>
               </div>
            </div>
            
            {/* Quick Links */}
            <div className="flex flex-col gap-3">
               <p className="text-[10px] text-white font-extrabold mb-2 opacity-30 tracking-[1.5px]">Navigation</p>
               <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-[9px] font-bold text-left text-emerald-100/40 hover:text-emerald-400 transition-colors uppercase tracking-[1px]">{t('nav.home')}</button>
               <button onClick={() => slowScroll('templates')} className="text-[9px] font-bold text-left text-emerald-100/40 hover:text-emerald-400 transition-colors uppercase tracking-[1px]">{t('nav.templates')}</button>
               <button onClick={() => slowScroll('features')} className="text-[9px] font-bold text-left text-emerald-100/40 hover:text-emerald-400 transition-colors uppercase tracking-[1px]">{t('nav.features')}</button>
            </div>

            {/* Legal Links */}
            <div className="flex flex-col gap-3">
               <p className="text-[10px] text-white font-extrabold mb-2 opacity-30 tracking-[1.5px]">{t('footer.legal')}</p>
               <a href="#" className="text-[9px] font-bold text-emerald-100/40 hover:text-emerald-400 transition-colors uppercase tracking-[1px]">{t('footer.privacy')}</a>
               <a href="#" className="text-[9px] font-bold text-emerald-100/40 hover:text-emerald-400 transition-colors uppercase tracking-[1px]">{t('footer.terms')}</a>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-white/5 text-center text-white/10 text-[8px] font-bold uppercase tracking-[2px] relative z-10">
            {t('footer.copyright')}
         </div>
      </footer>
    </div>
  );
}
