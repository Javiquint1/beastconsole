import { NextRequest, NextResponse } from "next/server";
import { metaApiError, requireMetaAdmin, requireMetaClientId } from "@/lib/meta-ads/api";
import { deleteMetaAdsCampaign, updateMetaAdsCampaign } from "@/lib/meta-ads/metaAdsService";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try { requireMetaAdmin(request); return NextResponse.json({ campaign: updateMetaAdsCampaign(requireMetaClientId(request), params.id, await request.json()) }); }
  catch (error) { return metaApiError(error); }
}
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try { requireMetaAdmin(request); return NextResponse.json({ ok: deleteMetaAdsCampaign(requireMetaClientId(request), params.id) }); }
  catch (error) { return metaApiError(error); }
}
