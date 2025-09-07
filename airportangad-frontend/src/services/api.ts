// src/services/api.ts
import axios from 'axios';
import { Platform } from 'react-native';
import { ServiceType, StatutReclamation } from '@/services/types';

/* =====================================================================
 *                       BASE URL & INSTANCE AXIOS
 * ===================================================================== */

// 1) Variable d'env (utile sur téléphone réel / réseau local)
const ENV_BASE = process.env.EXPO_PUBLIC_API_BASE_URL?.trim?.();

// 2) Fallbacks automatiques selon la plateforme
const FALLBACK = Platform.select({
  android: 'http://10.0.2.2:8888', // Android Emulator
  ios: 'http://localhost:8888',    // iOS Simulator
  web: 'http://localhost:8888',    // Expo Web
  default: 'http://localhost:8888'
});

const BASE_URL = ENV_BASE || FALLBACK!;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Log pour vérifier l’URL réellement utilisée
console.log('[API] baseURL =', api.defaults.baseURL);

// Messages d’erreur plus parlants (réseau/CORS/serveur)
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.message === 'Network Error') {
      console.warn('[API] Network Error. Backend injoignable à :', api.defaults.baseURL);
    } else {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message;
      console.warn('[API] Error', status, msg);
    }
    return Promise.reject(err);
  }
);

/* =====================================================================
 *                               TYPES
 * ===================================================================== */
export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // index de page courant
  size: number;   // taille demandée
};

export type AdminListParams = {
  page?: number;
  size?: number;
  sort?: string; // ex: 'dateCreation' ou 'dateUpdate'
  statut?: StatutReclamation;
  service?: ServiceType;
  q?: string;
};

/* =====================================================================
 *                              HELPERS
 * ===================================================================== */

/** Accepte un backend qui renvoie soit un Page<T>, soit une simple liste T[] */
function toPage<T>(raw: any): PageResponse<T> {
  if (Array.isArray(raw)) {
    return {
      content: raw as T[],
      totalElements: raw.length,
      totalPages: 1,
      number: 0,
      size: raw.length,
    };
  }
  return raw as PageResponse<T>;
}

/* =====================================================================
 *                               AUTH
 * ===================================================================== */
export async function login(username: string, password: string) {
  const { data } = await api.post('/api/auth/login', { username, password });
  return data as { username: string; role: 'ADMIN' | 'DEMANDEUR' | 'TECHNICIEN'; service: ServiceType | null };
}

/* =====================================================================
 *                             DEMANDEUR
 * ===================================================================== */
export async function createReclamation(
  username: string,
  payload: {
    service: ServiceType;
    titre: string;
    description: string;
    photoBase64?: string | null;
    photoPath?: string | null;
  }
) {
  const { data } = await api.post('/api/demandeur/reclamations', payload, { params: { username } });
  return data;
}

export async function getMyReclamations(username: string) {
  const { data } = await api.get('/api/demandeur/reclamations', { params: { username } });
  return data as any[];
}

export async function getMyReclamationDetail(id: number, username: string) {
  const { data } = await api.get(`/api/demandeur/reclamations/${id}`, { params: { username } });
  return data;
}

/* =====================================================================
 *                             TECHNICIEN
 * ===================================================================== */
export async function getServiceReclamations(username: string) {
  const { data } = await api.get('/api/technicien/reclamations', { params: { username } });
  return data as any[];
}

export async function getServiceReclamationDetail(id: number, username: string) {
  const { data } = await api.get(`/api/technicien/reclamations/${id}`, { params: { username } });
  return data;
}

/** Réponse technicien (commentaire + statut) */
export async function postTechnicianReply(
  id: number,
  username: string,
  body: { reponse: string; statut: StatutReclamation }
) {
  const payload = { ...body, commentaire: body.reponse };
  const { data } = await api.post(`/api/technicien/reclamations/${id}/reponse`, payload, {
    params: { username },
  });
  return data;
}

/** Alias rétro-compatible */
export const replyReclamation = postTechnicianReply;

/** Liste des réclamations déjà traitées par le technicien */
export async function getTechnicianReplies(username: string) {
  const { data } = await api.get('/api/technicien/reclamations/replied', {
    params: { username },
  });
  return data as any[];
}

/* =====================================================================
 *                               ADMIN
 * ===================================================================== */

/** Liste Admin paginée + filtres + recherche (ou simple liste selon backend) */
export async function getAdminReclamations(params?: AdminListParams) {
  const { data } = await api.get('/api/admin/reclamations', { params });
  return toPage<any>(data);
}

/**
 * Détail Admin (par id).
 * Ton backend n’a pas d’endpoint /api/admin/reclamations/{id} → on filtre côté front.
 */
export async function getAdminReclamationDetail(id: number) {
  const page = await getAdminReclamations({ page: 0, size: 500 });
  return page.content.find((r: any) => r.id === id);
}

/** Rétro-compat : renvoie un tableau simple (page 0) */
export async function getAllReclamations() {
  const page0 = await getAdminReclamations({ page: 0, size: 50 });
  return page0.content;
}

/** Statistiques Admin */
export async function getAdminStats() {
  const { data } = await api.get('/api/admin/stats');
  return data;
}
