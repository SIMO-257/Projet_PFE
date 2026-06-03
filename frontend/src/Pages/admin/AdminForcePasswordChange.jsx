import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearMustChangePassword } from '../../Redux/Slices/adminSlice';
import { forcePasswordReset } from '../../services/adminService';

const AdminForcePasswordChange = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { admin, mustChangePassword } = useSelector((state) => state.admin);

  const [form, setForm] = useState({
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // If not required to change password, redirect to dashboard
  if (!mustChangePassword) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (form.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères.';
    }
    if (form.password !== form.password_confirmation) {
      newErrors.password_confirmation = 'Les mots de passe ne correspondent pas.';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      await forcePasswordReset({
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      dispatch(clearMustChangePassword());
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Une erreur est survenue.';
      setErrors({ form: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2f0205]/95 to-[#180103]/95 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1a0507]/80 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Header */}
          <div className="p-6 text-center border-b border-white/5">
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Première connexion</h2>
            <p className="text-white/50 text-sm mt-1">
              {admin?.first_name
                ? `Bienvenue ${admin.first_name}, veuillez définir un nouveau mot de passe.`
                : 'Veuillez définir un nouveau mot de passe sécurisé.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errors.form && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {errors.form}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Nouveau mot de passe</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={handleChange('password')}
                className={`w-full bg-white/5 border ${
                  errors.password ? 'border-red-500/50' : 'border-white/10'
                } rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50 transition-all`}
                placeholder="•••••••• (min. 8 caractères)"
                autoFocus
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Confirmer le mot de passe</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password_confirmation}
                onChange={handleChange('password_confirmation')}
                className={`w-full bg-white/5 border ${
                  errors.password_confirmation ? 'border-red-500/50' : 'border-white/10'
                } rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50 transition-all`}
                placeholder="••••••••"
              />
              {errors.password_confirmation && (
                <p className="text-red-400 text-xs mt-1">{errors.password_confirmation}</p>
              )}
            </div>

            {/* Requirements hint */}
            <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl px-4 py-3">
              <p className="text-yellow-400/70 text-xs">
                <span className="font-semibold text-yellow-400/90">Exigences :</span> Minimum 8 caractères.
                Choisissez un mot de passe que vous n'utilisez pas ailleurs.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Modification en cours...</span>
                </>
              ) : (
                'Changer le mot de passe'
              )}
            </button>

            <p className="text-center text-white/30 text-xs">
              Cette étape est obligatoire pour des raisons de sécurité.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminForcePasswordChange;
