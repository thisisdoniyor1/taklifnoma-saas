import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Sparkles, MessageCircle, Star, Check } from 'lucide-react';
import TemplateManager, { preloadTemplate } from '../components/TemplateManager';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useInvitation } from '../context/InvitationContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { templates as templateRegistry } from '../lib/templates';
import m1 from '../music/AUDIO-2026-06-03-19-11-34.mp3';
import m2 from '../music/AUDIO-2026-06-03-19-18-12.mp3';
import m3 from '../music/British_Style_Floral_Design_Soft_Music_Save_the_Date_Wedding_Invite.mp3';
import m4 from '../music/Calming relaxing music 30 seconds.mp3';
import m5 from '../music/Destination_Save_the_Date_Video_Invitation,_World_Map_Digital_Animated.mp3';

const getTemplateMusic = (templateId) => {
  switch (templateId) {
    case 'envelope-classic': return m1;
    case 'classic-gold-white': return m2;
    case 'royal-navy-shield': return m3;
    case 'tuscany-finca': return m4;
    case 'chandelier-palm': return m5;
    default: return m1;
  }
};

const PREVIEW_DUMMY_DATA = {
  groomName: 'Rustam',
  brideName: 'Sevara',
  date: '26.02.2027',
  time: '18:00',
  location: 'Wedding house Forel, Khujand',
  welcomeText: 'We invite you to share in the joy of our wedding day.',
  rsvps: [],
};


const Templates = () => {
  const { updateInvitation } = useInvitation();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const redirectToSignupWithTemplate = (templateId) => {
    navigate('/signup', {
      state: {
        from: { pathname: '/create/details' },
        templateId,
      },
    });
  };

  useEffect(() => {
    const warmVisibleTemplates = () => {
      templateRegistry.slice(0, 4).forEach((template, index) => {
        window.setTimeout(() => {
          preloadTemplate(template.id).catch(() => { });
        }, index * 180);
      });
    };

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(warmVisibleTemplates, { timeout: 1800 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timerId = window.setTimeout(warmVisibleTemplates, 800);
    return () => window.clearTimeout(timerId);
  }, []);

  const openTemplatePreview = useCallback((template) => {
    preloadTemplate(template.id).catch(() => {});
    navigate(`/templates/preview/${template.id}`);
  }, [navigate]);

  const templates = useMemo(() => templateRegistry.map((item) => {
    const localizedName = t(`templates_catalog.${item.id}.name`);
    const localizedSummary = t(`templates_catalog.${item.id}.summary`);
    const localizedDesc = t(`templates_catalog.${item.id}.description`);
    const localizedWelcome = t(`templates_catalog.${item.id}.welcomeText`);
    return {
      ...item,
      name: localizedName !== `templates_catalog.${item.id}.name` ? localizedName : item.name,
      summary: localizedSummary !== `templates_catalog.${item.id}.summary` ? localizedSummary : item.summary,
      description: localizedDesc !== `templates_catalog.${item.id}.description` ? localizedDesc : item.description,
      welcomeText: localizedWelcome !== `templates_catalog.${item.id}.welcomeText` ? localizedWelcome : item.welcomeText,
      price: t(item.priceKey) || 'Free',
      priceOld: item.priceKeyOld ? t(item.priceKeyOld) : null,
    };
  }), [t]);


  const TemplateCard = ({ template, index }) => {
    const theme = template.theme;


    return (
      <motion.div
        key={template.id}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05, y: -10 }}
        viewport={{ once: true }}
        transition={{ 
          default: { type: 'spring', stiffness: 600, damping: 25 },
          opacity: { delay: index * 0.08, duration: 0.45 }
        }}
        onClick={() => openTemplatePreview(template)}
        onFocus={() => preloadTemplate(template.id).catch(() => { })}
        onPointerDown={() => preloadTemplate(template.id).catch(() => { })}
        onPointerEnter={() => preloadTemplate(template.id).catch(() => { })}
        className="w-full flex-1 flex flex-col cursor-pointer group relative"
        style={{ 
          backgroundColor: theme.previewCardBg, 
          border: `1px solid ${theme.border}`,
          boxShadow: theme.previewShadow,
          borderRadius: '24px',
          overflow: 'hidden',
          isolation: 'isolate',
          transform: 'translate3d(0, 0, 0)',
        }}
      >
        <div 
          className="h-[250px] sm:h-[340px] w-full relative overflow-hidden flex items-center justify-center pointer-events-none" 
          style={{ 
            backgroundColor: theme.previewCardBg,
            isolation: 'isolate',
            transform: 'translate3d(0, 0, 0)',
          }}
        >
          <div
            className="absolute"
            style={{
              width: '393px',
              height: '852px',
              transform: isDesktop ? 'scale(0.68)' : 'scale(0.48)',
              transformOrigin: 'center center',
              top: '50%',
              left: '50%',
              marginTop: '-426px', // half of height
              marginLeft: '-196.5px', // half of width
            }}
          >
            <ErrorBoundary>
              {template.thumbnail ? (
                <div className="w-full h-full relative flex items-center justify-center">
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Manually overlay text and button for the first template if using static thumbnail */}
                  {template.id === 'envelope-classic' && (
                    <div className="absolute inset-0 z-20 pointer-events-none">
                      {/* Text Section */}
                      <div 
                        className="absolute top-[23%] left-[8%] right-[8%] flex flex-col items-center text-center px-6 py-5"
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.42)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          borderRadius: '20px',
                          border: '1px solid rgba(255, 255, 255, 0.12)'
                        }}
                      >
                        <p style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: '15px', // Increased from 11px
                          letterSpacing: '0.15em',
                          color: '#ffffff',
                          fontWeight: 800,
                          lineHeight: 1.4,
                          maxWidth: '90%',
                          textShadow: '0 2px 6px rgba(0,0,0,0.5)',
                          textTransform: 'uppercase'
                        }}>
                          You have<br />an invitation
                        </p>
                        <div style={{ width: '30px', height: '1.5px', background: '#D4AF37', marginTop: '15px', boxShadow: '0 1px 2px rgba(0,0,0,0.5)' }} />
                      </div>

                      {/* Button Section */}
                      <div style={{
                        position: 'absolute',
                        top: '72%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}>
                        <div style={{
                          padding: '10px 28px',
                          background: 'linear-gradient(135deg, #fbe8a6 0%, #D4AF37 50%, #b8921a 100%)',
                          color: '#1a1a1a',
                          borderRadius: '30px',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                          fontFamily: "'Playfair Display', serif",
                          fontSize: '10px',
                          fontWeight: 800,
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          minWidth: '120px',
                          textAlign: 'center',
                          border: '1px solid rgba(255,215,0,0.6)',
                          whiteSpace: 'nowrap'
                        }}>
                          Click to Open
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <TemplateManager
                  templateId={template.id}
                  data={{
                    ...PREVIEW_DUMMY_DATA,
                    welcomeText: template.welcomeText || PREVIEW_DUMMY_DATA.welcomeText,
                    musicUrl: getTemplateMusic(template.id),
                    isPreview: true
                  }}
                  isThumbnail={true}
                />
              )}
            </ErrorBoundary>
          </div>
          <div className="absolute inset-0 bg-black/5 mix-blend-overlay pointer-events-none" />
          <motion.p
            className="absolute bottom-3 w-full text-center text-[7px] uppercase tracking-[0.35em] font-bold z-20"
            style={{ color: theme.accent || '#8f7740', textShadow: '0 0 10px rgba(255,255,255,0.8)' }}
            animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            ↑ {t('templates_modal.liveDemo')}
          </motion.p>
        </div>

        <div
          className="p-5 border-t flex flex-col items-center text-center w-full mt-auto"
          style={{ borderColor: theme.border, backgroundColor: theme.surface || '#ffffff' }}
        >
          <h3 className="text-sm font-extrabold tracking-tight uppercase leading-tight mb-2" style={{ color: theme.text }}>
            {template.name}
          </h3>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[12px] font-extrabold" style={{ color: theme.accent }}>
              {template.price}
            </span>
            {template.priceOld && (
              <span className="text-[10px] text-gray-400 line-through font-medium opacity-80">
                {template.priceOld}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  };  const WHATSAPP_NUMBER = '992985140212';
  const WHATSAPP_MSG = encodeURIComponent("Salom! Men Taklifnoma.vip orqali maxsus individual to‘y taklifnomasi buyurtma qilmoqchiman.");
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`;

  const premiumTexts = {
    badge: language === 'en' ? "Exclusive Service" : language === 'ru' ? "Эксклюзивная Услуга" : language === 'tj' ? "Хизмати Эксклюзивӣ" : "Maxsus xizmat",
    title: language === 'en' ? "Individual Invitation" : language === 'ru' ? "Индивидуальное Приглашение" : language === 'tj' ? "Даъватномаи Инфиродӣ" : "Individual Taklifnoma",
    desc: language === 'en' ? "Your wedding is a once-in-a-lifetime event! Our individual invitation creation service includes:" : language === 'ru' ? "Ваша свадьба — неповторимое событие! Создание индивидуального приглашения включает в себя:" : language === 'tj' ? "Тӯи шумо – рӯйдоди фаромӯшнашаванда аст! Сохтани даъватномаи инфиродӣ дар бар мегирад:" : "To‘yingiz – hayotingizdagi eng go‘zal tarix! Siz uchun individual taklifnoma yaratish quyidagilarni o‘z ichiga oladi:",
    features: language === 'en' ? ["Custom Design & Colors", "Your Choice of Music", "Unique Animations", "Unlimited Edits"] : language === 'ru' ? ["Уникальный дизайн", "Ваша любимая музыка", "Специальные анимации", "Безлимитные правки"] : language === 'tj' ? ["Дизайни дилхоҳи шумо", "Мусиқии дӯстдошта", "Аниматсияҳои махсус", "Тағйироти бемаҳдуд"] : ["Siz istagan noyob dizayn", "Yoqtirgan musiqangiz", "Maxsus animatsiyalar", "Cheksiz tahrir qilish"],
    button: language === 'en' ? "Order now" : language === 'ru' ? "Заказать" : language === 'tj' ? "Фармоиш додан" : "Buyurtma berish",
    priceLabel: language === 'en' ? "Price" : language === 'ru' ? "Стоимость" : language === 'tj' ? "Нархи" : "Narxi",
    currency: language === 'en' ? "Somoni" : language === 'ru' ? "сомони" : language === 'tj' ? "сомонӣ" : "somoni"
  };

  const standardTitle = language === 'en' ? "STANDARD" : language === 'ru' ? "СТАНДАРТ" : language === 'tj' ? "СТАНДАРТ" : "STANDART";
  const premiumTitle = language === 'en' ? "PREMIUM" : language === 'ru' ? "ПРЕМИУМ" : language === 'tj' ? "ПРЕМИУМ" : "PREMIUM";

  const PremiumCustomCard = ({ fullWidth = false }) => (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="p-8 sm:p-12 bg-white border border-emerald-900/10 rounded-3xl hover:border-emerald-950 transition-all shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(6,78,59,0.1)] group max-w-4xl mx-auto text-left relative overflow-hidden"
    >
      {/* Decorative ambient aura */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10">
        {/* Site Label Style */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-[2px] bg-gold-500 rounded-full" />
          <span className="text-xs font-extrabold uppercase tracking-[3px] text-emerald-900 font-sans flex items-center gap-1.5">
            <span>👑</span> {premiumTexts.badge}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 mb-4 tracking-tight font-sans">
          {premiumTexts.title}
        </h3>

        {/* Description */}
        <p className="text-emerald-900/60 font-medium text-base sm:text-lg leading-relaxed mb-8">
          {premiumTexts.desc}
        </p>

        {/* Feature Items (Compact Website Feature Pill Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-8">
          {premiumTexts.features.map((feature) => (
            <div 
              key={feature} 
              className="py-2.5 px-3.5 bg-[#F8FAF9] border border-emerald-900/5 rounded-xl flex items-center gap-2.5 group-hover:border-emerald-900/10 transition-colors"
            >
              <div className="w-6 h-6 rounded-md bg-white border border-emerald-900/10 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                <Check size={12} strokeWidth={3} />
              </div>
              <span className="text-xs sm:text-sm font-bold text-emerald-950 font-sans leading-tight">{feature}</span>
            </div>
          ))}
        </div>

        {/* Footer / Price & Luxury Action Button */}
        <div className="pt-7 border-t border-emerald-900/10 flex flex-col sm:flex-row items-center justify-between gap-5">
          {/* Price Tag */}
          <div className="flex items-baseline gap-2.5">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-900/40">{premiumTexts.priceLabel}:</span>
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-950 tracking-tight font-sans">
              199 <span className="text-base font-bold text-gold-600">{premiumTexts.currency}</span>
            </span>
            <span className="text-xs sm:text-sm font-semibold text-emerald-900/30 line-through">
              300 {premiumTexts.currency}
            </span>
          </div>

          {/* Luxury Website Action Button */}
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 0 24px rgba(16,185,129,0.28)" }}
            whileTap={{ scale: 0.98, boxShadow: "0 0 30px 5px rgba(16, 185, 129, 0.6)" }}
            onClick={() => window.open(WHATSAPP_URL, '_blank', 'noopener,noreferrer')}
            className="luxury-button !h-13 !px-9 text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2.5 w-full sm:w-auto"
          >
            <MessageCircle size={17} />
            {premiumTexts.button}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  /* ── Section Header Component ── */
  const SectionHeader = ({ title, isPremium = false }) => (
    <div className="flex items-center gap-4 mb-8 justify-center lg:justify-start">
      {isPremium && (
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-gold-50 text-gold-600 border border-gold-200 shadow-sm">
          <div className="text-2xl sm:text-3xl drop-shadow-sm leading-none" style={{ marginTop: '-4px' }}>👑</div>
        </div>
      )}
      <h2
        className={`text-2xl sm:text-3xl font-black tracking-widest uppercase font-sans ${
          isPremium ? 'text-gold-600' : 'text-emerald-950'
        }`}
      >
        {title}
      </h2>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative">

      {/* ── STANDARD TEMPLATES SECTION ── */}
      <div className="mb-12">
        <SectionHeader
          title={standardTitle}
        />

        {/* Mobile: 2-col grid */}
        <div className="grid grid-cols-2 gap-4 lg:hidden">
          {templates.map((template, index) => (
            <TemplateCard key={template.id} template={template} index={index} />
          ))}
        </div>

        {/* Desktop: row 1 = 3 centered, row 2 = remaining centered */}
        <div className="hidden lg:flex flex-col items-center gap-8">
          <div className="flex gap-8 justify-center w-full">
            {templates.slice(0, 3).map((template, index) => (
              <div key={template.id} style={{ width: '16.5rem', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                <TemplateCard template={template} index={index} />
              </div>
            ))}
          </div>
          <div className="flex gap-8 justify-center w-full">
            {templates.slice(3).map((template, index) => (
              <div key={template.id} style={{ width: '16.5rem', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                <TemplateCard template={template} index={index + 3} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PREMIUM CUSTOM SECTION ── */}
      <div className="mt-14">
        <SectionHeader
          title={premiumTitle}
          isPremium
        />

        <div className="w-full">
          <PremiumCustomCard fullWidth />
        </div>
      </div>

    </div>
  );
};

export default Templates;
