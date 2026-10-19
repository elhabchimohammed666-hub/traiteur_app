import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, CalendarPlus } from 'lucide-react';
import { useApp } from '../../store/AppContext';

export default function MobileStickyBar() {
  const location = useLocation();
  const { t } = useApp();

  // Hide on simulator page to allow full simulator sticky bar visibility
  if (location.pathname === '/reserver') return null;

  const whatsappUrl = 'https://wa.me/212705782737?text=' + encodeURIComponent('Bonjour Elhabchi Traiteur, je souhaite des renseignements pour un événement.');

  return (
    <aside aria-label="Actions rapides mobiles" className="fixed bottom-0 inset-x-0 z-40 bg-creme/95 dark:bg-creme-dark/95 backdrop-blur-md border-t border-safran/30 p-2.5 sm:hidden shadow-lg">
      <div className="grid grid-cols-2 gap-2">
        <Link
          to="/reserver"
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-zellige text-white text-xs font-bold tracking-wide shadow"
        >
          <CalendarPlus className="w-4 h-4 text-safran" />
          <span>Réserver</span>
        </Link>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-[#25D366] text-white text-xs font-bold tracking-wide shadow"
        >
          <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
          <span>WhatsApp</span>
        </a>
      </div>
    </aside>
  );
}
