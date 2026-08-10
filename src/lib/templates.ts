const createTheme = (overrides = {}) => ({
  accent: '#c9a84c',
  accentAlt: '#8b6a2f',
  accentSoft: 'rgba(201, 168, 76, 0.14)',
  bg: '#fffdf8',
  bgAlt: '#f7f0e3',
  surface: '#ffffff',
  surfaceAlt: '#fdf7ed',
  text: '#1f1912',
  mutedText: '#615649',
  softText: '#99876a',
  border: 'rgba(201, 168, 76, 0.18)',
  borderStrong: 'rgba(201, 168, 76, 0.34)',
  line: 'rgba(201, 168, 76, 0.24)',
  buttonText: '#ffffff',
  coverGradient:
    'radial-gradient(circle at top, rgba(201,168,76,0.22), transparent 42%), linear-gradient(180deg, #fffdf8 0%, #f5eddf 100%)',
  heroGradient:
    'radial-gradient(circle at 18% 18%, rgba(201,168,76,0.12), transparent 34%), linear-gradient(180deg, #fffdf8 0%, #faf3e7 100%)',
  sectionGradient:
    'linear-gradient(180deg, #fffdf8 0%, #f7efdf 100%)',
  heroPanelBg: 'rgba(255,255,255,0.68)',
  countdownCardBg: 'rgba(255,255,255,0.68)',
  previewCardBg: '#fffdf8',
  previewGradient:
    'radial-gradient(circle at top, rgba(201,168,76,0.22), transparent 42%), linear-gradient(180deg, #fffdf8 0%, #f5eddf 100%)',
  previewModalBg: '#f8f2e7',
  previewGlowA: 'rgba(201,168,76,0.18)',
  previewGlowB: 'rgba(90,74,43,0.12)',
  previewGlowC: 'rgba(255,255,255,0.52)',
  previewShadow: '0 28px 60px -30px rgba(54, 43, 20, 0.26)',
  galleryCardBg: '#fff8ef',
  galleryLabelBg: 'rgba(201,168,76,0.08)',
  designKey: 'royal-gold',
  ...overrides,
});

const templateCatalog = {
  'envelope-classic': {
    id: 'envelope-classic',
    name: 'Design 1',
    type: 'PREMIUM',
    category: 'classic',
    colors: ['#D4AF37', '#FFFAF0'],
    priceKey: 'templates.price_somoni',
    priceKeyOld: 'templates.price_somoni_old',
    summary: '',
    description: '',
    welcomeText: 'We invite you to share in the joy of our wedding day. Your presence will make our celebration complete as we begin our new life together.',

    theme: createTheme({
      designKey: 'envelope-classic',
      accent: '#D4AF37',
      accentAlt: '#a67c00',
      bg: '#FFFAF0',
      bgAlt: '#f8f1e7',
      surface: '#ffffff',
      surfaceAlt: '#fdfcf9',
      text: '#2C3E50',
      mutedText: '#5a7080',
      softText: '#95A5A6',
      border: 'rgba(212,175,55,0.45)',
      borderStrong: 'rgba(212,175,55,0.42)',
      line: 'rgba(212,175,55,0.28)',
      coverGradient: 'radial-gradient(circle at center, #ffffff 0%, #f4e7d5 100%)',
      previewGradient: 'radial-gradient(circle at center, #ffffff 0%, #f4e7d5 100%)',
      previewCardBg: '#FFFAF0',
      previewModalBg: '#f8f1e7',
      previewGlowA: 'rgba(212,175,55,0.18)',
      previewGlowB: 'rgba(164,124,0,0.12)',
      heroPanelBg: 'rgba(255,255,255,0.85)',
    }),
  },

  'classic-gold-white': {
    id: 'classic-gold-white',
    name: 'Design 2',
    type: 'PREMIUM',
    category: 'classic',
    colors: ['#b05470', '#fdf0f4'],
    priceKey: 'templates.price_somoni',
    priceKeyOld: 'templates.price_somoni_old',
    summary: '',
    description: '',
    welcomeText: 'We invite you to share in the joy of our wedding day. Your presence will make our celebration complete as we begin our new life together.',

    theme: createTheme({
      designKey: 'classic-gold-white',
      accent: '#b05470',
      accentAlt: '#7d4059',
      bg: '#fdf0f4',
      bgAlt: '#ffffff',
      surface: '#ffffff',
      surfaceAlt: '#fdf8fa',
      text: '#3b1a28',
      mutedText: '#6a4050',
      softText: '#d4849a',
      previewModalBg: '#fdf0f4',
      previewGlowA: 'rgba(176,84,112,0.14)',
      previewGlowB: 'rgba(176,84,112,0.08)',
      border: 'rgba(176,84,112,0.38)',
    }),
  },

  'royal-navy-shield': {
    id: 'royal-navy-shield',
    name: 'Design 3',
    type: 'PREMIUM',
    category: 'classic',
    colors: ['#1A2B4B', '#D4AF37'],
    priceKey: 'templates.price_somoni',
    priceKeyOld: 'templates.price_somoni_old',
    summary: '',
    description: '',
    welcomeText: 'We invite you to share in the joy of our wedding day. Your presence will make our celebration complete as we begin our new life together.',

    theme: createTheme({
      designKey: 'royal-navy-shield',
      accent: '#D4AF37',
      bg: '#fbf9fa',
      text: '#1a2b4b',
      previewCardBg: '#1a2b4b',
    }),
  },

  'tuscany-finca': {
    id: 'tuscany-finca',
    name: 'Design 4',
    type: 'PREMIUM',
    category: 'botanical',
    colors: ['#8a9e7a', '#f8f5f0'],
    priceKey: 'templates.price_somoni',
    priceKeyOld: 'templates.price_somoni_old',
    summary: '',
    description: '',
    welcomeText: 'We invite you to share in the joy of our wedding day. Your presence will make our celebration complete as we begin our new life together.',

    theme: createTheme({
      designKey: 'tuscany-finca',
      accent: '#8a9e7a',
      accentAlt: '#5c7048',
      bg: '#f8f5f0',
      bgAlt: '#f0ece4',
      surface: '#ffffff',
      text: '#3d3028',
      previewCardBg: '#8a9e7a',
    }),
  },

  'chandelier-palm': {
    id: 'chandelier-palm',
    name: 'Design 5',
    type: 'PREMIUM',
    category: 'classic',
    colors: ['#b99a52', '#f3e4e8', '#686a4d'],
    priceKey: 'templates.price_somoni',
    priceKeyOld: 'templates.price_somoni_old',
    summary: '',
    description: '',
    welcomeText: 'We invite you to share in the joy of our wedding day. Your presence will make our celebration complete as we begin our new life together.',

    theme: createTheme({
      designKey: 'chandelier-palm',
      accent: '#b99a52',
      accentAlt: '#686a4d',
      bg: '#fbf5f6',
      bgAlt: '#f3e4e8',
      surface: '#ffffff',
      surfaceAlt: '#fff9f7',
      text: '#342b28',
      mutedText: '#6c5d57',
      softText: '#8f8179',
      border: 'rgba(185,154,82,0.45)',
      borderStrong: 'rgba(185,154,82,0.42)',
      line: 'rgba(185,154,82,0.32)',
      previewCardBg: '#fbf5f6',
      previewGradient:
        'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.96), rgba(243,228,232,0.72) 48%, transparent 72%), linear-gradient(180deg, #fbf5f6 0%, #f3e4e8 100%)',
      previewModalBg: '#fbf5f6',
      previewGlowA: 'rgba(185,154,82,0.18)',
      previewGlowB: 'rgba(104,106,77,0.14)',
      heroPanelBg: 'rgba(255,255,255,0.68)',
    }),
  },

  'emerald-elegance': {
    id: 'emerald-elegance',
    name: 'Design 6',
    type: 'PREMIUM',
    category: 'classic',
    colors: ['#064E3B', '#FCD34D'],
    priceKey: 'templates.price_somoni',
    summary: 'A luxurious deep green and gold template for evening or premium events.',
    description: 'Features a beautiful emerald green palette with gold accents, elegant Playfair Display typography, and smooth fading animations.',
    theme: createTheme({
      designKey: 'emerald-elegance',
      accent: '#FCD34D',
      accentAlt: '#F59E0B',
      bg: '#064E3B',
      bgAlt: '#065F46',
      surface: '#047857',
      text: '#ECFDF5',
      previewCardBg: '#064E3B',
      previewModalBg: '#064E3B',
    }),
  },

  'luxury-gold': {
    id: 'luxury-gold',
    name: 'Design 7',
    type: 'PREMIUM',
    category: 'classic',
    colors: ['#0EA5E9', '#F8FAFC'],
    priceKey: 'templates.price_somoni',
    summary: 'A modern, clean luxury gold and cyan invitation with minimalist cards and a smooth layout.',
    description: 'A beautiful invitation with soft teal accents, slate typography, map integrations, and secure RSVP.',
    theme: createTheme({
      designKey: 'luxury-gold',
      accent: '#0EA5E9',
      accentAlt: '#0284C7',
      bg: '#F8FAFC',
      bgAlt: '#F1F5F9',
      surface: '#FFFFFF',
      text: '#0F172A',
      previewCardBg: '#F8FAFC',
      previewModalBg: '#F8FAFC',
    }),
  },

  'classic-minimalist': {
    id: 'classic-minimalist',
    name: 'Design 8',
    type: 'PREMIUM',
    category: 'classic',
    colors: ['#EC4899', '#FDF2F8'],
    priceKey: 'templates.price_somoni',
    summary: 'A luxurious dark pink-and-gold design featuring romantic animations, a custom digital gate, and a realistic countdown.',
    description: 'An elegant template with a stunning realistic opening invitation card, beautiful cherry blossom/pink rose aesthetics, animated live countdown, venue details with a castle illustration, and professional styling.',
    theme: createTheme({
      designKey: 'classic-minimalist',
      accent: '#EC4899',
      accentAlt: '#BE185D',
      bg: '#0F050A',
      bgAlt: '#1C0A15',
      surface: '#2D0F22',
      text: '#FDF2F8',
      previewCardBg: '#0F050A',
      previewModalBg: '#0F0F12',
    }),
  },
}

const templateAliases = {
  'premium-royal': 'envelope-classic',
  'moonlit-garden': 'envelope-classic',
  'rose-quartz': 'envelope-classic',
  'midnight-velvet': 'envelope-classic',
  'terracotta-bloom': 'envelope-classic',
  'cinematic-silk': 'envelope-classic',
  'the-grand-gala': 'envelope-classic',
  'velvet-night': 'envelope-classic',
  'interactive-onyx': 'envelope-classic',
  'infinity-story': 'envelope-classic',
  'luxe-motion': 'envelope-classic',
  'diamond-tier': 'envelope-classic',
  'bespoke-aura': 'envelope-classic',
  'signature-glass': 'envelope-classic',
  'royal-gold': 'envelope-classic',
};

export const defaultTemplateId = 'envelope-classic';


export const templates = Object.values(templateCatalog).filter(
  t => t.id !== 'luxury-gold' && t.id !== 'classic-minimalist' && t.id !== 'emerald-elegance'
);

export const resolveTemplateId = (templateId) => {
  if (templateId && templateCatalog[templateId]) {
    return templateId;
  }

  if (templateId && templateAliases[templateId]) {
    return templateAliases[templateId];
  }

  return defaultTemplateId;
};

export const getTemplateConfig = (templateId) => {
  return templateCatalog[resolveTemplateId(templateId)] || templateCatalog[defaultTemplateId];
};

export const getTemplateTheme = (templateId) => {
  return getTemplateConfig(templateId).theme;
};

export const getTemplateName = (templateId) => {
  return getTemplateConfig(templateId).name;
};
