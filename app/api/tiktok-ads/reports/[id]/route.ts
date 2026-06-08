import { NextRequest, NextResponse } from "next/server";
import { requireTikTokAdmin, requireTikTokClientId, tikTokApiError } from "@/lib/tiktok-ads/api";
import { deleteTikTokAdsReport, getTikTokAdsReport, updateTikTokAdsReport } from "@/lib/tiktok-ads/tiktokAdsService";
export async function GET(request: NextRequest, { params }: { params: { id: string } }) { try { return NextResponse.json({ report: getTikTokAdsReport(requireTikTokClientId(request), params.id) }); } catch (e) { return tikTokApiError(e); } }
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) { try { requireTikTokAdmin(request); return NextResponse.json({ report: updateTikTokAdsReport(requireTikTokClientId(request), params.id, await request.json()) }); } catch (e) { return tikTokApiError(e); } }
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) { try { requireTikTokAdmin(request); return NextResponse.json({ ok: deleteTikTokAdsReport(requireTikTokClientId(request), params.id) }); } catch (e) { return tikTokApiError(e); } }
