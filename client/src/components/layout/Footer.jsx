import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { Phone, Mail, MapPin, Instagram, Facebook, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const { t } = useApp();

  return (
    <footer className="bg-anthracite text-[#F3ECDD] pt-16 pb-24 lg:pb-12 border-t-4 border-safran relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-zellige flex items-center justify-center border border-safran">
                <span className="font-serif font-bold text-safran text-lg">E</span>
              </div>
              <span className="font-serif text-2xl font-bold tracking-wider text-safran">
                ELHABCHI
              </span>
            </div>
            <p className="text-sm text-[#F3ECDD]/70 leading-relaxed">
              Maison de haute gastronomie et traiteur marocain d’apparat. Mariages princiers, réceptions d'exception et art de la table impérial depuis plus de 25 ans.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/5 hover:bg-safran/20 flex items-center justify-center text-safran transition">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/5 hover:bg-safran/20 flex items-center justify-center text-safran transition">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-widest uppercase text-safran">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-[#F3ECDD]/80">
              <li><Link to="/menus" className="hover:text-safran transition">Nos Menus Traditionnels & Modernes</Link></li>
              <li><Link to="/formules" className="hover:text-safran transition">Formules Clés en Main</Link></li>
              <li><Link to="/reserver" className="hover:text-safran transition">Simulateur de Devis en Ligne</Link></li>
              <li><Link to="/galerie" className="hover:text-safran transition">Galerie de Réalisations</Link></li>
              <li><Link to="/suivi" className="hover:text-safran transition">Suivi de Devis & Réservation</Link></li>
              <li><Link to="/faq" className="hover:text-safran transition">Foire Aux Questions (FAQ)</Link></li>
            </ul>
          </div>

          {/* Contact details */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-widest uppercase text-safran">
              Contact & Réception
            </h4>
            <ul className="space-y-3 text-sm text-[#F3ECDD]/80">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-safran shrink-0 mt-0.5" />
                <span>Angle Bd d’Anfa & Rue Moulay Youssef, Casablanca, Maroc</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-safran shrink-0" />
                <a href="tel:+212705782737" className="hover:text-safran transition">+212 705 782 737</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-safran shrink-0" />
                <a href="mailto:contact@elhabchitraiteur.ma" className="hover:text-safran transition">contact@elhabchitraiteur.ma</a>
              </li>
              <li className="text-xs text-[#F3ECDD]/60">
                Horaires d'accueil : 7j/7 de 09h00 à 21h00
              </li>
            </ul>
          </div>

          {/* Trust & Regulations */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-widest uppercase text-safran">
              Confiance & Sécurité
            </h4>
            <p className="text-xs text-[#F3ECDD]/70 leading-relaxed">
              Données traitées conformément à la Loi marocaine 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel (CNDP).
            </p>
            <div className="pt-2">
              <Link to="/admin/login" className="inline-flex items-center gap-2 text-xs text-safran hover:underline">
                <ShieldCheck className="w-3.5 h-3.5" />
                Accès Collaborateurs & Administration
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#F3ECDD]/50 gap-4">
          <p>© {new Date().getFullYear()} Elhabchi Traiteur. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link to="/mentions-legales" className="hover:text-safran transition">Mentions Légales & Confidentialité</Link>
            <Link to="/a-propos" className="hover:text-safran transition">À Propos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
