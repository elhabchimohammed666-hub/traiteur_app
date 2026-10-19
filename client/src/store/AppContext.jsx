import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';
import { api } from '../api/client';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // 1. Language state
  const [lang, setLang] = useState(() => localStorage.getItem('elhabchi_lang') || 'fr');

  useEffect(() => {
    localStorage.setItem('elhabchi_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // 2. Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('elhabchi_theme') || 'light');

  useEffect(() => {
    localStorage.setItem('elhabchi_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  // 3. User Authentication state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('elhabchi_user');
    return saved ? JSON.parse(saved) : null;
  });

  const loginUser = (token, userData) => {
    localStorage.setItem('elhabchi_token', token);
    localStorage.setItem('elhabchi_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logoutUser = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('elhabchi_token');
    localStorage.removeItem('elhabchi_user');
    setUser(null);
  };

  // 4. Simulator Draft state (persisted)
  const [simulatorDraft, setSimulatorDraft] = useState(() => {
    const saved = localStorage.getItem('elhabchi_simulator_draft');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      step: 1,
      event: {
        type: 'mariage',
        date: '',
        startTime: '19:00',
        endTime: '02:00',
        guestsCount: 150,
        city: 'Casablanca',
        venueType: 'salle',
        address: ''
      },
      packageId: '',
      selectedPackage: null,
      selectedDishes: [],
      selectedEquipment: [],
      selectedServices: [],
      customer: {
        fullName: '',
        phone: '',
        email: '',
        isCompany: false,
        companyName: '',
        preferredContact: 'whatsapp'
      },
      specialRequests: '',
      consent: false
    };
  });

  const updateSimulator = (updater) => {
    setSimulatorDraft((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      localStorage.setItem('elhabchi_simulator_draft', JSON.stringify(next));
      return next;
    });
  };

  const resetSimulator = () => {
    localStorage.removeItem('elhabchi_simulator_draft');
    setSimulatorDraft({
      step: 1,
      event: {
        type: 'mariage',
        date: '',
        startTime: '19:00',
        endTime: '02:00',
        guestsCount: 150,
        city: 'Casablanca',
        venueType: 'salle',
        address: ''
      },
      packageId: '',
      selectedPackage: null,
      selectedDishes: [],
      selectedEquipment: [],
      selectedServices: [],
      customer: {
        fullName: '',
        phone: '',
        email: '',
        isCompany: false,
        companyName: '',
        preferredContact: 'whatsapp'
      },
      specialRequests: '',
      consent: false
    });
  };

  // Helper translation getter
  const t = (key) => {
    const keys = key.split('.');
    let cur = translations[lang] || translations.fr;
    for (const k of keys) {
      if (!cur || cur[k] === undefined) {
        // fallback to fr
        let fallback = translations.fr;
        for (const fbKey of keys) {
          fallback = fallback?.[fbKey];
        }
        return fallback || key;
      }
      cur = cur[k];
    }
    return cur;
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        theme,
        toggleTheme,
        t,
        user,
        loginUser,
        logoutUser,
        simulatorDraft,
        updateSimulator,
        resetSimulator
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
