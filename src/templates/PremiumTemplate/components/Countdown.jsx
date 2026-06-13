import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';

export default function Countdown({ data, theme }) {
  const { t } = useLanguage();

  const targetDate = useMemo(() => {
    // Default: 24 June 2026
    let nextTargetDate = "2026-06-24T00:00:00";

    if (data?.date) {
      const parts = data.date.split('.');
      if (parts.length === 3) {
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        const time = data.time || "00:00";
        nextTargetDate = `${year}-${month}-${day}T${time}:00`;
      }
    }

    return nextTargetDate;
  }, [data?.date, data?.time]);

  const calculateTimeLeft = useCallback(() => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const timeBlocks = [
    { label: t('invitation.days') || 'Days', value: timeLeft.days || 0 },
    { label: t('invitation.hours') || 'Hours', value: timeLeft.hours || 0 },
    { label: t('invitation.minutes') || 'Min', value: timeLeft.minutes || 0 },
    { label: t('invitation.seconds') || 'Sec', value: timeLeft.seconds || 0 },
  ];

  return (
    <section className="py-12 px-4 shadow-none bg-transparent">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto flex flex-col items-center"
      >
        <div className="flex flex-col md:flex-row md:flex-wrap justify-center gap-4 md:gap-12 w-full max-w-[320px] md:max-w-none">
          {timeBlocks.map((block, index) => (
            <div 
              key={index} 
              className={`flex flex-col md:items-center md:pl-0 ${
                index === 0 ? 'items-start pl-[5%]' :
                index === 1 ? 'items-start pl-[25%]' :
                index === 2 ? 'items-start pl-[45%]' :
                'items-start pl-[65%]'
              }`}
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-24 h-24 md:w-28 md:h-28 rounded-full border flex flex-col items-center justify-center relative backdrop-blur-[2px]"
                style={{ borderColor: `${theme.accent}60`, backgroundColor: theme.countdownCardBg }}
              >
                <div className="absolute inset-1 rounded-full border" style={{ borderColor: `${theme.accent}20` }}></div>
                <span className="text-3xl md:text-4xl font-serif font-light" style={{ color: theme.text }}>
                  {block.value}
                </span>
                <span className="text-[9px] uppercase tracking-[0.2em] mt-1 font-medium" style={{ color: theme.accent }}>
                  {block.label}
                </span>
              </motion.div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
