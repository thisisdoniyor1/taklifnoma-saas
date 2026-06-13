import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, CheckCircle2, Navigation, Music } from 'lucide-react';
import blueBookCover from './blue_book_cover.png';

const EmeraldEleganceTemplate = ({ data, isThumbnail }) => {
  const { groomName, brideName, date, time, location, welcomeText, musicUrl } = data || {};
  const [isOpened, setIsOpened] = useState(false);

  return (
    <div className={`min-h-[100dvh] bg-[#064E3B] text-[#ECFDF5] font-sans flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden ${isThumbnail ? 'h-full min-h-0' : ''}`}>
      
      {/* BOOK COVER OVERLAY */}
      <AnimatePresence>
        {!isOpened && (
          <motion.div
            onClick={() => !isThumbnail && setIsOpened(true)}
            initial={{ rotateY: 0 }}
            exit={{ rotateY: -110, opacity: 0, transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] } }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 50,
              transformOrigin: 'left center',
              perspective: '2000px',
              transformStyle: 'preserve-3d',
              pointerEvents: isThumbnail ? 'none' : 'auto',
              cursor: isThumbnail ? 'default' : 'pointer',
              backgroundColor: '#0f172a'
            }}
          >
            {/* The blue book cover image, centered and scaled to fill vertically */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100vh',
              height: '100vh',
              backgroundImage: `url(${blueBookCover})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              // Dynamic CSS Mask to punch a hole where the gold frame's center is
              maskImage: 'radial-gradient(ellipse 20.5% 26.5% at 50% 50%, transparent 99%, black 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 20.5% 26.5% at 50% 50%, transparent 99%, black 100%)',
            }} />

            {/* Inner shadow to give the cutout 3D depth */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100vh',
              height: '100vh',
              pointerEvents: 'none',
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '41vh',
                height: '53vh',
                borderRadius: '50%',
                boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.8)',
              }} />
            </div>

            {!isThumbnail && (
              <div className="absolute bottom-12 w-full text-center animate-pulse">
                <p className="text-[#FCD34D] font-serif italic text-lg tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  Click to Open
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#10B981]/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#047857]/20 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="absolute inset-0 border-[16px] border-[#065F46] opacity-50 m-4 rounded-[40px] pointer-events-none" />

      <motion.div 
        initial={isThumbnail ? false : { opacity: 0, scale: 0.95 }}
        animate={isThumbnail ? false : (isOpened ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 0.95 })}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: isOpened ? 0.2 : 0 }}
        className="w-full max-w-xl bg-[#064E3B]/80 backdrop-blur-3xl rounded-[32px] border border-[#10B981]/20 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] p-10 md:p-16 relative z-10 text-center"
      >
        <p className="text-[9px] font-extrabold uppercase tracking-[5px] text-[#FCD34D] mb-8">
          Wedding Invitation
        </p>

        <p className="text-base font-medium text-[#A7F3D0] mb-12 leading-relaxed italic px-2">
          "{welcomeText || 'We joyfully invite you to share in our happiness as we unite in marriage.'}"
        </p>

        <div className="py-10 border-y border-[#10B981]/20 mb-12 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-px bg-gradient-to-r from-transparent via-[#FCD34D] to-transparent" />
          
          <h1 className="text-5xl md:text-6xl font-light text-white tracking-tight mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            {groomName || 'Rustam'}
          </h1>
          <div className="flex items-center justify-center gap-4 my-6">
            <div className="w-12 h-[1px] bg-[#10B981]/30" />
            <div className="text-[#FCD34D] font-extrabold text-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>&</div>
            <div className="w-12 h-[1px] bg-[#10B981]/30" />
          </div>
          <h1 className="text-5xl md:text-6xl font-light text-white tracking-tight mt-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            {brideName || 'Sevara'}
          </h1>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-px bg-gradient-to-r from-transparent via-[#FCD34D] to-transparent" />
        </div>

        <div className="grid grid-cols-1 gap-6 mb-12">
           <div className="p-5 bg-[#065F46]/50 rounded-3xl border border-[#10B981]/10 flex flex-col items-center">
              <Calendar size={20} className="text-[#FCD34D] mb-3" />
              <p className="text-[8px] font-bold text-[#A7F3D0]/60 uppercase tracking-[3px] mb-1">Date & Time</p>
              <p className="text-[12px] font-bold text-white tracking-wide">{date || '24 June, 2026'}</p>
              <p className="text-[10px] font-medium text-[#A7F3D0] mt-0.5">{time || '18:00'}</p>
           </div>
           <div className="p-5 bg-[#065F46]/50 rounded-3xl border border-[#10B981]/10 flex flex-col items-center">
              <MapPin size={20} className="text-[#FCD34D] mb-3" />
              <p className="text-[8px] font-bold text-[#A7F3D0]/60 uppercase tracking-[3px] mb-1">Venue</p>
              <p className="text-[12px] font-bold text-white tracking-wide line-clamp-1">{location || 'Grand Palace, Tashkent'}</p>
              <p className="text-[10px] font-medium text-[#FCD34D] mt-0.5 underline cursor-pointer">View Map</p>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
           <button className="w-full h-12 bg-[#FCD34D] text-[#064E3B] rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[2px] whitespace-nowrap px-4 hover:bg-[#FDE68A] transition-all shadow-[0_10px_30px_-10px_rgba(252,211,77,0.4)] group">
              <Navigation size={14} className="shrink-0 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              Directions
           </button>
           <button className="w-full h-12 bg-transparent border border-[#FCD34D] text-[#FCD34D] rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[2px] whitespace-nowrap px-4 hover:bg-[#FCD34D]/10 transition-all group">
              <CheckCircle2 size={14} className="shrink-0" />
              Confirm RSVP
           </button>
        </div>

        {musicUrl && (
           <div className="mt-10 opacity-40 flex justify-center items-center gap-4 text-[#FCD34D]">
              <div className="w-8 h-px bg-[#FCD34D]/50" />
              <Music size={12} />
              <div className="w-8 h-px bg-[#FCD34D]/50" />
           </div>
        )}
      </motion.div>
      
      <footer className="mt-10 opacity-30 relative z-10">
        <p className="text-[8px] font-bold uppercase tracking-[5px] text-white">EMERALD ELEGANCE</p>
      </footer>
    </div>
  );
};

export default EmeraldEleganceTemplate;
