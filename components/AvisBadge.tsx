import type { Avis } from "@/lib/types";
import { AVIS_LABELS } from "@/lib/types";

const STYLES: Record<Avis, string> = {
  BIEN: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
  MOYEN: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  PUE_LA_MERDE: "bg-red-500/15 text-red-400 ring-red-500/30",
};

export default function AvisBadge({ avis }: { avis: Avis }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STYLES[avis]}`}
    >
      {AVIS_LABELS[avis]}
    </span>
  );
}
