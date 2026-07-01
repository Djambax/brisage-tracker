import { Redis } from "@upstash/redis";
import type { Brisage } from "./types";

export const BRISAGES_KEY = "brisages";

let redisClient: Redis | null = null;

function getRedis(): Redis {
  if (redisClient) return redisClient;

  // Compatible avec les variables générées par l'intégration Vercel Upstash
  // (KV_REST_API_*) comme avec les noms Upstash classiques (UPSTASH_REDIS_REST_*).
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Variables d'environnement Upstash manquantes. Renseigne UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN (ou KV_REST_API_URL / KV_REST_API_TOKEN). Voir .env.example."
    );
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}

/**
 * Récupère toutes les entrées de brisage, triées par date décroissante.
 * Les données sont stockées dans une liste Redis (un JSON par élément).
 */
export async function getBrisages(): Promise<Brisage[]> {
  const redis = getRedis();
  const raw = await redis.lrange<Brisage | string>(BRISAGES_KEY, 0, -1);

  const brisages: Brisage[] = raw.map((item) => {
    const parsed = (
      typeof item === "string" ? JSON.parse(item) : item
    ) as Brisage & { lamasGeneres?: number };
    // Compat rétro : anciennes entrées stockées avec "lamasGeneres".
    if (parsed.kamasGeneres === undefined && parsed.lamasGeneres !== undefined) {
      parsed.kamasGeneres = parsed.lamasGeneres;
    }
    return parsed;
  });

  return brisages.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Ajoute une entrée de brisage dans la liste Redis.
 */
export async function addBrisage(brisage: Brisage): Promise<void> {
  const redis = getRedis();
  await redis.rpush(BRISAGES_KEY, JSON.stringify(brisage));
}

/**
 * Récupère une entrée par son id (ou null si introuvable).
 */
export async function getBrisage(id: string): Promise<Brisage | null> {
  const all = await getBrisages();
  return all.find((b) => b.id === id) ?? null;
}

/**
 * Réécrit intégralement la liste Redis (utilisé pour update/delete).
 */
async function rewriteAll(brisages: Brisage[]): Promise<void> {
  const redis = getRedis();
  await redis.del(BRISAGES_KEY);
  if (brisages.length > 0) {
    await redis.rpush(
      BRISAGES_KEY,
      ...brisages.map((b) => JSON.stringify(b))
    );
  }
}

/**
 * Met à jour une entrée existante. Renvoie l'entrée mise à jour, ou null si absente.
 */
export async function updateBrisage(
  id: string,
  patch: Partial<Omit<Brisage, "id" | "createdAt">>
): Promise<Brisage | null> {
  const all = await getBrisages();
  const index = all.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const updated: Brisage = { ...all[index], ...patch, id: all[index].id };
  all[index] = updated;
  await rewriteAll(all);
  return updated;
}

/**
 * Supprime une entrée. Renvoie true si une entrée a été supprimée.
 */
export async function deleteBrisage(id: string): Promise<boolean> {
  const all = await getBrisages();
  const next = all.filter((b) => b.id !== id);
  if (next.length === all.length) return false;
  await rewriteAll(next);
  return true;
}
