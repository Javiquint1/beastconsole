import { NextRequest, NextResponse } from "next/server";
import { getMetaConfig, getMetaConnection } from "@/lib/meta/oauth";

export const runtime = "nodejs";

type MetaInsight = {
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
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
    const datePreset = normalizeDatePreset(request.nextUrl.searchParams.get("datePreset"));
    const level = normalizeLevel(request.nextUrl.searchParams.get("level"));
    const campaignId = request.nextUrl.searchParams.get("campaignId")?.trim();
    if (!clientId) return NextResponse.json({ error: "Missing clientId." }, { status: 400 });

    const connection = await getMetaConnection(clientId);
    if (!connection) {
      return NextResponse.json({ error: "Meta Ads is not connected for this client." }, { status: 404 });
    }

    const normalizedAdAccountId = normalizeAdAccountId(adAccountId || connection.selectedAdAccountId || "");
    if (!normalizedAdAccountId) {
      return NextResponse.json({ error: "No Meta ad account is selected." }, { status: 400 });
    }

    if (!connection.adAccounts.some((account) => account.id === normalizedAdAccountId)) {
      return NextResponse.json({ error: "Ad account is not connected for this client." }, { status: 403 });
    }

    const config = getMetaConfig();
    const url = new URL(
      `https://graph.facebook.com/${config.graphVersion}/act_${normalizedAdAccountId}/insights`
    );
    url.searchParams.set(
      "fields",
      "campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,spend,impressions,clicks,ctr,cpc,reach,frequency"
    );
    url.searchParams.set("level", level);
    url.searchParams.set("date_preset", datePreset);
    if (campaignId) {
      url.searchParams.set(
        "filtering",
        JSON.stringify([{ field: "campaign.id", operator: "IN", value: [campaignId] }])
      );
    }

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${connection.accessToken}` }
    });
    const data = (await response.json()) as MetaInsightsResponse;
    if (!response.ok || data.error) {
      throw new Error(data.error?.message || "Meta campaign insights fetch failed.");
    }

    return NextResponse.json({
      campaigns: (data.data || []).map((item) => ({
        campaignId: item.campaign_id || "",
        campaignName: item.campaign_name || "Untitled campaign",
        adsetId: item.adset_id || "",
        adsetName: item.adset_name || "",
        adId: item.ad_id || "",
        adName: item.ad_name || "",
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

function normalizeDatePreset(value: string | null) {
  return value === "last_7d" ||
    value === "last_30d" ||
    value === "last_90d" ||
    value === "this_month"
    ? value
    : "last_30d";
}

function normalizeLevel(value: string | null) {
  return value === "campaign" || value === "adset" || value === "ad" ? value : "campaign";
}
