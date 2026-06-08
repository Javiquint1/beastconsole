import { NextRequest, NextResponse } from "next/server";
import { metaApiError, requireMetaClientId } from "@/lib/meta-ads/api";
import { getDemoMetaAdsData, getMetaAdsCampaigns, getMetaAdsReports, getMetaAdsSummary, getRecommendations } from "@/lib/meta-ads/metaAdsService";

export async function GET(request: NextRequest) {
  try {
    const clientId = requireMetaClientId(request);
    const reports = getMetaAdsReports(clientId);
    if (!reports.length) return NextResponse.json({ ...getDemoMetaAdsData(clientId), demoMode: true });
    const campaigns = getMetaAdsCampaigns(clientId);
    return NextResponse.json({ report: reports[0], campaigns, summary: getMetaAdsSummary(clientId), recommendations: getRecommendations(campaigns), demoMode: false });
  } catch (error) { return metaApiError(error); }
}
