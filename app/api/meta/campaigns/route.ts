import { NextRequest, NextResponse } from "next/server";
import { getMetaConfig, getMetaConnection } from "@/lib/meta/oauth";

export const runtime = "nodejs";

type MetaCampaign = {
  id?: string;
  name?: string;
  status?: string;
  effective_status?: string;
  objective?: string;
  created_time?: string;
  start_time?: string;
  stop_time?: string;
};

type MetaCampaignsResponse = {
  data?: MetaCampaign[];
  error?: { message?: string; type?: string; code?: number };
};

export async function GET(request: NextRequest) {
  try {
    const clientId = request.nextUrl.searchParams.get("clientId")?.trim();
    const adAccountId = request.nextUrl.searchParams.get("adAccountId")?.trim();
    if (!clientId) return NextResponse.json({ error: "Missing clientId." }, { status: 400 });
    if (!adAccountId) return NextResponse.json({ error: "Missing adAccountId." }, { status: 400 });

    const connection = await getMetaConnection(clientId);
    if (!connection) {
      return NextResponse.json({ error: "Meta Ads is not connected for this client." }, { status: 404 });
    }

    const normalizedAdAccountId = normalizeAdAccountId(adAccountId);
    if (!connection.adAccounts.some((account) => account.id === normalizedAdAccountId)) {
      return NextResponse.json({ error: "Ad account is not connected for this client." }, { status: 403 });
    }

    const config = getMetaConfig();
    const url = new URL(
      `https://graph.facebook.com/${config.graphVersion}/act_${normalizedAdAccountId}/campaigns`
    );
    url.searchParams.set(
      "fields",
      "id,name,status,effective_status,objective,created_time,start_time,stop_time"
    );
    url.searchParams.set("limit", "100");

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${connection.accessToken}` }
    });
    const data = (await response.json()) as MetaCampaignsResponse;
    if (!response.ok || data.error) {
      throw new Error(data.error?.message || "Meta campaigns fetch failed.");
    }

    return NextResponse.json({
      campaigns: (data.data || []).map((item) => ({
        id: item.id || "",
        name: item.name || "Untitled campaign",
        status: item.status || "",
        effectiveStatus: item.effective_status || "",
        objective: item.objective || "",
        createdTime: item.created_time || null,
        startTime: item.start_time || null,
        stopTime: item.stop_time || null
      }))
    });
  } catch (error) {
    console.error("[meta] campaigns failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Meta campaigns request failed." },
      { status: 500 }
    );
  }
}

function normalizeAdAccountId(id: string) {
  return id.startsWith("act_") ? id.slice(4) : id;
}
