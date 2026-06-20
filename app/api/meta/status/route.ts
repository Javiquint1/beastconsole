import { NextRequest, NextResponse } from "next/server";
import { canStartMetaOAuth, getMetaConnection } from "@/lib/meta/oauth";

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get("clientId")?.trim();
  if (!clientId) {
    return NextResponse.json({ error: "Missing clientId." }, { status: 400 });
  }

  if (!canStartMetaOAuth(clientId)) {
    return NextResponse.json({
      connected: false,
      locked: true,
      message: "Meta/Facebook Ads is not enabled for this client.",
      adAccounts: [],
      selectedAdAccountId: null
    });
  }

  const connection = getMetaConnection(clientId);
  return NextResponse.json({
    connected: Boolean(connection),
    locked: false,
    adAccounts: connection?.adAccounts || [],
    selectedAdAccountId: connection?.selectedAdAccountId || null
  });
}
