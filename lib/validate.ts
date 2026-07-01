import type { Avis, NouveauBrisage } from "./types";
import { AVIS_OPTIONS, FOCUS_AUCUN } from "./types";

export interface ValidationResult {
  data?: NouveauBrisage;
  errors?: string[];
}

/**
 * Valide et normalise le corps d'une requête de création / modification de brisage.
 * Le pseudo (auteur) est optionnel : par défaut "Anonyme".
 */
export function parseBrisageInput(body: unknown): ValidationResult {
  const data = (body ?? {}) as Record<string, unknown>;

  const itemNom = typeof data.itemNom === "string" ? data.itemNom.trim() : "";
  const auteurRaw = typeof data.auteur === "string" ? data.auteur.trim() : "";
  const auteur = auteurRaw || "Anonyme";
  const avis = data.avis as Avis;
  const focus =
    typeof data.focus === "string" && data.focus.trim()
      ? data.focus.trim()
      : FOCUS_AUCUN;

  const itemImage =
    typeof data.itemImage === "string" && data.itemImage.trim()
      ? data.itemImage.trim()
      : undefined;

  const errors: string[] = [];
  if (!itemNom) errors.push("itemNom est requis.");
  if (!AVIS_OPTIONS.includes(avis)) errors.push("avis invalide.");

  const coefficient = Number(data.coefficient);
  const kamasGeneres = Number(data.kamasGeneres);
  if (Number.isNaN(coefficient)) errors.push("coefficient invalide.");
  if (Number.isNaN(kamasGeneres)) errors.push("kamasGeneres invalide.");

  if (errors.length > 0) return { errors };

  return {
    data: {
      itemNom,
      itemImage,
      coefficient,
      focus,
      avis,
      kamasGeneres,
      auteur,
    },
  };
}
