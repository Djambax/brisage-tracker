"use client";

import { useMemo, useState } from "react";
import type { Avis, Brisage } from "@/lib/types";
import { AVIS_LABELS, AVIS_OPTIONS } from "@/lib/types";
import AvisBadge from "./AvisBadge";

type AvisFilter = Avis | "TOUS";

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ItemCell({ b }: { b: Brisage }) {
  return (
    <div className="flex items-center gap-2">
      {b.itemImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={b.itemImage}
          alt=""
          className="h-8 w-8 flex-shrink-0 rounded"
        />
      ) : (
        <span className="h-8 w-8 flex-shrink-0 rounded bg-base-border" />
      )}
      <span className="font-medium">{b.itemNom}</span>
    </div>
  );
}

export default function BrisagesTable({ brisages }: { brisages: Brisage[] }) {
  const [avisFilter, setAvisFilter] = useState<AvisFilter>("TOUS");
  const [focusFilter, setFocusFilter] = useState<string>("TOUS");

  const focusValues = useMemo(() => {
    return Array.from(new Set(brisages.map((b) => b.focus).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, "fr"));
  }, [brisages]);

  const filtered = useMemo(() => {
    return brisages.filter((b) => {
      if (avisFilter !== "TOUS" && b.avis !== avisFilter) return false;
      if (focusFilter !== "TOUS" && b.focus !== focusFilter) return false;
      return true;
    });
  }, [brisages, avisFilter, focusFilter]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-400">Avis</label>
          <select
            value={avisFilter}
            onChange={(e) => setAvisFilter(e.target.value as AvisFilter)}
            className="rounded-lg border border-base-border bg-base-card px-3 py-2 text-sm outline-none focus:border-emerald-500"
          >
            <option value="TOUS">Tous</option>
            {AVIS_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {AVIS_LABELS[a]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-400">Focus</label>
          <select
            value={focusFilter}
            onChange={(e) => setFocusFilter(e.target.value)}
            className="rounded-lg border border-base-border bg-base-card px-3 py-2 text-sm outline-none focus:border-emerald-500"
          >
            <option value="TOUS">Tous</option>
            {focusValues.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-sm text-gray-400">
          {filtered.length} brisage{filtered.length > 1 ? "s" : ""}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-base-border bg-base-card p-8 text-center text-gray-400">
          Aucun brisage à afficher.
        </div>
      ) : (
        <>
          {/* Vue tableau (desktop) */}
          <div className="hidden overflow-x-auto rounded-xl border border-base-border md:block">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-base-card text-left text-xs uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Coefficient</th>
                  <th className="px-4 py-3">Focus</th>
                  <th className="px-4 py-3">Avis</th>
                  <th className="px-4 py-3">Kamas générés</th>
                  <th className="px-4 py-3">Auteur</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-border">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-base-card/50">
                    <td className="px-4 py-3">
                      <ItemCell b={b} />
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {b.coefficient}%
                    </td>
                    <td className="px-4 py-3 text-gray-300">{b.focus}</td>
                    <td className="px-4 py-3">
                      <AvisBadge avis={b.avis} />
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {b.kamasGeneres.toLocaleString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{b.auteur}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400">
                      {formatDate(b.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vue cartes (mobile) */}
          <div className="grid gap-3 md:hidden">
            {filtered.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-base-border bg-base-card p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <ItemCell b={b} />
                  <AvisBadge avis={b.avis} />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {b.coefficient}% · Focus {b.focus}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>
                    {b.kamasGeneres.toLocaleString("fr-FR")} kamas · {b.auteur}
                  </span>
                  <span>{formatDate(b.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
