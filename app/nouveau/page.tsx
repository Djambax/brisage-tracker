"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import ItemSearch, { type DofusItem } from "@/components/ItemSearch";
import { resolveStatLabels } from "@/lib/dofus";
import {
  AVIS_LABELS,
  AVIS_OPTIONS,
  FOCUS_AUCUN,
  type Avis,
  type Brisage,
} from "@/lib/types";

function NouveauForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = Boolean(editId);

  const [itemNom, setItemNom] = useState("");
  const [itemImage, setItemImage] = useState<string | undefined>(undefined);
  const [coefficient, setCoefficient] = useState<string>("");
  const [focusOptions, setFocusOptions] = useState<string[]>([]);
  const [focusLoading, setFocusLoading] = useState(false);
  const [focus, setFocus] = useState<string>(FOCUS_AUCUN);
  const [avis, setAvis] = useState<Avis>("GOD");
  const [kamasGeneres, setKamasGeneres] = useState<string>("");
  const [auteur, setAuteur] = useState("");

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/brisages/${editId}`);
        if (!res.ok) throw new Error("Brisage introuvable.");
        const b = (await res.json()) as Brisage;
        if (cancelled) return;
        setItemNom(b.itemNom);
        setItemImage(b.itemImage);
        setCoefficient(String(b.coefficient));
        setFocus(b.focus || FOCUS_AUCUN);
        setFocusOptions(b.focus && b.focus !== FOCUS_AUCUN ? [b.focus] : []);
        setAvis(b.avis);
        setKamasGeneres(String(b.kamasGeneres));
        setAuteur(b.auteur === "Anonyme" ? "" : b.auteur);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Erreur de chargement.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editId]);

  async function handleItemSelect(item: DofusItem) {
    setItemNom(item.nom);
    setItemImage(item.image);
    setFocus(FOCUS_AUCUN);
    setFocusOptions([]);

    if (item.effectIds.length > 0) {
      setFocusLoading(true);
      try {
        const labels = await resolveStatLabels(item.effectIds);
        setFocusOptions(labels);
      } catch {
        setFocusOptions([]);
      } finally {
        setFocusLoading(false);
      }
    }
  }

  function handleItemText(text: string) {
    setItemNom(text);
    setItemImage(undefined);
    setFocusOptions([]);
    setFocus(FOCUS_AUCUN);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!itemNom.trim()) {
      setError("Le nom de l'item est requis.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        itemNom: itemNom.trim(),
        itemImage,
        coefficient: coefficient === "" ? 0 : Number(coefficient),
        focus,
        avis,
        kamasGeneres: kamasGeneres === "" ? 0 : Number(kamasGeneres),
        auteur: auteur.trim(),
      };

      const res = await fetch(
        isEditing ? `/api/brisages/${editId}` : "/api/brisages",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

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
        <h1 className="text-2xl font-bold">
          {isEditing ? "Modifier le brisage" : "Ajouter un brisage"}
        </h1>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-200">
          ← Retour
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Chargement…</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Item
            </label>
            <div className="flex items-center gap-3">
              {itemImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={itemImage}
                  alt=""
                  className="h-10 w-10 flex-shrink-0 rounded border border-base-border"
                />
              )}
              <div className="flex-1">
                <ItemSearch
                  value={itemNom}
                  onSelect={handleItemSelect}
                  onChangeText={handleItemText}
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Recherche via DofusDB, ou saisis un nom libre.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Focus{" "}
                {focusLoading && (
                  <span className="text-xs text-gray-500">(chargement…)</span>
                )}
              </label>
              <select
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className={inputClass}
              >
                <option value={FOCUS_AUCUN}>Aucun</option>
                {focusOptions.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              {focusOptions.length === 0 && !focusLoading && (
                <p className="mt-1 text-xs text-gray-500">
                  Sélectionne un item pour voir ses stats.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Kamas générés
              </label>
              <input
                type="number"
                step="any"
                value={kamasGeneres}
                onChange={(e) => setKamasGeneres(e.target.value)}
                className={inputClass}
                placeholder="Ex: 5000"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Ton pseudo{" "}
              <span className="text-xs font-normal text-gray-500">
                (optionnel)
              </span>
            </label>
            <input
              type="text"
              value={auteur}
              onChange={(e) => setAuteur(e.target.value)}
              className={inputClass}
              placeholder="Ex: Jul (laisse vide pour Anonyme)"
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
              {submitting
                ? "Enregistrement…"
                : isEditing
                  ? "Enregistrer les modifications"
                  : "Enregistrer le brisage"}
            </button>
            <Link
              href="/"
              className="rounded-lg border border-base-border px-4 py-2.5 text-sm text-gray-300 transition hover:bg-base-card"
            >
              Annuler
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function NouveauPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-400">Chargement…</p>}>
      <NouveauForm />
    </Suspense>
  );
}
