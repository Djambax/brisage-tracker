export type Focus = "PA" | "PM" | "PO" | "AUCUN";

export type Avis = "BIEN" | "PUE_LA_MERDE" | "MOYEN";

export interface Brisage {
  id: string;
  itemNom: string;
  itemNiveau?: number;
  coefficient: number; // en %
  focus: Focus;
  avis: Avis;
  lamasGeneres: number;
  auteur: string;
  commentaire?: string;
  createdAt: string; // ISO date
}

// Champs fournis par le client lors de la création (id + createdAt générés côté serveur)
export type NouveauBrisage = Omit<Brisage, "id" | "createdAt">;

export const FOCUS_OPTIONS: Focus[] = ["PA", "PM", "PO", "AUCUN"];

export const AVIS_OPTIONS: Avis[] = ["BIEN", "MOYEN", "PUE_LA_MERDE"];

export const AVIS_LABELS: Record<Avis, string> = {
  BIEN: "Bien",
  MOYEN: "Moyen",
  PUE_LA_MERDE: "Pue la merde",
};
