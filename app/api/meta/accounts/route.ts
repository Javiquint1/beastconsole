import { NextRequest, NextResponse } from "next/server";
import { getMetaConnection } from "@/lib/meta/oauth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get("clientId")?.trim();
  if (!clientId) return NextResponse.json({ error: "Missing clientId." }, { status: 400 });

  const connection = await getMetaConnection(clientId);
  return NextResponse.json({
    connected: Boolean(connection),
    accounts: connection?.adAccounts || [],
    selectedAdAccountId: connection?.selectedAdAccountId || null
  });
}
