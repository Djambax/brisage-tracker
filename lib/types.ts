export type Avis = "GOD" | "MOYEN" | "PUE_LA_MERDE" | "CATASTROPHIQUE";

export interface Brisage {
  id: string;
  itemNom: string;
  itemImage?: string;
  coefficient: number; // en %
  focus: string; // libellé de la stat focus, ou "AUCUN"
  avis: Avis;
  kamasGeneres: number;
  auteur: string;
  createdAt: string; // ISO date
}

// Champs fournis par le client lors de la création (id + createdAt générés côté serveur)
export type NouveauBrisage = Omit<Brisage, "id" | "createdAt">;

export const FOCUS_AUCUN = "AUCUN";

export const AVIS_OPTIONS: Avis[] = [
  "GOD",
  "MOYEN",
  "PUE_LA_MERDE",
  "CATASTROPHIQUE",
];

export const AVIS_LABELS: Record<Avis, string> = {
  GOD: "God tier 🐐",
  MOYEN: "Bof mon reuf",
  PUE_LA_MERDE: "Pue la merde",
  CATASTROPHIQUE: "Catastrophique, ta race",
};
