import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const TemplatePreview = () => {
  const { templateId } = useParams();
  const { updateInvitation } = useInvitation();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isPreviewContentReady, setIsPreviewContentReady] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        const availableHeight = window.innerHeight - 80;
        const scaleFactor = Math.min(1, availableHeight / 731);
        setScale(scaleFactor);
      } else {
        setScale(1);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hide the Navbar while preview is open by adding a CSS override
  useEffect(() => {
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

    return () => {
      document.body.classList.remove('preview-open');
      document.body.style.overflow = '';
      const s = document.getElementById('preview-flex-fixes');
      if (s) s.remove();
    };
  }, []);

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

  const activePreview = useMemo(() =>
    templates.find((t) => t.id === templateId) || null,
  [templates, templateId]);

  // Preload the template and trigger content-ready
  useEffect(() => {
    if (!templateId) return;
    preloadTemplate(templateId).catch(() => {});
    setIsPreviewContentReady(false);

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
  }, [templateId]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const redirectToSignupWithTemplate = (id) => {
    navigate('/signup', {
      state: {
        from: { pathname: '/create/details' },
        templateId: id,
      },
    });
  };

  const handleSelectTemplate = () => {
    if (!user) {
      redirectToSignupWithTemplate(templateId);
      return;
    }
    updateInvitation({ templateId });
    navigate('/create/details', {
      state: { templateId },
    });
  };

  if (!activePreview) {
    // Template not found — redirect home
    navigate('/', { replace: true });
    return null;
  }

  const selectedTheme = activePreview?.theme || null;

  const previewWelcomeText = 'We invite you to share in the joy of our wedding day. Your presence will make our celebration complete as we begin our new life together.';
  const previewCtaClassName = "inline-flex h-12 w-full max-w-[320px] items-center justify-center rounded-[30px] border border-emerald-900 bg-gradient-to-r from-emerald-800 to-emerald-700 px-6 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white shadow-[0_8px_20px_rgba(6,78,59,0.45)] transition-transform active:scale-95";

  const dummyData = {
    groomName: 'Rustam',
    brideName: 'Sevara',
    date: '26.02.2027',
    time: '18:00',
    location: 'Wedding house Forel, Khujand',
    welcomeText: activePreview.welcomeText || previewWelcomeText,
    rsvps: [],
    isPreview: true,
  };

  return (
    <motion.div
      key="preview-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{
        backgroundColor: '#F8FAF9',
      }}
    >
      {/* Background glows */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="grid-bg opacity-30" />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-100/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-100/20 blur-[130px] rounded-full" />
      </div>

      <div className="w-full h-full flex flex-col lg:flex-row relative z-10 overflow-hidden">
        {/* Left info panel (desktop) */}
        <div className="hidden lg:flex flex-col items-center text-center justify-center pl-8 lg:pl-16 pr-8 py-10 lg:w-[42%] h-full overflow-y-auto relative">
          <div className="absolute top-8 left-8 lg:top-10 lg:left-12">
            <button
              onClick={goBack}
              className="flex items-center gap-2 transition-all text-[11px] font-bold uppercase tracking-widest text-emerald-900/50 hover:text-emerald-950"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              {t('templates_modal.back') || 'Go Back'}
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

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 0 24px rgba(16,185,129,0.28)" }}
            whileTap={{ scale: 0.98, boxShadow: "0 0 30px 5px rgba(16, 185, 129, 0.6)" }}
            onClick={handleSelectTemplate}
            className={previewCtaClassName}
          >
            {t('templates_modal.cta') || 'Create Your Invitation'}
          </motion.button>
        </div>

        {/* Right: template display */}
        <div
          className="flex flex-col lg:items-center lg:justify-center w-full lg:w-[58%] h-full overflow-hidden relative"
        >
          {/* Mobile back button */}
          <div className="flex lg:hidden items-center p-6 pb-2 z-[6000] fixed top-0 left-0">
            <button
              onClick={goBack}
              className="w-10 h-10 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center bg-white/80 text-emerald-950 border border-emerald-900/10"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>

          {isDesktop ? (
            /* Desktop: iPhone frame */
            <div 
              className="hidden lg:block relative flex-shrink-0 z-10"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
              }}
            >
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
                  {/* Dynamic Island */}
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
                          templateId={templateId}
                          data={{ ...dummyData, musicUrl: getTemplateMusic(templateId) }}
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
            /* Mobile: full-screen */
            <div className="lg:hidden w-full min-h-[100dvh] relative overflow-y-auto overflow-x-hidden">
              {isPreviewContentReady ? (
                <ErrorBoundary>
                  <TemplateManager
                    templateId={templateId}
                    data={{ ...dummyData, musicUrl: getTemplateMusic(templateId) }}
                    fallback={<TemplatePreviewFallback theme={selectedTheme} />}
                  />
                </ErrorBoundary>
              ) : (
                <TemplatePreviewFallback theme={selectedTheme} />
              )}
              {/* Mobile CTA floating button */}
              <div className="fixed bottom-5 left-0 right-0 z-[6000] flex justify-center px-5 pointer-events-none">
                <button
                  onClick={handleSelectTemplate}
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
  );
};

export default TemplatePreview;
