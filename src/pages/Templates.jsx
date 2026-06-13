import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import m6 from '../music/Electronic_Wedding_Invitation_Video_Virtual_Wedding_Invite_Rustic.mp3';

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


const TemplatePreviewFallback = ({ compact = false, theme }) => {
  const accent = theme?.accent || '#064E3B';
  const background = theme?.previewGradient || theme?.bg || '#F8FAF9';

  return (
    <div
      className="w-full flex items-center justify-center"
      style={{
        minHeight: compact ? '852px' : '100dvh',
        background,
      }}
    >
      <div
        aria-label="Loading template preview"
        className="h-11 w-11 rounded-full border-[3px] animate-spin"
        style={{
          borderColor: `${accent}33`,
          borderTopColor: accent,
        }}
      />
    </div>
  );
};

const Templates = () => {
  const { updateInvitation } = useInvitation();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [isPreviewContentReady, setIsPreviewContentReady] = useState(false);
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
    preloadTemplate(template.id).catch(() => { });
    setSelectedPreview(template);
  }, []);

  useEffect(() => {
    if (selectedPreview) {
      document.body.classList.add('preview-open');
      document.body.style.overflow = 'hidden';

      const style = document.createElement('style');
      style.id = 'preview-flex-fixes';
      style.innerHTML = `
        @media (min-width: 1024px) {
          .premium-template-root {
            min-height: 100% !important;
            height: 100% !important;
          }
          .device-cover-page {
            min-height: 100% !important;
            height: 100% !important;
          }
        }
      `;
      document.head.appendChild(style);
    } else {
      document.body.classList.remove('preview-open');
      document.body.style.overflow = '';
      const style = document.getElementById('preview-flex-fixes');
      if (style) style.remove();
    }

    return () => {
      document.body.classList.remove('preview-open');
      document.body.style.overflow = '';
      const style = document.getElementById('preview-flex-fixes');
      if (style) style.remove();
    };
  }, [selectedPreview]);

  useEffect(() => {
    if (!selectedPreview) {
      setIsPreviewContentReady(false);
      return undefined;
    }

    setIsPreviewContentReady(false);
    preloadTemplate(selectedPreview.id).catch(() => { });

    let cancelled = false;
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        if (!cancelled) setIsPreviewContentReady(true);
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [selectedPreview?.id]);

  const templates = useMemo(() => templateRegistry.map((item) => {
    const localizedName = t(`templates_catalog.${item.id}.name`);
    const localizedSummary = t(`templates_catalog.${item.id}.summary`);
    const localizedDesc = t(`templates_catalog.${item.id}.description`);
    return {
      ...item,
      name: localizedName !== `templates_catalog.${item.id}.name` ? localizedName : item.name,
      summary: localizedSummary !== `templates_catalog.${item.id}.summary` ? localizedSummary : item.summary,
      description: localizedDesc !== `templates_catalog.${item.id}.description` ? localizedDesc : item.description,
      price: t(item.priceKey) || 'Free',
      priceOld: item.priceKeyOld ? t(item.priceKeyOld) : null,
    };
  }), [t]);

  const activePreview = useMemo(() => {
    if (!selectedPreview) return null;
    return templates.find((t) => t.id === selectedPreview.id) || selectedPreview;
  }, [selectedPreview, templates]);

  const selectedTheme = activePreview?.theme || null;
  const previewWelcomeText = 'We invite you to share in the joy of our wedding day. Your presence will make our celebration complete as we begin our new life together.';
  const previewCtaClassName = "inline-flex h-12 w-full max-w-[320px] items-center justify-center rounded-[30px] border border-emerald-900 bg-gradient-to-r from-emerald-800 to-emerald-700 px-6 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white shadow-[0_8px_20px_rgba(6,78,59,0.45)] transition-transform active:scale-95";

  const dummyData = {
    groomName: 'Rustam',
    brideName: 'Sevara',
    date: '24.06.2026',
    time: '18:00',
    location: 'Wedding house Forel, Khujand',
    welcomeText: previewWelcomeText,
    rsvps: [],
  };

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
                <TemplateManager templateId={template.id} data={{ ...dummyData, musicUrl: getTemplateMusic(template.id) }} isThumbnail={true} />
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

      <AnimatePresence initial={false}>
        {selectedPreview && (
          <motion.div
            key="preview-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08, ease: 'easeOut' }}
            className="fixed inset-0 z-[100]"
            style={{
              backgroundColor: '#F8FAF9',
              overflowY: 'auto',
              overflowX: 'hidden',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
              <div className="grid-bg opacity-30" />
              <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-100/30 blur-[120px] rounded-full" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-100/20 blur-[130px] rounded-full" />
            </div>

            <div className="min-h-full flex flex-col lg:flex-row relative z-10">
              <div className="hidden lg:flex flex-col items-center text-center justify-center pl-8 lg:pl-16 pr-8 py-20 lg:py-0 lg:w-[42%] relative">
                <div className="absolute top-8 left-8 lg:top-10 lg:left-12">
                  <button
                    onClick={() => setSelectedPreview(null)}
                    className="flex items-center gap-2 transition-all text-[11px] font-bold uppercase tracking-widest text-emerald-900/50 hover:text-emerald-950"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    {t('templates_modal.back') || 'Go to Main Page'}
                  </button>
                </div>

                <p className="text-[13px] uppercase tracking-[0.45em] font-bold mb-5 mt-8 lg:mt-0 text-emerald-900/50">
                  {t('templates_modal.label') || 'Template Preview'}
                </p>
                <h2
                  className="text-4xl lg:text-6xl font-extrabold mb-5 leading-tight text-emerald-950"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {activePreview.name}
                </h2>
                <div className="flex flex-col items-center lg:items-start gap-1 mb-8">
                  <span className="font-extrabold text-xl lg:text-2xl text-[#C5A017]">
                    {activePreview.price}
                  </span>
                  {activePreview.priceOld && (
                    <span className="text-xs lg:text-sm text-gray-400 line-through font-medium opacity-80">
                      {activePreview.priceOld}
                    </span>
                  )}
                </div>
                <p className="text-sm lg:text-base mb-4 leading-relaxed max-w-sm text-emerald-900/50">
                  {activePreview.description || t('templates_modal.desc') || 'Every love story is unique. Choose this design and personalize it in minutes for a truly magical experience.'}
                </p>


                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 0 24px rgba(16,185,129,0.28)" }}
                  whileTap={{ scale: 0.98, boxShadow: "0 0 30px 5px rgba(16, 185, 129, 0.6)" }}
                  onClick={() => {
                    if (!user) {
                      redirectToSignupWithTemplate(selectedPreview.id);
                      return;
                    }
                    updateInvitation({ templateId: selectedPreview.id });
                    navigate('/create/details', {
                      state: { templateId: selectedPreview.id },
                    });
                  }}
                  className={previewCtaClassName}
                >
                  {t('templates_modal.cta') || 'Create Your Invitation'}
                </motion.button>
              </div>

              <div
                className="flex flex-col lg:items-center lg:justify-center w-full lg:w-[58%] lg:py-6 min-h-[100dvh] lg:h-auto overflow-hidden relative"
              >
                <div className="flex lg:hidden items-center p-6 pb-2 z-[6000] fixed top-0 left-0">
                  <button
                    onClick={() => setSelectedPreview(null)}
                    className="w-10 h-10 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center bg-white/80 text-emerald-950 border border-emerald-900/10"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                </div>

                {isDesktop ? (
                  <div className="hidden lg:block relative flex-shrink-0 z-10">
                    <div
                      style={{
                        position: 'relative',
                        width: '346px',
                        height: '731px',
                        backgroundColor: '#000000',
                        borderRadius: '55px',
                        padding: '8px',
                        boxShadow: 'inset 0 0 0 2px #1a1a24, inset 0 0 0 6px #0a0a0c, 0 30px 60px -15px rgba(0,0,0,0.5), 0 50px 100px -20px rgba(0,0,0,0.9)',
                      }}
                    >
                      <div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '54px', border: '1.5px solid rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', left: '-4px', top: '110px', width: '4px', height: '32px', backgroundColor: '#3a3a3c', borderRadius: '2px 0 0 2px' }} />
                      <div style={{ position: 'absolute', left: '-4px', top: '154px', width: '4px', height: '62px', backgroundColor: '#3a3a3c', borderRadius: '2px 0 0 2px' }} />
                      <div style={{ position: 'absolute', left: '-4px', top: '228px', width: '4px', height: '62px', backgroundColor: '#3a3a3c', borderRadius: '2px 0 0 2px' }} />
                      <div style={{ position: 'absolute', right: '-4px', top: '165px', width: '4px', height: '84px', backgroundColor: '#3a3a3c', borderRadius: '0 2px 2px 0' }} />

                      <div
                        style={{
                          width: '330px',
                          height: '715px',
                          backgroundColor: 'white',
                          borderRadius: '45px',
                          overflow: 'hidden',
                          position: 'relative',
                          boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.1)',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: '11px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '110px',
                            height: '32px',
                            backgroundColor: '#000000',
                            borderRadius: '24px',
                            zIndex: 20,
                            boxShadow: 'inset 0 0 2px rgba(255,255,255,0.2), 0 4px 10px rgba(0,0,0,0.2)',
                          }}
                        >
                          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0d0d12', border: '1px solid #1a1a24', boxShadow: 'inset 0 -1px 2px rgba(255,255,255,0.3)' }} />
                          <div style={{ position: 'absolute', right: '35px', top: '50%', transform: 'translateY(-50%)', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0d0d12', border: '1px solid #1a1a24' }} />
                        </div>

                        <div
                          style={{
                            width: '393px',
                            height: '852px',
                            transform: 'scale(0.8396)',
                            transformOrigin: 'top left',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch',
                          }}
                        >
                          {isPreviewContentReady ? (
                            <ErrorBoundary>
                              <TemplateManager
                                templateId={selectedPreview.id}
                                data={{ ...dummyData, musicUrl: getTemplateMusic(selectedPreview.id) }}
                                fallback={<TemplatePreviewFallback compact theme={selectedTheme} />}
                              />
                            </ErrorBoundary>
                          ) : (
                            <TemplatePreviewFallback compact theme={selectedTheme} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="lg:hidden w-full min-h-[100dvh] relative overflow-y-auto overflow-x-hidden">
                    {isPreviewContentReady ? (
                      <ErrorBoundary>
                        <TemplateManager
                          templateId={selectedPreview.id}
                          data={{ ...dummyData, musicUrl: getTemplateMusic(selectedPreview.id) }}
                          fallback={<TemplatePreviewFallback theme={selectedTheme} />}
                        />
                      </ErrorBoundary>
                    ) : (
                      <TemplatePreviewFallback theme={selectedTheme} />
                    )}
                    <div className="fixed bottom-5 left-0 right-0 z-[6000] flex justify-center px-5 pointer-events-none">
                      <button
                        onClick={() => {
                          if (!user) {
                            redirectToSignupWithTemplate(selectedPreview.id);
                            return;
                          }
                          updateInvitation({ templateId: selectedPreview.id });
                          navigate('/create/details', {
                            state: { templateId: selectedPreview.id },
                          });
                        }}
                        className={`pointer-events-auto ${previewCtaClassName}`}
                      >
                        {t('templates_modal.cta') || 'Create Your Invitation'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Templates;
