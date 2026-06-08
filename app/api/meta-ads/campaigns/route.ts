import { NextRequest, NextResponse } from "next/server";
import { metaApiError, requireMetaAdmin, requireMetaClientId } from "@/lib/meta-ads/api";
import { createMetaAdsCampaign, getMetaAdsCampaigns } from "@/lib/meta-ads/metaAdsService";

export async function GET(request: NextRequest) {
  try { return NextResponse.json({ campaigns: getMetaAdsCampaigns(requireMetaClientId(request)) }); }
  catch (error) { return metaApiError(error); }
}
export async function POST(request: NextRequest) {
  try { requireMetaAdmin(request); return NextResponse.json({ campaign: createMetaAdsCampaign(requireMetaClientId(request), await request.json()) }); }
  catch (error) { return metaApiError(error); }
}
