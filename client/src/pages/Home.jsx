import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { api } from '../api/client';
import {
  Sparkles,
  Calendar,
  Users,
  Award,
  ChevronRight,
  MessageCircle,
  CheckCircle,
  Star,
  Clock,
  MapPin,
  UtensilsCrossed,
  ShieldCheck,
  ArrowRight,
  Phone
} from 'lucide-react';

export default function Home() {
  const { t, lang, updateSimulator } = useApp();
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [activeMenuTab, setActiveMenuTab] = useState('traditionnel');
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    api.getPackages().then((res) => setPackages(res.data || [])).catch(() => {});
    api.getDishes().then((res) => setDishes(res.data || [])).catch(() => {});
    api.getGallery().then((res) => setGallery(res.data || [])).catch(() => {});
    api.getTestimonials().then((res) => setTestimonials(res.data || [])).catch(() => {});
  }, []);

  const handleSelectPackage = (pkg) => {
    updateSimulator({
      packageId: pkg._id,
      selectedPackage: pkg,
      step: 1
    });
    navigate('/reserver');
  };

  const filteredDishes = dishes.filter((d) => {
    if (activeMenuTab === 'traditionnel') return d.cuisineStyle === 'traditionnel';
    if (activeMenuTab === 'moderne') return d.cuisineStyle === 'moderne' || d.cuisineStyle === 'fusion';
    if (activeMenuTab === 'patisserie') return d.category === 'patisserie' || d.category === 'dessert';
    if (activeMenuTab === 'boisson') return d.category === 'boisson';
    return true;
  });

  const whatsappDirectUrl = 'https://wa.me/212705782737?text=' + encodeURIComponent('Bonjour Elhabchi Traiteur, je prépare un événement et je souhaite échanger avec un conseiller.');

  return (
    <div className="space-y-24 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-anthracite text-white px-4 sm:px-6 lg:px-8">
        {/* Background Image with warm overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&fit=crop"
            alt="Réception Elhabchi Traiteur"
            className="w-full h-full object-cover object-center opacity-30 transform scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-anthracite via-anthracite/60 to-transparent"></div>
          <div className="absolute inset-0 bg-zellige/20 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 pt-12 pb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-safran/20 border border-safran/40 text-safran text-xs font-semibold tracking-wider uppercase backdrop-blur-sm animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Maison fondée avec passion · Réceptions d’exception</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#FBF5E6] leading-tight">
            L'Art Sublimé du <br />
            <span className="text-safran italic font-normal">Traiteur Marocain</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-[#F3ECDD]/80 leading-relaxed font-light">
            {t('hero.baseline')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/reserver"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-zellige hover:bg-zellige-dark text-white font-semibold text-base shadow-zellige border border-safran/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Calendar className="w-5 h-5 text-safran" />
              <span>{t('hero.ctaPrimary')}</span>
            </Link>

            <a
              href={whatsappDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold text-base shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>{t('hero.ctaWhatsApp')}</span>
            </a>
          </div>

          {/* Quick stats pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-8 border-t border-white/10 max-w-xl mx-auto text-xs text-[#F3ECDD]/70">
            <div>
              <span className="block font-serif text-2xl font-bold text-safran">25+</span>
              <span>Années d’expérience</span>
            </div>
            <div>
              <span className="block font-serif text-2xl font-bold text-safran">1 200+</span>
              <span>Mariages & Galas</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="block font-serif text-2xl font-bold text-safran">100%</span>
              <span>Saveurs authentiques</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SERVICES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-safran block">
            Prestations
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zellige dark:text-zellige-accent">
            {t('services.title')}
          </h2>
          <p className="text-sm sm:text-base text-anthracite/70 dark:text-[#F3ECDD]/70">
            {t('services.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: t('services.wedding'),
              desc: t('services.weddingDesc'),
              img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&fit=crop',
              type: 'mariage'
            },
            {
              title: t('services.engagement'),
              desc: t('services.engagementDesc'),
              img: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&fit=crop',
              type: 'fiancailles'
            },
            {
              title: t('services.corporate'),
              desc: t('services.corporateDesc'),
              img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&fit=crop',
              type: 'entreprise'
            },
            {
              title: t('services.family'),
              desc: t('services.familyDesc'),
              img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&fit=crop',
              type: 'famille'
            },
            {
              title: t('services.equipment'),
              desc: t('services.equipmentDesc'),
              img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&fit=crop',
              type: 'autre'
            },
            {
              title: 'Cérémonie & Néguefa',
              desc: 'Trônes dorés, Amariya royale, cortège d’accueil et tenues marocaines de prestige.',
              img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&fit=crop',
              type: 'mariage'
            }
          ].map((srv, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl overflow-hidden bg-white dark:bg-sable-dark border border-safran/20 shadow-card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col"
            >
              <div className="h-52 overflow-hidden relative">
                <img
                  src={srv.img}
                  alt={srv.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <span className="absolute bottom-3 left-4 text-white font-serif font-bold text-xl drop-shadow">
                  {srv.title}
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-sm text-anthracite/80 dark:text-[#F3ECDD]/80 leading-relaxed font-normal">
                  {srv.desc}
                </p>
                <button
                  onClick={() => {
                    updateSimulator({ event: { type: srv.type, guestsCount: 150, city: 'Casablanca' } });
                    navigate('/reserver');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-zellige dark:text-safran hover:underline pt-2"
                >
                  <span>Estimer pour cette prestation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. PACKAGES (FORMULES) SECTION */}
      <section className="bg-sable/30 dark:bg-sable-dark/40 py-20 border-y border-safran/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase text-safran block">
              Formules Clés en Main
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zellige dark:text-zellige-accent">
              Des Menus Impériaux Pour Chaque Budget
            </h2>
            <p className="text-sm sm:text-base text-anthracite/70 dark:text-[#F3ECDD]/70">
              Découvrez nos compositions les plus plébiscitées. Chaque formule inclut le service et le mobilier d'apparat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => {
              const nameStr = pkg.name?.[lang] || pkg.name?.fr || pkg.name;
              const descStr = pkg.description?.[lang] || pkg.description?.fr;
              const isRecommended = pkg.badge === 'Recommandé' || pkg.badge === 'Excellence';

              return (
                <div
                  key={pkg._id}
                  className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 ${
                    isRecommended
                      ? 'bg-white dark:bg-sable-dark border-2 border-safran shadow-safran scale-105 z-10'
                      : 'bg-white/80 dark:bg-sable-dark/80 border border-safran/20 shadow-card hover:shadow-lg'
                  }`}
                >
                  {pkg.badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-safran text-anthracite font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow">
                        {pkg.badge}
                      </span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="font-serif text-xl font-bold text-zellige dark:text-safran pt-2">
                      {nameStr}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif text-3xl font-extrabold text-anthracite dark:text-white">
                        {pkg.pricePerPerson}
                      </span>
                      <span className="text-xs font-semibold text-safran uppercase tracking-wider">
                        MAD / pers.
                      </span>
                    </div>
                    <p className="text-xs text-anthracite/70 dark:text-[#F3ECDD]/70 leading-relaxed min-h-[50px]">
                      {descStr}
                    </p>

                    <div className="pt-2 border-t border-safran/10 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-anthracite/80 dark:text-white/80">
                        <Users className="w-3.5 h-3.5 text-safran shrink-0" />
                        <span>Min. {pkg.minGuests || 20} convives</span>
                      </div>
                      {(pkg.includedServices || []).slice(0, 2).map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-anthracite/80 dark:text-white/80">
                          <CheckCircle className="w-3.5 h-3.5 text-zellige dark:text-zellige-accent shrink-0" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => handleSelectPackage(pkg)}
                      className={`w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all shadow ${
                        isRecommended
                          ? 'bg-zellige hover:bg-zellige-dark text-white'
                          : 'bg-sable dark:bg-sable-dark hover:bg-safran hover:text-white text-anthracite dark:text-white'
                      }`}
                    >
                      Choisir cette formule
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/formules"
              className="inline-flex items-center gap-2 text-sm font-semibold text-zellige dark:text-safran hover:underline"
            >
              <span>Comparer toutes les formules en détail</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. MENUS PREVIEW SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-semibold tracking-widest uppercase text-safran block">
            Carte Gastronomique
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zellige dark:text-zellige-accent">
            Saveurs Impériales & Délices du Terroir
          </h2>
          <p className="text-sm text-anthracite/70 dark:text-[#F3ECDD]/70">
            Chaque plat est élaboré avec des épices nobles de Fès et des produits frais de nos terroirs.
          </p>
        </div>

        {/* Menu Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {[
            { id: 'traditionnel', label: 'Cuisine Traditionnelle' },
            { id: 'moderne', label: 'Revisites & Moderne' },
            { id: 'patisserie', label: 'Pâtisseries & Desserts' },
            { id: 'boisson', label: 'Thé & Boissons' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveMenuTab(tab.id)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeMenuTab === tab.id
                  ? 'bg-zellige text-white shadow-md'
                  : 'bg-white dark:bg-sable-dark text-anthracite dark:text-white hover:bg-safran/10 border border-safran/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dishes Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.slice(0, 6).map((dish) => {
            const nameStr = dish.name?.[lang] || dish.name?.fr;
            const descStr = dish.description?.[lang] || dish.description?.fr;

            return (
              <div
                key={dish._id}
                className="bg-white dark:bg-sable-dark rounded-2xl overflow-hidden border border-safran/20 shadow-card hover:shadow-lg transition-all flex flex-col justify-between"
              >
                {dish.images?.[0]?.url && (
                  <div className="h-44 overflow-hidden relative">
                    <img
                      src={dish.images[0].url}
                      alt={nameStr}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    {dish.isVegetarian && (
                      <span className="absolute top-3 right-3 bg-green-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Végétarien
                      </span>
                    )}
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif font-bold text-lg text-zellige dark:text-safran leading-snug">
                        {nameStr}
                      </h4>
                      <span className="shrink-0 font-bold text-sm text-safran">
                        {dish.price} MAD
                      </span>
                    </div>
                    <p className="text-xs text-anthracite/70 dark:text-[#F3ECDD]/70 mt-2 line-clamp-3 leading-relaxed">
                      {descStr}
                    </p>
                  </div>
                  {dish.allergens && dish.allergens.length > 0 && (
                    <div className="pt-2 border-t border-safran/10 flex flex-wrap gap-1">
                      {dish.allergens.map((alg, i) => (
                        <span key={i} className="text-[10px] bg-sable/50 dark:bg-black/30 px-2 py-0.5 rounded text-anthracite/70 dark:text-white/60">
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

        <div className="text-center mt-10">
          <Link
            to="/menus"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sable dark:bg-sable-dark text-anthracite dark:text-white font-semibold text-sm hover:bg-safran hover:text-white transition shadow border border-safran/20"
          >
            <span>Explorer la carte complète</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 5. PROCESS SECTION (Frise en 4 étapes) */}
      <section className="bg-anthracite text-white py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase text-safran block">
              Notre Méthode
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FBF5E6]">
              Votre Événement en 4 Étapes Simples
            </h2>
            <p className="text-sm text-[#F3ECDD]/70">
              De votre première idée à la magie du grand jour, nous vous accompagnons pas à pas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                num: '01',
                title: 'Je compose',
                desc: 'Choisissez votre formule, vos plats préférés et le matériel nécessaire via notre simulateur intuitif.'
              },
              {
                num: '02',
                title: 'J’envoie',
                desc: 'Recevez instantanément votre récapitulatif structuré et ouvrez WhatsApp en un clic pour valider la demande.'
              },
              {
                num: '03',
                title: 'Je reçois mon devis',
                desc: 'Notre équipe vérifie les disponibilités de stock et vous remet un devis officiel détaillé sous 24h.'
              },
              {
                num: '04',
                title: 'Je confirme',
                desc: 'Réglez l’acompte en ligne ou par virement pour bloquer vos dates et vivez un événement parfait.'
              }
            ].map((step, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl bg-white/5 border border-safran/20 flex flex-col justify-between space-y-4">
                <span className="font-serif text-4xl font-black text-safran block">
                  {step.num}
                </span>
                <h4 className="font-serif text-xl font-bold text-white">
                  {step.title}
                </h4>
                <p className="text-xs text-[#F3ECDD]/70 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/reserver"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-safran hover:bg-safran-dark text-anthracite font-bold text-sm tracking-wide shadow-lg transition transform hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Démarrer ma simulation en 3 minutes</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS & FAQ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Testimonials */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-safran block">
                Témoignages
              </span>
              <h2 className="font-serif text-3xl font-bold text-zellige dark:text-zellige-accent mt-1">
                Ils Nous Font Confiance
              </h2>
            </div>

            <div className="space-y-4">
              {testimonials.slice(0, 3).map((item) => (
                <div
                  key={item._id}
                  className="p-6 rounded-2xl bg-white dark:bg-sable-dark border border-safran/20 shadow-card space-y-3"
                >
                  <div className="flex items-center gap-1 text-safran">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-safran" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-anthracite/80 dark:text-[#F3ECDD]/80 italic leading-relaxed">
                    « {item.text} »
                  </p>
                  <div className="pt-2 border-t border-safran/10 flex items-center justify-between text-xs">
                    <span className="font-bold text-zellige dark:text-safran">
                      {item.authorName}
                    </span>
                    <span className="text-anthracite/50 dark:text-white/50">
                      {item.city} · {item.eventType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-safran block">
                Questions Fréquentes
              </span>
              <h2 className="font-serif text-3xl font-bold text-zellige dark:text-zellige-accent mt-1">
                Tout Ce Qu'il Faut Savoir
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Quel est le préavis minimum pour réserver ?",
                  a: "Pour garantir la fraîcheur des mets et la préparation du matériel d'apparat, nous demandons un préavis minimum de 7 jours pour les demandes en ligne. Pour les événements urgents, contactez-nous directement par téléphone ou WhatsApp."
                },
                {
                  q: "Dans quelles villes assurez-vous les prestations ?",
                  a: "Nous couvrons Casablanca (frais offerts), Mohammedia, Rabat-Salé, Marrakech, Fès, Meknès et Tanger avec nos camions frigorifiques et équipes mobiles."
                },
                {
                  q: "Quel est le montant de l'acompte à la réservation ?",
                  a: "Un acompte standard de 30% est requis pour bloquer définitivement votre date et réserver le stock de matériel. Le solde est payable lors de la prestation."
                },
                {
                  q: "Puis-je personnaliser entièrement les plats de ma formule ?",
                  a: "Absolument. Nos formules servent de base prestigieuse mais vous pouvez ajouter ou remplacer des plats à la carte, ou demander des options végétariennes sur-mesure."
                }
              ].map((faq, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-sable/30 dark:bg-sable-dark/50 border border-safran/20 space-y-2">
                  <h4 className="font-serif font-bold text-sm text-zellige dark:text-safran">
                    {faq.q}
                  </h4>
                  <p className="text-xs text-anthracite/70 dark:text-[#F3ECDD]/70 leading-relaxed font-light">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. CONTACT QUICK BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-zellige text-white p-8 sm:p-12 relative overflow-hidden border-2 border-safran/40 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-semibold tracking-widest uppercase text-safran block">
              Contact Immédiat
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
              Un Conseiller Dédié Pour Votre Projet
            </h2>
            <p className="text-sm text-[#F3ECDD]/80 leading-relaxed">
              Vous avez une demande particulière, un lieu atypique ou besoin d'un devis immédiat ? Échangez directement avec notre maître de maison.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href="tel:+212705782737"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zellige font-bold text-sm hover:bg-safran hover:text-white transition shadow"
              >
                <Phone className="w-4 h-4 text-safran" />
                <span>0705782737</span>
              </a>
              <a
                href={whatsappDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-sm transition shadow"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp Officiel</span>
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
