import { NextRequest, NextResponse } from "next/server";
import { deleteHubSpotConnection } from "@/lib/hubspot/oauth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const clientId = request.headers.get("x-beast-client-id") || request.nextUrl.searchParams.get("clientId");
    if (!clientId) return NextResponse.json({ error: "Missing clientId." }, { status: 400 });

    return NextResponse.json({ disconnected: await deleteHubSpotConnection(clientId) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "HubSpot disconnect failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
