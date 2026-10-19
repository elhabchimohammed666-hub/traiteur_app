import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import {
  LayoutDashboard,
  CalendarDays,
  Boxes,
  UtensilsCrossed,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Sun,
  Moon
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logoutUser, theme, toggleTheme } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Protected route check
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const menuItems = [
    { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
    { to: '/admin/reservations', label: 'Réservations & Devis', icon: CalendarDays },
    { to: '/admin/materiel', label: 'Stock & Matériel', icon: Boxes },
    { to: '/admin/menus', label: 'Menus & Prestations', icon: UtensilsCrossed },
    { to: '/admin/calendrier', label: 'Planning & Calendrier', icon: Calendar },
    { to: '/admin/parametres', label: 'Paramètres & Règles', icon: Settings }
  ];

  const handleLogout = async () => {
    await logoutUser();
    navigate('/admin/login');
  };

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <div className="min-h-screen bg-creme dark:bg-creme-dark flex flex-col md:flex-row text-anthracite dark:text-[#F3ECDD]">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-anthracite text-[#F3ECDD] border-r border-safran/20 shrink-0">
        
        {/* Brand */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-lg bg-zellige flex items-center justify-center border border-safran text-safran">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="font-serif font-bold tracking-wider text-safran text-lg block leading-none">
              ELHABCHI
            </span>
            <span className="text-[10px] uppercase font-semibold text-white/50 tracking-widest block mt-1">
              Back-Office Pro
            </span>
          </div>
        </div>

        {/* User Badge */}
        <div className="p-4 mx-4 my-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-safran/20 text-safran flex items-center justify-center text-xs font-bold">
              {user.name?.[0] || 'A'}
            </div>
            <div>
              <span className="text-xs font-semibold text-white block leading-tight">
                {user.name}
              </span>
              <span className="text-[10px] text-safran uppercase tracking-wider block">
                {user.role === 'admin' ? 'Administrateur' : 'Équipe Staff'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 py-2">
          {menuItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-medium transition ${
                  active
                    ? 'bg-zellige text-white font-semibold shadow border border-safran/30'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className={`w-4 h-4 ${active ? 'text-safran' : 'text-white/60'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-white/70 hover:bg-white/5 hover:text-white transition"
          >
            <span>Voir le site public</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-anthracite text-[#F3ECDD] p-4 flex items-center justify-between border-b border-safran/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-zellige flex items-center justify-center text-safran border border-safran">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-serif font-bold text-safran text-sm">Elhabchi Admin</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded text-white/80 hover:bg-white/10"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-safran" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-anthracite text-[#F3ECDD] p-4 space-y-2 border-b border-safran/20">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                isActive(item) ? 'bg-zellige text-white' : 'text-white/70 hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4 text-safran" />
              <span>{item.label}</span>
            </Link>
          ))}
          <div className="pt-2 border-t border-white/10 flex justify-between items-center">
            <Link to="/" className="text-xs text-safran underline">
              Voir le site public
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-red-400 font-semibold"
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar on desktop */}
        <header className="hidden md:flex h-16 bg-white dark:bg-sable-dark border-b border-safran/20 items-center justify-between px-8">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-safran">
              Espace Administrateur
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-anthracite/80 dark:text-[#F3ECDD]/80 hover:bg-safran/10 transition"
              title={theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-safran" /> : <Moon className="w-4 h-4 text-zellige" />}
            </button>

            <div className="h-6 w-px bg-safran/20"></div>

            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-anthracite/70 dark:text-[#F3ECDD]/70">Système opérationnel</span>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
