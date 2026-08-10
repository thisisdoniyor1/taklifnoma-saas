import React, { useEffect, useRef, useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English', flag: '🇬🇧', label: 'EN' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', label: 'RU' },
  { code: 'uz_cyrl', name: 'O‘zbekcha', flag: '🇺🇿', label: 'UZ' },
  { code: 'tj', name: 'Тоҷикӣ', flag: '🇹🇯', label: 'ТО' },
];

const LanguageSwitcher = ({
  align = 'right',
  buttonClassName = '',
  menuClassName = '',
  itemClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, []);

  const currentLanguage = LANGUAGE_OPTIONS.find((item) => item.code === language) || LANGUAGE_OPTIONS[0];
  const menuAlignmentClassName = align === 'left' ? 'left-0' : 'right-0';

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className={`inline-flex items-center gap-1.5 sm:gap-1.5 rounded-[10px] sm:rounded-xl border border-emerald-900/10 bg-emerald-50 px-2.5 py-1.5 sm:px-2 sm:py-2 text-emerald-950/70 transition-all duration-300 hover:scale-[1.02] hover:text-emerald-950 ${buttonClassName}`}
      >
        <Globe size={14} className="opacity-50 h-[14px] w-[14px]" />
        <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider">{currentLanguage.label}</span>
        <ChevronDown size={12} className={`hidden sm:block transition-transform h-[12px] w-[12px] ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`absolute top-full z-[140] mt-3 min-w-[180px] overflow-hidden rounded-xl border border-emerald-900/10 bg-white py-2 shadow-[0_20px_50px_rgba(6,78,59,0.1)] ${menuAlignmentClassName} ${menuClassName}`}
          >
            {LANGUAGE_OPTIONS.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setLanguage(item.code);
                  setIsOpen(false);
                }}
                className={`relative flex w-full items-center justify-between px-5 py-3 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 hover:z-10 hover:scale-[1.02] border-b border-emerald-900/5 last:border-b-0 ${language === item.code ? 'bg-emerald-50/70 text-gold-500' : 'text-emerald-950/60 hover:bg-emerald-50'} ${itemClassName}`}
              >
                <span>{item.name}</span>
                <span className="text-sm">{item.flag}</span>
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
