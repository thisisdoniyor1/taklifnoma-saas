import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/db';
import TemplateManager from '../components/TemplateManager';
import { ErrorBoundary } from '../components/ErrorBoundary';
import confetti from 'canvas-confetti';

const InvitationView = () => {
  const params = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Initializing...');
  const invitationRef = useMemo(() => {
    const wildcardId = String(params['*'] || '').trim();
    const directId = String(params.id || '').trim();
    const nestedId = params.slugPrefix && params.slugName
      ? `${String(params.slugPrefix).trim()}/${String(params.slugName).trim()}`
      : '';
    return wildcardId || nestedId || directId;
  }, [params]);

  useEffect(() => {
    if (!invitationRef) {
      setData(null);
      setLoading(false);
      setStatus('Xatolik: Taklifnoma topilmadi');
      return undefined;
    }

    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        setStatus("Xatolik: Tarmoq vaqti tugadi");
        setLoading(false);
      }
    }, 10000);

    const fetchInvitationData = async () => {
      try {
        const cleanId = invitationRef;
        setStatus(`Qidirilmoqda...`); // Searching...

        // Parallel fetch for better performance
        const [backendData, rsvpData] = await Promise.all([
          db.getOrder(cleanId),
          db.getRSVPs(cleanId)
        ]);

        if (!backendData) {
          throw new Error("Taklifnoma topilmadi");
        }

        setStatus(`Ma'lumotlar yuklanmoqda...`);

        let rsvps = Array.isArray(rsvpData) ? rsvpData : [];

        setStatus(`Tayyorlanmoqda...`);

        const transformedData = {
          templateId: backendData.template_id,
          groomName: backendData.groom_name,
          brideName: backendData.bride_name,
          date: backendData.wedding_date,
          time: backendData.wedding_time,
          location: backendData.location_name,
          locationUrl: backendData.location_url || `https://maps.google.com/?q=${encodeURIComponent(backendData.location_name || '')}`,
          welcomeText: backendData.welcome_text,
          musicUrl: backendData.music_url,
          image_url: backendData.image_url,
          rsvps
        };

        if (!isMounted) return;

        setData(transformedData);

        // Background view increment
        db.incrementView(cleanId).catch(() => { });

        setLoading(false);
        clearTimeout(timeoutId);

        // Confetti after render
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#C2A36B', '#8E7345', '#FFFFFF']
          });
        }, 500);

      } catch (err) {
        if (!isMounted) return;
        const errorMsg = err.name === 'AbortError' ? "Tarmoq vaqti tugadi" : err.message;
        setStatus(`Xatolik: ${errorMsg}`);
        setData(null);
        setLoading(false);
        clearTimeout(timeoutId);
      }
    };

    fetchInvitationData();
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [invitationRef]);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a1a14', // bg-dark emerald
        color: '#c9a84c' // primary gold
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #c9a84c33',
          borderTopColor: '#c9a84c',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <p style={{ fontFamily: 'serif', fontSize: '1.1rem', letterSpacing: '3px', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            TAKLIFNOMA YUKLANMOQDA
          </p>
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', tracking: '0.2em', opacity: 0.6 }}>
            {status}
          </p>
        </div>
        <style>
          {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
        </style>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: '20px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'serif', color: '#1a1a1a', marginBottom: '1rem' }}>Taklifnoma topilmadi</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          {status.includes('Xatolik') ? status : "Ushbu havola yaroqsiz yoki taklifnoma o'chirilgan bo'lishi mumkin."}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#064e3b',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Qaytadan urinib ko'rish
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', margin: '0 auto', overflowX: 'hidden' }}>
      <ErrorBoundary>
        <TemplateManager templateId={data.templateId} data={data} />
      </ErrorBoundary>
    </div>
  );
};

export default InvitationView;
