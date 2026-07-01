"use client";

import { useEffect, useRef, useState } from "react";

export interface DofusItem {
  nom: string;
  niveau?: number;
}

interface ItemSearchProps {
  value: string;
  onSelect: (item: DofusItem) => void;
  onChangeText: (text: string) => void;
}

interface DofusDbItem {
  name?: { fr?: string };
  level?: number;
}

export default function ItemSearch({
  value,
  onSelect,
  onChangeText,
}: ItemSearchProps) {
  const [results, setResults] = useState<DofusItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const skipNextSearch = useRef(false);

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }

    const term = value.trim();
    if (term.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `https://api.dofusdb.fr/items?slug.fr[$search]=${encodeURIComponent(
          term
        )}&$limit=10`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("Réponse API invalide");
        const json = (await res.json()) as { data?: DofusDbItem[] };
        const items: DofusItem[] = (json.data ?? [])
          .map((it) => ({
            nom: it.name?.fr ?? "",
            niveau: typeof it.level === "number" ? it.level : undefined,
          }))
          .filter((it) => it.nom);
        setResults(items);
        setOpen(true);
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(item: DofusItem) {
    skipNextSearch.current = true;
    onSelect(item);
    setOpen(false);
    setResults([]);
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        onFocus={() => {
          if (results.length > 0) setOpen(true);
        }}
        placeholder="Rechercher un item (ex: Gelano)…"
        autoComplete="off"
        className="w-full rounded-lg border border-base-border bg-base-card px-3 py-2 text-sm outline-none focus:border-emerald-500"
      />
      {loading && (
        <div className="absolute right-3 top-2.5 text-xs text-gray-500">…</div>
      )}
      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-base-border bg-base-card shadow-lg">
          {results.map((item, i) => (
            <li key={`${item.nom}-${i}`}>
              <button
                type="button"
                onClick={() => handleSelect(item)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-emerald-600/20"
              >
                <span>{item.nom}</span>
                {item.niveau !== undefined && (
                  <span className="text-xs text-gray-500">
                    Niv. {item.niveau}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
