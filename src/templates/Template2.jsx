import React from 'react';
import { Heart, Music, MapPin, Calendar, HeartIcon, Plus, CheckCircle, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

const Template2 = ({ data }) => {
  const { groomName, brideName, date, time, location, welcomeText, musicUrl } = data;

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Abstract Cyber Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/20 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full" />
      
      {/* Micro-grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl bg-white/[0.03] backdrop-blur-3xl rounded-[48px] border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] p-12 md:p-20 relative z-10 text-center"
      >
        <div className="flex justify-center mb-12">
           <motion.div 
             animate={{ scale: [1, 1.1, 1] }}
             transition={{ duration: 3, repeat: Infinity }}
             className="w-20 h-20 bg-slate-900 border border-white/10 text-cyan-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/20"
           >
              <HeartIcon size={32} fill="currentColor" className="opacity-80" />
           </motion.div>
        </div>

        <p className="text-[11px] font-extrabold uppercase tracking-[6px] text-cyan-400 mb-8 opacity-80">
          The Ultimate Union
        </p>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-[-0.05em] mb-4 text-white">
          {groomName || 'Doniyor'}
        </h1>
        <div className="flex items-center justify-center gap-6 mb-4">
           <div className="flex-1 h-[1px] bg-white/5" />
           <div className="text-indigo-400 font-extrabold text-3xl font-sans">+</div>
           <div className="flex-1 h-[1px] bg-white/5" />
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-[-0.05em] mb-12 text-white">
          {brideName || 'Madina'}
        </h1>

        <p className="max-w-md mx-auto text-lg text-slate-400 font-medium mb-16 leading-relaxed italic opacity-80">
          "{welcomeText || 'Uzoq kutilgan quvonchli kunimizda sizni ko’rishdan cheksiz baxtiyor bo’lamiz.'}"
        </p>

        <div className="bg-slate-900/50 rounded-[32px] border border-white/5 p-8 mb-16 space-y-10">
           <div className="flex items-center gap-6 text-left">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-cyan-400 border border-white/5 shadow-inner">
                 <Calendar size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Commencement</p>
                 <p className="text-lg font-bold text-white tracking-tight">{date || '15 June, 2026'}</p>
                 <p className="text-sm font-medium text-slate-400 opacity-60 italic">{time || '18:00 PM'}</p>
              </div>
           </div>

           <div className="flex items-center gap-6 text-left">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/5 shadow-inner">
                 <MapPin size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Destination</p>
                 <p className="text-lg font-bold text-white tracking-tight">{location || 'Tashkent, "Oltin Saroy"'}</p>
                 <p className="text-sm font-medium text-slate-400 underline cursor-pointer opacity-60">Synchronize Maps</p>
              </div>
           </div>
        </div>

        <div className="flex flex-col gap-4">
           <button className="h-16 bg-white text-slate-950 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[4px] hover:bg-cyan-500 hover:text-white transition-all shadow-xl shadow-cyan-500/10 group">
              <CheckCircle size={18} />
              Secure My RSVP
           </button>
           <button className="h-16 bg-slate-900/50 border border-white/10 text-white rounded-2xl flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[4px] hover:border-indigo-500 transition-all group">
              <Navigation size={18} className="text-indigo-400" />
              Get Guidance
           </button>
        </div>

        {musicUrl && (
           <div className="mt-16 flex items-center justify-center gap-3 animate-pulse opacity-30">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
              <p className="text-[10px] font-bold tracking-[6px] uppercase">Audio Stream Active</p>
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
           </div>
        )}
      </motion.div>
      
      <footer className="mt-16 opacity-10">
        <p className="text-[10px] font-bold uppercase tracking-[8px] flex items-center gap-3">
          <div className="w-8 h-[1px] bg-white/20" />
          VIP PROTOCOL
          <div className="w-8 h-[1px] bg-white/20" />
        </p>
      </footer>
    </div>
  );
};

export default Template2;
