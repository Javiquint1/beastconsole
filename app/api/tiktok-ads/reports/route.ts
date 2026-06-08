import { NextRequest, NextResponse } from "next/server";
import { requireTikTokAdmin, requireTikTokClientId, tikTokApiError } from "@/lib/tiktok-ads/api";
import { createTikTokAdsReport, getTikTokAdsReports } from "@/lib/tiktok-ads/tiktokAdsService";
export async function GET(request: NextRequest) { try { return NextResponse.json({ reports: getTikTokAdsReports(requireTikTokClientId(request)) }); } catch (e) { return tikTokApiError(e); } }
export async function POST(request: NextRequest) { try { requireTikTokAdmin(request); return NextResponse.json({ report: createTikTokAdsReport(requireTikTokClientId(request), await request.json()) }); } catch (e) { return tikTokApiError(e); } }
