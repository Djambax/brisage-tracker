import { NextResponse } from "next/server";
import { deleteBrisage, getBrisage, updateBrisage } from "@/lib/redis";
import { parseBrisageInput } from "@/lib/validate";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  try {
    const brisage = await getBrisage(params.id);
    if (!brisage) {
      return NextResponse.json({ error: "Brisage introuvable." }, { status: 404 });
    }
    return NextResponse.json(brisage);
  } catch (error) {
    console.error("GET /api/brisages/[id]", error);
    return NextResponse.json(
      { error: "Impossible de récupérer le brisage." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
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

  try {
    const updated = await updateBrisage(params.id, data);
    if (!updated) {
      return NextResponse.json({ error: "Brisage introuvable." }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/brisages/[id]", error);
    return NextResponse.json(
      { error: "Impossible de modifier le brisage." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const ok = await deleteBrisage(params.id);
    if (!ok) {
      return NextResponse.json({ error: "Brisage introuvable." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/brisages/[id]", error);
    return NextResponse.json(
      { error: "Impossible de supprimer le brisage." },
      { status: 500 }
    );
  }
}
