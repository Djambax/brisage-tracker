"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import ItemSearch, { type DofusItem } from "@/components/ItemSearch";
import {
  AVIS_LABELS,
  AVIS_OPTIONS,
  FOCUS_OPTIONS,
  type Avis,
  type Focus,
} from "@/lib/types";

export default function NouveauPage() {
  const router = useRouter();

  const [itemNom, setItemNom] = useState("");
  const [itemNiveau, setItemNiveau] = useState<string>("");
  const [coefficient, setCoefficient] = useState<string>("");
  const [focus, setFocus] = useState<Focus>("AUCUN");
  const [avis, setAvis] = useState<Avis>("BIEN");
  const [lamasGeneres, setLamasGeneres] = useState<string>("");
  const [auteur, setAuteur] = useState("");
  const [commentaire, setCommentaire] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleItemSelect(item: DofusItem) {
    setItemNom(item.nom);
    setItemNiveau(item.niveau !== undefined ? String(item.niveau) : "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!itemNom.trim()) {
      setError("Le nom de l'item est requis.");
      return;
    }
    if (!auteur.trim()) {
      setError("Le pseudo (auteur) est requis.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/brisages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemNom: itemNom.trim(),
          itemNiveau: itemNiveau === "" ? undefined : Number(itemNiveau),
          coefficient: coefficient === "" ? 0 : Number(coefficient),
          focus,
          avis,
          lamasGeneres: lamasGeneres === "" ? 0 : Number(lamasGeneres),
          auteur: auteur.trim(),
          commentaire: commentaire.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Erreur lors de l'enregistrement.");
      }

      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-base-border bg-base-card px-3 py-2 text-sm outline-none focus:border-emerald-500";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ajouter un brisage</h1>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-200">
          ← Retour
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            Item
          </label>
          <ItemSearch
            value={itemNom}
            onSelect={handleItemSelect}
            onChangeText={setItemNom}
          />
          <p className="mt-1 text-xs text-gray-500">
            Recherche via DofusDB, ou saisis un nom libre.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Niveau de l&apos;item
            </label>
            <input
              type="number"
              min={0}
              value={itemNiveau}
              onChange={(e) => setItemNiveau(e.target.value)}
              className={inputClass}
              placeholder="Ex: 200"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Coefficient (%)
            </label>
            <input
              type="number"
              step="any"
              value={coefficient}
              onChange={(e) => setCoefficient(e.target.value)}
              className={inputClass}
              placeholder="Ex: 120"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Focus
            </label>
            <select
              value={focus}
              onChange={(e) => setFocus(e.target.value as Focus)}
              className={inputClass}
            >
              {FOCUS_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Avis
            </label>
            <select
              value={avis}
              onChange={(e) => setAvis(e.target.value as Avis)}
              className={inputClass}
            >
              {AVIS_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {AVIS_LABELS[a]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Lamas générés
            </label>
            <input
              type="number"
              step="any"
              value={lamasGeneres}
              onChange={(e) => setLamasGeneres(e.target.value)}
              className={inputClass}
              placeholder="Ex: 5000"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Ton pseudo
            </label>
            <input
              type="text"
              value={auteur}
              onChange={(e) => setAuteur(e.target.value)}
              className={inputClass}
              placeholder="Ex: Jul"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            Commentaire (optionnel)
          </label>
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            className={`${inputClass} min-h-[80px] resize-y`}
            placeholder="Un petit mot sur ce brisage…"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Enregistrement…" : "Enregistrer le brisage"}
          </button>
          <Link
            href="/"
            className="rounded-lg border border-base-border px-4 py-2.5 text-sm text-gray-300 transition hover:bg-base-card"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
