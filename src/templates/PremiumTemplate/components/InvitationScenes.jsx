import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  Clock3,
  Copy,
  Check,
  Heart,
  MapPin,
  Play,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { db } from '../../../lib/db';
import { getTemplateConfig } from '../../../lib/templates';

const MONTHS_BY_LANG = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  ru: ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'],
  uz: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'],
  uz_cyrl: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'],
  tj: ['Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн', 'Июл', 'Август', 'Сентябр', 'Октябр', 'Ноябр', 'Декабр'],
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: 'easeOut' } },
};

const parseDateParts = (value) => {
  if (!value) {
    return { day: '24', month: '06', year: '2026' };
  }

  const [day = '24', month = '06', year = '2026'] = String(value).split('.');
  return { day, month, year };
};

const formatLongDate = (value, language) => {
  const { day, month, year } = parseDateParts(value);
  const monthIndex = Math.max(0, Math.min(11, Number(month) - 1));
  const monthLabel = MONTHS_BY_LANG[language]?.[monthIndex] || MONTHS_BY_LANG.en[monthIndex];
  return `${Number(day)} ${monthLabel} ${year}`;
};

const resolveInvitationRef = (params) => {
  const wildcardRef = String(params?.['*'] || '').trim();
  const directRef = String(params?.id || '').trim();
  return wildcardRef || directRef;
};

const buildInvitationUrl = (reference) => {
  if (!reference || typeof window === 'undefined') {
    return '';
  }

  return `${window.location.origin}/${reference}`;
};

const useCountdown = (date, time) => {
  const calculate = useCallback(() => {
    const { day, month, year } = parseDateParts(date);
    const target = `${year}-${month}-${day}T${time || '18:00'}:00`;
    const diff = Math.max(0, new Date(target).getTime() - Date.now());

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, [date, time]);

  const [timeLeft, setTimeLeft] = useState(calculate);

  useEffect(() => {
    setTimeLeft(calculate());
    const intervalId = window.setInterval(() => {
      setTimeLeft(calculate());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [calculate]);

  return timeLeft;
};

const getBodyFont = (designKey) => {
  if (designKey === 'interactive-onyx') return '"Roboto Mono", monospace';
  if (designKey === 'cinematic-silk' || designKey === 'luxe-motion') return '"Montserrat", sans-serif';
  return '"Inter", sans-serif';
};

const getDisplayFont = (designKey) => {
  if (designKey === 'interactive-onyx') return '"Roboto Mono", monospace';
  if (designKey === 'luxe-motion') return '"Montserrat", sans-serif';
  return '"Playfair Display", serif';
};

const getSectionOrder = (designKey) => {
  const orders = {
    'royal-gold': ['details', 'gallery', 'wishes', 'rsvp', 'footer'],
    'cinematic-silk': ['details', 'gallery', 'rsvp', 'wishes', 'footer'],
    'the-grand-gala': ['details', 'wishes', 'gallery', 'rsvp', 'footer'],
    'velvet-night': ['gallery', 'details', 'wishes', 'rsvp', 'footer'],
    'interactive-onyx': ['details', 'rsvp', 'gallery', 'wishes', 'footer'],
    'infinity-story': ['details', 'wishes', 'gallery', 'rsvp', 'footer'],
    'luxe-motion': ['gallery', 'details', 'rsvp', 'wishes', 'footer'],
    'diamond-tier': ['details', 'gallery', 'wishes', 'rsvp', 'footer'],
    'bespoke-aura': ['gallery', 'details', 'wishes', 'rsvp', 'footer'],
    'signature-glass': ['details', 'gallery', 'rsvp', 'wishes', 'footer'],
  };

  return orders[designKey] || orders['royal-gold'];
};

const DecorativeLine = ({ theme, width = '4rem' }) => (
  <div className="mx-auto h-px" style={{ width, background: `linear-gradient(to right, transparent, ${theme.line}, transparent)` }} />
);

const OutlineChip = ({ theme, children, dark = false }) => (
  <div
    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.35em]"
    style={{
      border: `1px solid ${dark ? theme.borderStrong : theme.border}`,
      backgroundColor: dark ? theme.surfaceAlt : theme.heroPanelBg,
      color: theme.accent,
      backdropFilter: 'blur(12px)',
    }}
  >
    {children}
  </div>
);

const SectionHeading = ({ theme, eyebrow, title, subtitle, align = 'center', designKey }) => (
  <div className={`mb-10 ${align === 'left' ? 'text-left' : 'text-center'}`}>
    {eyebrow ? (
      <p
        className="mb-3 text-[10px] uppercase tracking-[0.42em] font-semibold"
        style={{ color: theme.accent, fontFamily: getBodyFont(designKey) }}
      >
        {eyebrow}
      </p>
    ) : null}
    <h2
      className="text-[2rem] leading-tight"
      style={{ color: theme.text, fontFamily: getDisplayFont(designKey), fontWeight: designKey === 'interactive-onyx' ? 600 : 500 }}
    >
      {title}
    </h2>
    {subtitle ? (
      <p className="mt-3 text-sm leading-7" style={{ color: theme.mutedText, fontFamily: getBodyFont(designKey) }}>
        {subtitle}
      </p>
    ) : null}
  </div>
);

const CountdownBlock = ({ theme, designKey, label, value }) => {
  const layouts = {
    compact: {
      wrapper: {
        border: `1px solid ${theme.border}`,
        backgroundColor: theme.countdownCardBg,
        backdropFilter: 'blur(14px)',
      },
      valueClass: 'text-2xl',
      labelClass: 'text-[10px] tracking-[0.26em]',
    },
    film: {
      wrapper: {
        border: `1px solid ${theme.borderStrong}`,
        backgroundColor: theme.surfaceAlt,
      },
      valueClass: 'text-3xl',
      labelClass: 'text-[9px] tracking-[0.38em]',
    },
  };

  const layout = designKey === 'cinematic-silk' || designKey === 'interactive-onyx' ? layouts.film : layouts.compact;

  return (
    <div
      className="rounded-[26px] px-4 py-5 min-w-[78px] text-center shadow-[0_18px_45px_-35px_rgba(0,0,0,0.45)]"
      style={layout.wrapper}
    >
      <div className={`${layout.valueClass} font-semibold`} style={{ color: theme.text, fontFamily: getDisplayFont(designKey) }}>
        {String(value).padStart(2, '0')}
      </div>
      <div className={`${layout.labelClass} mt-2 uppercase`} style={{ color: theme.accent, fontFamily: getBodyFont(designKey) }}>
        {label}
      </div>
    </div>
  );
};

const GalleryTile = ({ theme, designKey, index, imageUrl, label }) => {
  const shapes = {
    'royal-gold': 'rounded-[28px]',
    'cinematic-silk': 'rounded-[18px]',
    'the-grand-gala': 'rounded-[32px]',
    'velvet-night': 'rounded-[26px]',
    'interactive-onyx': 'rounded-[20px]',
    'infinity-story': 'rounded-[40px]',
    'luxe-motion': 'rounded-[32px]',
    'diamond-tier': 'rounded-[22px]',
    'bespoke-aura': 'rounded-[30px]',
    'signature-glass': 'rounded-[30px]',
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      className={`relative aspect-[3/4] overflow-hidden ${shapes[designKey] || 'rounded-[28px]'}`}
      style={{
        background: imageUrl
          ? `linear-gradient(180deg, rgba(10,10,10,0.04), rgba(10,10,10,0.42)), url(${imageUrl}) center/cover`
          : `linear-gradient(180deg, ${theme.galleryCardBg} 0%, ${theme.surfaceAlt} 100%)`,
        border: `1px solid ${theme.galleryLabelBg}`,
      }}
    >
      {!imageUrl ? (
        <div className="absolute inset-0 flex items-center justify-center" style={{ color: theme.accent }}>
          <span className="text-[2.2rem]" style={{ fontFamily: getDisplayFont(designKey) }}>
            {index}
          </span>
        </div>
      ) : null}
      <div className="absolute inset-x-4 bottom-4 rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.32em]" style={{ backgroundColor: theme.heroPanelBg, color: imageUrl ? '#ffffff' : theme.text, backdropFilter: 'blur(14px)' }}>
        {label}
      </div>
    </motion.div>
  );
};

const WishesList = ({ theme, designKey, wishes }) => {
  const isPanelStyle = designKey === 'interactive-onyx' || designKey === 'signature-glass';

  return (
    <div className="space-y-4">
      {wishes.map((wish, index) => (
        <motion.div
          key={`${wish.name}-${index}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: index * 0.08 }}
          className="p-5"
          style={{
            borderRadius: isPanelStyle ? '26px' : '30px',
            border: `1px solid ${theme.border}`,
            backgroundColor: isPanelStyle ? theme.heroPanelBg : theme.surface,
            backdropFilter: isPanelStyle ? 'blur(16px)' : 'none',
          }}
        >
          <p className="text-[0.98rem] leading-8 italic" style={{ color: theme.mutedText, fontFamily: getDisplayFont(designKey) }}>
            "{wish.wish}"
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-px w-8" style={{ backgroundColor: theme.accent }} />
            <span className="text-[10px] uppercase tracking-[0.32em]" style={{ color: theme.accent, fontFamily: getBodyFont(designKey) }}>
              {wish.name}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const FooterSignature = ({ theme, designKey, groomName, brideName, message }) => {
  const glass = designKey === 'signature-glass';
  const noir = designKey === 'cinematic-silk' || designKey === 'velvet-night' || designKey === 'interactive-onyx';

  return (
    <footer className="px-5 pb-20 pt-12">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-[420px] text-center"
        style={{
          borderRadius: '32px',
          padding: '2.25rem 1.5rem',
          border: `1px solid ${theme.border}`,
          backgroundColor: glass ? theme.heroPanelBg : noir ? theme.surfaceAlt : theme.surface,
          backdropFilter: glass ? 'blur(16px)' : 'none',
        }}
      >
        <p className="text-[10px] uppercase tracking-[0.36em]" style={{ color: theme.accent, fontFamily: getBodyFont(designKey) }}>
          {groomName} · {brideName}
        </p>
        <h3 className="mt-4 text-[2rem]" style={{ color: theme.text, fontFamily: getDisplayFont(designKey) }}>
          {groomName} & {brideName}
        </h3>
        <p className="mt-4 text-sm leading-7" style={{ color: theme.mutedText, fontFamily: getBodyFont(designKey) }}>
          {message}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="h-px w-10" style={{ backgroundColor: theme.line }} />
          <Heart size={14} style={{ color: theme.accent }} />
          <div className="h-px w-10" style={{ backgroundColor: theme.line }} />
        </div>
      </motion.div>
    </footer>
  );
};

function CoverScene({ config, theme, content, onOpen, t }) {
  const monogram = `${content.groomInitial}${content.brideInitial}`;
  const titleFont = getDisplayFont(config.id);
  const bodyFont = getBodyFont(config.id);
  const button = (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onOpen}
      className="inline-flex items-center gap-3 rounded-full px-7 py-3 text-[10px] uppercase tracking-[0.34em]"
      style={{
        border: `1px solid ${theme.borderStrong}`,
        backgroundColor: theme.heroPanelBg,
        color: theme.accent,
        backdropFilter: 'blur(14px)',
        fontFamily: bodyFont,
      }}
    >
      <Play size={14} />
      {t('invitation.open')}
    </motion.button>
  );

  const baseProps = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0, scale: 1.02 },
    transition: { duration: 0.8, ease: 'easeInOut' },
    className: 'relative min-h-[100dvh] overflow-hidden flex items-center justify-center px-5 py-10',
    style: { backgroundColor: theme.bg, backgroundImage: theme.coverGradient },
  };

  const renderCommonNames = (eyebrow) => (
    <>
      <p className="text-[10px] uppercase tracking-[0.42em]" style={{ color: theme.accent, fontFamily: bodyFont }}>
        {eyebrow}
      </p>
      <h1 className="mt-6 text-[4.5rem] leading-none" style={{ color: theme.text, fontFamily: titleFont }}>
        {monogram}
      </h1>
    </>
  );

  switch (config.id) {
    case 'cinematic-silk':
      return (
        <motion.section {...baseProps}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.35), transparent 18%, transparent 82%, rgba(0,0,0,0.35))' }} />
          <div className="absolute inset-x-0 top-0 h-20" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.45), transparent)' }} />
          <div className="absolute inset-x-0 bottom-0 h-24" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.58), transparent)' }} />
          <div className="absolute top-14 left-8 h-24 w-px" style={{ backgroundColor: theme.line }} />
          <div className="absolute top-14 right-8 h-24 w-px" style={{ backgroundColor: theme.line }} />
          <div className="relative w-full max-w-[420px] rounded-[36px] px-7 py-12 text-center" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.heroPanelBg, backdropFilter: 'blur(10px)' }}>
            <p className="text-[10px] uppercase tracking-[0.55em]" style={{ color: theme.accent, fontFamily: bodyFont }}>
              Feature Presentation
            </p>
            <h1 className="mt-8 text-[3.7rem] leading-[0.92]" style={{ color: theme.text, fontFamily: '"Montserrat", sans-serif', fontWeight: 700 }}>
              {content.groomName}
              <span className="block text-[1rem] tracking-[0.7em] mt-4" style={{ color: theme.accent }}>×</span>
              <span className="block mt-3">{content.brideName}</span>
            </h1>
            <p className="mt-8 text-[11px] uppercase tracking-[0.36em]" style={{ color: theme.softText, fontFamily: bodyFont }}>
              {t('invitation.label')}
            </p>
            <div className="mt-10">{button}</div>
          </div>
        </motion.section>
      );
    case 'the-grand-gala':
      return (
        <motion.section {...baseProps}>
          <div className="absolute inset-7 rounded-[44px]" style={{ border: `1px solid ${theme.borderStrong}` }} />
          <div className="absolute inset-12 rounded-[38px]" style={{ border: `1px solid ${theme.border}` }} />
          <div className="relative w-full max-w-[420px] text-center px-7 py-10">
            <div className="mx-auto w-[210px] rounded-t-[120px] rounded-b-[32px] px-6 py-8" style={{ border: `1px solid ${theme.borderStrong}`, backgroundColor: theme.heroPanelBg }}>
              <p className="text-[10px] uppercase tracking-[0.44em]" style={{ color: theme.accentAlt, fontFamily: bodyFont }}>The Grand Gala</p>
              <h1 className="mt-5 text-[4.1rem] leading-none" style={{ color: theme.text, fontFamily: titleFont }}>{monogram}</h1>
            </div>
            <p className="mt-8 text-[10px] uppercase tracking-[0.5em]" style={{ color: theme.accent, fontFamily: bodyFont }}>
              Formal Invitation
            </p>
            <div className="mt-8">{button}</div>
          </div>
        </motion.section>
      );
    case 'velvet-night':
      return (
        <motion.section {...baseProps}>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at top, rgba(255,255,255,0.16), transparent 24%), radial-gradient(circle at 50% 40%, rgba(255,255,255,0.06), transparent 32%)' }} />
          <div className="relative w-full max-w-[400px] text-center px-6 py-10">
            <div className="mx-auto h-28 w-28 rounded-full blur-3xl" style={{ backgroundColor: theme.accentSoft }} />
            <div className="mt-[-4.5rem] rounded-[34px] px-7 py-10" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.heroPanelBg }}>
              {renderCommonNames('Velvet Night')}
              <p className="mt-7 text-[11px] uppercase tracking-[0.34em]" style={{ color: theme.softText, fontFamily: bodyFont }}>
                Candlelight Edition
              </p>
              <div className="mt-8">{button}</div>
            </div>
          </div>
        </motion.section>
      );
    case 'interactive-onyx':
      return (
        <motion.section {...baseProps}>
          <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="relative w-full max-w-[420px] rounded-[30px] overflow-hidden" style={{ border: `1px solid ${theme.borderStrong}`, backgroundColor: theme.heroPanelBg }}>
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${theme.border}` }}>
              <span className="text-[10px] uppercase tracking-[0.36em]" style={{ color: theme.accent, fontFamily: bodyFont }}>Interactive Onyx</span>
              <span className="text-[10px]" style={{ color: theme.softText, fontFamily: bodyFont }}>Live Invite</span>
            </div>
            <div className="px-6 py-10 text-center">
              <h1 className="text-[3rem] leading-[1.05]" style={{ color: theme.text, fontFamily: '"Roboto Mono", monospace', fontWeight: 600 }}>
                {content.groomName}
                <span className="block mt-4 text-[0.9rem] tracking-[0.48em]" style={{ color: theme.accent }}>SYNC</span>
                <span className="block mt-4">{content.brideName}</span>
              </h1>
              <div className="mt-8 flex justify-center">
                {button}
              </div>
            </div>
          </div>
        </motion.section>
      );
    case 'infinity-story':
      return (
        <motion.section {...baseProps}>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.48), transparent 36%)' }} />
          <div className="relative w-full max-w-[420px] text-center px-6">
            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full" style={{ border: `2px solid ${theme.borderStrong}`, backgroundColor: theme.heroPanelBg }}>
              <div className="relative h-20 w-28">
                <div className="absolute left-0 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full" style={{ border: `2px solid ${theme.accent}` }} />
                <div className="absolute right-0 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full" style={{ border: `2px solid ${theme.accentAlt}` }} />
              </div>
            </div>
            <h1 className="mt-8 text-[3.8rem] leading-none" style={{ color: theme.text, fontFamily: titleFont }}>
              {monogram}
            </h1>
            <p className="mt-4 text-[10px] uppercase tracking-[0.42em]" style={{ color: theme.accent, fontFamily: bodyFont }}>
              Infinity Story
            </p>
            <div className="mt-8">{button}</div>
          </div>
        </motion.section>
      );
    case 'luxe-motion':
      return (
        <motion.section {...baseProps}>
          <div className="absolute left-[-8%] top-[12%] h-40 w-40 rounded-full blur-3xl" style={{ backgroundColor: theme.previewGlowA }} />
          <div className="absolute right-[-10%] bottom-[18%] h-44 w-44 rounded-full blur-3xl" style={{ backgroundColor: theme.previewGlowB }} />
          <div className="relative w-full max-w-[420px] px-6 py-10">
            <div className="rounded-[34px] p-7 rotate-[-4deg]" style={{ backgroundColor: theme.surfaceAlt, border: `1px solid ${theme.border}` }}>
              <div className="rounded-[28px] p-7 rotate-[4deg]" style={{ backgroundColor: theme.heroPanelBg, border: `1px solid ${theme.borderStrong}` }}>
                <p className="text-[10px] uppercase tracking-[0.42em]" style={{ color: theme.accent, fontFamily: bodyFont }}>Luxe Motion</p>
                <h1 className="mt-6 text-[3.2rem] leading-none uppercase" style={{ color: theme.text, fontFamily: '"Montserrat", sans-serif', fontWeight: 700 }}>
                  {content.groomName}
                  <span className="block mt-3 text-[0.95rem] tracking-[0.65em]" style={{ color: theme.accentAlt }}>MOVE</span>
                  <span className="block mt-3">{content.brideName}</span>
                </h1>
                <div className="mt-8">{button}</div>
              </div>
            </div>
          </div>
        </motion.section>
      );
    case 'diamond-tier':
      return (
        <motion.section {...baseProps}>
          <div className="absolute inset-0 opacity-70" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.22) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.18) 25%, transparent 25%)', backgroundSize: '120px 120px' }} />
          <div className="relative w-full max-w-[410px] text-center px-6 py-8">
            <div className="mx-auto flex h-40 w-40 items-center justify-center rotate-45" style={{ border: `1px solid ${theme.borderStrong}`, backgroundColor: theme.heroPanelBg }}>
              <div className="-rotate-45">
                <p className="text-[10px] uppercase tracking-[0.34em]" style={{ color: theme.accentAlt, fontFamily: bodyFont }}>Diamond Tier</p>
                <h1 className="mt-3 text-[3rem] leading-none" style={{ color: theme.text, fontFamily: titleFont }}>{monogram}</h1>
              </div>
            </div>
            <div className="mt-10">{button}</div>
          </div>
        </motion.section>
      );
    case 'bespoke-aura':
      return (
        <motion.section {...baseProps}>
          <div className="absolute left-6 top-14 h-28 w-28 rounded-full blur-3xl" style={{ backgroundColor: theme.previewGlowA }} />
          <div className="absolute right-6 bottom-16 h-36 w-36 rounded-full blur-3xl" style={{ backgroundColor: theme.previewGlowB }} />
          <div className="relative grid w-full max-w-[420px] gap-5 px-2">
            <div className="rounded-[34px] px-6 py-8" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.heroPanelBg }}>
              <p className="text-[10px] uppercase tracking-[0.42em]" style={{ color: theme.accent, fontFamily: bodyFont }}>Bespoke Aura</p>
              <h1 className="mt-5 text-[3.8rem] leading-[0.92]" style={{ color: theme.text, fontFamily: titleFont }}>
                {content.groomInitial}
                <span className="mx-2" style={{ color: theme.accentAlt }}>&</span>
                {content.brideInitial}
              </h1>
            </div>
            <div className="ml-auto max-w-[85%] rounded-[30px] px-6 py-6" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.surface }}>
              <p className="text-sm leading-7" style={{ color: theme.mutedText, fontFamily: bodyFont }}>
                Quiet luxury, tailored details, and a warm editorial mood.
              </p>
            </div>
            <div className="pl-2">{button}</div>
          </div>
        </motion.section>
      );
    case 'signature-glass':
      return (
        <motion.section {...baseProps}>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.65), transparent 26%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.45), transparent 30%)' }} />
          <div className="relative w-full max-w-[420px] px-4">
            <div className="rounded-[38px] p-6" style={{ border: `1px solid ${theme.borderStrong}`, backgroundColor: theme.surface, backdropFilter: 'blur(22px)', boxShadow: theme.previewShadow }}>
              <p className="text-[10px] uppercase tracking-[0.42em]" style={{ color: theme.accentAlt, fontFamily: bodyFont }}>Signature Glass</p>
              <div className="mt-6 rounded-[30px] px-6 py-8" style={{ backgroundColor: theme.surfaceAlt, border: `1px solid ${theme.border}` }}>
                <h1 className="text-[3.8rem] leading-none" style={{ color: theme.text, fontFamily: titleFont }}>
                  {content.groomInitial}
                  <span className="mx-3" style={{ color: theme.accent }}>&</span>
                  {content.brideInitial}
                </h1>
                <p className="mt-4 text-[11px] uppercase tracking-[0.34em]" style={{ color: theme.softText, fontFamily: bodyFont }}>
                  Frosted Edition
                </p>
              </div>
              <div className="mt-8">{button}</div>
            </div>
          </div>
        </motion.section>
      );
    default:
      return (
        <motion.section {...baseProps}>
          <div className="absolute inset-7 rounded-[40px]" style={{ border: `1px solid ${theme.borderStrong}` }} />
          <div className="relative w-full max-w-[420px] text-center px-6 py-10">
            {renderCommonNames(config.name)}
            <div className="mt-8">
              <DecorativeLine theme={theme} width="6rem" />
            </div>
            <div className="mt-10">{button}</div>
          </div>
        </motion.section>
      );
  }
}

function HeroSection({ config, theme, content, t }) {
  const titleFont = getDisplayFont(config.id);
  const bodyFont = getBodyFont(config.id);

  switch (config.id) {
    case 'cinematic-silk':
      return (
        <section className="px-5 pt-10 pb-16" style={{ background: theme.heroGradient }}>
          <motion.div className="mx-auto max-w-[420px]" variants={fadeUp} initial="hidden" animate="show">
            <OutlineChip theme={theme} dark>{t('invitation.label')}</OutlineChip>
            <div className="mt-6 rounded-[32px] overflow-hidden" style={{ border: `1px solid ${theme.borderStrong}`, backgroundColor: theme.heroPanelBg }}>
              <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${theme.border}` }}>
                <span className="text-[10px] uppercase tracking-[0.34em]" style={{ color: theme.accent, fontFamily: bodyFont }}>Now Showing</span>
                <span className="text-[10px]" style={{ color: theme.softText, fontFamily: bodyFont }}>Wide Format</span>
              </div>
              <div className="px-5 py-8">
                <h2 className="text-[2.6rem] leading-[1.02]" style={{ color: theme.text, fontFamily: '"Montserrat", sans-serif', fontWeight: 700 }}>
                  {content.groomName}
                  <span className="block mt-4 text-[0.95rem] tracking-[0.6em]" style={{ color: theme.accent }}>AND</span>
                  <span className="block mt-4">{content.brideName}</span>
                </h2>
                <p className="mt-6 text-sm leading-7" style={{ color: theme.mutedText, fontFamily: bodyFont }}>
                  {content.welcomeText}
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      );
    case 'the-grand-gala':
      return (
        <section className="px-5 pt-10 pb-16" style={{ background: theme.heroGradient }}>
          <motion.div className="mx-auto max-w-[420px]" variants={fadeUp} initial="hidden" animate="show">
            <div className="rounded-[34px] px-6 py-8" style={{ border: `1px solid ${theme.borderStrong}`, backgroundColor: theme.surface }}>
              <SectionHeading
                theme={theme}
                eyebrow="Ballroom Program"
                title={`${content.groomName} & ${content.brideName}`}
                subtitle={content.welcomeText}
                designKey={config.id}
                align="left"
              />
              <div className="grid grid-cols-3 gap-3">
                {[content.longDate, content.time, content.location].map((item) => (
                  <div key={item} className="rounded-[22px] p-3 text-center" style={{ backgroundColor: theme.surfaceAlt, border: `1px solid ${theme.border}` }}>
                    <span className="text-[10px] uppercase tracking-[0.26em]" style={{ color: theme.accent, fontFamily: bodyFont }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      );
    case 'velvet-night':
      return (
        <section className="px-5 pt-10 pb-16" style={{ background: theme.heroGradient }}>
          <motion.div className="mx-auto max-w-[420px]" variants={fadeUp} initial="hidden" animate="show">
            <div className="rounded-[36px] px-6 py-8" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.heroPanelBg }}>
              <SectionHeading
                theme={theme}
                eyebrow="After Dark"
                title={`${content.groomName}\n&\n${content.brideName}`}
                subtitle={content.welcomeText}
                designKey={config.id}
              />
            </div>
          </motion.div>
        </section>
      );
    case 'interactive-onyx':
      return (
        <section className="px-5 pt-10 pb-16" style={{ background: theme.heroGradient }}>
          <motion.div className="mx-auto max-w-[420px] rounded-[28px] overflow-hidden" variants={fadeUp} initial="hidden" animate="show" style={{ border: `1px solid ${theme.borderStrong}`, backgroundColor: theme.heroPanelBg }}>
            <div className="grid grid-cols-2">
              <div className="px-5 py-4" style={{ borderRight: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}>
                <p className="text-[10px] uppercase tracking-[0.32em]" style={{ color: theme.accent, fontFamily: bodyFont }}>Pair</p>
                <p className="mt-3 text-lg leading-7" style={{ color: theme.text, fontFamily: '"Roboto Mono", monospace' }}>{content.groomInitial} + {content.brideInitial}</p>
              </div>
              <div className="px-5 py-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
                <p className="text-[10px] uppercase tracking-[0.32em]" style={{ color: theme.accent, fontFamily: bodyFont }}>Status</p>
                <p className="mt-3 text-lg" style={{ color: theme.text, fontFamily: '"Roboto Mono", monospace' }}>Live</p>
              </div>
              <div className="col-span-2 px-5 py-7">
                <h2 className="text-[2.1rem] leading-tight" style={{ color: theme.text, fontFamily: '"Roboto Mono", monospace' }}>
                  {content.groomName}
                  <span className="block text-sm tracking-[0.4em] mt-4" style={{ color: theme.accent }}>INTERFACE</span>
                  <span className="block mt-4">{content.brideName}</span>
                </h2>
                <p className="mt-6 text-sm leading-7" style={{ color: theme.mutedText, fontFamily: bodyFont }}>
                  {content.welcomeText}
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      );
    case 'infinity-story':
      return (
        <section className="px-5 pt-10 pb-16" style={{ background: theme.heroGradient }}>
          <motion.div className="mx-auto max-w-[420px]" variants={fadeUp} initial="hidden" animate="show">
            <div className="relative rounded-[36px] px-6 py-8" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.surface }}>
              <div className="absolute left-6 top-10 bottom-10 w-px" style={{ backgroundColor: theme.line }} />
              <div className="pl-8">
                <SectionHeading
                  theme={theme}
                  eyebrow="Story Begins"
                  title={`${content.groomName} & ${content.brideName}`}
                  subtitle={content.welcomeText}
                  designKey={config.id}
                  align="left"
                />
                <div className="space-y-4">
                  {[content.longDate, content.time, content.location].map((item, index) => (
                    <div key={item} className="relative rounded-[24px] px-4 py-4" style={{ border: `1px solid ${theme.border}`, backgroundColor: index % 2 === 0 ? theme.surfaceAlt : theme.surface }}>
                      <div className="absolute -left-[1.6rem] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full" style={{ backgroundColor: theme.accent }} />
                      <span className="text-sm" style={{ color: theme.text, fontFamily: bodyFont }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      );
    case 'luxe-motion':
      return (
        <section className="px-5 pt-10 pb-16" style={{ background: theme.heroGradient }}>
          <motion.div className="mx-auto max-w-[420px]" variants={fadeUp} initial="hidden" animate="show">
            <div className="rounded-[34px] px-6 py-7 relative overflow-hidden" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.surface }}>
              <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full blur-3xl" style={{ backgroundColor: theme.previewGlowA }} />
              <div className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full blur-3xl" style={{ backgroundColor: theme.previewGlowB }} />
              <p className="text-[10px] uppercase tracking-[0.42em]" style={{ color: theme.accent, fontFamily: bodyFont }}>Luxe Motion</p>
              <h2 className="mt-6 text-[2.6rem] leading-[0.95] uppercase" style={{ color: theme.text, fontFamily: '"Montserrat", sans-serif', fontWeight: 700 }}>
                {content.groomName}
                <span className="block mt-4 text-sm tracking-[0.6em]" style={{ color: theme.accentAlt }}>FORWARD</span>
                <span className="block mt-4">{content.brideName}</span>
              </h2>
              <p className="mt-6 max-w-[290px] text-sm leading-7" style={{ color: theme.mutedText, fontFamily: bodyFont }}>
                {content.welcomeText}
              </p>
            </div>
          </motion.div>
        </section>
      );
    case 'diamond-tier':
      return (
        <section className="px-5 pt-10 pb-16" style={{ background: theme.heroGradient }}>
          <motion.div className="mx-auto max-w-[420px]" variants={fadeUp} initial="hidden" animate="show">
            <div className="rounded-[34px] px-6 py-8" style={{ border: `1px solid ${theme.borderStrong}`, backgroundColor: theme.surface }}>
              <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rotate-45" style={{ border: `1px solid ${theme.borderStrong}` }}>
                <span className="-rotate-45 text-lg" style={{ color: theme.accent, fontFamily: titleFont }}>{content.groomInitial}{content.brideInitial}</span>
              </div>
              <SectionHeading
                theme={theme}
                eyebrow="Faceted Edition"
                title={`${content.groomName} & ${content.brideName}`}
                subtitle={content.welcomeText}
                designKey={config.id}
              />
            </div>
          </motion.div>
        </section>
      );
    case 'bespoke-aura':
      return (
        <section className="px-5 pt-10 pb-16" style={{ background: theme.heroGradient }}>
          <motion.div className="mx-auto max-w-[420px] grid gap-4" variants={fadeUp} initial="hidden" animate="show">
            <div className="rounded-[36px] px-6 py-8" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.surface }}>
              <p className="text-[10px] uppercase tracking-[0.4em]" style={{ color: theme.accentAlt, fontFamily: bodyFont }}>Editorial Notes</p>
              <h2 className="mt-5 text-[2.8rem] leading-[0.94]" style={{ color: theme.text, fontFamily: titleFont }}>
                {content.groomName}
                <span className="mx-2" style={{ color: theme.accent }}>&</span>
                {content.brideName}
              </h2>
            </div>
            <div className="ml-10 rounded-[30px] px-6 py-6" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.heroPanelBg }}>
              <p className="text-sm leading-7" style={{ color: theme.mutedText, fontFamily: bodyFont }}>
                {content.welcomeText}
              </p>
            </div>
          </motion.div>
        </section>
      );
    case 'signature-glass':
      return (
        <section className="px-5 pt-10 pb-16" style={{ background: theme.heroGradient }}>
          <motion.div className="mx-auto max-w-[420px] grid gap-4" variants={fadeUp} initial="hidden" animate="show">
            <div className="rounded-[38px] px-6 py-8" style={{ border: `1px solid ${theme.borderStrong}`, backgroundColor: theme.surface, backdropFilter: 'blur(20px)' }}>
              <SectionHeading
                theme={theme}
                eyebrow="Frosted Reveal"
                title={`${content.groomName} & ${content.brideName}`}
                subtitle={content.welcomeText}
                designKey={config.id}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[content.longDate, content.time].map((item) => (
                <div key={item} className="rounded-[24px] px-4 py-4" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceAlt, backdropFilter: 'blur(16px)' }}>
                  <span className="text-sm" style={{ color: theme.text, fontFamily: bodyFont }}>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      );
    default:
      return (
        <section className="px-5 pt-10 pb-16" style={{ background: theme.heroGradient }}>
          <motion.div className="mx-auto max-w-[420px]" variants={fadeUp} initial="hidden" animate="show">
            <div className="rounded-[36px] px-6 py-8" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.heroPanelBg }}>
              <SectionHeading
                theme={theme}
                eyebrow="Royal Gold"
                title={`${content.groomName} & ${content.brideName}`}
                subtitle={content.welcomeText}
                designKey={config.id}
              />
            </div>
          </motion.div>
        </section>
      );
  }
}

function DetailsSection({ config, theme, content, countdown, t }) {
  const bodyFont = getBodyFont(config.id);
  const labels = [
    { label: t('invitation.days') || 'Days', value: countdown.days },
    { label: t('invitation.hours') || 'Hours', value: countdown.hours },
    { label: t('invitation.minutes') || 'Minutes', value: countdown.minutes },
    { label: t('invitation.seconds') || 'Seconds', value: countdown.seconds },
  ];

  const baseCardStyle = {
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.surface,
  };

  const infoRows = [
    { icon: <Calendar size={15} />, label: t('invitation.calendar') || 'Save the Date', value: content.longDate },
    { icon: <Clock3 size={15} />, label: t('editor.fields.time') || 'Time', value: content.time },
    { icon: <MapPin size={15} />, label: t('invitation.location') || 'Location', value: content.location },
  ];

  switch (config.id) {
    case 'cinematic-silk':
      return (
        <section className="px-5 py-12" style={{ backgroundColor: theme.bg }}>
          <div className="mx-auto max-w-[420px]">
            <SectionHeading theme={theme} eyebrow="Scene Details" title={content.longDate} subtitle={content.location} designKey={config.id} align="left" />
            <div className="grid grid-cols-2 gap-3">
              {labels.map((item) => (
                <CountdownBlock key={item.label} theme={theme} designKey={config.id} label={item.label} value={item.value} />
              ))}
            </div>
            <div className="mt-6 rounded-[28px] overflow-hidden" style={{ border: `1px solid ${theme.borderStrong}`, backgroundColor: theme.surfaceAlt }}>
              {infoRows.map((row) => (
                <div key={row.label} className="flex items-start gap-3 px-4 py-4" style={{ borderTop: row.label === infoRows[0].label ? 'none' : `1px solid ${theme.border}` }}>
                  <div className="mt-1" style={{ color: theme.accent }}>{row.icon}</div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.32em]" style={{ color: theme.softText, fontFamily: bodyFont }}>{row.label}</p>
                    <p className="mt-2 text-sm leading-7" style={{ color: theme.text, fontFamily: bodyFont }}>{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    case 'the-grand-gala':
      return (
        <section className="px-5 py-12" style={{ backgroundColor: theme.bgAlt }}>
          <div className="mx-auto max-w-[420px] rounded-[34px] px-5 py-6" style={{ ...baseCardStyle, backgroundColor: theme.surfaceAlt }}>
            <SectionHeading theme={theme} eyebrow="Program" title={t('invitation.counting') || 'We are counting every second'} designKey={config.id} />
            <div className="grid grid-cols-2 gap-3">
              {labels.map((item) => (
                <CountdownBlock key={item.label} theme={theme} designKey={config.id} label={item.label} value={item.value} />
              ))}
            </div>
            <div className="mt-6 grid gap-3">
              {infoRows.map((row) => (
                <div key={row.label} className="rounded-[24px] px-4 py-4 flex items-start gap-3" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.surface }}>
                  <div className="mt-1" style={{ color: theme.accent }}>{row.icon}</div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.32em]" style={{ color: theme.accentAlt, fontFamily: bodyFont }}>{row.label}</p>
                    <p className="mt-2 text-sm leading-7" style={{ color: theme.text, fontFamily: bodyFont }}>{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    case 'interactive-onyx':
      return (
        <section className="px-5 py-12" style={{ backgroundColor: theme.bg }}>
          <div className="mx-auto max-w-[420px] rounded-[28px] overflow-hidden" style={{ border: `1px solid ${theme.borderStrong}`, backgroundColor: theme.surface }}>
            <div className="grid grid-cols-2">
              {labels.map((item) => (
                <div key={item.label} className="px-4 py-5" style={{ borderRight: item.label === labels[1].label || item.label === labels[3].label ? 'none' : `1px solid ${theme.border}`, borderBottom: item.label === labels[2].label || item.label === labels[3].label ? 'none' : `1px solid ${theme.border}` }}>
                  <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: theme.accent, fontFamily: bodyFont }}>{item.label}</p>
                  <p className="mt-3 text-2xl" style={{ color: theme.text, fontFamily: '"Roboto Mono", monospace' }}>{String(item.value).padStart(2, '0')}</p>
                </div>
              ))}
            </div>
            <div className="border-t" style={{ borderColor: theme.border }}>
              {infoRows.map((row) => (
                <div key={row.label} className="flex items-start gap-3 px-4 py-4" style={{ borderTop: row.label === infoRows[0].label ? 'none' : `1px solid ${theme.border}` }}>
                  <div className="mt-1" style={{ color: theme.accent }}>{row.icon}</div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.32em]" style={{ color: theme.softText, fontFamily: bodyFont }}>{row.label}</p>
                    <p className="mt-2 text-sm leading-7" style={{ color: theme.text, fontFamily: bodyFont }}>{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    case 'infinity-story':
      return (
        <section className="px-5 py-12" style={{ backgroundColor: theme.bgAlt }}>
          <div className="mx-auto max-w-[420px] relative pl-7">
            <div className="absolute left-2 top-0 bottom-0 w-px" style={{ backgroundColor: theme.line }} />
            {infoRows.map((row) => (
              <div key={row.label} className="relative mb-5 rounded-[26px] px-4 py-4" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.surface }}>
                <div className="absolute -left-[1.2rem] top-6 h-3 w-3 rounded-full" style={{ backgroundColor: theme.accent }} />
                <div className="flex items-start gap-3">
                  <div className="mt-1" style={{ color: theme.accent }}>{row.icon}</div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.32em]" style={{ color: theme.softText, fontFamily: bodyFont }}>{row.label}</p>
                    <p className="mt-2 text-sm leading-7" style={{ color: theme.text, fontFamily: bodyFont }}>{row.value}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3 mt-6">
              {labels.map((item) => (
                <CountdownBlock key={item.label} theme={theme} designKey={config.id} label={item.label} value={item.value} />
              ))}
            </div>
          </div>
        </section>
      );
    case 'luxe-motion':
      return (
        <section className="px-5 py-12" style={{ backgroundColor: theme.bg }}>
          <div className="mx-auto max-w-[420px] grid gap-4">
            <div className="rounded-[32px] px-5 py-5" style={{ border: `1px solid ${theme.borderStrong}`, backgroundColor: theme.surface }}>
              <SectionHeading theme={theme} eyebrow="Momentum" title={t('invitation.counting') || 'We are counting every second'} designKey={config.id} align="left" />
              <div className="grid grid-cols-2 gap-3">
                {labels.map((item) => (
                  <CountdownBlock key={item.label} theme={theme} designKey={config.id} label={item.label} value={item.value} />
                ))}
              </div>
            </div>
            <div className="grid gap-3">
              {infoRows.map((row, index) => (
                <div key={row.label} className="rounded-[28px] px-5 py-4 flex items-start gap-3" style={{ border: `1px solid ${theme.border}`, backgroundColor: index === 1 ? theme.surfaceAlt : theme.surface }}>
                  <div className="mt-1" style={{ color: index === 1 ? theme.accentAlt : theme.accent }}>{row.icon}</div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.32em]" style={{ color: theme.softText, fontFamily: bodyFont }}>{row.label}</p>
                    <p className="mt-2 text-sm leading-7" style={{ color: theme.text, fontFamily: bodyFont }}>{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    case 'signature-glass':
      return (
        <section className="px-5 py-12" style={{ backgroundColor: theme.bgAlt }}>
          <div className="mx-auto max-w-[420px] rounded-[36px] p-5" style={{ border: `1px solid ${theme.borderStrong}`, backgroundColor: theme.surface, backdropFilter: 'blur(20px)' }}>
            <SectionHeading theme={theme} eyebrow="Glass Details" title={content.longDate} subtitle={content.location} designKey={config.id} />
            <div className="grid grid-cols-2 gap-3">
              {labels.map((item) => (
                <CountdownBlock key={item.label} theme={theme} designKey={config.id} label={item.label} value={item.value} />
              ))}
            </div>
            <div className="mt-6 grid gap-3">
              {infoRows.map((row) => (
                <div key={row.label} className="rounded-[24px] px-4 py-4 flex items-start gap-3" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceAlt, backdropFilter: 'blur(16px)' }}>
                  <div className="mt-1" style={{ color: theme.accent }}>{row.icon}</div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.32em]" style={{ color: theme.softText, fontFamily: bodyFont }}>{row.label}</p>
                    <p className="mt-2 text-sm leading-7" style={{ color: theme.text, fontFamily: bodyFont }}>{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    default:
      return (
        <section className="px-5 py-12" style={{ backgroundColor: theme.bgAlt }}>
          <div className="mx-auto max-w-[420px] rounded-[36px] px-5 py-6" style={{ ...baseCardStyle, backgroundColor: theme.surface }}>
            <SectionHeading theme={theme} eyebrow={t('invitation.calendar') || 'Save the Date'} title={content.longDate} subtitle={content.location} designKey={config.id} />
            <div className="grid grid-cols-2 gap-3">
              {labels.map((item) => (
                <CountdownBlock key={item.label} theme={theme} designKey={config.id} label={item.label} value={item.value} />
              ))}
            </div>
            <div className="mt-6 grid gap-3">
              {infoRows.map((row) => (
                <div key={row.label} className="rounded-[24px] px-4 py-4 flex items-start gap-3" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceAlt }}>
                  <div className="mt-1" style={{ color: theme.accent }}>{row.icon}</div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.32em]" style={{ color: theme.softText, fontFamily: bodyFont }}>{row.label}</p>
                    <p className="mt-2 text-sm leading-7" style={{ color: theme.text, fontFamily: bodyFont }}>{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
  }
}

function GallerySection({ config, theme, content, t }) {
  const layouts = {
    'cinematic-silk': 'grid-cols-1',
    'the-grand-gala': 'grid-cols-2',
    'velvet-night': 'grid-cols-2',
    'interactive-onyx': 'grid-cols-1',
    'infinity-story': 'grid-cols-2',
    'luxe-motion': 'grid-cols-2',
    'diamond-tier': 'grid-cols-2',
    'bespoke-aura': 'grid-cols-1',
    'signature-glass': 'grid-cols-2',
  };

  const images = [content.imageUrl, null, null];

  return (
    <section className="px-5 py-12" style={{ backgroundColor: config.id === 'signature-glass' ? theme.bgAlt : theme.surfaceAlt }}>
      <div className="mx-auto max-w-[420px]">
        <SectionHeading theme={theme} eyebrow={t('invitation.gallery') || 'Gallery'} title={config.id === 'cinematic-silk' ? 'Frames from the Story' : 'Engagement Gallery'} subtitle="Add your own image link later and this space becomes your visual story." designKey={config.id} />
        <div className={`grid gap-4 ${layouts[config.id] || 'grid-cols-1'}`}>
          {images.map((imageUrl, index) => (
            <GalleryTile
              key={`gallery-${index}`}
              theme={theme}
              designKey={config.id}
              index={index + 1}
              imageUrl={index === 0 ? imageUrl : null}
              label={`${t('invitation.gallery') || 'Gallery'} ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function WishesSection({ config, theme, wishes, t }) {
  if (wishes.length === 0) {
    return null;
  }

  return (
    <section className="px-5 py-12" style={{ backgroundColor: config.id === 'velvet-night' || config.id === 'cinematic-silk' ? theme.bgAlt : theme.bg }}>
      <div className="mx-auto max-w-[420px]">
        <SectionHeading
          theme={theme}
          eyebrow={t('invitation.wishes') || 'Guest Wishes'}
          title={config.id === 'interactive-onyx' ? 'Live Messages' : 'Words from Loved Ones'}
          subtitle="Every response is tied only to this invitation and shown here as part of your story."
          designKey={config.id}
        />
        <WishesList theme={theme} designKey={config.id} wishes={wishes} />
      </div>
    </section>
  );
}

function RsvpSection({ config, theme, t }) {
  const params = useParams();
  const inviteRef = resolveInvitationRef(params);
  const bodyFont = getBodyFont(config.id);
  const titleFont = getDisplayFont(config.id);
  const [formData, setFormData] = useState({ name: '', wish: '', status: 'attending' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteUrl = buildInvitationUrl(inviteRef);

  const handleCopy = async () => {
    if (!inviteUrl) {
      return;
    }

    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!inviteRef) {
      window.alert("Taklifnoma oldindan ko'rish rejimida. RSVP yuborilmaydi.");
      return;
    }

    setLoading(true);
    try {
      await db.addRSVP(inviteRef, formData);
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      window.alert(t('invitation.rsvp_error') || "Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-5 py-12" style={{ backgroundColor: theme.bg }}>
      <div
        className="mx-auto max-w-[420px] rounded-[34px] p-5"
        style={{
          border: `1px solid ${theme.borderStrong}`,
          backgroundColor: config.id === 'signature-glass' ? theme.surface : config.id === 'interactive-onyx' ? theme.surface : theme.surfaceAlt,
          backdropFilter: config.id === 'signature-glass' ? 'blur(18px)' : 'none',
        }}
      >
        {submitted ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center">
            <p className="text-[10px] uppercase tracking-[0.36em]" style={{ color: theme.accent, fontFamily: bodyFont }}>
              {t('invitation.rsvp_success_title') || 'Thank You'}
            </p>
            <h3 className="mt-4 text-[2rem]" style={{ color: theme.text, fontFamily: titleFont }}>
              {t('invitation.rsvp_success_title') || 'Thank You'}
            </h3>
            <p className="mt-4 text-sm leading-7" style={{ color: theme.mutedText, fontFamily: bodyFont }}>
              {t('invitation.rsvp_success_desc') || 'Your response has been received.'}
            </p>
          </motion.div>
        ) : (
          <>
            <SectionHeading
              theme={theme}
              eyebrow={t('invitation.rsvp') || 'RSVP'}
              title={config.id === 'interactive-onyx' ? 'Confirm Your Status' : 'Confirm Attendance'}
              subtitle="Send your name and optional message directly to the creator of this invitation."
              designKey={config.id}
              align="left"
            />
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.34em]" style={{ color: theme.softText, fontFamily: bodyFont }}>
                  {t('invitation.rsvp_name') || 'Your Name'}
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(event) => setFormData((previous) => ({ ...previous, name: event.target.value }))}
                  placeholder=""
                  className="mt-3 w-full rounded-[20px] px-4 py-4 outline-none"
                  style={{
                    border: `1px solid ${theme.border}`,
                    backgroundColor: config.id === 'signature-glass' ? theme.surfaceAlt : theme.surface,
                    color: theme.text,
                    fontFamily: bodyFont,
                  }}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.34em]" style={{ color: theme.softText, fontFamily: bodyFont }}>
                  {t('invitation.rsvp_wish') || 'Leave a wish'}
                </label>
                <textarea
                  rows="4"
                  value={formData.wish}
                  onChange={(event) => setFormData((previous) => ({ ...previous, wish: event.target.value }))}
                  placeholder=""
                  className="mt-3 w-full rounded-[20px] px-4 py-4 outline-none resize-none"
                  style={{
                    border: `1px solid ${theme.border}`,
                    backgroundColor: config.id === 'signature-glass' ? theme.surfaceAlt : theme.surface,
                    color: theme.text,
                    fontFamily: bodyFont,
                  }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  onClick={() => setFormData((previous) => ({ ...previous, status: 'attending' }))}
                  className="flex-1 rounded-[18px] px-4 py-4 text-[10px] uppercase tracking-[0.34em] font-semibold disabled:opacity-60"
                  style={{ backgroundColor: theme.accent, color: theme.buttonText, fontFamily: bodyFont }}
                >
                  {loading ? (t('invitation.rsvp_sending') || 'Sending...') : (t('invitation.rsvp_attend') || 'I will attend')}
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-[18px] px-4 py-4"
                  style={{ border: `1px solid ${theme.borderStrong}`, color: theme.accent }}
                  aria-label="Copy invitation link"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </section>
  );
}

function MainScene({ config, theme, content, countdown, t }) {
  const sectionMap = {
    details: <DetailsSection key="details" config={config} theme={theme} content={content} countdown={countdown} t={t} />,
    gallery: <GallerySection key="gallery" config={config} theme={theme} content={content} t={t} />,
    wishes: <WishesSection key="wishes" config={config} theme={theme} wishes={content.wishes} t={t} />,
    rsvp: <RsvpSection key="rsvp" config={config} theme={theme} t={t} />,
    footer: (
      <FooterSignature
        key="footer"
        theme={theme}
        designKey={config.id}
        groomName={content.groomName}
        brideName={content.brideName}
        message={t('invitation.footer_message') || 'We are honored to celebrate this day surrounded by the people we love most.'}
      />
    ),
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} style={{ backgroundColor: theme.bg }}>
      <HeroSection config={config} theme={theme} content={content} t={t} />
      {getSectionOrder(config.id).map((sectionKey) => sectionMap[sectionKey])}
    </motion.div>
  );
}

export default function InvitationScenes({ data, templateId }) {
  const { t, language } = useLanguage();
  const [isOpened, setIsOpened] = useState(false);
  const config = getTemplateConfig(templateId);
  const theme = config.theme;
  const countdown = useCountdown(data?.date, data?.time);

  useEffect(() => {
    setIsOpened(false);
  }, [templateId]);

  const content = useMemo(() => {
    const groomName = data?.groomName || 'Doniyor';
    const brideName = data?.brideName || 'Iroda';
    const imageUrl = data?.image_url || '';
    const wishes = Array.isArray(data?.rsvps)
      ? data.rsvps.filter((item) => item?.wish)
      : [];

    return {
      groomName,
      brideName,
      groomInitial: groomName.charAt(0).toUpperCase(),
      brideInitial: brideName.charAt(0).toUpperCase(),
      welcomeText: t('invitation.speech'),
      location: data?.location || 'Wedding House',
      time: data?.time || '18:00',
      longDate: formatLongDate(data?.date, language),
      imageUrl,
      musicUrl: data?.musicUrl || '',
      wishes,
    };
  }, [data, language, t]);

  return (
    <div className="premium-template-root min-h-screen overflow-hidden relative" style={{ backgroundColor: theme.bg, color: theme.text }}>
      <AnimatePresence mode="wait">
        {!isOpened ? (
          <CoverScene key={`${config.id}-cover`} config={config} theme={theme} content={content} onOpen={() => setIsOpened(true)} t={t} />
        ) : (
          <MainScene key={`${config.id}-main`} config={config} theme={theme} content={content} countdown={countdown} t={t} />
        )}
      </AnimatePresence>
    </div>
  );
}
