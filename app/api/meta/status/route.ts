import { NextRequest, NextResponse } from "next/server";
import { canStartMetaOAuth, getMetaConnection } from "@/lib/meta/oauth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
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

    const connection = await getMetaConnection(clientId);
    return NextResponse.json({
      connected: Boolean(connection),
      locked: false,
      adAccounts: connection?.adAccounts || [],
      selectedAdAccountId: connection?.selectedAdAccountId || null
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Meta connection status failed." },
      { status: 500 }
    );
  }
}
