import clientApi from './clientService';
import adminApi from './adminService';

// ── User-facing ─────────────────────────────────────────────────

export const getUserRapports = () => clientApi.get('/help');

export const submitRapport = (data) => clientApi.post('/rapports', data);

// ── Admin ────────────────────────────────────────────────────────

export const getAdminRapports = (params) => adminApi.get('/admin/rapports', { params });

export const updateRapportStatut = (id, statut) => adminApi.patch(`/admin/rapports/${id}/statut`, { statut });
