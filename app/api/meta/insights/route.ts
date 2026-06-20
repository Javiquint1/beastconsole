import { NextRequest, NextResponse } from "next/server";
import { decryptToken, getMetaConfig, getMetaConnection } from "@/lib/meta/oauth";

type MetaInsight = {
  campaign_name?: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  ctr?: string;
  cpc?: string;
  reach?: string;
  frequency?: string;
};

type MetaInsightsResponse = {
  data?: MetaInsight[];
  error?: { message?: string; type?: string; code?: number };
};

export async function GET(request: NextRequest) {
  try {
    const clientId = request.nextUrl.searchParams.get("clientId")?.trim();
    const adAccountId = request.nextUrl.searchParams.get("adAccountId")?.trim();
    if (!clientId) return NextResponse.json({ error: "Missing clientId." }, { status: 400 });
    if (!adAccountId) return NextResponse.json({ error: "Missing adAccountId." }, { status: 400 });

    const connection = getMetaConnection(clientId);
    if (!connection) {
      return NextResponse.json({ error: "Meta Ads is not connected for this client." }, { status: 404 });
    }

    const normalizedAdAccountId = normalizeAdAccountId(adAccountId);
    if (!connection.adAccounts.some((account) => account.id === normalizedAdAccountId)) {
      return NextResponse.json({ error: "Ad account is not connected for this client." }, { status: 403 });
    }

    const config = getMetaConfig();
    const accessToken = decryptToken(connection.encryptedAccessToken);
    const url = new URL(
      `https://graph.facebook.com/${config.graphVersion}/act_${normalizedAdAccountId}/insights`
    );
    url.searchParams.set("fields", "campaign_name,spend,impressions,clicks,ctr,cpc,reach,frequency");
    url.searchParams.set("level", "campaign");
    url.searchParams.set("date_preset", "last_30d");

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = (await response.json()) as MetaInsightsResponse;
    if (!response.ok || data.error) {
      throw new Error(data.error?.message || "Meta campaign insights fetch failed.");
    }

    return NextResponse.json({
      campaigns: (data.data || []).map((item) => ({
        campaignName: item.campaign_name || "Untitled campaign",
        spend: Number(item.spend || 0),
        impressions: Number(item.impressions || 0),
        clicks: Number(item.clicks || 0),
        ctr: Number(item.ctr || 0),
        cpc: Number(item.cpc || 0),
        reach: Number(item.reach || 0),
        frequency: Number(item.frequency || 0)
      }))
    });
  } catch (error) {
    console.error("[meta] insights failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Meta insights request failed." },
      { status: 500 }
    );
  }
}

function normalizeAdAccountId(id: string) {
  return id.startsWith("act_") ? id.slice(4) : id;
}
