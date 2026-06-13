import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { db } from '../../../lib/db';

export default function RSVP({ theme }) {
  const { t } = useLanguage();
  const { id: uuid } = useParams();
  const [formData, setFormData] = useState({ name: '', wish: '', status: 'attending' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fallback theme if not provided
  const activeTheme = theme || { accent: '#c9a84c', bg: '#ffffff', text: '#1a1a1a' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uuid) {
      alert("Taklifnoma oldindan ko'rish rejimida. RSVP yuborilmaydi.");
      return;
    }
    setLoading(true);
    try {
      await db.addRSVP(uuid, formData);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert(t('invitation.rsvp_error') || "Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className="py-28 px-4 text-center" style={{ backgroundColor: activeTheme.bg }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-3xl font-serif mb-4" style={{ color: activeTheme.accent, fontFamily: "'Playfair Display', serif" }}>
            {t('invitation.rsvp_success_title') || 'Rahmat!'}
          </h2>
          <p className="font-medium" style={{ color: activeTheme.mutedText || '#6b7280' }}>
            {t('invitation.rsvp_success_desc') || 'Sizning javobingiz muvaffaqiyatli qabul qilindi.'}
          </p>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="py-28 px-4 relative" style={{ backgroundColor: activeTheme.bg }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${activeTheme.accent}40, transparent)` }}></div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1 }}
        className="max-w-xl mx-auto"
      >
        <div className="text-center mb-14">
          <h2 className="mb-6" style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontStyle: 'italic', fontWeight: 400, color: activeTheme.text }}>
            {t('invitation.rsvp') || 'RSVP'}
          </h2>
          <div className="w-20 h-px mx-auto opacity-40" style={{ backgroundColor: activeTheme.accent }}></div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="relative group">
            <label className="block text-[10px] uppercase tracking-[0.4em] mb-3 font-bold transition-colors" style={{ color: activeTheme.softText || '#9ca3af' }}>
              {t('invitation.rsvp_name') || 'Your Name'}
            </label>
            <input 
              type="text" 
              required 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border-b py-4 focus:outline-none transition-all bg-transparent text-lg"
              style={{ fontFamily: "'Playfair Display', serif", borderColor: activeTheme.border || '#e5e7eb', color: activeTheme.text }} 
              placeholder={t('invitation.rsvp_name_placeholder') || "Your full name"}
            />
          </div>
          <div className="relative group">
            <label className="block text-[10px] uppercase tracking-[0.4em] mb-3 font-bold transition-colors" style={{ color: activeTheme.softText || '#9ca3af' }}>
              {t('invitation.rsvp_wish') || 'Leave a wish (optional)'}
            </label>
            <textarea 
              rows="3" 
              value={formData.wish} 
              onChange={(e) => setFormData({ ...formData, wish: e.target.value })}
              className="w-full border-b py-4 focus:outline-none transition-all bg-transparent resize-none text-lg"
              style={{ fontFamily: "'Playfair Display', serif", borderColor: activeTheme.border || '#e5e7eb', color: activeTheme.text }} 
              placeholder={t('invitation.rsvp_wish_placeholder') || "Leave your message..."}
            ></textarea>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 mb-12">
            <button
              type="submit"
              disabled={loading}
              onClick={() => setFormData({ ...formData, status: 'attending' })}
              className={`flex-1 py-5 rounded-2xl border-2 transition-all font-bold text-[11px] uppercase tracking-[3px] shadow-sm text-white border-transparent disabled:opacity-50`}
              style={{ backgroundColor: activeTheme.accent }}
            >
              {loading ? (t('invitation.rsvp_sending') || 'Sending...') : (t('invitation.rsvp_attend') || 'I will attend')}
            </button>
          </div>
          <p className="text-[10px] text-center mt-4 leading-relaxed" style={{ color: activeTheme.softText || '#9ca3af' }}>
            Note: Your response here is securely tied directly to this specific invitation ID.<br/>
            It will only appear in the admin panel and dashboard of the creator of this invitation, and will not mix with RSVPs from other invitations.
          </p>
        </form>
      </motion.div>
    </section>
  );
}
