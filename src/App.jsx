import React from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard } from 'lucide-react'
import Home from './pages/Home'
import Editor from './pages/Editor'
import InvitationView from './pages/InvitationView'
import Admin from './pages/Admin'
import Auth from './pages/Auth'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Navbar from './components/Navbar'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { InvitationProvider } from './context/InvitationContext'

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen bg-white" />; // Loader placeholder

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const FloatingDashboardBtn = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user || ['/create', '/login', '/DI-2406', '/dashboard'].includes(location.pathname)) {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/dashboard')}
      className="fixed bottom-8 right-8 z-[150] shadow-2xl flex items-center gap-3 bg-emerald-950 text-white px-6 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-gold-500 transition-all duration-500 hover:-translate-y-1 hover:shadow-emerald-900/40"
    >
      <LayoutDashboard size={18} />
      See Your Results
    </button>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <InvitationProvider>
          <div className="App">
            <Navbar />
            <FloatingDashboardBtn />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              <Route path="/create" element={
                <ProtectedRoute>
                  <Editor />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="/DI-2406" element={
                <ProtectedRoute adminOnly={true}>
                  <Admin />
                </ProtectedRoute>
              } />

              <Route path="/v/:id" element={<InvitationView />} />
            </Routes>
          </div>
        </InvitationProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
