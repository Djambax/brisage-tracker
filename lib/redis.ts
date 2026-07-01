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
