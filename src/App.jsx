import React from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard } from 'lucide-react'
import { motion } from 'framer-motion'
import Home from './pages/Home'
import Editor from './pages/Editor'
import InvitationView from './pages/InvitationView'
import Admin from './pages/Admin'
import Auth from './pages/Auth'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import TemplatePreview from './pages/TemplatePreview'
import Navbar from './components/Navbar'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const FloatingDashboardBtn = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [previewOpen, setPreviewOpen] = React.useState(false);

  // Only show on the homepage '/' not on /templates, /create, admin, etc.
  const isHomePage = location.pathname === '/';
  const isAdminPage = location.pathname === '/DI-2406';

  // Watch for preview-open class on body (set by Templates.jsx)
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setPreviewOpen(document.body.classList.contains('preview-open'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (!user || !isHomePage || previewOpen || isAdminPage) {
    return null;
  }

  return (
    <motion.button
      onClick={() => { window.scrollTo(0, 0); navigate('/dashboard'); }}
      whileHover={{ scale: 1.03, boxShadow: "0 0 24px rgba(16,185,129,0.28)" }}
      whileTap={{ scale: 0.98, boxShadow: "0 0 30px 5px rgba(16, 185, 129, 0.6)" }}
      className="luxury-button fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[150] shadow-2xl flex items-center gap-1.5 md:gap-3 !h-10 md:!h-12 !px-3 md:!px-6 !py-2 md:!py-4 rounded-full font-bold uppercase tracking-[1.5px] md:tracking-widest !text-[8px] md:!text-[10px] transition-colors duration-150"
    >
      <LayoutDashboard size={18} />
      {t('dashboard.floatingCta')}
    </motion.button>
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
              <Route element={<Auth />}>
                <Route path="/login" element={null} />
                <Route path="/signup" element={null} />
              </Route>
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/create" element={<Navigate to="/#templates" replace />} />
              <Route path="/templates/preview/:templateId" element={<TemplatePreview />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />

              <Route path="/create/details" element={
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
              <Route path="/admin" element={
                <ProtectedRoute adminOnly={true}>
                  <Navigate to="/DI-2406" replace />
                </ProtectedRoute>
              } />

              <Route path="/v/*" element={<InvitationView />} />
              <Route path="/i/*" element={<InvitationView />} />
              <Route path="/:slugPrefix/:slugName" element={<InvitationView />} />
              <Route path="/:id" element={<InvitationView />} />
            </Routes>
          </div>
        </InvitationProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
