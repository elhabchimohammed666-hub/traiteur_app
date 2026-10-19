import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  MapPin,
  ExternalLink
} from 'lucide-react';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  useEffect(() => {
    fetchEvents();
  }, [year, month]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
      const res = await api.getMonthlyCalendar(monthStr);
      setEvents(res.data?.events || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayEvents(null);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayEvents(null);
  };

  // Calendar calculations
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  // Convert Sunday=0 to Monday=0
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const getDayEvents = (dayNum) => {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    return events.filter((ev) => {
      const evDate = new Date(ev.date || ev.event?.date).toISOString().split('T')[0];
      return evDate === dStr;
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-zellige dark:text-zellige-accent">
            Planning & Calendrier des Réceptions
          </h1>
          <p className="text-xs text-anthracite/60 dark:text-[#F3ECDD]/60">
            Vue mensuelle des événements réservés pour la planification des équipes et du matériel.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3 bg-white dark:bg-sable-dark px-4 py-2 rounded-2xl border border-safran/30 shadow-sm">
          <button
            onClick={prevMonth}
            className="p-1 rounded-lg hover:bg-safran/10 text-anthracite dark:text-[#F3ECDD]"
          >
            <ChevronLeft className="w-5 h-5 text-safran" />
          </button>
          <span className="font-serif text-sm font-bold min-w-32 text-center text-zellige dark:text-zellige-accent">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1 rounded-lg hover:bg-safran/10 text-anthracite dark:text-[#F3ECDD]"
          >
            <ChevronRight className="w-5 h-5 text-safran" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-sable-dark rounded-3xl border border-safran/20 shadow-md p-4 sm:p-6 space-y-4">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-wider text-safran pb-2 border-b border-safran/10">
          <div>Lun</div>
          <div>Mar</div>
          <div>Mer</div>
          <div>Jeu</div>
          <div>Ven</div>
          <div>Sam</div>
          <div>Dim</div>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells before start of month */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-24 p-2 rounded-xl bg-sable/5 dark:bg-sable-dark/20 opacity-30"></div>
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayEvents = getDayEvents(dayNum);
            const isToday =
              new Date().getDate() === dayNum &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => dayEvents.length > 0 && setSelectedDayEvents({ dayNum, events: dayEvents })}
                className={`min-h-24 p-2 rounded-xl border transition flex flex-col justify-between ${
                  dayEvents.length > 0 ? 'cursor-pointer hover:border-safran' : ''
                } ${
                  isToday
                    ? 'border-safran ring-2 ring-safran/30 bg-safran/5'
                    : 'border-safran/15 bg-white dark:bg-sable-dark'
                }`}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-bold ${isToday ? 'text-safran' : 'text-anthracite dark:text-[#F3ECDD]'}`}>
                    {dayNum}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-safran animate-pulse"></span>
                  )}
                </div>

                <div className="space-y-1 mt-1">
                  {dayEvents.slice(0, 2).map((ev, idx) => (
                    <div
                      key={idx}
                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zellige text-white truncate"
                    >
                      {ev.customer?.fullName || ev.title || 'Événement'}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[9px] text-safran font-semibold block">
                      +{dayEvents.length - 2} autres
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Events Popup / Box */}
      {selectedDayEvents && (
        <div className="bg-white dark:bg-sable-dark p-6 rounded-2xl border border-safran/30 shadow-lg space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-safran/20 pb-3">
            <h3 className="font-serif text-lg font-bold text-zellige dark:text-zellige-accent">
              Événements du {selectedDayEvents.dayNum} {monthNames[month]} {year}
            </h3>
            <button
              onClick={() => setSelectedDayEvents(null)}
              className="text-xs text-anthracite/60 dark:text-[#F3ECDD]/60 hover:text-safran"
            >
              Fermer
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedDayEvents.events.map((ev) => (
              <div
                key={ev._id}
                className="p-4 rounded-xl bg-sable/20 dark:bg-sable-dark/40 border border-safran/20 space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-safran">{ev.trackingCode}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-safran/10 text-safran">
                    {ev.event?.type || ev.type}
                  </span>
                </div>
                <div className="font-bold text-sm text-anthracite dark:text-[#F3ECDD]">
                  {ev.customer?.fullName}
                </div>
                <div className="text-xs text-anthracite/60 dark:text-[#F3ECDD]/60 flex items-center gap-3">
                  <span>{ev.event?.guestsCount} invités</span>
                  <span>·</span>
                  <span>{ev.event?.city}</span>
                </div>
                <div className="pt-2">
                  <Link
                    to={`/admin/reservations?id=${ev._id}`}
                    className="inline-flex items-center gap-1 text-xs text-safran hover:underline font-semibold"
                  >
                    <span>Ouvrir la fiche complète</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
