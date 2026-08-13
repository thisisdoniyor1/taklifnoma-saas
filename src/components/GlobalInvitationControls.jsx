import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Music2 } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';

const extractYouTubeVideoId = (url = '') => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : null;
};

const DEFAULT_MUSIC_URL = 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Bridal_Chorus_%28Wagner%29.ogg';

const MusicPlayer = ({ musicUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const { t } = useLanguage();

  const finalMusicUrl = musicUrl && musicUrl.trim() !== '' ? musicUrl : DEFAULT_MUSIC_URL;
  const youTubeVideoId = useMemo(() => extractYouTubeVideoId(finalMusicUrl), [finalMusicUrl]);

  useEffect(() => {
    if (youTubeVideoId && !ytPlayerRef.current && window.YT) {
      ytPlayerRef.current = new window.YT.Player(`yt-player-global`, {
        videoId: youTubeVideoId,
        playerVars: { autoplay: 0, controls: 0, loop: 1, playlist: youTubeVideoId },
        events: {
          onReady: (event) => {
            if (isPlaying) event.target.playVideo();
          },
        },
      });
    }
  }, [youTubeVideoId, isPlaying]);

  useEffect(() => {
    if (!window.YT && youTubeVideoId) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, [youTubeVideoId]);

  const togglePlay = () => {
    if (youTubeVideoId) {
      if (!ytPlayerRef.current || !ytPlayerRef.current.getPlayerState) return;
      const state = ytPlayerRef.current.getPlayerState();
      if (state === 1) {
        ytPlayerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      }
    } else {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }
  };

  return (
    <>
      {youTubeVideoId ? (
        <div id="yt-player-global" className="hidden" />
      ) : (
        <audio ref={audioRef} src={finalMusicUrl} loop className="hidden" preload="metadata" />
      )}
      
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={togglePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border backdrop-blur-md transition-colors ${
          isPlaying 
            ? 'bg-gold-500 text-white border-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
            : 'bg-white/80 text-emerald-900 border-white/40 shadow-emerald-900/10'
        }`}
        aria-label={t('invitation.toggle_music') || 'Toggle Music'}
      >
        {isPlaying ? <Music size={18} className="animate-pulse" /> : <Music2 size={18} />}
      </motion.button>
    </>
  );
};

export default function GlobalInvitationControls({ data }) {
  return (
    <div className="fixed top-0 left-0 w-full z-[9999] pointer-events-none">
      <div className="max-w-[450px] mx-auto w-full h-full relative">
        {/* Music Player (Top Left) */}
        <div className="absolute top-4 left-4 pointer-events-auto">
          <MusicPlayer musicUrl={data?.musicUrl} />
        </div>

        {/* Language Switcher (Top Right) */}
        <div className="absolute top-4 right-4 pointer-events-auto">
          <LanguageSwitcher 
            buttonClassName="!bg-white/80 !border-white/40 !shadow-lg !backdrop-blur-md" 
            align="right" 
          />
        </div>
      </div>
    </div>
  );
}
