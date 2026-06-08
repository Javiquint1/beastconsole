import { NextRequest, NextResponse } from "next/server";
import { requireTikTokAdmin, requireTikTokClientId, tikTokApiError } from "@/lib/tiktok-ads/api";
import { importTikTokAdsCsv } from "@/lib/tiktok-ads/tiktokAdsService";
export async function POST(request: NextRequest) { try { requireTikTokAdmin(request); const body = await request.json() as { csvData?: string; fileName?: string }; if (!body.csvData) return NextResponse.json({ error: "CSV data is required." }, { status: 400 }); return NextResponse.json({ upload: importTikTokAdsCsv(requireTikTokClientId(request), body.csvData, body.fileName) }); } catch (e) { return tikTokApiError(e); } }
