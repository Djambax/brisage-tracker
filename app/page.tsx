import Link from "next/link";
import BrisagesTable from "@/components/BrisagesTable";
import { getBrisages } from "@/lib/redis";
import type { Brisage } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let brisages: Brisage[] = [];
  let error: string | null = null;

  try {
    brisages = await getBrisages();
  } catch (e) {
    error =
      e instanceof Error
        ? e.message
        : "Erreur inconnue lors du chargement des brisages.";
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Les brisages</h1>
        <p className="mt-1 text-sm text-gray-400">
          Toutes les tentatives de brisage notées par la team.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-300">
          <p className="font-medium">Impossible de charger les brisages.</p>
          <p className="mt-1 text-red-300/80">{error}</p>
          <p className="mt-2 text-red-300/60">
            Vérifie que les variables Upstash sont bien configurées (voir le
            README).
          </p>
        </div>
      ) : (
        <BrisagesTable brisages={brisages} />
      )}

      <div className="mt-6 md:hidden">
        <Link
          href="/nouveau"
          className="block rounded-lg bg-emerald-600 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-emerald-500"
        >
          + Ajouter un brisage
        </Link>
      </div>
    </div>
  );
}
