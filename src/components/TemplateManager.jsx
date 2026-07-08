import React, { Suspense } from 'react';
import { getTemplateConfig } from '../lib/templates';
import { useLanguage } from '../context/LanguageContext';
import { getWelcomeText } from '../templates/WatercolorTuscanVillaTemplate/utils/transliterate';

const templateLoaders = {
  'envelope-classic': () => import('../templates/RoyalIvoryGatesTemplate'),
  'classic-gold-white': () => import('../templates/BlushRoseEleganceTemplate'),
  'jeweled-mandala': () => import('../templates/JeweledMandalaTemplate'),
  'golden-plumes': () => import('../templates/GoldenPlumesTemplate'),
  'minimal-floral': () => import('../templates/MinimalFloralTemplate'),
  'royal-navy-shield': () => import('../templates/ImperialNavyShieldTemplate'),
  'tuscany-finca': () => import('../templates/WatercolorTuscanVillaTemplate'),
  'chandelier-palm': () => import('../templates/ChandelierGardenDinnerTemplate'),
  'emerald-elegance': () => import('../templates/EmeraldEleganceTemplate'),
  'luxury-gold': () => import('../templates/LuxuryGoldTemplate'),
  'classic-minimalist': () => import('../templates/ClassicMinimalistTemplate'),
};

const premiumTemplateLoader = () => import('../templates/PremiumTemplate');
const lazyTemplateCache = new Map();

const DefaultTemplateFallback = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-white">
    <div className="h-10 w-10 rounded-full border-[3px] border-emerald-900/15 border-t-emerald-900 animate-spin" />
  </div>
);

const getTemplateLoader = (templateId) => templateLoaders[templateId] || premiumTemplateLoader;

const getLazyTemplate = (templateId) => {
  if (!lazyTemplateCache.has(templateId)) {
    lazyTemplateCache.set(templateId, React.lazy(getTemplateLoader(templateId)));
  }

  return lazyTemplateCache.get(templateId);
};

export const preloadTemplate = (templateId) => {
  const resolvedTemplateId = getTemplateConfig(templateId).id;
  return getTemplateLoader(resolvedTemplateId)();
};

export const preloadTemplates = (templateIds) => {
  const uniqueTemplateIds = [...new Set(templateIds)];
  return Promise.allSettled(uniqueTemplateIds.map((templateId) => preloadTemplate(templateId)));
};

const TemplateManager = ({ templateId, data, fallback, isThumbnail = false }) => {
  const { language, t } = useLanguage();
  const resolvedTemplateId = getTemplateConfig(templateId).id;
  const SelectedTemplate = getLazyTemplate(resolvedTemplateId);

  const processedData = data ? {
    ...data,
    welcomeText: getWelcomeText(data.welcomeText, language, t)
  } : data;

  return (
    <Suspense fallback={fallback ?? <DefaultTemplateFallback />}>
      <SelectedTemplate data={processedData} templateId={resolvedTemplateId} isThumbnail={isThumbnail} />
    </Suspense>
  );
};

export default TemplateManager;
