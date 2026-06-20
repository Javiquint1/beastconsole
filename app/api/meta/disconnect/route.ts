import { NextRequest, NextResponse } from "next/server";
import { deleteMetaConnection } from "@/lib/meta/oauth";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { clientId?: string };
    const clientId = body.clientId?.trim() || request.nextUrl.searchParams.get("clientId")?.trim();
    if (!clientId) return NextResponse.json({ error: "Missing clientId." }, { status: 400 });
    deleteMetaConnection(clientId);
    return NextResponse.json({ connected: false, adAccounts: [], selectedAdAccountId: null });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Meta disconnect failed." },
      { status: 500 }
    );
  }
}
