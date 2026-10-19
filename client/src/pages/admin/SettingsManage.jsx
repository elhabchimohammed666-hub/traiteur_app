import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  Settings,
  Save,
  CheckCircle2,
  Calendar,
  Trash2,
  Plus,
  Phone,
  Clock,
  Shield,
  MapPin
} from 'lucide-react';

export default function SettingsManage() {
  const [settings, setSettings] = useState({
    whatsappNumber: '212705782737',
    minNoticeDays: 7,
    depositPercentage: 30,
    maxEventsPerDay: 3,
    quoteValidityDays: 15,
    email: 'contact@elhabchitraiteur.ma',
    address: 'Angle Bd d’Anfa & Rue Moulay Youssef, Casablanca'
  });

  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New blocked date form
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('Complet / Congés');

  useEffect(() => {
    fetchSettingsAndBlocked();
  }, []);

  const fetchSettingsAndBlocked = async () => {
    try {
      setLoading(true);
      const [setRes, blockRes] = await Promise.all([
        api.getSettings().catch(() => ({ data: null })),
        api.getBlockedDates().catch(() => ({ data: [] }))
      ]);
      if (setRes.data) {
        setSettings((prev) => ({ ...prev, ...setRes.data }));
      }
      setBlockedDates(blockRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.updateSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlockedDate = async (e) => {
    e.preventDefault();
    if (!newBlockedDate) return;
    try {
      await api.blockDate({ date: newBlockedDate, reason: newBlockedReason });
      setNewBlockedDate('');
      fetchSettingsAndBlocked();
    } catch (err) {
      alert(err.message || 'Erreur lors du blocage de date.');
    }
  };

  const handleUnblockDate = async (id) => {
    if (!window.confirm('Débloquer cette date ?')) return;
    try {
      await api.unblockDate(id);
      fetchSettingsAndBlocked();
    } catch (err) {
      alert(err.message || 'Erreur.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-zellige dark:text-zellige-accent">
          Paramètres Généraux & Règles Métier
        </h1>
        <p className="text-xs text-anthracite/60 dark:text-[#F3ECDD]/60">
          Configuration des règles de réservation, coordonnées WhatsApp officielles et dates bloquées.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Paramètres enregistrés avec succès dans le système.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white dark:bg-sable-dark p-6 sm:p-8 rounded-3xl border border-safran/20 shadow-sm space-y-6">
        <h3 className="font-serif text-lg font-bold text-zellige dark:text-zellige-accent flex items-center gap-2">
          <Settings className="w-5 h-5 text-safran" />
          Règles de Réservation & WhatsApp
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-safran flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              Numéro WhatsApp Officiel
            </label>
            <input
              type="text"
              required
              value={settings.whatsappNumber}
              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs font-mono outline-none"
            />
            <span className="text-[10px] text-anthracite/50 dark:text-[#F3ECDD]/50 block">
              Format international sans symbole + (ex: 212705782737)
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-safran flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Préavis Minimum (jours)
            </label>
            <input
              type="number"
              min="1"
              required
              value={settings.minNoticeDays}
              onChange={(e) => setSettings({ ...settings, minNoticeDays: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs outline-none"
            />
            <span className="text-[10px] text-anthracite/50 dark:text-[#F3ECDD]/50 block">
              Délai minimal pour commander en ligne (par défaut 7 jours)
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-safran">
              Pourcentage d'Acompte Requis (%)
            </label>
            <input
              type="number"
              min="10"
              max="100"
              required
              value={settings.depositPercentage}
              onChange={(e) => setSettings({ ...settings, depositPercentage: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs outline-none"
            />
            <span className="text-[10px] text-anthracite/50 dark:text-[#F3ECDD]/50 block">
              Taux requis pour confirmer la réservation (défaut: 30%)
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-safran">
              Capacité Max d'Événements / Jour
            </label>
            <input
              type="number"
              min="1"
              max="10"
              required
              value={settings.maxEventsPerDay}
              onChange={(e) => setSettings({ ...settings, maxEventsPerDay: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs outline-none"
            />
            <span className="text-[10px] text-anthracite/50 dark:text-[#F3ECDD]/50 block">
              Limite quotidienne pour garantir la qualité de service
            </span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zellige text-white text-xs font-semibold shadow hover:bg-zellige-dark transition"
          >
            <Save className="w-4 h-4 text-safran" />
            <span>{saving ? 'Sauvegarde...' : 'Enregistrer les Modifications'}</span>
          </button>
        </div>
      </form>

      {/* Blocked Dates Section */}
      <div className="bg-white dark:bg-sable-dark p-6 sm:p-8 rounded-3xl border border-safran/20 shadow-sm space-y-6">
        <div>
          <h3 className="font-serif text-lg font-bold text-zellige dark:text-zellige-accent flex items-center gap-2">
            <Calendar className="w-5 h-5 text-safran" />
            Dates Bloquées (Congés, Fermetures Exceptionnelles)
          </h3>
          <p className="text-xs text-anthracite/60 dark:text-[#F3ECDD]/60">
            Les dates bloquées seront indiquées indisponibles sur le simulateur client.
          </p>
        </div>

        {/* Add blocked date */}
        <form onSubmit={handleAddBlockedDate} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="space-y-1 flex-1">
            <label className="text-xs text-safran font-semibold uppercase">Date à bloquer</label>
            <input
              type="date"
              required
              value={newBlockedDate}
              onChange={(e) => setNewBlockedDate(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs outline-none"
            />
          </div>

          <div className="space-y-1 flex-1">
            <label className="text-xs text-safran font-semibold uppercase">Motif / Raison</label>
            <input
              type="text"
              required
              placeholder="Ex: Congés de l'Aïd, maintenance atelier..."
              value={newBlockedReason}
              onChange={(e) => setNewBlockedReason(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-zellige text-white text-xs font-semibold shadow flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-safran" />
            <span>Bloquer cette date</span>
          </button>
        </form>

        {/* Blocked dates list */}
        <div className="space-y-2 pt-2 border-t border-safran/10">
          {blockedDates.length === 0 ? (
            <p className="text-xs text-anthracite/50 dark:text-[#F3ECDD]/50">
              Aucune date bloquée actuellement.
            </p>
          ) : (
            blockedDates.map((b) => (
              <div
                key={b._id}
                className="p-3 rounded-xl bg-sable/20 dark:bg-sable-dark/40 border border-safran/10 flex items-center justify-between text-xs"
              >
                <div>
                  <strong className="text-anthracite dark:text-[#F3ECDD]">
                    {new Date(b.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </strong>
                  <span className="text-[11px] text-anthracite/60 dark:text-[#F3ECDD]/60 ml-2">
                    ({b.reason})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleUnblockDate(b._id)}
                  className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                  title="Débloquer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
