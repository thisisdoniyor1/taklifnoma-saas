import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ChevronDown, Check } from 'lucide-react';

/* ─── 1. CUSTOM LANGUAGE SELECT ─── */
export const CustomLanguageSelect = ({ label, value, onChange, options, required = false, isDashboard = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  const getFlag = (val) => {
    switch (val) {
      case 'uz_cyrl': return '🇺🇿';
      case 'ru': return '🇷🇺';
      case 'en': return '🇬🇧';
      case 'tj': return '🇹🇯';
      default: return '🌐';
    }
  };

  return (
    <div className="relative block" ref={containerRef}>
      <span className={`mb-2 block text-[10px] font-black uppercase tracking-[2px] ${isDashboard ? 'text-emerald-900/45' : 'text-emerald-950'}`}>
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </span>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex min-h-[3.25rem] w-full items-center justify-between rounded-[18px] border-[1.5px] border-emerald-900/30 bg-white px-4 text-base font-semibold text-emerald-950 shadow-xs transition-all hover:border-emerald-800 focus:outline-none"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl shrink-0">{getFlag(selectedOption.value)}</span>
          <span>{selectedOption.label}</span>
        </div>
        <ChevronDown size={18} className={`text-emerald-900/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 z-[120] mt-1.5 overflow-hidden rounded-2xl border-2 border-emerald-900/10 bg-white shadow-xl max-h-60 overflow-y-auto"
          >
            <div className="py-1">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      if (isDashboard) {
                        onChange(opt.value);
                      } else {
                        onChange({ target: { name: 'defaultLang', value: opt.value } });
                      }
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-950'
                        : 'text-emerald-900/80 hover:bg-emerald-50/50 hover:text-emerald-950'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg shrink-0">{getFlag(opt.value)}</span>
                      <span>{opt.label}</span>
                    </div>
                    {isSelected && <Check size={16} className="text-[#C5A017] stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


/* ─── 2. CUSTOM DATE PICKER ─── */
export const CustomDatePicker = ({ label, value, onChange, placeholder, invalid = false, required = false, isDashboard = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const parseCurrentDate = (val) => {
    const parts = (val || '').split('.');
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
        return new Date(y, m, d);
      }
    }
    return new Date();
  };

  const today = new Date();
  const selectedDate = value ? parseCurrentDate(value) : null;
  const [viewDate, setViewDate] = useState(() => selectedDate || new Date());

  useEffect(() => {
    if (value) {
      setViewDate(parseCurrentDate(value));
    }
  }, [value]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const handleYearChange = (e) => {
    const y = parseInt(e.target.value, 10);
    setViewDate(new Date(y, viewMonth, 1));
  };

  const handleMonthChange = (e) => {
    const m = parseInt(e.target.value, 10);
    setViewDate(new Date(viewYear, m, 1));
  };

  const handleDaySelect = (day) => {
    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDate = `${formattedDay}.${formattedMonth}.${viewYear}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const blanks = Array(firstDayOfWeek).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const calendarCells = [...blanks, ...days];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = today.getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="relative block" ref={containerRef}>
      <span className={`mb-2 block text-[10px] font-black uppercase tracking-[2px] ${isDashboard ? 'text-emerald-900/45' : 'text-emerald-950'}`}>
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </span>

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex min-h-[3.25rem] items-center gap-3 rounded-[18px] border-[1.5px] px-4 cursor-pointer shadow-xs transition-all ${
          isOpen ? 'border-emerald-800' : ''
        } ${invalid ? 'border-red-400 bg-red-50/70' : 'border-emerald-900/30 bg-white'}`}
      >
        <span className="text-emerald-800 shrink-0"><Calendar size={16} strokeWidth={3} /></span>
        <input
          type="text"
          readOnly
          value={value}
          placeholder={placeholder}
          className="h-full w-full bg-transparent text-base font-semibold text-emerald-950 outline-none cursor-pointer placeholder:text-emerald-900/40"
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 md:left-auto md:w-[320px] z-[120] mt-2 rounded-[24px] border-2 border-emerald-900/10 bg-white p-4 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-emerald-900/5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-center gap-1.5">
                <select
                  value={viewMonth}
                  onChange={handleMonthChange}
                  className="bg-transparent text-xs font-black uppercase tracking-wider text-emerald-950 outline-none cursor-pointer hover:text-emerald-800"
                >
                  {monthNames.map((name, idx) => (
                    <option key={name} value={idx}>{name}</option>
                  ))}
                </select>

                <select
                  value={viewYear}
                  onChange={handleYearChange}
                  className="bg-transparent text-xs font-black uppercase tracking-wider text-emerald-950 outline-none cursor-pointer hover:text-emerald-800"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((wd, i) => (
                <span key={wd} className={`text-[9px] font-black uppercase tracking-wider ${i >= 5 ? 'text-[#C5A017]' : 'text-emerald-900/40'}`}>
                  {wd}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cellDay, idx) => {
                if (cellDay === null) {
                  return <div key={`blank-${idx}`} />;
                }

                const isSelected = selectedDate &&
                  selectedDate.getDate() === cellDay &&
                  selectedDate.getMonth() === viewMonth &&
                  selectedDate.getFullYear() === viewYear;

                const isToday = today.getDate() === cellDay &&
                  today.getMonth() === viewMonth &&
                  today.getFullYear() === viewYear;

                return (
                  <button
                    key={`day-${cellDay}`}
                    type="button"
                    onClick={() => handleDaySelect(cellDay)}
                    className={`h-9 w-9 rounded-full text-xs font-bold transition-all flex items-center justify-center ${
                      isSelected
                        ? 'bg-emerald-900 text-white shadow-md'
                        : isToday
                        ? 'border border-emerald-800 text-emerald-950 bg-emerald-50/40 font-black'
                        : 'text-emerald-950 hover:bg-emerald-50'
                    }`}
                  >
                    {cellDay}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


/* ─── 3. CUSTOM TIME PICKER ─── */
export const CustomTimePicker = ({ label, value, onChange, placeholder, invalid = false, required = false, isDashboard = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const [selectedHour, setSelectedHour] = useState('18');
  const [selectedMinute, setSelectedMinute] = useState('00');

  useEffect(() => {
    if (value && value.includes(':')) {
      const parts = value.split(':');
      if (parts.length >= 2) {
        setSelectedHour(parts[0]);
        setSelectedMinute(parts[1]);
      }
    }
  }, [value]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  const quickTimes = ['17:00', '18:00', '19:00', '20:00'];

  const handleSelectTime = (h, m) => {
    const formattedTime = `${h}:${m}`;
    onChange(formattedTime);
  };

  const handleQuickSelect = (timeStr) => {
    const [h, m] = timeStr.split(':');
    setSelectedHour(h);
    setSelectedMinute(m);
    onChange(timeStr);
    setIsOpen(false);
  };

  return (
    <div className="relative block" ref={containerRef}>
      <span className={`mb-2 block text-[10px] font-black uppercase tracking-[2px] ${isDashboard ? 'text-emerald-900/45' : 'text-emerald-950'}`}>
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </span>

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex min-h-[3.25rem] items-center gap-3 rounded-[18px] border-[1.5px] px-4 cursor-pointer shadow-xs transition-all ${
          isOpen ? 'border-emerald-800' : ''
        } ${invalid ? 'border-red-400 bg-red-50/70' : 'border-emerald-900/30 bg-white'}`}
      >
        <span className="text-emerald-800 shrink-0"><Clock size={16} strokeWidth={3} /></span>
        <input
          type="text"
          readOnly
          value={value}
          placeholder={placeholder}
          className="h-full w-full bg-transparent text-base font-semibold text-emerald-950 outline-none cursor-pointer placeholder:text-emerald-900/40"
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 md:left-auto md:w-[320px] z-[120] mt-2 rounded-[24px] border-2 border-emerald-900/10 bg-white p-4 shadow-2xl"
          >
            <div className="mb-3">
              <span className="block text-[8px] font-black uppercase tracking-wider text-emerald-900/40 mb-1.5">
                Quick Select
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {quickTimes.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleQuickSelect(t)}
                    className="py-1.5 rounded-lg border border-emerald-900/10 hover:border-emerald-700 bg-emerald-50/20 hover:bg-emerald-50 text-xs font-black text-emerald-950 transition-all"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-emerald-900/5 pt-3">
              <div>
                <span className="block text-[8px] font-black uppercase tracking-wider text-emerald-900/40 mb-1.5 text-center">
                  Hours
                </span>
                <div className="h-40 overflow-y-auto pr-1 flex flex-col gap-1 scrollbar-thin">
                  {hours.map(h => {
                    const isSelected = selectedHour === h;
                    return (
                      <button
                        key={`h-${h}`}
                        type="button"
                        onClick={() => {
                          setSelectedHour(h);
                          handleSelectTime(h, selectedMinute);
                        }}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-emerald-900 text-white font-black'
                            : 'text-emerald-950 hover:bg-emerald-50'
                        }`}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="block text-[8px] font-black uppercase tracking-wider text-emerald-900/40 mb-1.5 text-center">
                  Minutes
                </span>
                <div className="h-40 overflow-y-auto pr-1 flex flex-col gap-1 scrollbar-thin">
                  {minutes.map(m => {
                    const isSelected = selectedMinute === m;
                    return (
                      <button
                        key={`m-${m}`}
                        type="button"
                        onClick={() => {
                          setSelectedMinute(m);
                          handleSelectTime(selectedHour, m);
                        }}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-emerald-900 text-white font-black'
                            : 'text-emerald-950 hover:bg-emerald-50'
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-3.5 w-full py-2 bg-emerald-950 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-900 transition-colors"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
