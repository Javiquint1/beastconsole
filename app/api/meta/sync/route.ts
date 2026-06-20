import { NextRequest, NextResponse } from "next/server";
import { getMetaConnection } from "@/lib/meta/oauth";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { clientId?: string };
    const clientId = body.clientId?.trim() || request.nextUrl.searchParams.get("clientId")?.trim();
    if (!clientId) return NextResponse.json({ error: "Missing clientId." }, { status: 400 });

    const connection = getMetaConnection(clientId);
    if (!connection) {
      return NextResponse.json({ error: "Meta Ads is not connected for this client." }, { status: 404 });
    }

    return NextResponse.json({
      connected: true,
      adAccounts: connection.adAccounts,
      selectedAdAccountId: connection.selectedAdAccountId,
      message: "Meta Ads connection is ready. Fetch insights through /api/meta/insights."
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Meta sync failed." },
      { status: 500 }
    );
  }
}
