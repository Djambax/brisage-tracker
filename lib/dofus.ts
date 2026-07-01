const API = "https://api.dofusdb.fr";

export interface DofusItem {
  nom: string;
  image?: string;
  effectIds: number[];
}

interface DofusDbItem {
  name?: { fr?: string };
  img?: string;
  effects?: { effectId?: number }[];
}

interface DofusDbEffect {
  id?: number;
  boost?: boolean;
  description?: { fr?: string };
}

/**
 * Recherche d'items par nom (autocomplete).
 */
export async function searchItems(
  term: string,
  signal?: AbortSignal
): Promise<DofusItem[]> {
  const url = `${API}/items?slug.fr[$search]=${encodeURIComponent(
    term
  )}&$limit=10`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Réponse API invalide");
  const json = (await res.json()) as { data?: DofusDbItem[] };
  return (json.data ?? [])
    .map((it) => ({
      nom: it.name?.fr ?? "",
      image: it.img,
      effectIds: (it.effects ?? [])
        .map((e) => e.effectId)
        .filter((id): id is number => typeof id === "number"),
    }))
    .filter((it) => it.nom);
}

/**
 * Nettoie une description d'effet DofusDB pour n'en garder que le nom de la stat.
 * Ex: "#1{{~1~2 à }}#2 PA" -> "PA" ; "#1{{~1~2 à }}#2 Vitalité" -> "Vitalité"
 */
function parseStatLabel(descFr: string): string {
  return descFr
    .replace(/\{\{.*?\}\}/g, " ")
    .replace(/#\d+/g, " ")
    .replace(/[+\-]?\d+/g, " ")
    .replace(/%/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Résout une liste d'effectId en libellés de stats (uniquement les bonus / boosts).
 */
export async function resolveStatLabels(
  effectIds: number[],
  signal?: AbortSignal
): Promise<string[]> {
  const ids = Array.from(new Set(effectIds));
  if (ids.length === 0) return [];

  const params = ids
    .map((id) => `id[$in][]=${encodeURIComponent(id)}`)
    .join("&");
  const url = `${API}/effects?${params}&$limit=50`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Réponse API invalide");
  const json = (await res.json()) as { data?: DofusDbEffect[] };

  const labels = (json.data ?? [])
    .filter((e) => e.boost === true && e.description?.fr)
    .map((e) => parseStatLabel(e.description!.fr!))
    .filter((l) => l.length > 0);

  return Array.from(new Set(labels));
}
