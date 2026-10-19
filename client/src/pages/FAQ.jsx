import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle } from 'lucide-react';

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: "Quel est le préavis minimum pour réserver une prestation Elhabchi Traiteur ?",
      a: "Pour garantir la fraîcheur optimale des produits et la disponibilité de nos tentes et de notre brigade, nous recommandons un préavis minimum de 7 jours pour toute commande en ligne. Pour les demandes urgentes (moins de 7 jours), contactez directement notre équipe par WhatsApp ou téléphone afin d'étudier la faisabilité."
    },
    {
      q: "Comment fonctionne l'acompte et le paiement de la prestation ?",
      a: "Pour bloquer définitivement votre date et le matériel nécessaire, un acompte de 30% du montant total estimé est requis lors de la validation du devis. Le solde restant est réglé soit par tranches préalables, soit le jour même de l'événement avant le lancement du service."
    },
    {
      q: "Proposez-vous une séance de dégustation avant le mariage ?",
      a: "Absolument. Pour les mariages et réceptions de plus de 100 personnes, nous organisons une séance de dégustation pour les mariés et leurs parents au sein de notre atelier culinaire à Casablanca afin de peaufiner les saveurs, le dressage et le choix des douceurs."
    },
    {
      q: "Quelles sont les villes et régions couvertes par vos équipes ?",
      a: "Nous intervenons principalement dans le Grand Casablanca, Rabat, Marrakech, Tanger, Fès, El Jadida et Agadir. Nous pouvons également nous déplacer dans d'autres régions du Royaume ou dans des domaines privés reculés avec notre cuisine mobile autonome."
    },
    {
      q: "La vaisselle, les tentes et le personnel sont-ils inclus dans les formules ?",
      a: "Nos formules 'Clés en Main' intègrent la vaisselle fine, les couverts dorés, le nappage royal, ainsi que les maîtres d'hôtel en jabador traditionnel. Vous pouvez également louer du matériel complémentaire (tentes caïdales, trônes de mariés, salons marocains) via notre simulateur."
    },
    {
      q: "Comment suivre l'avancement de mon devis ou de ma réservation ?",
      a: "Dès l'envoi de votre demande via le simulateur, vous recevez un code unique de suivi (ex: ELH-2026-00042). Vous pouvez à tout moment vous rendre sur la page 'Suivi de Devis' avec votre numéro de téléphone pour voir l'état d'avancement, accepter le devis en ligne ou télécharger votre devis officiel au format PDF."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-semibold tracking-widest uppercase text-safran block">
          Réponses à Vos Questions
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-zellige dark:text-zellige-accent">
          Foire Aux Questions
        </h1>
        <p className="text-sm text-anthracite/70 dark:text-[#F3ECDD]/70 max-w-xl mx-auto">
          Tout ce qu'il faut savoir sur l'organisation de vos réceptions, nos formules d'apparat et les conditions de réservation.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-safran/30 bg-white dark:bg-sable-dark overflow-hidden shadow-sm transition"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif text-base sm:text-lg font-bold text-zellige dark:text-zellige-accent"
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-safran shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-safran shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-anthracite/80 dark:text-[#F3ECDD]/80 leading-relaxed border-t border-safran/10">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still questions box */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-zellige/10 via-sable/20 to-zellige/10 border border-safran/30 text-center space-y-4">
        <h3 className="font-serif text-xl font-bold text-zellige dark:text-zellige-accent">
          Vous avez une question spécifique ?
        </h3>
        <p className="text-xs sm:text-sm text-anthracite/70 dark:text-[#F3ECDD]/70 max-w-md mx-auto">
          Notre équipe est à votre disposition 7j/7 pour vous renseigner et vous orienter.
        </p>
        <a
          href="https://wa.me/212705782737"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold shadow transition"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>Contacter notre conseiller WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
