import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { api } from '../api/client';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  MessageCircle,
  XCircle,
  Calendar,
  Users,
  MapPin,
  Utensils,
  Download,
  Send,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function Track() {
  const { lang, t } = useApp();
  const [searchParams] = useSearchParams();

  const [code, setCode] = useState(searchParams.get('code') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals & Actions
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [modificationText, setModificationText] = useState('');
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Auto trigger search if params present
  useEffect(() => {
    if (searchParams.get('code') && searchParams.get('phone')) {
      handleSearch(searchParams.get('code'), searchParams.get('phone'));
    }
  }, [searchParams]);

  const handleSearch = async (c = code, p = phone) => {
    if (!c.trim() || !p.trim()) {
      setError('Veuillez renseigner à la fois votre référence de dossier et votre numéro de téléphone.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setActionSuccess('');
      const res = await api.trackBooking(c.trim(), p.trim());
      if (res?.data) {
        setBooking(res.data);
      } else {
        setError('Aucun dossier trouvé pour ces identifiants.');
      }
    } catch (err) {
      setError(err.message || 'Impossible de trouver ce dossier. Vérifiez votre référence et numéro.');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async () => {
    if (!window.confirm('Confirmez-vous l\'acceptation de ce devis ? Notre équipe préparera votre contrat et les modalités d\'acompte.')) return;
    try {
      setActionLoading(true);
      const res = await api.respondToBooking(booking.trackingCode, {
        action: 'accept',
        customerPhone: phone
      });
      if (res?.data) {
        setBooking(res.data);
        setActionSuccess('Félicitations ! Vous avez accepté le devis. Notre équipe vous contacte sous peu.');
      }
    } catch (err) {
      alert(err.message || 'Erreur lors de la confirmation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestModification = async (e) => {
    e.preventDefault();
    if (!modificationText.trim()) return;
    try {
      setActionLoading(true);
      const res = await api.respondToBooking(booking.trackingCode, {
        action: 'request_modification',
        comments: modificationText,
        customerPhone: phone
      });
      if (res?.data) {
        setBooking(res.data);
        setShowModifyModal(false);
        setModificationText('');
        setActionSuccess('Votre demande de modification a bien été transmise à notre équipe.');
      }
    } catch (err) {
      alert(err.message || 'Erreur lors de la transmission.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    try {
      setActionLoading(true);
      const res = await api.respondToBooking(booking.trackingCode, {
        action: 'cancel',
        reason: cancelReason,
        customerPhone: phone
      });
      if (res?.data) {
        setBooking(res.data);
        setShowCancelModal(false);
        setCancelReason('');
        setActionSuccess('Votre dossier a été annulé conformément à votre demande.');
      }
    } catch (err) {
      alert(err.message || 'Erreur lors de l\'annulation.');
    } finally {
      setActionLoading(false);
    }
  };

  const statusConfig = {
    new: { label: 'Demande reçue', color: 'bg-blue-100 text-blue-800 border-blue-300', stepIndex: 1 },
    quote_sent: { label: 'Devis prêt à valider', color: 'bg-amber-100 text-amber-800 border-amber-300', stepIndex: 2 },
    confirmed: { label: 'Réservation confirmée', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', stepIndex: 3 },
    in_progress: { label: 'En préparation logistique', color: 'bg-purple-100 text-purple-800 border-purple-300', stepIndex: 4 },
    completed: { label: 'Événement célébré', color: 'bg-zinc-100 text-zinc-800 border-zinc-300', stepIndex: 5 },
    cancelled: { label: 'Dossier annulé', color: 'bg-red-100 text-red-800 border-red-300', stepIndex: -1 },
    rejected: { label: 'Non disponible', color: 'bg-red-100 text-red-800 border-red-300', stepIndex: -1 }
  };

  const stepsList = [
    { key: 'new', label: '1. Demande reçue' },
    { key: 'quote_sent', label: '2. Devis chiffré' },
    { key: 'confirmed', label: '3. Acompte & Confirmé' },
    { key: 'in_progress', label: '4. En préparation' },
    { key: 'completed', label: '5. Réception réussie' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-semibold tracking-widest uppercase text-safran block">
          Espace Client & Suivi
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-zellige dark:text-zellige-accent">
          Suivi de Votre Devis & Réservation
        </h1>
        <p className="text-sm text-anthracite/70 dark:text-[#F3ECDD]/70">
          Entrez votre référence unique (ex: ELH-2026-00042) et votre numéro de téléphone pour consulter l'avancement de votre réception.
        </p>
      </div>

      {/* Search Bar Box */}
      <div className="bg-white dark:bg-sable-dark/80 p-6 sm:p-8 rounded-3xl shadow-xl border border-safran/30">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end"
        >
          <div className="sm:col-span-5 space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-safran">
              Référence du dossier
            </label>
            <input
              type="text"
              required
              placeholder="Ex: ELH-2026-00042"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-sm outline-none font-mono text-anthracite dark:text-[#F3ECDD]"
            />
          </div>

          <div className="sm:col-span-5 space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-safran">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              required
              placeholder="Ex: 06 12 34 56 78"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-sm outline-none text-anthracite dark:text-[#F3ECDD]"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-zellige hover:bg-zellige-dark text-white font-semibold text-sm shadow transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Recherche...</span>
              ) : (
                <>
                  <Search className="w-4 h-4 text-safran" />
                  <span>Consulter</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Action Success Alert */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Booking Details View */}
      {booking && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Top Info Bar */}
          <div className="bg-white dark:bg-sable-dark p-6 rounded-2xl border border-safran/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xl font-bold text-safran">
                  {booking.trackingCode}
                </span>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${
                    statusConfig[booking.status]?.color || 'bg-zinc-100 text-zinc-800'
                  }`}
                >
                  {statusConfig[booking.status]?.label || booking.status}
                </span>
              </div>
              <p className="text-xs text-anthracite/60 dark:text-[#F3ECDD]/60">
                Client : <strong>{booking.customer?.fullName}</strong> ({booking.customer?.phone})
              </p>
            </div>

            {/* Quick Actions (PDF / WhatsApp) */}
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={`/api/v1/bookings/pdf/${booking._id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sable/30 dark:bg-sable-dark hover:bg-safran/20 border border-safran/30 text-xs font-semibold text-anthracite dark:text-[#F3ECDD] transition"
              >
                <Download className="w-4 h-4 text-safran" />
                <span>Télécharger Devis (PDF)</span>
              </a>

              <a
                href={`https://wa.me/212705782737?text=${encodeURIComponent(
                  `Bonjour Elhabchi Traiteur, concernant mon dossier ${booking.trackingCode} (${booking.event?.type} du ${booking.event?.date}) : `
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold transition"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Direct WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Status Timeline */}
          {statusConfig[booking.status]?.stepIndex > 0 && (
            <div className="p-6 bg-white dark:bg-sable-dark rounded-2xl border border-safran/20 shadow-md">
              <span className="text-xs font-semibold uppercase tracking-wider text-safran block mb-6">
                Progression du Dossier
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {stepsList.map((step, idx) => {
                  const stepNum = idx + 1;
                  const currentIdx = statusConfig[booking.status]?.stepIndex || 1;
                  const isDone = currentIdx >= stepNum;
                  const isCurrent = currentIdx === stepNum;
                  return (
                    <div
                      key={step.key}
                      className={`p-3 rounded-xl border text-center space-y-1.5 transition ${
                        isCurrent
                          ? 'bg-zellige text-white border-safran shadow-md'
                          : isDone
                          ? 'bg-safran/10 border-safran/30 text-anthracite dark:text-[#F3ECDD]'
                          : 'bg-sable/10 dark:bg-sable-dark/20 border-transparent text-anthracite/40 dark:text-[#F3ECDD]/40'
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        {isDone ? (
                          <CheckCircle2 className={`w-5 h-5 ${isCurrent ? 'text-safran' : 'text-safran'}`} />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>
                      <span className="text-xs font-semibold block">{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Client Decision Actions (Accept / Modify / Cancel) */}
          {(booking.status === 'quote_sent' || booking.status === 'new') && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-safran/10 via-sable/30 to-safran/10 border border-safran/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-serif text-lg font-bold text-zellige dark:text-zellige-accent">
                  Votre validation en ligne
                </h4>
                <p className="text-xs text-anthracite/70 dark:text-[#F3ECDD]/70">
                  Validez votre devis pour bloquer la date ou demandez un ajustement de menu/matériel.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleAcceptQuote}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-zellige hover:bg-zellige-dark text-white font-semibold text-xs shadow transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-safran" />
                  <span>Accepter le devis</span>
                </button>

                <button
                  onClick={() => setShowModifyModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-sable-dark border border-safran/40 hover:bg-safran/10 text-xs font-semibold text-anthracite dark:text-[#F3ECDD] transition"
                >
                  Modifier ma demande
                </button>

                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-3.5 py-2.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-semibold transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Details Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Specs */}
            <div className="p-6 bg-white dark:bg-sable-dark rounded-2xl border border-safran/20 shadow-md space-y-4">
              <h3 className="font-serif text-lg font-bold text-zellige dark:text-zellige-accent flex items-center gap-2">
                <Calendar className="w-5 h-5 text-safran" />
                Détails de l'Événement
              </h3>
              <div className="space-y-2 text-sm divide-y divide-safran/10">
                <div className="flex justify-between py-1">
                  <span className="text-anthracite/60 dark:text-[#F3ECDD]/60">Date prévue :</span>
                  <strong>{booking.event?.date ? new Date(booking.event.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-anthracite/60 dark:text-[#F3ECDD]/60">Nombre d'invités :</span>
                  <strong>{booking.event?.guestsCount} personnes</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-anthracite/60 dark:text-[#F3ECDD]/60">Lieu / Ville :</span>
                  <strong>{booking.event?.city} ({booking.event?.venueType})</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-anthracite/60 dark:text-[#F3ECDD]/60">Horaires :</span>
                  <strong>{booking.event?.startTime || '19:00'} - {booking.event?.endTime || '02:00'}</strong>
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="p-6 bg-white dark:bg-sable-dark rounded-2xl border border-safran/20 shadow-md space-y-4">
              <h3 className="font-serif text-lg font-bold text-zellige dark:text-zellige-accent flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-safran" />
                Budget & Règlements
              </h3>
              <div className="space-y-2 text-sm divide-y divide-safran/10">
                <div className="flex justify-between py-1">
                  <span className="text-anthracite/60 dark:text-[#F3ECDD]/60">Montant total estimé :</span>
                  <span className="font-serif text-lg font-bold text-safran">
                    {booking.pricing?.total?.toLocaleString()} MAD
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-anthracite/60 dark:text-[#F3ECDD]/60">Acomptes encaissés :</span>
                  <strong className="text-emerald-600">
                    {booking.financials?.totalPaid?.toLocaleString() || 0} MAD
                  </strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-anthracite/60 dark:text-[#F3ECDD]/60">Solde restant dû :</span>
                  <strong className="text-anthracite dark:text-[#F3ECDD]">
                    {booking.financials?.balanceDue?.toLocaleString() || booking.pricing?.total?.toLocaleString()} MAD
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modify Modal */}
      {showModifyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-sable-dark p-6 sm:p-8 rounded-2xl max-w-lg w-full border border-safran shadow-2xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-zellige dark:text-zellige-accent">
              Demande de Modification
            </h3>
            <p className="text-xs text-anthracite/70 dark:text-[#F3ECDD]/70">
              Indiquez les changements souhaités (nombre d'invités, ajustement de menu, vaisselle ou date) :
            </p>
            <form onSubmit={handleRequestModification} className="space-y-4">
              <textarea
                required
                rows="4"
                placeholder="Ex: Nous souhaitons ajouter 20 invités et retirer la tente caïdale..."
                value={modificationText}
                onChange={(e) => setModificationText(e.target.value)}
                className="w-full p-3 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs sm:text-sm outline-none"
              ></textarea>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModifyModal(false)}
                  className="px-4 py-2 rounded-lg border border-safran/30 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-zellige text-white text-xs font-semibold shadow"
                >
                  Envoyer la demande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-sable-dark p-6 sm:p-8 rounded-2xl max-w-lg w-full border border-red-400 shadow-2xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-red-600">
              Annulation du Dossier
            </h3>
            <p className="text-xs text-anthracite/70 dark:text-[#F3ECDD]/70">
              Êtes-vous certain de vouloir annuler cette demande ? Veuillez indiquer le motif :
            </p>
            <form onSubmit={handleCancelBooking} className="space-y-4">
              <textarea
                required
                rows="3"
                placeholder="Motif de l'annulation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs sm:text-sm outline-none"
              ></textarea>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 rounded-lg border border-safran/30 text-xs font-semibold"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold shadow"
                >
                  Confirmer l'annulation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
