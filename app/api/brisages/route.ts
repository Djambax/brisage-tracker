import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { addBrisage, getBrisages } from "@/lib/redis";
import type { Avis, Brisage, Focus } from "@/lib/types";
import { AVIS_OPTIONS, FOCUS_OPTIONS } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const brisages = await getBrisages();
    return NextResponse.json(brisages);
  } catch (error) {
    console.error("GET /api/brisages", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les brisages." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête JSON invalide." },
      { status: 400 }
    );
  }

  const data = body as Record<string, unknown>;

  const itemNom = typeof data.itemNom === "string" ? data.itemNom.trim() : "";
  const auteur = typeof data.auteur === "string" ? data.auteur.trim() : "";
  const focus = data.focus as Focus;
  const avis = data.avis as Avis;

  const errors: string[] = [];
  if (!itemNom) errors.push("itemNom est requis.");
  if (!auteur) errors.push("auteur est requis.");
  if (!FOCUS_OPTIONS.includes(focus)) errors.push("focus invalide.");
  if (!AVIS_OPTIONS.includes(avis)) errors.push("avis invalide.");

  const coefficient = Number(data.coefficient);
  const lamasGeneres = Number(data.lamasGeneres);
  if (Number.isNaN(coefficient)) errors.push("coefficient invalide.");
  if (Number.isNaN(lamasGeneres)) errors.push("lamasGeneres invalide.");

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  const itemNiveau =
    data.itemNiveau === undefined ||
    data.itemNiveau === null ||
    data.itemNiveau === ""
      ? undefined
      : Number(data.itemNiveau);

  const commentaire =
    typeof data.commentaire === "string" && data.commentaire.trim()
      ? data.commentaire.trim()
      : undefined;

  const brisage: Brisage = {
    id: uuidv4(),
    itemNom,
    itemNiveau: Number.isNaN(itemNiveau as number) ? undefined : itemNiveau,
    coefficient,
    focus,
    avis,
    lamasGeneres,
    auteur,
    commentaire,
    createdAt: new Date().toISOString(),
  };

  try {
    await addBrisage(brisage);
    return NextResponse.json(brisage, { status: 201 });
  } catch (error) {
    console.error("POST /api/brisages", error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer le brisage." },
      { status: 500 }
    );
  }
}
