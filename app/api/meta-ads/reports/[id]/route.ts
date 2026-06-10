import { NextRequest, NextResponse } from "next/server";
import { metaApiError, requireMetaAdmin, requireMetaClientId } from "@/lib/meta-ads/api";
import { deleteMetaAdsReport, getMetaAdsReport, updateMetaAdsReport } from "@/lib/meta-ads/metaAdsService";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { return NextResponse.json({ report: getMetaAdsReport(requireMetaClientId(request), (await params).id) }); }
  catch (error) { return metaApiError(error); }
}
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { requireMetaAdmin(request); return NextResponse.json({ report: updateMetaAdsReport(requireMetaClientId(request), (await params).id, await request.json()) }); }
  catch (error) { return metaApiError(error); }
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { requireMetaAdmin(request); return NextResponse.json({ ok: deleteMetaAdsReport(requireMetaClientId(request), (await params).id) }); }
  catch (error) { return metaApiError(error); }
}
