import { NextRequest, NextResponse } from "next/server";
import { requireTikTokAdmin, requireTikTokClientId, tikTokApiError } from "@/lib/tiktok-ads/api";
import { deleteTikTokAdsCampaign, updateTikTokAdsCampaign } from "@/lib/tiktok-ads/tiktokAdsService";
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) { try { requireTikTokAdmin(request); return NextResponse.json({ campaign: updateTikTokAdsCampaign(requireTikTokClientId(request), params.id, await request.json()) }); } catch (e) { return tikTokApiError(e); } }
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) { try { requireTikTokAdmin(request); return NextResponse.json({ ok: deleteTikTokAdsCampaign(requireTikTokClientId(request), params.id) }); } catch (e) { return tikTokApiError(e); } }
