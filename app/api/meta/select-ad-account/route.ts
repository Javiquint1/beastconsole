import { NextRequest, NextResponse } from "next/server";
import { updateSelectedMetaAdAccount } from "@/lib/meta/oauth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { clientId?: string; adAccountId?: string };
    const clientId = body.clientId?.trim();
    const adAccountId = body.adAccountId?.trim();
    if (!clientId) return NextResponse.json({ error: "Missing clientId." }, { status: 400 });
    if (!adAccountId) return NextResponse.json({ error: "Missing adAccountId." }, { status: 400 });

    const updated = await updateSelectedMetaAdAccount(clientId, normalizeAdAccountId(adAccountId));
    if (!updated) {
      return NextResponse.json({ error: "Connected Meta ad account was not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Meta ad account selection failed." },
      { status: 500 }
    );
  }
}

function normalizeAdAccountId(id: string) {
  return id.startsWith("act_") ? id.slice(4) : id;
}
