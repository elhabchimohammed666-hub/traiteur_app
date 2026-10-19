import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { api } from '../../api/client';
import {
  CalendarDays,
  Search,
  Filter,
  Eye,
  Plus,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  MessageCircle,
  FileText,
  DollarSign,
  AlertTriangle,
  X,
  CreditCard,
  User,
  MapPin,
  Calendar
} from 'lucide-react';

export default function BookingsManage() {
  const { user } = useApp();
  const [searchParams] = useSearchParams();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('virement');
  const [paymentNote, setPaymentNote] = useState('');
  const [newNoteText, setNewNoteText] = useState('');

  // Manual booking form state
  const [manualForm, setManualForm] = useState({
    customer: { fullName: '', phone: '', email: '' },
    event: { type: 'mariage', date: '', guestsCount: 100, city: 'Casablanca', venueType: 'salle' },
    pricing: { total: 35000 }
  });

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await api.getAdminBookings(params);
      setBookings(res.data?.bookings || res.data || []);

      // If id is in URL params, auto-open it
      const targetId = searchParams.get('id');
      if (targetId && res.data) {
        const found = (res.data?.bookings || res.data).find((b) => b._id === targetId);
        if (found) setSelectedBooking(found);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await api.updateBookingStatus(id, { status: newStatus });
      if (res?.data) {
        setSelectedBooking(res.data);
        fetchBookings();
      }
    } catch (err) {
      alert(err.message || 'Erreur lors du changement de statut.');
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || Number(paymentAmount) <= 0) return;
    try {
      const res = await api.addPayment(selectedBooking._id, {
        amount: Number(paymentAmount),
        method: paymentMethod,
        note: paymentNote
      });
      if (res?.data) {
        setSelectedBooking(res.data);
        setShowPaymentModal(false);
        setPaymentAmount('');
        setPaymentNote('');
        fetchBookings();
      }
    } catch (err) {
      alert(err.message || 'Erreur lors de l\'enregistrement du paiement.');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    try {
      const res = await api.addInternalNote(selectedBooking._id, newNoteText.trim());
      if (res?.data) {
        setSelectedBooking(res.data);
        setNewNoteText('');
        fetchBookings();
      }
    } catch (err) {
      alert(err.message || 'Erreur lors de l\'ajout de la note.');
    }
  };

  const handleCreateManualBooking = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createAdminBooking(manualForm);
      if (res?.data) {
        setShowCreateModal(false);
        fetchBookings();
        setSelectedBooking(res.data);
      }
    } catch (err) {
      alert(err.message || 'Erreur lors de la création.');
    }
  };

  const statusConfig = {
    new: { label: 'Nouveau', bg: 'bg-blue-100 text-blue-800' },
    quote_sent: { label: 'Devis envoyé', bg: 'bg-amber-100 text-amber-800' },
    confirmed: { label: 'Confirmé', bg: 'bg-emerald-100 text-emerald-800' },
    in_progress: { label: 'En cours', bg: 'bg-purple-100 text-purple-800' },
    completed: { label: 'Réalisé', bg: 'bg-zinc-100 text-zinc-800' },
    cancelled: { label: 'Annulé', bg: 'bg-red-100 text-red-800' },
    rejected: { label: 'Refusé', bg: 'bg-red-100 text-red-800' }
  };

  const filteredBookings = bookings.filter((b) => {
    if (typeFilter !== 'all' && b.event?.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const code = (b.trackingCode || '').toLowerCase();
      const name = (b.customer?.fullName || '').toLowerCase();
      const phone = (b.customer?.phone || '').toLowerCase();
      if (!code.includes(q) && !name.includes(q) && !phone.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-zellige dark:text-zellige-accent">
            Gestion des Réservations & Devis
          </h1>
          <p className="text-xs text-anthracite/60 dark:text-[#F3ECDD]/60">
            Validation des devis, suivi des acomptes et coordination logistique.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/v1/bookings/export"
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-sable-dark border border-safran/30 text-xs font-semibold hover:bg-safran/10 transition"
          >
            <Download className="w-3.5 h-3.5 text-safran" />
            <span>Export CSV</span>
          </a>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zellige text-white text-xs font-semibold shadow hover:bg-zellige-dark transition"
          >
            <Plus className="w-4 h-4" />
            <span>Saisie Téléphonique / Manuelle</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-sable-dark p-4 rounded-2xl border border-safran/20 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-safran absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher code, client, téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="new">Nouveaux devis</option>
            <option value="quote_sent">Devis envoyés</option>
            <option value="confirmed">Confirmés</option>
            <option value="in_progress">En préparation</option>
            <option value="completed">Réalisés</option>
            <option value="cancelled">Annulés</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs outline-none"
          >
            <option value="all">Tous les types</option>
            <option value="mariage">Mariage</option>
            <option value="fiancailles">Fiançailles</option>
            <option value="bapteme">Baptême</option>
            <option value="entreprise">Entreprise</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-sable-dark rounded-2xl border border-safran/20 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-xs text-safran animate-pulse">
            Chargement des réservations...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 text-xs text-anthracite/50 dark:text-[#F3ECDD]/50">
            Aucun dossier ne correspond à votre recherche.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sable/30 dark:bg-sable-dark/60 text-anthracite/70 dark:text-[#F3ECDD]/70 border-b border-safran/20 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Code / Date</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Événement & Lieu</th>
                  <th className="px-4 py-3">Invités</th>
                  <th className="px-4 py-3">Montant / Solde</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-safran/10">
                {filteredBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-safran/5 transition">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-safran block">{b.trackingCode}</span>
                      <span className="text-[11px] text-anthracite/50 dark:text-[#F3ECDD]/50">
                        {b.event?.date ? new Date(b.event.date).toLocaleDateString('fr-FR') : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-anthracite dark:text-[#F3ECDD]">
                      <div>{b.customer?.fullName}</div>
                      <div className="text-[11px] font-normal text-anthracite/50 dark:text-[#F3ECDD]/50">{b.customer?.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize block">{b.event?.type}</span>
                      <span className="text-[11px] text-anthracite/50 dark:text-[#F3ECDD]/50">{b.event?.city}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {b.event?.guestsCount} pers.
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-serif font-bold text-safran block">
                        {b.pricing?.total?.toLocaleString()} MAD
                      </span>
                      <span className="text-[10px] text-emerald-600 block">
                        Reçu: {b.financials?.totalPaid?.toLocaleString() || 0} MAD
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          statusConfig[b.status]?.bg || 'bg-zinc-100 text-zinc-800'
                        }`}
                      >
                        {statusConfig[b.status]?.label || b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="px-3 py-1.5 rounded-lg bg-zellige text-white text-xs font-semibold hover:bg-zellige-dark transition"
                      >
                        Gérer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL DRAWER / MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-white dark:bg-sable-dark h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border-l border-safran/30">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-safran/20 pb-4">
              <div>
                <span className="font-mono text-xl font-bold text-safran">
                  {selectedBooking.trackingCode}
                </span>
                <p className="text-xs text-anthracite/60 dark:text-[#F3ECDD]/60">
                  Dossier créé le {new Date(selectedBooking.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-lg hover:bg-safran/10 text-anthracite dark:text-[#F3ECDD]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Change Selector */}
            <div className="p-4 rounded-xl bg-sable/20 dark:bg-sable-dark/40 border border-safran/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-safran block">
                  Statut du dossier
                </span>
                <span className="text-xs text-anthracite/60 dark:text-[#F3ECDD]/60">
                  Rôle actif : {user.role === 'admin' ? 'Administrateur' : 'Staff'}
                </span>
              </div>

              <select
                value={selectedBooking.status}
                onChange={(e) => handleStatusChange(selectedBooking._id, e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-sable-dark border border-safran/40 text-xs font-bold outline-none"
              >
                <option value="new">Nouveau</option>
                <option value="quote_sent">Devis envoyé</option>
                {user.role === 'admin' && <option value="confirmed">Confirmé (Acompte ok)</option>}
                <option value="in_progress">En préparation</option>
                {user.role === 'admin' && <option value="completed">Événement réalisé</option>}
                {user.role === 'admin' && <option value="cancelled">Annuler</option>}
                {user.role === 'admin' && <option value="rejected">Refuser (Indispo)</option>}
              </select>
            </div>

            {/* Quick Action Buttons (WhatsApp / PDF) */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`https://wa.me/${(selectedBooking.customer?.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Bonjour ${selectedBooking.customer?.fullName}, votre devis Elhabchi Traiteur pour votre ${selectedBooking.event?.type} est prêt.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp Client</span>
              </a>

              <a
                href={`/api/v1/bookings/pdf/${selectedBooking._id}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl bg-zellige hover:bg-zellige-dark text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-4 h-4 text-safran" />
                <span>Télécharger PDF</span>
              </a>
            </div>

            {/* Customer & Event Info */}
            <div className="p-4 rounded-xl border border-safran/20 space-y-2 text-xs">
              <span className="font-semibold uppercase tracking-wider text-safran block">
                Client & Réception
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>Client: <strong>{selectedBooking.customer?.fullName}</strong></div>
                <div>Téléphone: <strong>{selectedBooking.customer?.phone}</strong></div>
                <div>Date: <strong>{selectedBooking.event?.date ? new Date(selectedBooking.event.date).toLocaleDateString('fr-FR') : 'N/A'}</strong></div>
                <div>Invités: <strong>{selectedBooking.event?.guestsCount} personnes</strong></div>
                <div>Lieu: <strong>{selectedBooking.event?.city}</strong></div>
                <div>Type de lieu: <strong>{selectedBooking.event?.venueType}</strong></div>
              </div>
            </div>

            {/* Financials & Payments */}
            <div className="p-4 rounded-xl border border-safran/20 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold uppercase tracking-wider text-safran">
                  Règlements & Acomptes
                </span>
                {user.role === 'admin' && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="px-2.5 py-1 rounded bg-safran/20 text-safran font-bold hover:bg-safran/30 transition text-[11px]"
                  >
                    + Encaisser paiement
                  </button>
                )}
              </div>

              <div className="flex justify-between items-center text-sm">
                <span>Total dossier : <strong className="text-safran">{selectedBooking.pricing?.total?.toLocaleString()} MAD</strong></span>
                <span>Déjà payé : <strong className="text-emerald-600">{selectedBooking.financials?.totalPaid?.toLocaleString() || 0} MAD</strong></span>
              </div>

              {/* Payments list */}
              {(selectedBooking.financials?.payments || []).length > 0 && (
                <div className="mt-2 space-y-1.5 border-t border-safran/10 pt-2">
                  {selectedBooking.financials.payments.map((p, i) => (
                    <div key={i} className="flex justify-between text-[11px] text-anthracite/70 dark:text-[#F3ECDD]/70">
                      <span>{p.amount?.toLocaleString()} MAD ({p.method})</span>
                      <span>{new Date(p.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Internal Notes */}
            <div className="p-4 rounded-xl border border-safran/20 space-y-3 text-xs">
              <span className="font-semibold uppercase tracking-wider text-safran block">
                Notes Internes & Historique Staff
              </span>

              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ajouter une consigne staff..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-zellige text-white text-xs font-semibold"
                >
                  Ajouter
                </button>
              </form>

              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {(selectedBooking.internalNotes || []).map((n, idx) => (
                  <div key={idx} className="p-2 rounded bg-sable/20 dark:bg-sable-dark/40 text-[11px]">
                    <div className="text-anthracite dark:text-[#F3ECDD]">{n.text}</div>
                    <div className="text-[10px] text-anthracite/50 dark:text-[#F3ECDD]/50 mt-1">
                      {n.author} · {new Date(n.date).toLocaleString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Recording Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-sable-dark p-6 rounded-2xl max-w-sm w-full border border-safran space-y-4">
            <h3 className="font-serif text-lg font-bold text-zellige dark:text-zellige-accent">
              Enregistrer un Règlement
            </h3>
            <form onSubmit={handleAddPayment} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-safran font-semibold uppercase">Montant (MAD)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Ex: 10000"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-safran font-semibold uppercase">Mode de paiement</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs outline-none"
                >
                  <option value="virement">Virement bancaire</option>
                  <option value="especes">Espèces</option>
                  <option value="cheque">Chèque</option>
                  <option value="tpe">Carte bancaire (TPE)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-safran font-semibold uppercase">Référence / Note</label>
                <input
                  type="text"
                  placeholder="Ex: Acompte 30% reçu par virement"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-safran/30 text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-zellige text-white text-xs font-semibold shadow"
                >
                  Valider l'encaissement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Phone Booking Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-sable-dark p-6 sm:p-8 rounded-2xl max-w-lg w-full border border-safran space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-bold text-zellige dark:text-zellige-accent">
              Créer une Réservation Téléphonique
            </h3>
            <form onSubmit={handleCreateManualBooking} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-safran font-semibold uppercase">Nom du client *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.customer.fullName}
                    onChange={(e) => setManualForm({ ...manualForm, customer: { ...manualForm.customer, fullName: e.target.value } })}
                    className="w-full p-2.5 rounded-xl bg-sable/20 border border-safran/30 text-xs outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-safran font-semibold uppercase">Téléphone *</label>
                  <input
                    type="tel"
                    required
                    value={manualForm.customer.phone}
                    onChange={(e) => setManualForm({ ...manualForm, customer: { ...manualForm.customer, phone: e.target.value } })}
                    className="w-full p-2.5 rounded-xl bg-sable/20 border border-safran/30 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-safran font-semibold uppercase">Type d'événement</label>
                  <select
                    value={manualForm.event.type}
                    onChange={(e) => setManualForm({ ...manualForm, event: { ...manualForm.event, type: e.target.value } })}
                    className="w-full p-2.5 rounded-xl bg-sable/20 border border-safran/30 text-xs outline-none"
                  >
                    <option value="mariage">Mariage</option>
                    <option value="fiancailles">Fiançailles</option>
                    <option value="bapteme">Baptême</option>
                    <option value="entreprise">Entreprise</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-safran font-semibold uppercase">Date prévue</label>
                  <input
                    type="date"
                    required
                    value={manualForm.event.date}
                    onChange={(e) => setManualForm({ ...manualForm, event: { ...manualForm.event, date: e.target.value } })}
                    className="w-full p-2.5 rounded-xl bg-sable/20 border border-safran/30 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-safran font-semibold uppercase">Nombre d'invités</label>
                  <input
                    type="number"
                    min="10"
                    value={manualForm.event.guestsCount}
                    onChange={(e) => setManualForm({ ...manualForm, event: { ...manualForm.event, guestsCount: Number(e.target.value) } })}
                    className="w-full p-2.5 rounded-xl bg-sable/20 border border-safran/30 text-xs outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-safran font-semibold uppercase">Ville</label>
                  <input
                    type="text"
                    value={manualForm.event.city}
                    onChange={(e) => setManualForm({ ...manualForm, event: { ...manualForm.event, city: e.target.value } })}
                    className="w-full p-2.5 rounded-xl bg-sable/20 border border-safran/30 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-safran font-semibold uppercase">Montant Devis Estimé (MAD)</label>
                <input
                  type="number"
                  min="0"
                  value={manualForm.pricing.total}
                  onChange={(e) => setManualForm({ ...manualForm, pricing: { total: Number(e.target.value) } })}
                  className="w-full p-2.5 rounded-xl bg-sable/20 border border-safran/30 text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-safran/30 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-zellige text-white text-xs font-semibold shadow"
                >
                  Créer la réservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
