import { NextRequest, NextResponse } from "next/server";
import { fetchHubSpotPrivateAppSnapshot } from "@/lib/hubspot/private-app";
import { syncHubSpotCrmRecords } from "@/lib/hubspot-crm/hubspotCrmService";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const clientId = request.headers.get("x-beast-client-id");
    if (!clientId) return NextResponse.json({ error: "Missing clientId." }, { status: 400 });
    if (request.headers.get("x-beast-role") !== "admin") {
      return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
    }

    const snapshot = await fetchHubSpotPrivateAppSnapshot(clientId);
    const synced = await syncHubSpotCrmRecords(clientId, snapshot);
    return NextResponse.json({ synced });
  } catch (error) {
    const message = error instanceof Error ? error.message : "HubSpot CRM sync failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
