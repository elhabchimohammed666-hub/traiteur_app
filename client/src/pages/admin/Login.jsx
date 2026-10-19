import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { api } from '../../api/client';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const { loginUser, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect to admin dashboard
  if (user) {
    navigate('/admin', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const res = await api.login({ email, password });
      if (res?.data) {
        loginUser(res.data.token, res.data.user);
        const redirect = location.state?.from?.pathname || '/admin';
        navigate(redirect, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Identifiants incorrects ou compte suspendu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white dark:bg-sable-dark p-8 sm:p-10 rounded-3xl border-2 border-safran/40 shadow-2xl space-y-8">
        
        {/* Brand & Icon */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-zellige flex items-center justify-center text-safran shadow-md border border-safran">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zellige dark:text-zellige-accent">
            Espace Professionnel
          </h1>
          <p className="text-xs text-anthracite/60 dark:text-[#F3ECDD]/60">
            Accès sécurisé réservé à la direction et au staff Elhabchi Traiteur
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-safran flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              Email professionnel
            </label>
            <input
              type="email"
              required
              placeholder="admin@elhabchitraiteur.ma"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-sable/20 dark:bg-sable-dark/80 border border-safran/30 text-sm outline-none text-anthracite dark:text-[#F3ECDD]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-safran flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Mot de passe
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-sable/20 dark:bg-sable-dark/80 border border-safran/30 text-sm outline-none text-anthracite dark:text-[#F3ECDD]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-zellige hover:bg-zellige-dark text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authentification...</span>
            ) : (
              <>
                <span>Connexion au Dashboard</span>
                <ArrowRight className="w-4 h-4 text-safran" />
              </>
            )}
          </button>
        </form>

        <div className="p-3 rounded-xl bg-sable/20 dark:bg-sable-dark/40 border border-safran/20 text-center">
          <span className="text-[11px] text-anthracite/60 dark:text-[#F3ECDD]/60 block">
            Comptes démo préconfigurés :
          </span>
          <span className="text-[11px] font-mono font-medium text-safran block mt-1">
            Admin: admin@elhabchitraiteur.ma / Admin1234!
          </span>
          <span className="text-[11px] font-mono text-anthracite/60 dark:text-[#F3ECDD]/60 block">
            Staff: staff@elhabchitraiteur.ma / Staff1234!
          </span>
        </div>
      </div>
    </div>
  );
}
