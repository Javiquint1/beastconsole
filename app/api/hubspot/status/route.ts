import { NextRequest, NextResponse } from "next/server";
import { getHubSpotConnection } from "@/lib/hubspot/oauth";
import { hasHubSpotPrivateToken } from "@/lib/hubspot/private-app";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const clientId = request.headers.get("x-beast-client-id") || request.nextUrl.searchParams.get("clientId");
    if (!clientId) return NextResponse.json({ error: "Missing clientId." }, { status: 400 });

    const connection = await getHubSpotConnection(clientId);
    return NextResponse.json({
      connected: Boolean(connection) || hasHubSpotPrivateToken(),
      mode: hasHubSpotPrivateToken() ? "private-app" : connection ? "oauth" : null,
      hubId: connection?.hubId || null,
      tokenExpiresAt: connection?.tokenExpiresAt || null,
      updatedAt: connection?.updatedAt || null
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "HubSpot status check failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
