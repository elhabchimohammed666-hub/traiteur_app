import React, { useState } from 'react';
import { api } from '../api/client';
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    eventType: 'mariage',
    guestsCount: 100,
    eventDate: '',
    city: 'Casablanca',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      await api.submitContact(form);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de l\'envoi.');
    } finally {
      setLoading(false);
    }
  };

  const whatsappDirectUrl =
    'https://wa.me/212705782737?text=' +
    encodeURIComponent('Bonjour Elhabchi Traiteur, je souhaite des informations sur vos prestations pour un événement.');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold tracking-widest uppercase text-safran block">
          Contact & Devis Personnalisé
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-zellige dark:text-zellige-accent">
          Échangeons sur Votre Grand Projet
        </h1>
        <p className="text-sm sm:text-base text-anthracite/70 dark:text-[#F3ECDD]/70 font-light">
          Notre équipe de conseillers événementiels est à votre écoute pour concevoir une prestation à la hauteur de vos exigences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-sable-dark p-8 rounded-3xl border border-safran/30 shadow-lg space-y-6">
            <h3 className="font-serif text-2xl font-bold text-zellige dark:text-zellige-accent">
              Nos Coordonnées
            </h3>

            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-safran/10 text-safran flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-anthracite dark:text-[#F3ECDD]">Siège & Réception</strong>
                  <span className="text-anthracite/70 dark:text-[#F3ECDD]/70 text-xs">
                    Angle Bd d’Anfa & Rue Moulay Youssef, 20000 Casablanca, Maroc
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-safran/10 text-safran flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-anthracite dark:text-[#F3ECDD]">Ligne Téléphonique</strong>
                  <a href="tel:0705782737" className="text-safran hover:underline font-mono text-sm">
                    +212 (0) 7 05 78 27 37
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-safran/10 text-safran flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-anthracite dark:text-[#F3ECDD]">Email Professionnel</strong>
                  <a href="mailto:contact@elhabchitraiteur.ma" className="text-safran hover:underline text-xs">
                    contact@elhabchitraiteur.ma
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-safran/10 text-safran flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-anthracite dark:text-[#F3ECDD]">Horaires d'Accueil</strong>
                  <span className="text-anthracite/70 dark:text-[#F3ECDD]/70 text-xs">
                    Du Lundi au Samedi : 09h00 – 20h00 <br />
                    Dimanche : Sur rendez-vous
                  </span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Callout */}
            <div className="pt-4 border-t border-safran/20">
              <a
                href={whatsappDirectUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-sm shadow transition"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Discussion Rapide sur WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Contact / Custom Quote Form */}
        <div className="lg:col-span-7 bg-white dark:bg-sable-dark p-8 sm:p-10 rounded-3xl border border-safran/30 shadow-xl space-y-6">
          <div>
            <h3 className="font-serif text-2xl font-bold text-zellige dark:text-zellige-accent">
              Demande Spécifique & Devis Sur-Mesure
            </h3>
            <p className="text-xs sm:text-sm text-anthracite/70 dark:text-[#F3ECDD]/70">
              Remplissez ce formulaire pour les événements atypiques, grands galas ou régimes spécifiques.
            </p>
          </div>

          {success ? (
            <div className="p-8 text-center space-y-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-300">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="font-serif text-xl font-bold text-emerald-800 dark:text-emerald-300">
                Message Transmis avec Succès !
              </h4>
              <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-200 max-w-md mx-auto">
                Notre maître d'hôtel a bien reçu votre demande et vous contactera par téléphone ou WhatsApp dans les plus brefs délais.
              </p>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="px-5 py-2.5 rounded-xl bg-zellige text-white text-xs font-semibold"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-safran">
                    Nom Complet *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="Votre nom et prénom"
                    value={form.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs sm:text-sm outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-safran">
                    Téléphone (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="06 12 34 56 78"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs sm:text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-safran">
                    Type d'événement
                  </label>
                  <select
                    name="eventType"
                    value={form.eventType}
                    onChange={handleChange}
                    className="w-full px-3 py-3 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs sm:text-sm outline-none"
                  >
                    <option value="mariage">Mariage</option>
                    <option value="fiancailles">Fiançailles</option>
                    <option value="bapteme">Baptême</option>
                    <option value="entreprise">Gala d'Entreprise</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-safran">
                    Nombre de convives
                  </label>
                  <input
                    type="number"
                    name="guestsCount"
                    min="10"
                    value={form.guestsCount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs sm:text-sm outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-safran">
                    Ville
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Casablanca, Rabat..."
                    value={form.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs sm:text-sm outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-safran">
                  Votre Message & Besoins Particuliers
                </label>
                <textarea
                  name="message"
                  required
                  rows="4"
                  placeholder="Décrivez votre projet, vos préférences culinaires, le lieu ou vos questions..."
                  value={form.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-sable/20 dark:bg-sable-dark border border-safran/30 text-xs sm:text-sm outline-none"
                ></textarea>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-zellige hover:bg-zellige-dark text-white font-semibold text-sm shadow transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Envoi en cours...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-safran" />
                    <span>Transmettre ma demande</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
