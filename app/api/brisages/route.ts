import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { addBrisage, getBrisages } from "@/lib/redis";
import type { Brisage } from "@/lib/types";
import { parseBrisageInput } from "@/lib/validate";

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

  const { data, errors } = parseBrisageInput(body);
  if (errors || !data) {
    return NextResponse.json(
      { error: (errors ?? ["Données invalides."]).join(" ") },
      { status: 400 }
    );
  }

  const brisage: Brisage = {
    ...data,
    id: uuidv4(),
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
