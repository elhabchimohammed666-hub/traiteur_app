import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-safran/10 flex items-center justify-center text-safran border-2 border-safran">
          <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '20s' }} />
        </div>

        <div className="space-y-2">
          <span className="font-serif text-6xl font-bold text-safran block">404</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zellige dark:text-zellige-accent">
            Page Introuvable
          </h1>
          <p className="text-xs sm:text-sm text-anthracite/70 dark:text-[#F3ECDD]/70">
            La page que vous recherchez semble introuvable ou a été déplacée dans nos salons d'apparat.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zellige text-white text-xs font-semibold shadow hover:bg-zellige-dark transition"
          >
            <Home className="w-4 h-4 text-safran" />
            <span>Retour à l'accueil</span>
          </Link>
          <Link
            to="/reserver"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-safran text-anthracite text-xs font-semibold hover:bg-safran-light transition"
          >
            <span>Simuler un devis</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
