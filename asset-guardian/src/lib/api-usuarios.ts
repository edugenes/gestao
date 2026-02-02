/**
 * API de usuários (backend Patrimônio).
 */

import { apiGet, apiPost, apiPatch, apiDelete } from './api';

export type Role = 'ADMIN' | 'GESTOR' | 'OPERADOR' | 'CONSULTA';

export interface UsuarioResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
}

export interface CreateUsuarioBody {
  email: string;
  name: string;
  password: string;
  role?: Role;
}

export function fetchUsuarios(params: { page?: number; limit?: number } = {}) {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', String(params.page));
  if (params.limit != null) sp.set('limit', String(params.limit));
  const q = sp.toString();
  return apiGet<{ data: UsuarioResponse[]; total: number }>(
    `/usuarios${q ? `?${q}` : ''}`
  );
}

export function createUsuario(body: CreateUsuarioBody) {
  return apiPost<{ id: string; email: string; name: string; role: string }>(
    '/usuarios',
    body
  );
}

export function updateUsuario(
  id: string,
  body: { name?: string; role?: Role; active?: boolean; password?: string }
) {
  return apiPatch<UsuarioResponse>(`/usuarios/${id}`, body);
}

export function deleteUsuario(id: string) {
  return apiDelete(`/usuarios/${id}`);
}
