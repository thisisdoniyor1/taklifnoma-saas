import { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export default function FloatingControls() {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Audio playback failed", e));
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const handleOpen = () => {
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {});
      }
    };
    window.addEventListener('open-invitation', handleOpen);
    return () => window.removeEventListener('open-invitation', handleOpen);
  }, []);

  return (
    <>
      <audio ref={audioRef} loop
        src="https://archive.org/download/ShahriyarImomov/ShahriyarImomov_Tajik_01.mp3"
      />
      {/* Music - Left */}
      <button
        onClick={togglePlay}
        className="fixed bottom-10 right-6 z-50 w-12 h-12 bg-white/90 backdrop-blur-md border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c] hover:bg-[#c9a84c] hover:text-white transition-all duration-500 cursor-pointer shadow-xl rounded-full"
        aria-label={t('invitation.toggle_music') || "Toggle Music"}
      >
        {isPlaying ? <Volume2 size={20} className="animate-pulse" /> : <VolumeX size={20} />}
      </button>
    </>
  );
}
