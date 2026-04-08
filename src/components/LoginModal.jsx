import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail } from 'lucide-react';

const LoginModal = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      login(email);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: '#FFFDF5', 
        padding: '3rem 2.5rem', 
        borderRadius: '4px', 
        width: '90%', 
        maxWidth: '420px',
        position: 'relative',
        boxShadow: '0 25px 60px rgba(197, 160, 89, 0.15)',
        border: '1px solid rgba(197, 160, 89, 0.2)'
      }}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#C5A059' }}
        >
          <X size={20} />
        </button>
        
        <h2 style={{ fontSize: '1.75rem', fontFamily: '"Playfair Display", serif', fontWeight: 500, marginBottom: '0.75rem', textAlign: 'center', color: '#2D2D2D' }}>
          Hush Kelibsiz!
        </h2>
        <p style={{ textAlign: 'center', color: '#666666', fontSize: '0.9rem', marginBottom: '2.5rem', fontFamily: '"Montserrat", sans-serif' }}>
          Taklifnoma yaratish va ularni boshqarish uchun sahifangizga kiring.
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#C5A059', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'block', fontFamily: '"Montserrat", sans-serif' }}>Elektron Pochta</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(197, 160, 89, 0.2)', borderRadius: '4px', padding: '0.75rem 1rem', background: 'white' }}>
               <Mail size={16} color="#C5A059" style={{ marginRight: '0.75rem' }} />
               <input 
                 type="email" 
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
                 placeholder="Sizning pochtangiz"
                 style={{ border: 'none', outline: 'none', width: '100%', padding: '0.25rem 0', fontSize: '0.9rem', fontFamily: '"Montserrat", sans-serif', color: '#2D2D2D' }}
               />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#C5A059', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'block', fontFamily: '"Montserrat", sans-serif' }}>Parol</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(197, 160, 89, 0.2)', borderRadius: '4px', padding: '0.75rem 1rem', background: 'white' }}>
               <Lock size={16} color="#C5A059" style={{ marginRight: '0.75rem' }} />
               <input 
                 type="password" 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
                 placeholder="Sizning parolingiz"
                 style={{ border: 'none', outline: 'none', width: '100%', padding: '0.25rem 0', fontSize: '0.9rem', fontFamily: '"Montserrat", sans-serif', color: '#2D2D2D' }}
               />
            </div>
          </div>
          <button 
            type="submit" 
            className="luxury-button"
            style={{ 
              marginTop: '1.5rem', width: '100%',
              fontFamily: '"Montserrat", sans-serif'
            }}
          >
            TIZIMGA KIRISH
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
