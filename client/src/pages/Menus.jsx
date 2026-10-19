import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { api } from '../api/client';
import { Search, Sparkles, Filter, Check, Utensils } from 'lucide-react';

export default function Menus() {
  const { lang } = useApp();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeStyle, setActiveStyle] = useState('all');
  const [search, setSearch] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getDishes()
      .then((res) => setDishes(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { id: 'all', label: 'Tout le menu' },
    { id: 'entree', label: 'Entrées d’apparat' },
    { id: 'plat', label: 'Grands Plats & Tajines' },
    { id: 'mechoui', label: 'Méchouis' },
    { id: 'patisserie', label: 'Pâtisseries & Desserts' },
    { id: 'boisson', label: 'Thés & Rafraîchissements' }
  ];

  const filtered = dishes.filter((dish) => {
    if (activeCategory !== 'all' && dish.category !== activeCategory) return false;
    if (activeStyle !== 'all' && dish.cuisineStyle !== activeStyle) return false;
    if (vegOnly && !dish.isVegetarian) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const nameFr = (dish.name?.fr || '').toLowerCase();
      const nameAr = (dish.name?.ar || '').toLowerCase();
      const descFr = (dish.description?.fr || '').toLowerCase();
      if (!nameFr.includes(q) && !nameAr.includes(q) && !descFr.includes(q)) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold tracking-widest uppercase text-safran block">
          Haute Gastronomie
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-zellige dark:text-zellige-accent">
          La Carte des Délices Elhabchi
        </h1>
        <p className="text-sm sm:text-base text-anthracite/70 dark:text-[#F3ECDD]/70 font-light">
          Découvrez la quintessence des mets traditionnels marocains et nos revisites contemporaines pour sublimer vos tables de fête.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-sable-dark p-6 rounded-2xl border border-safran/20 shadow-card space-y-5">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-anthracite/40 dark:text-white/40" />
            <input
              type="text"
              placeholder="Rechercher pastilla, méchoui, tajine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-sable/30 dark:bg-black/20 border border-safran/20 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-safran"
            />
          </div>

          {/* Style Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-medium text-anthracite/60 dark:text-white/60">Style :</span>
            {['all', 'traditionnel', 'moderne'].map((st) => (
              <button
                key={st}
                onClick={() => setActiveStyle(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeStyle === st
                    ? 'bg-zellige text-white'
                    : 'bg-sable/40 dark:bg-black/20 text-anthracite dark:text-white hover:bg-safran/20'
                }`}
              >
                {st === 'all' ? 'Tous styles' : st === 'traditionnel' ? 'Traditionnel' : 'Moderne / Fusion'}
              </button>
            ))}

            {/* Vegetarian Toggle */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`ml-2 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                vegOnly
                  ? 'bg-green-700 text-white'
                  : 'bg-sable/40 dark:bg-black/20 text-anthracite dark:text-white'
              }`}
            >
              {vegOnly && <Check className="w-3 h-3" />}
              <span>Végétarien</span>
            </button>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-safran/10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeCategory === cat.id
                  ? 'bg-safran text-anthracite shadow'
                  : 'bg-sable/30 dark:bg-black/20 text-anthracite/80 dark:text-white/80 hover:bg-safran/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dishes Cards Grid */}
      {loading ? (
        <div className="text-center py-20 text-sm text-safran animate-pulse">
          Chargement de nos cartes gastronomiques...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-sable-dark rounded-2xl border border-safran/20 p-8 space-y-3">
          <Utensils className="w-10 h-10 mx-auto text-safran/40" />
          <h3 className="font-serif text-lg font-bold">Aucun plat ne correspond à vos filtres</h3>
          <p className="text-xs text-anthracite/60 dark:text-white/60">
            Essayez d'élargir votre recherche ou de réinitialiser les critères.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((dish) => {
            const nameStr = dish.name?.[lang] || dish.name?.fr;
            const descStr = dish.description?.[lang] || dish.description?.fr;

            return (
              <div
                key={dish._id}
                className="bg-white dark:bg-sable-dark rounded-2xl overflow-hidden border border-safran/20 shadow-card hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                {dish.images?.[0]?.url && (
                  <div className="h-52 overflow-hidden relative">
                    <img
                      src={dish.images[0].url}
                      alt={nameStr}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-anthracite/80 backdrop-blur-sm text-safran text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {dish.cuisineStyle}
                      </span>
                      {dish.isVegetarian && (
                        <span className="bg-green-700/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Végétarien
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif font-bold text-xl text-zellige dark:text-safran leading-snug">
                        {nameStr}
                      </h3>
                      <div className="text-right shrink-0">
                        <span className="font-serif font-bold text-lg text-safran block leading-tight">
                          {dish.price} MAD
                        </span>
                        <span className="text-[10px] text-anthracite/50 dark:text-white/50 block">
                          {dish.pricingMode === 'per_person' ? '/ convive' : dish.unitLabel || '/ unité'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-anthracite/75 dark:text-[#F3ECDD]/75 leading-relaxed font-light">
                      {descStr}
                    </p>
                  </div>

                  {dish.allergens && dish.allergens.length > 0 && (
                    <div className="pt-3 border-t border-safran/10 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-anthracite/40 dark:text-white/40">
                        Allergènes :
                      </span>
                      {dish.allergens.map((alg, i) => (
                        <span key={i} className="text-[10px] bg-sable/50 dark:bg-black/30 px-2 py-0.5 rounded text-anthracite/80 dark:text-white/70">
                          {alg}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
