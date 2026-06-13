import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { db } from '../../../lib/db';
import { Check, Send } from 'lucide-react';

const ROSE  = '#b05470';
const PINK  = '#d4849a';
const MAUVE = '#7d4059';
const INK   = '#3b1a28';

export default function RSVP() {
  const { t, language } = useLanguage();

  const SECTION_HEADING = {
    en: "Confirm Your Attendance",
    ru: "Подтвердите ваше присутствие",
    uz_cyrl: "Иштирокингизни тасдиқланг",
    tj: "Иштироки худро тасдиқ кунед"
  };

  const CONFIRM_BTN = {
    en: "Send Confirmation",
    ru: "Отправить подтверждение",
    uz_cyrl: "Тасдиқни юбориш",
    tj: "Тасдиқро ирсол кунед"
  };

  const heading = SECTION_HEADING[language] || SECTION_HEADING.en;
  const btnText = CONFIRM_BTN[language] || CONFIRM_BTN.en;

  const params = useParams();
  const invitationRef = params['*'] || params.id || (params.slugPrefix && params.slugName ? `${params.slugPrefix}/${params.slugName}` : '') || '';

  const [formData, setFormData] = useState({ name: '', wish: '' });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setLoading(true);
    setError('');
    try {
      await db.addRSVP(invitationRef, { name: formData.name, wish: formData.wish, status: 'attending' });
      setSuccess(true);
    } catch (err) {
      setError(t('invitation.rsvp_error'));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 0',
    borderTop: 'none', borderLeft: 'none', borderRight: 'none',
    borderBottom: '1px solid rgba(176,84,112,0.25)',
    outline: 'none',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: '1rem',
    color: INK,
    background: 'transparent',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  return (
    <section style={{ padding: '5rem 1.5rem', backgroundColor: '#fdf5f8', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(176,84,112,0.22), transparent)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1 }}
        style={{ maxWidth: 520, margin: '0 auto' }}
      >
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            fontSize: 'clamp(1.8rem, 5vw, 2.4rem)',
            fontStyle: 'italic',
            fontWeight: 400,
            color: INK,
            marginBottom: 16,
          }}>
            {heading}
          </h2>
          <div style={{ width: 50, height: 1, background: 'linear-gradient(90deg, transparent, #b05470, transparent)', margin: '0 auto' }} />
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', padding: '48px 20px' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 64, height: 64, borderRadius: '50%',
                background: `linear-gradient(135deg, ${ROSE}, ${MAUVE})`,
                marginBottom: 20,
                boxShadow: '0 8px 24px rgba(176,84,112,0.35)',
              }}
            >
              <Check size={28} color="#fff" strokeWidth={2.5} />
            </motion.div>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontSize: '1.6rem', color: ROSE, marginBottom: 10 }}>
              {t('invitation.rsvp_success_title')}
            </p>
            <p style={{ fontFamily: "'Lato', Arial, sans-serif", fontSize: '0.78rem', letterSpacing: '0.12em', color: PINK }}>
              {t('invitation.rsvp_success_desc')}
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {error && <p style={{ color: '#e0524a', textAlign: 'center', fontSize: '0.85rem' }}>{error}</p>}

            {/* Name */}
            <div>
              <label style={{ display: 'block', fontFamily: "'Lato', Arial, sans-serif", fontSize: '0.6rem', letterSpacing: '0.38em', textTransform: 'uppercase', color: PINK, marginBottom: 10, fontWeight: 700 }}>
                {t('invitation.rsvp_name')}
              </label>
              <input
                type="text" required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('invitation.rsvp_name_placeholder')}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = ROSE}
                onBlur={e  => e.target.style.borderColor = 'rgba(176,84,112,0.25)'}
              />
            </div>

            {/* Wish */}
            <div>
              <label style={{ display: 'block', fontFamily: "'Lato', Arial, sans-serif", fontSize: '0.6rem', letterSpacing: '0.38em', textTransform: 'uppercase', color: PINK, marginBottom: 10, fontWeight: 700 }}>
                {t('invitation.rsvp_wish')}
              </label>
              <textarea
                rows="3"
                value={formData.wish}
                onChange={(e) => setFormData({ ...formData, wish: e.target.value })}
                placeholder={t('invitation.rsvp_wish_placeholder')}
                style={{ ...inputStyle, resize: 'none' }}
                onFocus={e => e.target.style.borderColor = ROSE}
                onBlur={e  => e.target.style.borderColor = 'rgba(176,84,112,0.25)'}
              />
            </div>

            {/* Submit */}
            <div style={{ textAlign: 'center', paddingTop: 8 }}>
              <motion.button
                whileHover={{ scale: 1.04, y: -2, boxShadow: '0 12px 32px rgba(176,84,112,0.4)' }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '15px 52px',
                  background: loading
                    ? 'rgba(176,84,112,0.35)'
                    : `linear-gradient(135deg, ${ROSE} 0%, #c96880 45%, ${MAUVE} 100%)`,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '999px',
                  fontFamily: "'Lato', Arial, sans-serif",
                  fontSize: '0.7rem',
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  cursor: loading ? 'default' : 'pointer',
                  boxShadow: loading ? 'none' : '0 8px 24px rgba(176,84,112,0.35)',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
                    />
                    {t('invitation.rsvp_sending')}
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    {btnText}
                  </>
                )}
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
    </section>
  );
}
