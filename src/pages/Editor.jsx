import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useInvitation } from '../context/InvitationContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../config';
import TemplateManager from '../components/TemplateManager';
import {
  Save,
  ChevronRight,
  ChevronLeft,
  Calendar,
  MapPin,
  Music,
  Image as ImageIcon,
  Heart,
  Type,
  Share2,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Editor = () => {
  const { t } = useLanguage();
  const { invitationData, updateInvitation } = useInvitation();
  const locationState = useLocation().state;
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [invalidFields, setInvalidFields] = useState([]);

  const { user } = useAuth();

  // Set selected template if coming from gallery
  useEffect(() => {
    if (locationState?.templateId) {
      updateInvitation({ templateId: locationState.templateId });
    }
  }, [locationState]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateInvitation({ [name]: value });
    if (invalidFields.includes(name)) {
      setInvalidFields(invalidFields.filter(field => field !== name));
    }
  };

  const validateStep = (step) => {
    setErrorMsg('');
    let invalids = [];
    if (step === 1) {
      if (!invitationData.groomName) invalids.push('groomName');
      if (!invitationData.brideName) invalids.push('brideName');
      
      if (invalids.length > 0) {
        setInvalidFields(invalids);
        setErrorMsg('Iltimos, ismlarni to\'liq kiriting!');
        return false;
      }
    }
    if (step === 2) {
      if (!invitationData.date) invalids.push('date');
      if (!invitationData.time) invalids.push('time');
      if (!invitationData.location) invalids.push('location');
      
      if (invalids.length > 0) {
        setInvalidFields(invalids);
        setErrorMsg('Iltimos, sana va manzil ma\'lumotlarini kiritishni unutmang!');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(prev + 1, 6));
    }
  };
  const prevStep = () => {
    setErrorMsg('');
    setActiveStep((prev) => Math.max(prev - 1, 1));
  };

  const steps = [
    { id: 1, title: t('editor.steps.basic') || 'ASOSIY', icon: <Heart size={18} /> },
    { id: 2, title: t('editor.steps.timeLocation') || 'VAQT & JOY', icon: <Calendar size={18} /> },
    { id: 3, title: t('editor.steps.design') || 'DIZAYN', icon: <Type size={18} /> },
    { id: 4, title: t('editor.steps.finish') || 'YAKUNLASH', icon: <Share2 size={18} /> },
  ];

  const handleSaveOrder = async () => {
    if (!user) {
      alert("Tizimga kirishingiz so'raladi!");
      const authEvent = new CustomEvent('open-login-modal');
      window.dispatchEvent(authEvent);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: invitationData.templateId,
          groom_name: invitationData.groomName,
          bride_name: invitationData.brideName,
          wedding_date: invitationData.date,
          wedding_time: invitationData.time,
          location_name: invitationData.location,
          welcome_text: invitationData.welcomeText,
          music_url: invitationData.musicUrl,
          user_id: user.id // Tie to current user
        })
      });
      const data = await response.json();
      if (response.ok && data.uuid) {
        setOrderId(data.uuid);
        setActiveStep(5); // Move to Payment step
      } else {
        alert(data.error || 'Server xatosi yuz berdi');
      }
    } catch (err) {
      console.error(err);
      alert('Tarmoq xatosi, internetni tekshiring.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setPaymentLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/pay`, {
        method: 'POST'
      });
      const data = await response.json();
      if (response.ok) {
        setActiveStep(6); // Move to Success Step
      } else {
        alert(data.error || "To'lov amalga oshmadi");
      }
    } catch (err) {
      console.error(err);
      alert('Tarmoq xatosi');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`http://localhost:5173/v/${orderId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'white' }}>
      {/* Left Side: Form */}
      <div style={{
        flex: '1',
        padding: '6rem 3rem',
        borderRight: '1px solid #eee',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--primary-gold)', marginBottom: '1rem' }}>
            {steps.map((st) => (
              <div key={st.id} style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: `2px solid ${activeStep >= st.id ? '#064E3B' : '#eee'}`,
                display: activeStep > 4 && st.id < 4 ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: activeStep >= st.id ? '#064E3B' : 'transparent',
                color: activeStep >= st.id ? 'white' : '#999',
                transition: 'all 0.3s ease'
              }}>
                {st.icon}
              </div>
            ))}
          </div>
          <h2 style={{ fontSize: '2rem', color: 'var(--bg-dark)' }}>
            {activeStep <= 4 ? steps[activeStep - 1].title : activeStep === 5 ? t('editor.payment.simulate') || "TO'LOVNI AMALGA OSHIRISH" : t('editor.payment.ready') || "TAYYOR!"}
          </h2>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            style={{ flex: 1 }}
          >
            {activeStep === 1 && (
              <div style={formGroupStyle}>
                <div style={inputContainerStyle}>
                  <label style={labelStyle}>{t('editor.fields.groom') || 'KUYOV ISMI'}</label>
                  <input
                    name="groomName"
                    value={invitationData.groomName}
                    onChange={handleInputChange}
                    placeholder={t('editor.placeholders.groom') || "Masalan: Doniyor"}
                    style={{ ...inputStyle, border: invalidFields.includes('groomName') ? '1px solid #fca5a5' : '1px solid #ddd', outline: invalidFields.includes('groomName') ? 'none' : '' }}
                  />
                </div>
                <div style={inputContainerStyle}>
                  <label style={labelStyle}>{t('editor.fields.bride') || 'KELIN ISMI'}</label>
                  <input
                    name="brideName"
                    value={invitationData.brideName}
                    onChange={handleInputChange}
                    placeholder={t('editor.placeholders.bride') || "Masalan: Madina"}
                    style={{ ...inputStyle, border: invalidFields.includes('brideName') ? '1px solid #fca5a5' : '1px solid #ddd', outline: invalidFields.includes('brideName') ? 'none' : '' }}
                  />
                </div>
                <div style={inputContainerStyle}>
                  <label style={labelStyle}>{t('editor.fields.welcome') || 'XUSH KELIBSIZ MATNI'}</label>
                  <textarea
                    name="welcomeText"
                    value={invitationData.welcomeText}
                    onChange={handleInputChange}
                    placeholder={t('editor.placeholders.welcome') || "Mehmonlar uchun samimiy so'zlar..."}
                    style={{ ...inputStyle, height: '100px', resize: 'none' }}
                  />
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div style={formGroupStyle}>
                <div style={inputContainerStyle}>
                  <label style={labelStyle}>{t('editor.fields.date') || 'SANA (KUN.OY.YIL)'}</label>
                  <input
                    name="date"
                    value={invitationData.date}
                    onChange={handleInputChange}
                    placeholder={t('editor.placeholders.date') || "15.06.2026"}
                    style={{ ...inputStyle, border: invalidFields.includes('date') ? '1px solid #fca5a5' : '1px solid #ddd', outline: invalidFields.includes('date') ? 'none' : '' }}
                  />
                </div>
                <div style={inputContainerStyle}>
                  <label style={labelStyle}>{t('editor.fields.time') || 'VAQT (SOAT)'}</label>
                  <input
                    name="time"
                    value={invitationData.time}
                    onChange={handleInputChange}
                    placeholder={t('editor.placeholders.time') || "18:30"}
                    style={{ ...inputStyle, border: invalidFields.includes('time') ? '1px solid #fca5a5' : '1px solid #ddd', outline: invalidFields.includes('time') ? 'none' : '' }}
                  />
                </div>
                <div style={inputContainerStyle}>
                  <label style={labelStyle}>{t('editor.fields.location') || "TO'YXONA NOMI VA MANZILI"}</label>
                  <input
                    name="location"
                    value={invitationData.location}
                    onChange={handleInputChange}
                    placeholder={t('editor.placeholders.location') || "Hashamatli To'yxona Manzili"}
                    style={{ ...inputStyle, border: invalidFields.includes('location') ? '1px solid #fca5a5' : '1px solid #ddd', outline: invalidFields.includes('location') ? 'none' : '' }}
                  />
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div style={formGroupStyle}>
                <label style={labelStyle}>{t('editor.fields.changeTemplate') || "ANDOZANI O'ZGARTIRISH"}</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                  <div
                    onClick={() => updateInvitation({ templateId: 'luxury-gold' })}
                    style={{
                      padding: '1rem',
                      border: `2px solid ${invitationData.templateId === 'luxury-gold' ? 'var(--primary-gold)' : '#eee'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}>
                    {t('templates.luxury') || "Oltin Hashamat"}
                  </div>
                  <div
                    onClick={() => updateInvitation({ templateId: 'classic-minimalist' })}
                    style={{
                      padding: '1rem',
                      border: `2px solid ${invitationData.templateId === 'classic-minimalist' ? 'var(--primary-gold)' : '#eee'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}>
                    {t('templates.elegant') || "Tungi Nafosat"}
                  </div>
                </div>

                <div style={inputContainerStyle}>
                  <label style={labelStyle}>{t('editor.fields.music') || "MUSIQA HAVOLASI (YOUTUBE/CLOUD)"}</label>
                  <input
                    name="musicUrl"
                    value={invitationData.musicUrl}
                    onChange={handleInputChange}
                    placeholder={t('editor.placeholders.music') || "Optional music link"}
                    style={inputStyle}
                  />
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--primary-gold)' }}>{t('editor.payment.readyTitle') || "Tayyor bo'ldingizmi?"}</h3>
                <p style={{ color: '#666', marginBottom: '2rem' }}>{t('editor.payment.readyDesc') || "Barcha ma'lumotlar kiritildimi? Taklifnomangizni saqlang va to'lov sahifasiga o'ting."}</p>
                <button
                  onClick={handleSaveOrder}
                  disabled={loading}
                  className="luxury-button"
                  style={{
                    backgroundColor: 'var(--primary-gold)',
                    color: 'white',
                    width: '100%',
                    padding: '15px',
                    opacity: loading ? 0.7 : 1
                  }}>
                  {loading ? (t('editor.payment.saving') || 'SAQLANMOQDA...') : (t('editor.payment.saveBtn') || 'SAQLASH VA DAVOM ETISH')}
                </button>
              </div>
            )}

            {activeStep === 5 && (
              <div style={{ padding: '2rem', border: '1px solid #eee', borderRadius: '12px', backgroundColor: '#fafafa' }}>
                <h3 style={{ marginBottom: '2rem', textAlign: 'center', fontFamily: 'var(--font-serif)' }}>{t('editor.payment.simulateHeader') || "To'lov Tizimi Simulyatsiyasi"}</h3>

                <div style={{ padding: '1.5rem', border: '1px solid var(--primary-gold)', borderRadius: '8px', marginBottom: '2rem', backgroundColor: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                    <span style={{ fontWeight: '600', color: '#666' }}>{t('editor.payment.invoiceItem') || "Taklifnoma:"}</span>
                    <span style={{ fontWeight: '700' }}>{invitationData.templateId === 'luxury-gold' ? (t('templates.luxury') || 'Oltin Hashamat') : (t('templates.elegant') || 'Tungi Nafosat')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '600', color: '#666' }}>{t('editor.payment.total') || "Jami to'lov:"}</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--luxury-black)' }}>199,000 UZS</span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="luxury-button"
                  style={{
                    backgroundColor: 'var(--luxury-black)',
                    color: 'var(--primary-gold)',
                    width: '100%',
                    padding: '15px',
                    opacity: paymentLoading ? 0.7 : 1
                  }}>
                  {paymentLoading ? (t('editor.payment.processing') || "TO'LOV QILINMOQDA...") : (t('editor.payment.payBtn') || "TO'LOV QILING (SIMULATSIYA)")}
                </button>
              </div>
            )}

            {activeStep === 6 && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ display: 'inline-block', padding: '1rem', borderRadius: '50%', backgroundColor: '#E8F5E9', marginBottom: '1.5rem' }}>
                  <Heart size={48} color="#4CAF50" />
                </div>
                <h3 style={{ marginBottom: '1rem', color: '#064E3B', fontSize: '1.8rem', fontFamily: 'var(--font-serif)' }}>{t('editor.payment.successTitle') || "Payment is accepted!"}</h3>
                <p style={{ color: '#666', marginBottom: '2rem' }}>{t('editor.payment.successDesc') || "Here is your link for the online invitation. Thank you for choosing us."}</p>

                <div style={{ display: 'flex', border: '2px solid var(--primary-gold)', borderRadius: '8px', overflow: 'hidden', marginBottom: '2rem' }}>
                  <input
                    readOnly
                    value={`https://taklifnoma.vip/v/${orderId}`}
                    style={{ flex: 1, padding: '1rem', border: 'none', backgroundColor: '#fff8eb', outline: 'none', color: '#064E3B', fontSize: '0.9rem', fontWeight: 'bold', width: '100%' }}
                  />
                  <button
                    onClick={handleCopy}
                    style={{ padding: '0 1.5rem', backgroundColor: 'var(--primary-gold)', color: 'white', fontWeight: 'bold', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Copy size={16} /> {copied ? (t('editor.payment.copied') || 'COPIED!') : (t('editor.payment.copyBtn') || 'COPY')}
                  </button>
                </div>

                <a href={`/v/${orderId}`} target="_blank" rel="noreferrer" style={{ color: 'var(--luxury-black)', textDecoration: 'underline', fontWeight: '600' }}>{t('editor.payment.viewInv') || "Taklifnomani ko'rish"}</a>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', paddingTop: '2rem' }}>
          {activeStep <= 4 && (
            <button
              onClick={prevStep}
              disabled={activeStep === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: activeStep === 1 ? '#ccc' : 'var(--bg-dark)',
                fontWeight: '600',
                opacity: activeStep > 4 ? 0 : 1
              }}>
              <ChevronLeft size={20} /> {t('editor.nav.back') || 'ORQAGA'}
            </button>
          )}



          {activeStep < 4 && (
            <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              {errorMsg && <span style={{ color: 'red', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>{errorMsg}</span>}
              <button
                onClick={nextStep}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--primary-gold)',
                  fontWeight: '600'
                }}>
                {t('editor.nav.next') || 'DAVOM ETISH'} <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Mockup Preview */}
      <div style={{
        flex: '1.2',
        backgroundColor: '#f5f5f5',
        padding: '4rem 2rem',
        position: 'relative'
      }}>
        <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', padding: '8px 16px', borderRadius: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', fontSize: '0.8rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4CAF50', animation: 'pulse 2s infinite' }}></div>
              {t('editor.preview.title') || "Jonli Ko'rinish"}
            </div>
          </div>

          <div className="mobile-mockup" style={{ transform: 'scale(0.9)', transformOrigin: 'top center' }}>
            <div className="mockup-inner">
              <TemplateManager templateId={invitationData.templateId} data={invitationData} />
            </div>
          </div>

          <p style={{ marginTop: '0.5rem', color: '#999', fontSize: '0.7rem', letterSpacing: '2px', fontWeight: 600, textTransform: 'uppercase' }}>
            {t('footer.tagline') || 'Live Preview'}
          </p>
        </div>
      </div>

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.4; }
            50% { opacity: 1; }
            100% { opacity: 0.4; }
          }
        `}
      </style>
    </div>
  );
};

const formGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
};

const inputContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const labelStyle = {
  fontSize: '0.7rem',
  fontWeight: '700',
  letterSpacing: '2px',
  color: '#999',
};

const inputStyle = {
  padding: '1rem',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '1rem',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  transition: 'border-color 0.3s ease',
};

export default Editor;
