import { NextRequest, NextResponse } from "next/server";
import { requireTikTokAdmin, requireTikTokClientId, tikTokApiError } from "@/lib/tiktok-ads/api";
import { createTikTokAdsCampaign, getTikTokAdsCampaigns } from "@/lib/tiktok-ads/tiktokAdsService";
export async function GET(request: NextRequest) { try { return NextResponse.json({ campaigns: getTikTokAdsCampaigns(requireTikTokClientId(request)) }); } catch (e) { return tikTokApiError(e); } }
export async function POST(request: NextRequest) { try { requireTikTokAdmin(request); return NextResponse.json({ campaign: createTikTokAdsCampaign(requireTikTokClientId(request), await request.json()) }); } catch (e) { return tikTokApiError(e); } }
