import clientApi from './clientService';
import adminApi from './adminService';

// ── User-facing ─────────────────────────────────────────────────

export const getUserRapports = () => clientApi.get('/help');

export const submitRapport = (data) => clientApi.post('/repports', data);

// ── Admin ────────────────────────────────────────────────────────

export const getAdminRapports = (params) => adminApi.get('/admin/repports', { params });

export const updateRapportStatut = (id, statut) => adminApi.patch(`/admin/repports/${id}/statut`, { statut });
