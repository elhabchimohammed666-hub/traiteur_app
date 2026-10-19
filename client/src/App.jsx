import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FloatingWhatsApp from './components/layout/FloatingWhatsApp';
import MobileStickyBar from './components/layout/MobileStickyBar';

// Public Pages
import Home from './pages/Home';
import Menus from './pages/Menus';
import Packages from './pages/Packages';
import Gallery from './pages/Gallery';
import Simulator from './pages/Simulator';
import Track from './pages/Track';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import NotFound from './pages/NotFound';

// Admin Pages
import Login from './pages/admin/Login';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import BookingsManage from './pages/admin/BookingsManage';
import EquipmentManage from './pages/admin/EquipmentManage';
import MenuManage from './pages/admin/MenuManage';
import CalendarView from './pages/admin/CalendarView';
import SettingsManage from './pages/admin/SettingsManage';

// Helper to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Public layout wrapper
function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingWhatsApp />
      <MobileStickyBar />
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-creme dark:bg-creme-dark text-anthracite dark:text-[#F3ECDD]">
          <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-sable-dark border border-safran shadow-xl text-center space-y-4">
            <h2 className="text-xl font-bold font-serif text-zellige dark:text-zellige-accent">Une erreur inattendue est survenue</h2>
            <p className="text-xs text-anthracite/70 dark:text-[#F3ECDD]/70">{this.state.error?.message || "Erreur d'affichage"}</p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
              className="px-5 py-2.5 rounded-xl bg-zellige text-white text-xs font-semibold hover:bg-zellige-dark transition"
            >
              Recharger l'accueil
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />
        <Route
          path="/menus"
          element={
            <PublicLayout>
              <Menus />
            </PublicLayout>
          }
        />
        <Route
          path="/formules"
          element={
            <PublicLayout>
              <Packages />
            </PublicLayout>
          }
        />
        <Route
          path="/galerie"
          element={
            <PublicLayout>
              <Gallery />
            </PublicLayout>
          }
        />
        <Route
          path="/reserver"
          element={
            <PublicLayout>
              <Simulator />
            </PublicLayout>
          }
        />
        <Route
          path="/suivi"
          element={
            <PublicLayout>
              <Track />
            </PublicLayout>
          }
        />
        <Route
          path="/a-propos"
          element={
            <PublicLayout>
              <About />
            </PublicLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <PublicLayout>
              <Contact />
            </PublicLayout>
          }
        />
        <Route
          path="/faq"
          element={
            <PublicLayout>
              <FAQ />
            </PublicLayout>
          }
        />

        {/* Admin Login */}
        <Route path="/admin/login" element={<Login />} />

        {/* Admin Dashboard & Management Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="reservations" element={<BookingsManage />} />
          <Route path="materiel" element={<EquipmentManage />} />
          <Route path="menus" element={<MenuManage />} />
          <Route path="calendrier" element={<CalendarView />} />
          <Route path="parametres" element={<SettingsManage />} />
        </Route>

        {/* 404 Fallback */}
        <Route
          path="*"
          element={
            <PublicLayout>
              <NotFound />
            </PublicLayout>
          }
        />
      </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
