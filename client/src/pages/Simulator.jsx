import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { api } from '../api/client';
import {
  Calendar,
  Users,
  Utensils,
  Sparkles,
  PackageCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Clock,
  MapPin,
  Building,
  Info,
  Check,
  Plus,
  Minus,
  MessageCircle,
  Copy,
  ExternalLink,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';

export default function Simulator() {
  const { lang, t, simulatorDraft, updateSimulator, resetSimulator } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Data catalogues
  const [packages, setPackages] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [publicSettings, setPublicSettings] = useState(null);

  // States
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dateStatus, setDateStatus] = useState(null); // { available, reason }
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(null); // { booking, whatsappUrl }
  const [copiedCode, setCopiedCode] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [formError, setFormError] = useState('');

  const currentStep = simulatorDraft.step || 1;

  // Load initial data
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getPackages().catch(() => ({ data: [] })),
      api.getDishes().catch(() => ({ data: [] })),
      api.getRentableEquipment().catch(() => ({ data: [] })),
      api.getServices().catch(() => ({ data: [] })),
      api.getPublicSettings().catch(() => ({ data: null }))
    ])
      .then(([pkgsRes, dishesRes, equipRes, servRes, setRes]) => {
        setPackages(pkgsRes.data || []);
        setDishes(dishesRes.data || []);
        setEquipmentList(equipRes.data || []);
        setServicesList(servRes.data || []);
        setPublicSettings(setRes.data || null);

        // Pre-select package from URL if present
        const pkgParam = searchParams.get('package');
        if (pkgParam && pkgsRes.data) {
          const found = pkgsRes.data.find((p) => p._id === pkgParam || p.slug === pkgParam);
          if (found) {
            updateSimulator({
              packageId: found._id,
              selectedPackage: found
            });
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Check date availability when date changes
  useEffect(() => {
    if (simulatorDraft.event?.date) {
      api.getDateAvailability(simulatorDraft.event.date)
        .then((res) => {
          setDateStatus(res.data);
        })
        .catch(() => {
          setDateStatus(null);
        });
    }
  }, [simulatorDraft.event?.date]);

  // Recalculate price estimation whenever relevant items change
  useEffect(() => {
    // Debounce estimation call
    const timer = setTimeout(() => {
      fetchEstimate();
    }, 300);
    return () => clearTimeout(timer);
  }, [
    simulatorDraft.event?.guestsCount,
    simulatorDraft.event?.city,
    simulatorDraft.packageId,
    simulatorDraft.selectedDishes,
    simulatorDraft.selectedEquipment,
    simulatorDraft.selectedServices
  ]);

  const fetchEstimate = async () => {
    try {
      setCalculating(true);
      const payload = {
        guestsCount: Number(simulatorDraft.event?.guestsCount || 50),
        city: simulatorDraft.event?.city || 'Casablanca',
        packageId: simulatorDraft.packageId || undefined,
        dishes: (simulatorDraft.selectedDishes || []).map((d) => ({
          dish: d._id || d.dish,
          quantity: d.quantity || 1
        })),
        equipment: (simulatorDraft.selectedEquipment || []).map((e) => ({
          equipment: e._id || e.equipment,
          quantity: e.quantity || 1
        })),
        services: (simulatorDraft.selectedServices || []).map((s) => ({
          service: s._id || s.service,
          quantity: s.quantity || 1
        }))
      };

      const res = await api.estimateBooking(payload);
      if (res?.data) {
        setPriceBreakdown(res.data);
      }
    } catch (e) {
      console.error('Estimation error:', e);
    } finally {
      setCalculating(false);
    }
  };

  // Event handlers
  const handleEventChange = (field, value) => {
    updateSimulator((prev) => ({
      ...prev,
      event: { ...prev.event, [field]: value }
    }));
  };

  const handleCustomerChange = (field, value) => {
    updateSimulator((prev) => ({
      ...prev,
      customer: { ...prev.customer, [field]: value }
    }));
  };

  const handleSelectPackage = (pkg) => {
    if (simulatorDraft.packageId === pkg._id) {
      // Toggle unselect
      updateSimulator({ packageId: '', selectedPackage: null });
    } else {
      updateSimulator({ packageId: pkg._id, selectedPackage: pkg });
    }
  };

  const toggleDish = (dish) => {
    const list = simulatorDraft.selectedDishes || [];
    const exists = list.find((item) => (item._id || item.dish) === dish._id);
    let next;
    if (exists) {
      next = list.filter((item) => (item._id || item.dish) !== dish._id);
    } else {
      next = [...list, { _id: dish._id, dish: dish._id, name: dish.name, price: dish.price, pricingType: dish.pricingType, quantity: 1 }];
    }
    updateSimulator({ selectedDishes: next });
  };

  const changeDishQuantity = (dishId, delta) => {
    const list = simulatorDraft.selectedDishes || [];
    const next = list.map((item) => {
      if ((item._id || item.dish) === dishId) {
        const q = Math.max(1, (item.quantity || 1) + delta);
        return { ...item, quantity: q };
      }
      return item;
    });
    updateSimulator({ selectedDishes: next });
  };

  const changeEquipmentQuantity = (equip, delta) => {
    const list = simulatorDraft.selectedEquipment || [];
    const existing = list.find((item) => (item._id || item.equipment) === equip._id);
    let next;
    if (!existing && delta > 0) {
      next = [...list, { _id: equip._id, equipment: equip._id, name: equip.name, rentalPrice: equip.rentalPrice, quantity: delta }];
    } else if (existing) {
      const newQty = (existing.quantity || 0) + delta;
      if (newQty <= 0) {
        next = list.filter((item) => (item._id || item.equipment) !== equip._id);
      } else {
        next = list.map((item) => ((item._id || item.equipment) === equip._id ? { ...item, quantity: newQty } : item));
      }
    } else {
      next = list;
    }
    updateSimulator({ selectedEquipment: next });
  };

  const toggleService = (srv) => {
    const list = simulatorDraft.selectedServices || [];
    const exists = list.find((item) => (item._id || item.service) === srv._id);
    let next;
    if (exists) {
      next = list.filter((item) => (item._id || item.service) !== srv._id);
    } else {
      next = [...list, { _id: srv._id, service: srv._id, name: srv.name, price: srv.price, pricingType: srv.pricingType, quantity: 1 }];
    }
    updateSimulator({ selectedServices: next });
  };

  // Step Validation & Navigation
  const goToStep = (stepNum) => {
    setFormError('');
    if (stepNum > currentStep) {
      // Validate current step before advancing
      if (currentStep === 1) {
        if (!simulatorDraft.event?.date) {
          setFormError('Veuillez sélectionner la date prévue pour votre événement.');
          return;
        }
        if (dateStatus && !dateStatus.available) {
          setFormError('La date sélectionnée est indisponible. Veuillez en choisir une autre ou nous contacter.');
          return;
        }
      }
      if (currentStep === 2) {
        const count = Number(simulatorDraft.event?.guestsCount || 0);
        if (!count || count < 10) {
          setFormError('Le nombre minimum d\'invités pour une réception est de 10 personnes.');
          return;
        }
      }
      if (currentStep === 5) {
        if (!simulatorDraft.customer?.fullName?.trim()) {
          setFormError('Veuillez renseigner votre nom complet.');
          return;
        }
        if (!simulatorDraft.customer?.phone?.trim()) {
          setFormError('Veuillez renseigner votre numéro de téléphone (WhatsApp).');
          return;
        }
      }
    }
    updateSimulator({ step: stepNum });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Submission to API + WhatsApp redirect
  const handleFinalSubmit = async () => {
    setFormError('');
    if (!simulatorDraft.customer?.fullName?.trim() || !simulatorDraft.customer?.phone?.trim()) {
      setFormError('Nom et numéro de téléphone requis pour générer le devis.');
      goToStep(5);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        event: {
          type: simulatorDraft.event?.type || 'mariage',
          date: simulatorDraft.event?.date,
          startTime: simulatorDraft.event?.startTime || '19:00',
          endTime: simulatorDraft.event?.endTime || '02:00',
          guestsCount: Number(simulatorDraft.event?.guestsCount || 50),
          city: simulatorDraft.event?.city || 'Casablanca',
          venueType: simulatorDraft.event?.venueType || 'salle',
          address: simulatorDraft.event?.address || ''
        },
        packageId: simulatorDraft.packageId || undefined,
        dishes: (simulatorDraft.selectedDishes || []).map((d) => ({
          dish: d._id || d.dish,
          quantity: d.quantity || 1
        })),
        equipment: (simulatorDraft.selectedEquipment || []).map((e) => ({
          equipment: e._id || e.equipment,
          quantity: e.quantity || 1
        })),
        services: (simulatorDraft.selectedServices || []).map((s) => ({
          service: s._id || s.service,
          quantity: s.quantity || 1
        })),
        customer: {
          fullName: simulatorDraft.customer?.fullName,
          phone: simulatorDraft.customer?.phone,
          email: simulatorDraft.customer?.email || '',
          isCompany: Boolean(simulatorDraft.customer?.isCompany),
          companyName: simulatorDraft.customer?.companyName || '',
          preferredContact: 'whatsapp'
        },
        specialRequests: simulatorDraft.specialRequests || '',
        pricing: priceBreakdown || {}
      };

      const res = await api.createPublicBooking(payload);

      if (res?.data) {
        const booking = res.data.booking;
        const whatsappUrl = res.data.whatsappUrl;

        setSubmissionSuccess({ booking, whatsappUrl });
        // Record click and open WhatsApp
        if (whatsappUrl) {
          window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        }
      }
    } catch (err) {
      console.error('Submission error:', err);
      setFormError(err.message || 'Une erreur est survenue lors de l\'enregistrement de votre demande.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyTrackingCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Helper date formatted
  const minNoticeDate = new Date();
  minNoticeDate.setDate(minNoticeDate.getDate() + 7);
  const minDateStr = minNoticeDate.toISOString().split('T')[0];

  const eventTypes = [
    { id: 'mariage', label: 'Mariage Princier' },
    { id: 'fiancailles', label: 'Fiançailles & Henné' },
    { id: 'bapteme', label: 'Baptême & Aqiqah' },
    { id: 'entreprise', label: 'Événement d\'Entreprise & Gala' },
    { id: 'anniversaire', label: 'Anniversaire & Réception Privée' },
    { id: 'autre', label: 'Autre Célébration' }
  ];

  const cities = ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 'Agadir', 'El Jadida', 'Autre'];

  // SUCCESS SCREEN
  if (submissionSuccess) {
    const { booking, whatsappUrl } = submissionSuccess;
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
        <div className="w-20 h-20 mx-auto rounded-full bg-zellige/10 dark:bg-zellige-accent/20 flex items-center justify-center text-zellige dark:text-zellige-accent border-2 border-safran">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <span className="text-xs font-semibold tracking-widest uppercase text-safran block">
            Demande Enregistrée avec Succès
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-zellige dark:text-zellige-accent">
            Félicitations pour votre Réception !
          </h1>
          <p className="text-sm text-anthracite/70 dark:text-[#F3ECDD]/70 max-w-lg mx-auto">
            Votre dossier a été enregistré dans notre système. Nous avons préparé votre message WhatsApp pour finaliser votre devis avec notre équipe.
          </p>
        </div>

        {/* Tracking Code Badge */}
        <div className="p-6 rounded-2xl bg-white dark:bg-sable-dark border border-safran/40 shadow-xl max-w-md mx-auto space-y-3">
          <span className="text-xs text-anthracite/60 dark:text-[#F3ECDD]/60 font-medium">
            Votre Code de Suivi Unique :
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-2xl font-bold text-safran tracking-wider">
              {booking.trackingCode}
            </span>
            <button
              onClick={() => copyTrackingCode(booking.trackingCode)}
              className="p-2 rounded-lg bg-safran/10 hover:bg-safran/20 text-safran transition"
              title="Copier le code"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          {copiedCode && <span className="text-[11px] text-zellige dark:text-safran block">Code copié dans le presse-papier !</span>}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-md mx-auto">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-sm shadow-lg transition transform hover:-translate-y-0.5"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Ouvrir WhatsApp</span>
            </a>
          )}
          <button
            onClick={() => navigate(`/suivi?code=${booking.trackingCode}&phone=${encodeURIComponent(booking.customer?.phone)}`)}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-zellige hover:bg-zellige-dark text-white font-semibold text-sm shadow transition"
          >
            <span>Suivre mon dossier</span>
            <ChevronRight className="w-4 h-4 text-safran" />
          </button>
        </div>

        <div className="pt-6">
          <button
            onClick={() => {
              resetSimulator();
              setSubmissionSuccess(null);
            }}
            className="inline-flex items-center gap-1.5 text-xs text-anthracite/60 dark:text-[#F3ECDD]/60 hover:text-safran transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Faire une nouvelle simulation</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-xs font-semibold tracking-widest uppercase text-safran block">
          Simulateur & Devis d'Excellence
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-zellige dark:text-zellige-accent">
          Composez Votre Événement d’Apparat
        </h1>
        <p className="text-xs sm:text-sm text-anthracite/70 dark:text-[#F3ECDD]/70 font-light">
          Tarification transparente en dirhams marocains (MAD). Estimation en temps réel et envoi direct sur WhatsApp.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-safran/20 w-full z-0"></div>
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-safran transition-all duration-500 z-0"
            style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
          ></div>

          {[
            { num: 1, label: 'Événement' },
            { num: 2, label: 'Invités' },
            { num: 3, label: 'Menu' },
            { num: 4, label: 'Matériel' },
            { num: 5, label: 'Contact' },
            { num: 6, label: 'Devis' }
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => goToStep(s.num)}
              className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
            >
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all shadow-md ${
                  currentStep === s.num
                    ? 'bg-zellige text-white ring-4 ring-safran/30 scale-110'
                    : currentStep > s.num
                    ? 'bg-safran text-anthracite font-semibold'
                    : 'bg-white dark:bg-sable-dark text-anthracite/50 dark:text-[#F3ECDD]/50 border border-safran/30'
                }`}
              >
                {currentStep > s.num ? <Check className="w-5 h-5 text-white" /> : s.num}
              </div>
              <span
                className={`text-[10px] sm:text-xs font-semibold mt-1.5 hidden sm:block ${
                  currentStep === s.num
                    ? 'text-zellige dark:text-safran'
                    : 'text-anthracite/60 dark:text-[#F3ECDD]/60'
                }`}
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {formError && (
        <div className="max-w-3xl mx-auto p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Step Content Card */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-sable-dark/80 rounded-3xl p-6 sm:p-10 shadow-xl border border-safran/30 backdrop-blur-sm">
        
        {/* STEP 1: EVENT DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="font-serif text-2xl font-bold text-zellige dark:text-zellige-accent">
                1. Nature et Date de votre Événement
              </h2>
              <p className="text-xs sm:text-sm text-anthracite/70 dark:text-[#F3ECDD]/70">
                Précisez le type de célébration et la date souhaitée.
              </p>
            </div>

            {/* Event Type Grid */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-safran">
                Type de Célébration
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {eventTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleEventChange('type', type.id)}
                    className={`p-4 rounded-2xl text-left border text-sm font-semibold transition-all ${
                      simulatorDraft.event?.type === type.id
                        ? 'bg-zellige text-white border-safran shadow-md'
                        : 'bg-sable/30 dark:bg-sable-dark/40 border-safran/20 hover:border-safran/60 text-anthracite dark:text-[#F3ECDD]'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Picker + Notice Warning */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-safran flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Date Prévue
                </label>
                <input
                  type="date"
                  min={minDateStr}
                  value={simulatorDraft.event?.date || ''}
                  onChange={(e) => handleEventChange('date', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-anthracite dark:text-[#F3ECDD] focus:border-zellige focus:ring-1 focus:ring-zellige outline-none text-sm"
                />
                <span className="text-[11px] text-anthracite/50 dark:text-[#F3ECDD]/50 block">
                  * Préavis standard de 7 jours minimum pour préparation optimale.
                </span>
                
                {/* Date Availability Indicator */}
                {dateStatus && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                      dateStatus.available
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                        : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-300'
                    }`}
                  >
                    <Info className="w-4 h-4 shrink-0" />
                    <span>{dateStatus.reason || (dateStatus.available ? 'Date disponible pour votre réception' : 'Date sous forte demande')}</span>
                  </div>
                )}
              </div>

              {/* City Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-safran flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  Ville / Région
                </label>
                <select
                  value={simulatorDraft.event?.city || 'Casablanca'}
                  onChange={(e) => handleEventChange('city', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-anthracite dark:text-[#F3ECDD] focus:border-zellige outline-none text-sm"
                >
                  {cities.map((c) => (
                    <option key={c} value={c} className="bg-white dark:bg-sable-dark">
                      {c}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-anthracite/50 dark:text-[#F3ECDD]/50 block">
                  Frais de déplacement et logistique adaptés selon la zone.
                </span>
              </div>
            </div>

            {/* Venue Type & Times */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-safran">
                  Type de Lieu
                </label>
                <select
                  value={simulatorDraft.event?.venueType || 'salle'}
                  onChange={(e) => handleEventChange('venueType', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs sm:text-sm outline-none text-anthracite dark:text-[#F3ECDD]"
                >
                  <option value="salle">Salle des fêtes / Domaine</option>
                  <option value="villa">Villa privée / Jardin</option>
                  <option value="riad">Riad traditionnel</option>
                  <option value="plein_air">Plein air / Tente Caïdale</option>
                  <option value="domicile">Domicile familial</option>
                  <option value="entreprise">Siège d'entreprise</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-safran">
                  Heure de Début
                </label>
                <input
                  type="time"
                  value={simulatorDraft.event?.startTime || '19:00'}
                  onChange={(e) => handleEventChange('startTime', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs sm:text-sm outline-none text-anthracite dark:text-[#F3ECDD]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-safran">
                  Heure de Fin estimée
                </label>
                <input
                  type="time"
                  value={simulatorDraft.event?.endTime || '02:00'}
                  onChange={(e) => handleEventChange('endTime', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs sm:text-sm outline-none text-anthracite dark:text-[#F3ECDD]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: GUESTS COUNT */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="font-serif text-2xl font-bold text-zellige dark:text-zellige-accent">
                2. Nombre de Convives & Envergure
              </h2>
              <p className="text-xs sm:text-sm text-anthracite/70 dark:text-[#F3ECDD]/70">
                Le dimensionnement culinaire et matériel s'adapte précisément à votre nombre d'invités.
              </p>
            </div>

            {/* Guests Counter & Slider */}
            <div className="p-8 rounded-2xl bg-sable/20 dark:bg-sable-dark/40 border border-safran/30 text-center space-y-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-safran block">
                Nombre total d'invités
              </span>

              <div className="flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={() =>
                    handleEventChange('guestsCount', Math.max(10, (simulatorDraft.event?.guestsCount || 100) - 10))
                  }
                  className="w-12 h-12 rounded-xl bg-white dark:bg-sable-dark border border-safran/40 flex items-center justify-center text-zellige dark:text-safran hover:bg-safran/10 transition text-xl font-bold"
                >
                  -10
                </button>

                <div className="font-serif text-5xl sm:text-6xl font-bold text-zellige dark:text-zellige-accent tracking-tight">
                  {simulatorDraft.event?.guestsCount || 100}
                  <span className="text-base sm:text-lg font-sans font-normal text-anthracite/60 dark:text-[#F3ECDD]/60 ml-2">
                    personnes
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleEventChange('guestsCount', (simulatorDraft.event?.guestsCount || 100) + 10)
                  }
                  className="w-12 h-12 rounded-xl bg-white dark:bg-sable-dark border border-safran/40 flex items-center justify-center text-zellige dark:text-safran hover:bg-safran/10 transition text-xl font-bold"
                >
                  +10
                </button>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="20"
                max="800"
                step="10"
                value={simulatorDraft.event?.guestsCount || 100}
                onChange={(e) => handleEventChange('guestsCount', Number(e.target.value))}
                className="w-full max-w-lg accent-safran cursor-pointer"
              />

              {/* Approximate Tables breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 max-w-lg mx-auto text-center">
                <div className="p-3 rounded-xl bg-white dark:bg-sable-dark border border-safran/20">
                  <span className="text-xs text-anthracite/60 dark:text-[#F3ECDD]/60 block">Tables rondes (10p)</span>
                  <span className="font-serif text-lg font-bold text-safran">
                    ~ {Math.ceil((simulatorDraft.event?.guestsCount || 100) / 10)} tables
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-sable-dark border border-safran/20">
                  <span className="text-xs text-anthracite/60 dark:text-[#F3ECDD]/60 block">Brigade de service</span>
                  <span className="font-serif text-lg font-bold text-safran">
                    ~ {Math.max(4, Math.ceil((simulatorDraft.event?.guestsCount || 100) / 20))} maîtres d'hôtel
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-sable-dark border border-safran/20 col-span-2 sm:col-span-1">
                  <span className="text-xs text-anthracite/60 dark:text-[#F3ECDD]/60 block">Vaisselle fine</span>
                  <span className="font-serif text-lg font-bold text-safran">
                    {simulatorDraft.event?.guestsCount || 100} couverts
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: MENU & PACKAGES SELECTION */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="font-serif text-2xl font-bold text-zellige dark:text-zellige-accent">
                3. Sélection de la Formule & Plats Supplémentaires
              </h2>
              <p className="text-xs sm:text-sm text-anthracite/70 dark:text-[#F3ECDD]/70">
                Optez pour l'une de nos formules prestigieuses ou composez entièrement à la carte.
              </p>
            </div>

            {/* Packages Selection Carousel/Grid */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-safran block">
                Nos Formules Clés en Main (optionnel mais recommandé)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map((pkg) => {
                  const isSelected = simulatorDraft.packageId === pkg._id;
                  const nameStr = pkg.name?.[lang] || pkg.name?.fr || pkg.name;
                  return (
                    <div
                      key={pkg._id}
                      onClick={() => handleSelectPackage(pkg)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-zellige/10 border-safran shadow-md ring-2 ring-safran'
                          : 'bg-white dark:bg-sable-dark/40 border-safran/20 hover:border-safran/60'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-safran text-anthracite flex items-center justify-center">
                          <Check className="w-4 h-4 font-bold" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-safran">
                          Formule
                        </span>
                        <h4 className="font-serif text-lg font-bold text-zellige dark:text-zellige-accent">
                          {nameStr}
                        </h4>
                        <p className="text-xs text-anthracite/70 dark:text-[#F3ECDD]/70 line-clamp-2">
                          {pkg.description?.[lang] || pkg.description?.fr || pkg.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-safran/20 flex items-center justify-between">
                        <div>
                          <span className="font-serif text-xl font-bold text-safran">
                            {pkg.pricePerPerson}
                          </span>
                          <span className="text-xs text-anthracite/60 dark:text-[#F3ECDD]/60 ml-1">
                            MAD / pers.
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-zellige dark:text-safran">
                          {isSelected ? 'Sélectionnée' : 'Choisir'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Extra dishes selection */}
            <div className="space-y-4 pt-4 border-t border-safran/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-zellige dark:text-zellige-accent">
                    Plats & Rafraîchissements Additionnels
                  </h3>
                  <p className="text-xs text-anthracite/70 dark:text-[#F3ECDD]/70">
                    Complétez votre fête avec nos spécialités signature.
                  </p>
                </div>
                <span className="text-xs font-semibold text-safran">
                  {(simulatorDraft.selectedDishes || []).length} sélectionnés
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {dishes.map((dish) => {
                  const dishName = dish.name?.[lang] || dish.name?.fr || dish.name;
                  const selected = (simulatorDraft.selectedDishes || []).find(
                    (item) => (item._id || item.dish) === dish._id
                  );
                  return (
                    <div
                      key={dish._id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition ${
                        selected
                          ? 'bg-safran/10 border-safran shadow-sm'
                          : 'bg-white dark:bg-sable-dark border-safran/20 hover:border-safran/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {dish.images?.[0] ? (
                          <img
                            src={dish.images[0]}
                            alt={dishName}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-sable/30 flex items-center justify-center text-safran">
                            <Utensils className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-anthracite dark:text-[#F3ECDD]">
                            {dishName}
                          </h4>
                          <span className="text-xs font-serif font-bold text-safran">
                            {dish.price} MAD{' '}
                            <span className="text-[10px] font-sans font-normal text-anthracite/60 dark:text-[#F3ECDD]/60">
                              {dish.pricingType === 'per_person' ? '/pers' : '/plat'}
                            </span>
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleDish(dish)}
                        className={`p-2 rounded-lg transition ${
                          selected
                            ? 'bg-safran text-anthracite hover:bg-safran-light'
                            : 'bg-sable/30 dark:bg-sable-dark hover:bg-safran/20 text-anthracite dark:text-[#F3ECDD]'
                        }`}
                      >
                        {selected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: EQUIPMENT & SERVICES */}
        {currentStep === 4 && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="font-serif text-2xl font-bold text-zellige dark:text-zellige-accent">
                4. Location de Matériel & Services Complémentaires
              </h2>
              <p className="text-xs sm:text-sm text-anthracite/70 dark:text-[#F3ECDD]/70">
                Assurez le confort et la magnificence de votre réception (tentes, tables impériales, maîtres d'hôtel).
              </p>
            </div>

            {/* Equipment Grid */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-safran block">
                Mobilier, Tentes & Art de la Table
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {equipmentList.map((eq) => {
                  const selected = (simulatorDraft.selectedEquipment || []).find(
                    (item) => (item._id || item.equipment) === eq._id
                  );
                  const qty = selected?.quantity || 0;
                  return (
                    <div
                      key={eq._id}
                      className="p-3.5 rounded-xl bg-white dark:bg-sable-dark border border-safran/20 flex items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-anthracite dark:text-[#F3ECDD]">
                          {eq.name}
                        </h4>
                        <span className="text-xs text-safran font-serif font-bold">
                          {eq.rentalPrice} MAD{' '}
                          <span className="text-[10px] font-sans font-normal text-anthracite/60 dark:text-[#F3ECDD]/60">
                            / unité
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => changeEquipmentQuantity(eq, -1)}
                          disabled={qty <= 0}
                          className="w-7 h-7 rounded bg-sable/30 dark:bg-sable-dark hover:bg-safran/20 flex items-center justify-center text-xs font-bold disabled:opacity-30"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-6 text-center">{qty}</span>
                        <button
                          type="button"
                          onClick={() => changeEquipmentQuantity(eq, 1)}
                          className="w-7 h-7 rounded bg-sable/30 dark:bg-sable-dark hover:bg-safran/20 flex items-center justify-center text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Services List */}
            <div className="space-y-3 pt-4 border-t border-safran/20">
              <span className="text-xs font-semibold uppercase tracking-wider text-safran block">
                Prestations de Service & Animation
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {servicesList.map((srv) => {
                  const isSelected = (simulatorDraft.selectedServices || []).some(
                    (item) => (item._id || item.service) === srv._id
                  );
                  return (
                    <div
                      key={srv._id}
                      onClick={() => toggleService(srv)}
                      className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                        isSelected
                          ? 'bg-safran/10 border-safran shadow-sm'
                          : 'bg-white dark:bg-sable-dark border-safran/20 hover:border-safran/40'
                      }`}
                    >
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-anthracite dark:text-[#F3ECDD]">
                          {srv.name}
                        </h4>
                        <span className="text-xs text-safran font-serif font-bold">
                          {srv.price} MAD
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center ${
                          isSelected ? 'bg-safran text-anthracite' : 'border border-safran/40'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: CONTACT & COORDONNEES */}
        {currentStep === 5 && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="font-serif text-2xl font-bold text-zellige dark:text-zellige-accent">
                5. Vos Coordonnées & Précisions
              </h2>
              <p className="text-xs sm:text-sm text-anthracite/70 dark:text-[#F3ECDD]/70">
                Informations indispensables pour vous envoyer le récapitulatif officiel et votre estimation personnalisée.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-safran">
                    Nom Complet *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Laila Benjelloun"
                    value={simulatorDraft.customer?.fullName || ''}
                    onChange={(e) => handleCustomerChange('fullName', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-sm outline-none text-anthracite dark:text-[#F3ECDD]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-safran">
                    Numéro WhatsApp / Téléphone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: 06 12 34 56 78"
                    value={simulatorDraft.customer?.phone || ''}
                    onChange={(e) => handleCustomerChange('phone', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-sm outline-none text-anthracite dark:text-[#F3ECDD]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-safran">
                  Adresse Email (optionnelle, pour devis PDF officiel)
                </label>
                <input
                  type="email"
                  placeholder="contact@exemple.ma"
                  value={simulatorDraft.customer?.email || ''}
                  onChange={(e) => handleCustomerChange('email', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-sm outline-none text-anthracite dark:text-[#F3ECDD]"
                />
              </div>

              {/* Is Company toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-anthracite dark:text-[#F3ECDD]">
                  <input
                    type="checkbox"
                    checked={Boolean(simulatorDraft.customer?.isCompany)}
                    onChange={(e) => handleCustomerChange('isCompany', e.target.checked)}
                    className="rounded accent-safran w-4 h-4"
                  />
                  <span>Il s'agit d'un événement d'entreprise / société</span>
                </label>

                {simulatorDraft.customer?.isCompany && (
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Raison sociale de l'entreprise"
                      value={simulatorDraft.customer?.companyName || ''}
                      onChange={(e) => handleCustomerChange('companyName', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-sm outline-none text-anthracite dark:text-[#F3ECDD]"
                    />
                  </div>
                )}
              </div>

              {/* Special requests / notes */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-safran">
                  Remarques Particulières ou Régimes Alimentaires
                </label>
                <textarea
                  rows="3"
                  placeholder="Ex: régimes sans gluten, préférences pour le thé de bienvenue, accès particulier au lieu..."
                  value={simulatorDraft.specialRequests || ''}
                  onChange={(e) => updateSimulator({ specialRequests: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-sm outline-none text-anthracite dark:text-[#F3ECDD]"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: RECAPITULATIF & ESTIMATION */}
        {currentStep === 6 && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="font-serif text-2xl font-bold text-zellige dark:text-zellige-accent">
                6. Récapitulatif & Devis Estimatif
              </h2>
              <p className="text-xs sm:text-sm text-anthracite/70 dark:text-[#F3ECDD]/70">
                Consultez l'estimation calculée par nos algorithmes avant de transmettre votre demande sur WhatsApp.
              </p>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Event details card */}
              <div className="p-5 rounded-2xl bg-sable/20 dark:bg-sable-dark/40 border border-safran/20 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-safran block">
                  Événement & Lieu
                </span>
                <div className="space-y-1.5 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-anthracite/60 dark:text-[#F3ECDD]/60">Type :</span>
                    <strong className="capitalize">{simulatorDraft.event?.type}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-anthracite/60 dark:text-[#F3ECDD]/60">Date :</span>
                    <strong>{simulatorDraft.event?.date || 'Non définie'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-anthracite/60 dark:text-[#F3ECDD]/60">Invités :</span>
                    <strong>{simulatorDraft.event?.guestsCount} convives</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-anthracite/60 dark:text-[#F3ECDD]/60">Ville :</span>
                    <strong>{simulatorDraft.event?.city}</strong>
                  </div>
                </div>
              </div>

              {/* Selections breakdown */}
              <div className="p-5 rounded-2xl bg-sable/20 dark:bg-sable-dark/40 border border-safran/20 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-safran block">
                  Menu & Équipements
                </span>
                <div className="space-y-1 text-xs">
                  <p>
                    <span className="text-anthracite/60 dark:text-[#F3ECDD]/60">Formule :</span>{' '}
                    <strong>{simulatorDraft.selectedPackage?.name?.fr || simulatorDraft.selectedPackage?.name || 'À la carte'}</strong>
                  </p>
                  <p>
                    <span className="text-anthracite/60 dark:text-[#F3ECDD]/60">Plats extras :</span>{' '}
                    <strong>{(simulatorDraft.selectedDishes || []).length} sélectionnés</strong>
                  </p>
                  <p>
                    <span className="text-anthracite/60 dark:text-[#F3ECDD]/60">Matériel :</span>{' '}
                    <strong>{(simulatorDraft.selectedEquipment || []).length} références</strong>
                  </p>
                  <p>
                    <span className="text-anthracite/60 dark:text-[#F3ECDD]/60">Services :</span>{' '}
                    <strong>{(simulatorDraft.selectedServices || []).length} prestations</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Price Breakdown Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-sable-dark border-2 border-safran/40 shadow-lg space-y-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-safran block">
                Calcul Détaillé du Prix (MAD)
              </span>

              {calculating ? (
                <div className="text-center py-6 text-xs text-safran animate-pulse">
                  Mise à jour de l'estimation en temps réel...
                </div>
              ) : priceBreakdown ? (
                <div className="space-y-2 text-sm divide-y divide-safran/10">
                  <div className="flex justify-between py-1">
                    <span className="text-anthracite/70 dark:text-[#F3ECDD]/70">Nourriture & Menu :</span>
                    <span className="font-semibold">{priceBreakdown.foodSubtotal?.toLocaleString()} MAD</span>
                  </div>
                  {priceBreakdown.equipmentSubtotal > 0 && (
                    <div className="flex justify-between py-1">
                      <span className="text-anthracite/70 dark:text-[#F3ECDD]/70">Location Matériel :</span>
                      <span className="font-semibold">{priceBreakdown.equipmentSubtotal?.toLocaleString()} MAD</span>
                    </div>
                  )}
                  {priceBreakdown.servicesSubtotal > 0 && (
                    <div className="flex justify-between py-1">
                      <span className="text-anthracite/70 dark:text-[#F3ECDD]/70">Prestations de Service :</span>
                      <span className="font-semibold">{priceBreakdown.servicesSubtotal?.toLocaleString()} MAD</span>
                    </div>
                  )}
                  {priceBreakdown.deliveryFee > 0 && (
                    <div className="flex justify-between py-1">
                      <span className="text-anthracite/70 dark:text-[#F3ECDD]/70">Transport & Installation ({simulatorDraft.event?.city}) :</span>
                      <span className="font-semibold">{priceBreakdown.deliveryFee?.toLocaleString()} MAD</span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline pt-4">
                    <div>
                      <span className="font-serif text-xl sm:text-2xl font-bold text-zellige dark:text-zellige-accent">
                        Total Estimé :
                      </span>
                      <span className="text-[11px] text-anthracite/50 dark:text-[#F3ECDD]/50 block">
                        Devis indicatif non contractuel
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-serif text-2xl sm:text-3xl font-bold text-safran">
                        {priceBreakdown.total?.toLocaleString()} MAD
                      </span>
                    </div>
                  </div>

                  {priceBreakdown.depositRequired > 0 && (
                    <div className="flex justify-between items-center pt-2 text-xs text-safran font-semibold">
                      <span>Acompte requis pour confirmation (30%) :</span>
                      <span>{priceBreakdown.depositRequired?.toLocaleString()} MAD</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-anthracite/60 dark:text-[#F3ECDD]/60">
                  Calcul en cours...
                </div>
              )}
            </div>

            {/* Direct WhatsApp Submission CTA */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-zellige to-zellige-dark text-white space-y-4 text-center">
              <h3 className="font-serif text-xl font-bold text-[#FBF5E6]">
                Prêt à sublimer vos convives ?
              </h3>
              <p className="text-xs sm:text-sm text-[#F3ECDD]/80 max-w-xl mx-auto">
                En cliquant ci-dessous, votre demande sera enregistrée avec un code de suivi officiel et transmise directement à notre directeur de réception sur WhatsApp.
              </p>

              <button
                type="button"
                disabled={submitting}
                onClick={handleFinalSubmit}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-base shadow-xl transition transform hover:scale-[1.02] active:scale-100 disabled:opacity-50"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>{submitting ? 'Préparation de votre dossier...' : 'Envoyer ma demande sur WhatsApp (0705782737)'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="pt-8 border-t border-safran/20 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => goToStep(currentStep - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-safran/30 text-xs sm:text-sm font-semibold text-anthracite dark:text-[#F3ECDD] hover:bg-safran/10 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Précédent</span>
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 6 && (
            <button
              type="button"
              onClick={() => goToStep(currentStep + 1)}
              className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-zellige text-white text-xs sm:text-sm font-semibold shadow hover:bg-zellige-dark transition"
            >
              <span>Continuer</span>
              <ChevronRight className="w-4 h-4 text-safran" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
