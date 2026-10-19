import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { api } from '../api/client';
import { Sparkles, Calendar, Eye, X, ArrowRight, Heart } from 'lucide-react';

export default function Gallery() {
  const { lang, t } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.getGallery()
      .then((res) => setItems(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filters = [
    { id: 'all', label: 'Toutes les créations' },
    { id: 'mariage', label: 'Mariages Féeriques' },
    { id: 'fiancailles', label: 'Fiançailles & Henné' },
    { id: 'entreprise', label: 'Galas & Entreprises' },
    { id: 'buffet', label: 'Buffets & Art de la Table' }
  ];

  const filteredItems = items.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.eventType === activeFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold tracking-widest uppercase text-safran block">
          Galerie d'Apparat
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-zellige dark:text-zellige-accent">
          Nos Réceptions & Célébrations Sublimées
        </h1>
        <p className="text-sm sm:text-base text-anthracite/70 dark:text-[#F3ECDD]/70 font-light">
          Chaque événement signé Elhabchi Traiteur est une œuvre d'art éphémère. Découvrez nos tentes impériales, nos buffets royaux et l'atmosphère envoûtante de nos plus beaux mariages.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
              activeFilter === f.id
                ? 'bg-zellige text-white shadow-md'
                : 'bg-white dark:bg-creme-dark border border-safran/30 text-anthracite/80 dark:text-[#F3ECDD]/80 hover:bg-safran/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="text-center py-20 text-sm text-safran animate-pulse">
          Chargement des réalisations d'exception...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-sable-dark/20 rounded-2xl border border-safran/20">
          <p className="text-anthracite/60 dark:text-[#F3ECDD]/60 text-sm">
            Aucune photo disponible pour cette catégorie.
          </p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredItems.map((item) => {
            const titleStr = item.title?.[lang] || item.title?.fr || item.title;
            const descStr = item.description?.[lang] || item.description?.fr || item.description;

            return (
              <div
                key={item._id}
                onClick={() => setSelectedImage(item)}
                className="group relative cursor-pointer break-inside-avoid overflow-hidden rounded-2xl bg-anthracite shadow-lg border border-safran/20 hover:border-safran transition-all duration-300"
              >
                <img
                  src={item.imageUrl}
                  alt={titleStr}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-anthracite/90 via-anthracite/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white">
                  <span className="text-[10px] uppercase font-semibold tracking-widest text-safran mb-1">
                    {item.eventType} · {item.city || 'Maroc'}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-white mb-1">
                    {titleStr}
                  </h3>
                  {descStr && (
                    <p className="text-xs text-white/80 line-clamp-2 mb-3">
                      {descStr}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs font-semibold text-safran">
                    <Eye className="w-4 h-4" />
                    <span>Agrandir & Détails</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white dark:bg-sable-dark rounded-2xl overflow-hidden shadow-2xl border border-safran/40"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-black flex items-center justify-center min-h-[350px]">
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title?.fr}
                  className="max-h-[70vh] w-full object-contain"
                />
              </div>

              <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="inline-block px-3 py-1 rounded-full bg-safran/10 text-safran text-xs font-semibold uppercase tracking-wider">
                    {selectedImage.eventType}
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-zellige dark:text-zellige-accent">
                    {selectedImage.title?.[lang] || selectedImage.title?.fr || selectedImage.title}
                  </h2>
                  <p className="text-sm text-anthracite/80 dark:text-[#F3ECDD]/80 leading-relaxed">
                    {selectedImage.description?.[lang] || selectedImage.description?.fr || selectedImage.description}
                  </p>
                  {selectedImage.city && (
                    <p className="text-xs text-anthracite/60 dark:text-[#F3ECDD]/60">
                      Lieu : <strong className="text-anthracite dark:text-[#F3ECDD]">{selectedImage.city}</strong>
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-safran/20">
                  <Link
                    to="/reserver"
                    onClick={() => setSelectedImage(null)}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zellige text-white text-sm font-semibold shadow hover:bg-zellige-dark transition"
                  >
                    <Calendar className="w-4 h-4 text-safran" />
                    <span>Créer un événement similaire</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-zellige to-zellige-dark rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FBF5E6]">
            Vous rêvez d'une célébration inoubliable ?
          </h2>
          <p className="text-sm sm:text-base text-[#F3ECDD]/80">
            Confiez vos envies à nos maîtres d'hôtel et chefs cuisiniers. Obtenez une estimation personnalisée en moins de 3 minutes.
          </p>
          <div className="pt-2">
            <Link
              to="/reserver"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-safran hover:bg-safran-light text-anthracite font-semibold text-sm transition shadow-lg"
            >
              <span>Accéder au Simulateur de Réservation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
