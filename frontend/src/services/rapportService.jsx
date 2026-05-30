import userApi from './userService';
import adminApi from './adminService';

// ── User-facing ─────────────────────────────────────────────────

export const getUserRapports = () => userApi.get('/help');

export const submitRapport = (data) => userApi.post('/repports', data);

// ── Admin ────────────────────────────────────────────────────────

export const getAdminRapports = (params) => adminApi.get('/admin/repports', { params });

export const updateRapportStatut = (id, statut) => adminApi.patch(`/admin/repports/${id}/statut`, { statut });
