import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Clock, Users, Heart, Sparkles, ChefHat, ShieldCheck, ArrowRight } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold tracking-widest uppercase text-safran block">
          L'Héritage Culinaire
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-zellige dark:text-zellige-accent">
          La Maison Elhabchi Traiteur
        </h1>
        <p className="text-sm sm:text-base text-anthracite/70 dark:text-[#F3ECDD]/70 font-light">
          Plus d'un quart de siècle consacré à perpétuer la haute gastronomie marocaine et l'art impérial de la réception.
        </p>
      </div>

      {/* Story Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-safran/10 text-safran text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Depuis 1999</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zellige dark:text-zellige-accent leading-snug">
            Une Passion Impériale pour le Goût et l'Apparat
          </h2>

          <p className="text-sm sm:text-base text-anthracite/80 dark:text-[#F3ECDD]/80 leading-relaxed">
            Fondée par des passionnés des traditions d'hospitalité du Royaume, la maison Elhabchi s'est imposée comme la référence des réceptions princières à Casablanca, Rabat et Marrakech.
          </p>

          <p className="text-sm sm:text-base text-anthracite/80 dark:text-[#F3ECDD]/80 leading-relaxed">
            Notre philosophie repose sur le respect scrupuleux des recettes ancestrales marocaines – pastillas au pigeon subtilement parfumées à la cannelle et fleur d'oranger, tajines aux pruneaux et amandes grillées, méchouis fondants à souhait – associées à des techniques de dressage contemporaines et un service en livrée d'exception.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-safran/20">
            <div>
              <span className="font-serif text-3xl font-bold text-safran block">25+</span>
              <span className="text-xs text-anthracite/60 dark:text-[#F3ECDD]/60">Années d'excellence</span>
            </div>
            <div>
              <span className="font-serif text-3xl font-bold text-safran block">1,500+</span>
              <span className="text-xs text-anthracite/60 dark:text-[#F3ECDD]/60">Événements célébrés</span>
            </div>
            <div>
              <span className="font-serif text-3xl font-bold text-safran block">100%</span>
              <span className="text-xs text-anthracite/60 dark:text-[#F3ECDD]/60">Fait maison & frais</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-safran/30">
            <img
              src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&fit=crop"
              alt="Art culinaire marocain"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Subtle badge */}
          <div className="absolute -bottom-6 -left-6 bg-zellige text-white p-5 rounded-2xl shadow-xl border border-safran hidden sm:block">
            <span className="font-serif text-lg font-bold block text-safran">Haute Gastronomie</span>
            <span className="text-xs text-[#F3ECDD]/80">Saveurs authentiques du terroir marocain</span>
          </div>
        </div>
      </div>

      {/* Values Pillars */}
      <div className="space-y-8 pt-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-safran block">
            Nos Engagements
          </span>
          <h3 className="font-serif text-3xl font-bold text-zellige dark:text-zellige-accent">
            Les Quatre Piliers d'Elhabchi Traiteur
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: ChefHat,
              title: "Chefs Étoilés & Dadas",
              desc: "L'alliance unique du savoir-faire des dadas fassies et de la rigueur des grands chefs de banquet."
            },
            {
              icon: Award,
              title: "Ingrédients d'Exception",
              desc: "Safran pur de Taliouine, huile d'olive de terroir, agneaux de pâturage et amandes locales de premier choix."
            },
            {
              icon: Sparkles,
              title: "Art de la Table Royal",
              desc: "Tentes caïdales ornées, argenterie étincelante, théières martelées et porcelaine fine dorée."
            },
            {
              icon: ShieldCheck,
              title: "Sérénité & Rigueur",
              desc: "Coordination millimétrée le jour J, maîtres d'hôtel en tenue d'apparat et respect strict de vos horaires."
            }
          ].map((pillar, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-sable-dark border border-safran/20 shadow-md space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-safran/10 text-safran flex items-center justify-center">
                <pillar.icon className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg font-bold text-zellige dark:text-zellige-accent">
                {pillar.title}
              </h4>
              <p className="text-xs text-anthracite/70 dark:text-[#F3ECDD]/70 leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Direct CTA */}
      <div className="bg-anthracite text-[#F3ECDD] rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden border border-safran/40">
        <h3 className="font-serif text-3xl sm:text-4xl font-bold text-safran">
          Écrivons Ensemble la Magie de Votre Célébration
        </h3>
        <p className="text-sm text-[#F3ECDD]/80 max-w-xl mx-auto">
          Contactez notre équipe de maîtres d'hôtel pour convenir d'une dégustation privée ou d'une visite de repérage.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/reserver"
            className="px-6 py-3.5 rounded-xl bg-zellige text-white text-sm font-semibold hover:bg-zellige-dark transition shadow"
          >
            Composer mon événement
          </Link>
          <Link
            to="/contact"
            className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition"
          >
            Nous contacter
          </Link>
        </div>
      </div>
    </div>
  );
}
