import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateAdmin, clearAdminError } from '../../Redux/Slices/adminSlice';

const AdminProfile = () => {
  const dispatch = useDispatch();
  const { admin, loading, error } = useSelector((state) => state.admin);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (admin) {
      setForm({
        ...form,
        first_name: admin.first_name || '',
        last_name: admin.last_name || '',
        email: admin.email || '',
      });
    }
  }, [admin]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setFieldErrors({});
    dispatch(clearAdminError());

    const resultAction = await dispatch(updateAdmin(form));
    if (updateAdmin.fulfilled.match(resultAction)) {
      setSuccess('Profil mis à jour avec succès.');
      setForm({ ...form, password: '', password_confirmation: '' });
    } else {
      if (resultAction.payload?.errors) {
        setFieldErrors(resultAction.payload.errors);
      }
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Mon Profil</h2>
        <p className="text-white/50">Gérez vos informations personnelles et votre sécurité.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1a0507]/80 border border-white/10 p-8 rounded-2xl space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-white/70 text-sm font-medium">Prénom</label>
            <input
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50"
              required
            />
            {fieldErrors.first_name && <p className="text-red-400 text-xs">{fieldErrors.first_name[0]}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-white/70 text-sm font-medium">Nom</label>
            <input
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50"
              required
            />
            {fieldErrors.last_name && <p className="text-red-400 text-xs">{fieldErrors.last_name[0]}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-white/70 text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50"
            required
          />
          {fieldErrors.email && <p className="text-red-400 text-xs">{fieldErrors.email[0]}</p>}
        </div>

        <div className="border-t border-white/10 pt-6">
          <h3 className="text-lg font-medium text-white mb-4">Changer le mot de passe</h3>
          <p className="text-white/40 text-xs mb-4 italic">Laissez vide pour conserver le mot de passe actuel.</p>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Nouveau mot de passe</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50"
                placeholder="********"
              />
              {fieldErrors.password && <p className="text-red-400 text-xs">{fieldErrors.password[0]}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Confirmer</label>
              <input
                type="password"
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50"
                placeholder="********"
              />
            </div>
          </div>
        </div>

        {success && <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">{success}</div>}
        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error.message || 'Une erreur est survenue.'}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-yellow-500/20"
        >
          {loading ? 'Enregistrement...' : 'Mettre à jour le profil'}
        </button>
      </form>
    </div>
  );
};

export default AdminProfile;
