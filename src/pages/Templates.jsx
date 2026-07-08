import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  const { t } = useLanguage();
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
  };


  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 relative">
      {/* Mobile: 2-col grid — unchanged */}
      <div className="grid grid-cols-2 gap-4 lg:hidden">
        {templates.map((template, index) => (
          <TemplateCard key={template.id} template={template} index={index} />
        ))}
      </div>

      {/* Desktop: row 1 = 3 centered, row 2 = 2 centered, same card size as original 4-col grid */}
      <div className="hidden lg:flex flex-col items-center gap-8">
        {/* Row 1 — 3 templates */}
        <div className="flex gap-8 justify-center w-full">
          {templates.slice(0, 3).map((template, index) => (
            <div key={template.id} style={{ width: '16.5rem', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              <TemplateCard template={template} index={index} />
            </div>
          ))}
        </div>
        {/* Row 2 — 2 templates centered */}
        <div className="flex gap-8 justify-center w-full">
          {templates.slice(3).map((template, index) => (
            <div key={template.id} style={{ width: '16.5rem', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              <TemplateCard template={template} index={index + 3} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Templates;


