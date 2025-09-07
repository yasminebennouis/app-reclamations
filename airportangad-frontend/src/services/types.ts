// src/types.ts

// ✅ Services disponibles
export enum ServiceType {
  IT = 'IT',
  EQUIPEMENT = 'EQUIPEMENT',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
}

// ✅ Statuts possibles d’une réclamation
export enum StatutReclamation {
  OUVERT = 'OUVERT',
  EN_COURS = 'EN_COURS',
  RESOLUE = 'RESOLUE',
  NON_RESOLUE = 'NON_RESOLUE',
}

// ✅ Rôles utilisateur
export enum UserRole {
  ADMIN = 'ADMIN',
  DEMANDEUR = 'DEMANDEUR',
  TECHNICIEN = 'TECHNICIEN',
}

// ✅ Informations utilisateur (AuthContext)
export interface UserInfo {
  username: string;
  role: UserRole;
  service: ServiceType | null;
}

// ✅ Modèle de réclamation (côté front)
export interface Reclamation {
  id: number;
  titre: string;
  description: string;
  service: ServiceType;
  statut: StatutReclamation;
  dateCreation: string;
  dateUpdate?: string;
  dateResolution?: string;
  reponseTechnicien?: string;
  photoPath?: string;
  photoBase64?: string;
} 