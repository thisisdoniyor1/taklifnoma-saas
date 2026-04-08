import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TemplateManager from '../components/TemplateManager';
import { Sparkles, Eye, Check, Star, ArrowUpRight, Trophy, Gem, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInvitation } from '../context/InvitationContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { slowScroll } from '../utils/scroll';

const Templates = () => {
  const { updateInvitation } = useInvitation();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dbTemplates, setDbTemplates] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8100/api/templates')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbTemplates(data.map(item => ({
            ...item,
            colors: typeof item.colors === 'string' ? JSON.parse(item.colors) : item.colors
          })));
        }
      })
      .catch(err => console.error("Template fetch failed", err));
  }, []);

  const templates = useMemo(() => {
    const defaults = [
      { id: 'luxury-gold', name: 'Oltin Hashamat', type: 'KLASSIK', colors: ['#D4AF37', '#FFFFFF'], category: 'standard', price: t('templates.free') },
      { id: 'modern-floral', name: 'Zamonoviy Bahor', type: 'FLORAL', colors: ['#064E3B', '#FFFFFF'], category: 'standard', price: t('templates.free') },
      { id: 'classic-minimalist', name: 'Tungi Nafosat', type: 'PREMIUM', colors: ['#0A0A0A', '#D4AF37'], category: 'premium', price: '$19' },
      { id: 'royal-blue', name: 'Qirollik Moviyi', type: 'ROYAL', colors: ['#002366', '#D4AF37'], category: 'premium', price: '$19' },
    ];
    return [...defaults, ...dbTemplates.filter(dt => !defaults.find(def => def.id === dt.id))];
  }, [dbTemplates, t]);

  const standardTemplates = useMemo(() => templates.filter(t => t.category === 'standard'), [templates]);
  const premiumTemplates = useMemo(() => templates.filter(t => t.category === 'premium'), [templates]);

  const dummyData = {
    groomName: 'Xurshidbek',
    brideName: 'Sultonoy',
    date: '12.08.2026',
    time: '18:00',
    location: 'Toshkent, "Oq Saroy"',
    welcomeText: 'Xush kelibsiz!',
  };

  const TemplateCard = ({ template, index }) => (
    <motion.div
      key={template.id}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-transparent border border-emerald-950/5 rounded-[32px] overflow-hidden hover:border-gold-500/20 transition-all hover:shadow-[0_48px_80px_-24px_rgba(6,78,59,0.12)]"
    >
      {/* Price Badge */}
      <div className={`absolute top-6 right-6 z-10 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl border backdrop-blur-md ${
        template.category === 'premium' 
          ? 'bg-emerald-950/90 text-gold-500 border-gold-500/30' 
          : 'bg-white/80 text-emerald-900 border-emerald-950/10'
      }`}>
        {template.category === 'premium' && <Gem size={10} className="inline mr-1.5 text-gold-500" />}
        {template.price}
      </div>

      {/* Preview Container - COMPACT HEIGHT */}
      <div className="h-[380px] bg-transparent relative overflow-hidden pointer-events-none transition-transform duration-700 ease-out origin-top border-b border-emerald-950/5">
         <div className="absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-white to-transparent" />
         <div className="scale-[0.7] origin-top translate-x-0 mt-8 transition-transform duration-700 group-hover:scale-[0.75]">
            <TemplateManager templateId={template.id} data={dummyData} />
         </div>
      </div>

      {/* Info Card Overlay (Bottom) - MORE COMPACT */}
      <div className="p-4 bg-white flex flex-col gap-4">
         <div className="text-center">
            <p className="text-[8px] font-bold uppercase tracking-[2px] text-gold-500 mb-1">{template.type}</p>
            <h3 className="text-base font-extrabold text-emerald-950 tracking-[-0.03em] uppercase">{template.name}</h3>
         </div>
         
         <motion.button 
           onClick={() => {
             if (!user) {
               alert(t('auth.loginFirst') || "Please log in first to create a template");
               navigate('/login');
               return;
             }
             updateInvitation({ templateId: template.id });
             navigate('/create');
           }}
           className="w-full h-11 bg-emerald-50 rounded-xl flex items-center justify-center gap-2 font-extrabold text-[9px] tracking-[1.5px] border border-emerald-950/5 pointer-events-auto relative overflow-hidden group/btn"
         initial="initial" whileHover="hover" whileTap="tap">
            <motion.div 
              variants={{
                initial: { x: "-100%" }, 
                hover: { x: 0 }
              }} 
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} 
              className="absolute inset-0 bg-emerald-950" 
            />
            <span className="relative z-10 transition-colors duration-300 group-hover/btn:text-white text-emerald-950 flex items-center gap-2">
               CHOOSE TEMPLATE
               <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
            </span>
         </motion.button>
      </div>
    </motion.div>
  );

  const SectionHeader = ({ icon, title }) => (
    <div className="flex flex-col items-start mb-10 px-0">
       <div className="w-12 h-12 bg-emerald-50 text-emerald-950 rounded-xl flex items-center justify-center mb-4 border border-emerald-950/5 shadow-inner">
          {icon}
       </div>
       <h3 className="text-xl font-extrabold text-emerald-950 uppercase tracking-widest tracking-[-0.02em]">{title}</h3>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-32">
      {/* Standard Section */}
      <div id="standard-templates">
        <SectionHeader 
          icon={<Trophy size={20} className="text-emerald-600" />}
          title="Standard Collection"
        />
        {/* CHANGED TO 4 COLUMNS ON LG SCREENS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {standardTemplates.map((template, i) => (
            <TemplateCard key={template.id} template={template} index={i} />
          ))}
        </div>
      </div>

      {/* Premium Section */}
      <div id="premium-templates" className="pt-20 border-t border-emerald-950/5">
        <SectionHeader 
          icon={<Gem size={20} className="text-gold-500" />}
          title="Premium Selection"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {premiumTemplates.map((template, i) => (
            <TemplateCard key={template.id} template={template} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Templates;
