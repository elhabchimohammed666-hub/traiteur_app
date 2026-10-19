import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsApp() {
  const whatsappUrl = 'https://wa.me/212705782737?text=' + encodeURIComponent('Bonjour Elhabchi Traiteur, je souhaite des informations pour organiser un événement.');

  return (
    <aside aria-label="Support WhatsApp" className="fixed bottom-20 md:bottom-6 right-6 z-40 hidden sm:block">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-white/20"
        title="Discuter directement sur WhatsApp"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
        <span className="font-semibold text-sm tracking-wide hidden lg:inline">
          WhatsApp 0705782737
        </span>
      </a>
    </aside>
  );
}
