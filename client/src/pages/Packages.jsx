import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { api } from '../api/client';
import { Check, Users, Sparkles, UtensilsCrossed, ArrowRight } from 'lucide-react';

export default function Packages() {
  const { lang, updateSimulator } = useApp();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getPackages()
      .then((res) => setPackages(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectPackage = (pkg) => {
    updateSimulator({
      packageId: pkg._id,
      selectedPackage: pkg,
      step: 1
    });
    navigate('/reserver');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold tracking-widest uppercase text-safran block">
          Compositions de Fête
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-zellige dark:text-zellige-accent">
          Nos Formules d'Apparat Clés en Main
        </h1>
        <p className="text-sm sm:text-base text-anthracite/70 dark:text-[#F3ECDD]/70 font-light">
          Chaque formule est une symphonie culinaire conçue pour offrir à vos convives une expérience inoubliable, incluant le service et les équipements nécessaires.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-sm text-safran animate-pulse">
          Chargement des formules...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          {packages.map((pkg) => {
            const nameStr = pkg.name?.[lang] || pkg.name?.fr || pkg.name;
            const descStr = pkg.description?.[lang] || pkg.description?.fr;
            const isFeatured = pkg.badge === 'Recommandé' || pkg.badge === 'Excellence';

            return (
              <div
                key={pkg._id}
                className={`rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 relative ${
                  isFeatured
                    ? 'bg-white dark:bg-sable-dark border-2 border-safran shadow-safran scale-105 z-10'
                    : 'bg-white/80 dark:bg-sable-dark/80 border border-safran/20 shadow-card hover:shadow-xl'
                }`}
              >
                {pkg.badge && (
                  <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
                    <span className="bg-safran text-anthracite font-extrabold text-[10px] px-3.5 py-1 rounded-full uppercase tracking-widest shadow">
                      {pkg.badge}
                    </span>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-zellige dark:text-safran leading-snug">
                      {nameStr}
                    </h3>
                    <div className="flex items-baseline gap-1 mt-3">
                      <span className="font-serif text-4xl font-extrabold text-anthracite dark:text-white">
                        {pkg.pricePerPerson}
                      </span>
                      <span className="text-xs font-semibold text-safran uppercase tracking-wider">
                        MAD / invité
                      </span>
                    </div>
                    <p className="text-xs text-anthracite/70 dark:text-[#F3ECDD]/70 mt-3 leading-relaxed">
                      {descStr}
                    </p>
                  </div>

                  {/* Convives limits */}
                  <div className="p-3 rounded-xl bg-sable/30 dark:bg-black/20 flex items-center justify-between text-xs">
                    <span className="text-anthracite/60 dark:text-white/60">Effectif d'invités :</span>
                    <span className="font-bold text-zellige dark:text-safran">
                      {pkg.minGuests || 20} à {pkg.maxGuests || 500} pers.
                    </span>
                  </div>

                  {/* Courses detail */}
                  {pkg.courses && pkg.courses.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-safran block">
                        Composition du banquet :
                      </span>
                      {pkg.courses.map((course, cIdx) => (
                        <div key={cIdx} className="space-y-1">
                          <span className="text-xs font-semibold text-anthracite dark:text-white block">
                            • {course.label} ({course.choose} au choix) :
                          </span>
                          <div className="pl-3 space-y-0.5">
                            {(course.dishes || []).map((dish, dIdx) => (
                              <span key={dIdx} className="text-[11px] text-anthracite/70 dark:text-white/70 block">
                                - {dish.name?.[lang] || dish.name?.fr || dish.name || 'Plat d’apparat'}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Included Services */}
                  {pkg.includedServices && pkg.includedServices.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-safran/10 text-xs">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-safran block">
                        Prestations incluses :
                      </span>
                      {pkg.includedServices.map((srv, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2 text-anthracite/80 dark:text-white/80">
                          <Check className="w-3.5 h-3.5 text-zellige dark:text-zellige-accent shrink-0" />
                          <span>{srv}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => handleSelectPackage(pkg)}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow flex items-center justify-center gap-2 ${
                      isFeatured
                        ? 'bg-zellige hover:bg-zellige-dark text-white'
                        : 'bg-sable dark:bg-sable-dark hover:bg-safran hover:text-white text-anthracite dark:text-white'
                    }`}
                  >
                    <span>Choisir cette formule</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Quote Notice */}
      <div className="rounded-2xl bg-sable/30 dark:bg-sable-dark/50 border border-safran/30 p-8 text-center max-w-3xl mx-auto space-y-3">
        <Sparkles className="w-6 h-6 text-safran mx-auto" />
        <h3 className="font-serif text-xl font-bold text-zellige dark:text-safran">
          Vous souhaitez une formule entièrement sur-mesure ?
        </h3>
        <p className="text-xs text-anthracite/70 dark:text-[#F3ECDD]/70 max-w-xl mx-auto">
          Nos maîtres d'hôtel et chefs élaborent des compositions libres adaptées à vos envies : menus diététiques, dîners d'ambassades ou réceptions privées à domicile.
        </p>
        <button
          onClick={() => {
            updateSimulator({ packageId: '', selectedPackage: null, step: 1 });
            navigate('/reserver');
          }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zellige text-white text-xs font-semibold shadow hover:bg-zellige-dark transition"
        >
          <span>Créer un menu libre dans le simulateur</span>
        </button>
      </div>

    </div>
  );
}
