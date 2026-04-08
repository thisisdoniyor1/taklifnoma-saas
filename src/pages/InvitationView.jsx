import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TemplateManager from '../components/TemplateManager';
import confetti from 'canvas-confetti';

const InvitationView = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock fetching data based on ID
  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const res = await fetch(`http://localhost:8100/api/orders/${id}`);
        if (!res.ok) {
          throw new Error("Taklifnoma topilmadi yoki to'lanmagan");
        }
        const backendData = await res.json();
        
        // Map backend snake_case to frontend camelCase
        setData({
          templateId: backendData.template_id,
          groomName: backendData.groom_name,
          brideName: backendData.bride_name,
          date: backendData.wedding_date,
          time: backendData.wedding_time,
          location: backendData.location_name,
          welcomeText: backendData.welcome_text,
          musicUrl: backendData.music_url
        });
        
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C2A36B', '#8E7345', '#FFFFFF']
        });
      } catch (err) {
        console.error(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

        fetchInvitation();
        // Increment view count
        fetch(`http://localhost:8100/api/orders/${id}/view`, { method: 'POST' }).catch(console.error);
      }, [id]);

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'var(--bg-dark)',
        color: 'var(--primary-gold)'
      }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '5px solid var(--primary-gold)', 
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '2rem', fontFamily: 'var(--font-serif)', fontSize: '1.2rem', letterSpacing: '2px' }}>
          TAKLIFNOMA YUKLANMOQDA...
        </p>
        <style>
          {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
        </style>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--luxury-white)' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--luxury-black)', marginBottom: '1rem' }}>Taklifnoma topilmadi</h2>
        <p style={{ color: '#666' }}>Ushbu havola yaroqsiz yoki taklifnoma o'chirilgan bo'lishi mumkin.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '450px', margin: '0 auto', boxShadow: '0 0 50px rgba(0,0,0,0.1)' }}>
      <TemplateManager templateId={data.templateId} data={data} />
    </div>
  );
};

export default InvitationView;
