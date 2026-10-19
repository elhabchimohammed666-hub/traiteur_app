import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  TrendingUp,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  DollarSign,
  ArrowRight,
  Package,
  Boxes,
  Plus
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getDashboardStats().catch(() => ({ data: null })),
      api.getUpcomingEvents(30).catch(() => ({ data: [] })),
      api.getStockAlerts().catch(() => ({ data: [] })),
      api.getMonthlyRevenue(new Date().getFullYear()).catch(() => ({ data: [] }))
    ])
      .then(([statsRes, upRes, alertsRes, revRes]) => {
        setStats(statsRes.data || null);
        setUpcoming(upRes.data || []);
        setStockAlerts(alertsRes.data || []);
        setRevenueData(revRes.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-safran animate-pulse text-sm">
        Chargement des indicateurs clés...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zellige dark:text-zellige-accent">
            Tableau de Bord Exécutif
          </h1>
          <p className="text-xs sm:text-sm text-anthracite/60 dark:text-[#F3ECDD]/60">
            Aperçu des performances, réservations à venir et statut logistique.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/reservations"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zellige text-white text-xs font-semibold shadow hover:bg-zellige-dark transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Gérer les Réservations</span>
          </Link>
          <Link
            to="/admin/materiel"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-sable-dark border border-safran/30 text-xs font-semibold text-anthracite dark:text-[#F3ECDD] hover:bg-safran/10 transition"
          >
            <Boxes className="w-3.5 h-3.5 text-safran" />
            <span>Inventaire Stock</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Nouvelles demandes */}
        <div className="p-5 rounded-2xl bg-white dark:bg-sable-dark border border-safran/20 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-anthracite/60 dark:text-[#F3ECDD]/60">
            <span>Nouvelles Demandes</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-zellige dark:text-zellige-accent">
            {stats?.newBookingsCount || 0}
          </div>
          <span className="text-[11px] text-anthracite/50 dark:text-[#F3ECDD]/50 block">
            Devis en attente de traitement
          </span>
        </div>

        {/* KPI 2: Événements à venir (30j) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-sable-dark border border-safran/20 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-anthracite/60 dark:text-[#F3ECDD]/60">
            <span>Événements (30j)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-zellige dark:text-zellige-accent">
            {stats?.upcomingEventsCount || 0}
          </div>
          <span className="text-[11px] text-anthracite/50 dark:text-[#F3ECDD]/50 block">
            Confirmés pour les 30 prochains jours
          </span>
        </div>

        {/* KPI 3: Revenus Confirmés */}
        <div className="p-5 rounded-2xl bg-white dark:bg-sable-dark border border-safran/20 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-anthracite/60 dark:text-[#F3ECDD]/60">
            <span>Chiffre d'Affaires Confirmé</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-safran flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-safran">
            {(stats?.confirmedRevenue || 0).toLocaleString()}{' '}
            <span className="text-sm font-sans font-normal text-anthracite/60 dark:text-[#F3ECDD]/60">MAD</span>
          </div>
          <div className="flex justify-between text-[11px] text-anthracite/50 dark:text-[#F3ECDD]/50">
            <span>Encaissé : {(stats?.collectedRevenue || 0).toLocaleString()} MAD</span>
          </div>
        </div>

        {/* KPI 4: Alertes Stock */}
        <div className="p-5 rounded-2xl bg-white dark:bg-sable-dark border border-safran/20 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-anthracite/60 dark:text-[#F3ECDD]/60">
            <span>Alertes Matériel</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-bold text-red-600">
            {stockAlerts.length}
          </div>
          <span className="text-[11px] text-anthracite/50 dark:text-[#F3ECDD]/50 block">
            Articles sous seuil ou hors service
          </span>
        </div>
      </div>

      {/* Main Grid: Upcoming Events & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Upcoming Events (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-sable-dark p-6 rounded-3xl border border-safran/20 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-zellige dark:text-zellige-accent flex items-center gap-2">
              <Calendar className="w-5 h-5 text-safran" />
              Prochains Événements (30 jours)
            </h2>
            <Link
              to="/admin/reservations"
              className="text-xs text-safran hover:underline font-semibold flex items-center gap-1"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="text-center py-12 text-xs text-anthracite/50 dark:text-[#F3ECDD]/50">
              Aucun événement prévu dans les 30 prochains jours.
            </div>
          ) : (
            <div className="divide-y divide-safran/10">
              {upcoming.map((b) => (
                <div key={b._id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-safran">
                        {b.trackingCode}
                      </span>
                      <span className="text-xs font-semibold text-anthracite dark:text-[#F3ECDD]">
                        {b.customer?.fullName}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-safran/15 text-safran">
                        {b.event?.type}
                      </span>
                    </div>
                    <div className="text-xs text-anthracite/60 dark:text-[#F3ECDD]/60 flex items-center gap-3">
                      <span>{b.event?.date ? new Date(b.event.date).toLocaleDateString('fr-FR') : 'N/A'}</span>
                      <span>·</span>
                      <span>{b.event?.guestsCount} invités</span>
                      <span>·</span>
                      <span>{b.event?.city}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-serif font-bold text-sm text-safran">
                      {b.pricing?.total?.toLocaleString()} MAD
                    </span>
                    <Link
                      to={`/admin/reservations?id=${b._id}`}
                      className="px-3 py-1.5 rounded-lg bg-sable/30 dark:bg-sable-dark text-xs font-semibold hover:bg-safran/20 transition"
                    >
                      Détails
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock Alerts (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-sable-dark p-6 rounded-3xl border border-safran/20 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-zellige dark:text-zellige-accent flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Alertes Matériel
            </h2>
            <Link
              to="/admin/materiel"
              className="text-xs text-safran hover:underline font-semibold"
            >
              Gérer
            </Link>
          </div>

          {stockAlerts.length === 0 ? (
            <div className="text-center py-10 text-xs text-emerald-600">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-60" />
              Tous les stocks sont à niveau optimal.
            </div>
          ) : (
            <div className="space-y-3">
              {stockAlerts.map((item) => (
                <div
                  key={item._id}
                  className="p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-1"
                >
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-anthracite dark:text-[#F3ECDD]">{item.name}</span>
                    <span className="text-red-600 font-bold">
                      {item.availableQuantity} dispo / {item.totalQuantity}
                    </span>
                  </div>
                  <div className="text-[11px] text-anthracite/60 dark:text-[#F3ECDD]/60 flex justify-between">
                    <span>Hors service : {item.outOfServiceQuantity || 0}</span>
                    <span>Seuil d'alerte : {item.alertThreshold || 5}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
