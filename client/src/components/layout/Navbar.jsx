import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { Menu, X, Sun, Moon, Globe, Phone, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { lang, setLang, theme, toggleTheme, t, user } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/menus', label: t('nav.menus') },
    { to: '/formules', label: t('nav.packages') },
    { to: '/galerie', label: t('nav.gallery') },
    { to: '/reserver', label: t('nav.simulator') },
    { to: '/suivi', label: t('nav.track') },
    { to: '/contact', label: t('nav.contact') }
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-creme/90 dark:bg-creme-dark/90 border-b border-safran/20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo with Moroccan geometric touch */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-lg bg-zellige flex items-center justify-center shadow-md border border-safran/40 group-hover:scale-105 transition-transform">
              <svg className="w-7 h-7 text-safran" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
                <rect x="26" y="26" width="48" height="48" rx="2" />
                <rect x="26" y="26" width="48" height="48" rx="2" transform="rotate(45 50 50)" />
                <circle cx="50" cy="50" r="10" fill="currentColor" />
              </svg>
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-wider text-zellige dark:text-zellige-accent block leading-none">
                ELHABCHI
              </span>
              <span className="text-[11px] font-semibold tracking-widest uppercase text-safran block mt-1">
                Traiteur d’Apparat
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive(item.to)
                    ? 'text-zellige dark:text-safran font-semibold bg-safran/10'
                    : 'text-anthracite/80 dark:text-[#F3ECDD]/80 hover:text-zellige dark:hover:text-safran hover:bg-safran/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Action buttons (Theme, Lang, CTA) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-sable/50 dark:bg-sable-dark p-1 rounded-lg border border-safran/20 text-xs font-semibold">
              <button
                onClick={() => setLang('fr')}
                className={`px-2 py-1 rounded transition-colors ${lang === 'fr' ? 'bg-zellige text-white' : 'text-anthracite/70 dark:text-[#F3ECDD]/70'}`}
              >
                FR
              </button>
              <button
                onClick={() => setLang('ar')}
                className={`px-2 py-1 rounded transition-colors ${lang === 'ar' ? 'bg-zellige text-white' : 'text-anthracite/70 dark:text-[#F3ECDD]/70'}`}
              >
                عربية
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded transition-colors ${lang === 'en' ? 'bg-zellige text-white' : 'text-anthracite/70 dark:text-[#F3ECDD]/70'}`}
              >
                EN
              </button>
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-anthracite/80 dark:text-[#F3ECDD]/80 hover:bg-safran/10 transition-colors"
              title={theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-safran" /> : <Moon className="w-5 h-5 text-zellige" />}
            </button>

            {/* Admin or CTA */}
            {user ? (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zellige text-white text-xs font-semibold shadow hover:bg-zellige-dark transition"
              >
                <ShieldCheck className="w-4 h-4 text-safran" />
                Dashboard
              </Link>
            ) : (
              <Link
                to="/reserver"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zellige text-white text-sm font-semibold shadow hover:bg-zellige-dark transition-all transform hover:-translate-y-0.5 border border-safran/30"
              >
                <span>{t('nav.simulator')}</span>
              </Link>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-anthracite dark:text-[#F3ECDD]"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-safran" /> : <Moon className="w-5 h-5 text-zellige" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-anthracite dark:text-[#F3ECDD] hover:bg-safran/10"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden border-b border-safran/20 bg-creme dark:bg-creme-dark px-4 pt-2 pb-6 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-safran/10">
            <span className="text-xs font-medium text-anthracite/60 dark:text-white/60">Langue :</span>
            <div className="flex gap-1">
              {['fr', 'ar', 'en'].map((l) => (
                <button
                  key={l}
                  onClick={() => { setLang(l); }}
                  className={`px-3 py-1 rounded text-xs font-semibold uppercase ${lang === l ? 'bg-zellige text-white' : 'bg-sable/40 dark:bg-sable-dark'}`}
                >
                  {l === 'ar' ? 'عربية' : l}
                </button>
              ))}
            </div>
          </div>
          {navLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-base font-medium ${
                isActive(item.to)
                  ? 'bg-safran/15 text-zellige dark:text-safran font-semibold'
                  : 'text-anthracite dark:text-[#F3ECDD] hover:bg-safran/10'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2">
            <Link
              to="/reserver"
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-zellige text-white text-base font-semibold shadow"
            >
              {t('nav.simulator')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
