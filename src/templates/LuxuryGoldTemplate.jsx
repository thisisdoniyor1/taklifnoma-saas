import React from 'react';
import { Heart, Music, MapPin, Calendar, CheckCircle2, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

const LuxuryGoldTemplate = ({ data }) => {
  const { groomName, brideName, date, time, location, welcomeText, musicUrl } = data;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-100/30 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/30 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl bg-white/70 backdrop-blur-2xl rounded-[40px] border border-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] p-12 md:p-20 relative z-10 text-center"
      >
        <div className="flex justify-center mb-10">
           <div className="w-16 h-16 bg-cyan-50 text-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Heart size={30} fill="currentColor" />
           </div>
        </div>

        <p className="text-[11px] font-extrabold uppercase tracking-[4px] text-cyan-600 mb-6">
          Official Digital Invitation
        </p>

        <p className="text-lg md:text-xl font-medium text-slate-500 mb-12 leading-relaxed italic">
          "{welcomeText || 'Uzoq kutilgan quvonchli kunimizda sizni ko’rishdan cheksiz baxtiyor bo’lamiz.'}"
        </p>

        <div className="space-y-4 mb-16 px-4 py-8 border-y border-slate-100">
           <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-[-0.03em]">{groomName || 'Rustam'}</h1>
           <div className="flex items-center justify-center gap-4">
              <div className="w-8 h-[1px] bg-slate-200" />
              <div className="text-cyan-500 font-extrabold text-2xl">&</div>
              <div className="w-8 h-[1px] bg-slate-200" />
           </div>
           <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-[-0.03em]">{brideName || 'Madina'}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
           <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <Calendar size={20} className="text-cyan-500 mx-auto mb-4" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">When</p>
              <p className="text-[10px] font-extrabold text-slate-900">{date || '15 June, 2026'}</p>
              <p className="text-[12px] font-medium text-slate-500">{time || '18:00 PM'}</p>
           </div>
           <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <MapPin size={20} className="text-cyan-500 mx-auto mb-4" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Where</p>
              <p className="text-sm font-extrabold text-slate-900 line-clamp-1">{location || 'Tashkent, "Oltin Saroy"'}</p>
              <p className="text-[12px] font-medium text-slate-500 underline cursor-pointer">Open Maps</p>
           </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
           <button className="w-full h-16 bg-slate-950 text-white rounded-2xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[2px] whitespace-nowrap px-2 hover:bg-cyan-500 transition-all shadow-2xl shadow-slate-950/20 group">
              <Navigation size={16} className="shrink-0 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              Get Location
           </button>
           <button className="w-full h-16 bg-white border border-slate-200 text-slate-900 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[2px] whitespace-nowrap px-2 hover:border-cyan-500 transition-all transition-colors group">
              <CheckCircle2 size={16} className="shrink-0 text-cyan-500" />
              Confirm RSVP
           </button>
        </div>

        {musicUrl && (
           <div className="mt-12 opacity-30 flex justify-center gap-4">
              <Music size={16} />
              <div className="w-12 h-[2px] bg-slate-200 self-center" />
              <Music size={16} />
           </div>
        )}
      </motion.div>
      
      <footer className="mt-12 opacity-20 relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-[4px]">TAKLIFNOMA.VIP DIGITAL LUXURY</p>
      </footer>
    </div>
  );
};

export default LuxuryGoldTemplate;
