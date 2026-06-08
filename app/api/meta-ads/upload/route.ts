import { NextRequest, NextResponse } from "next/server";
import { metaApiError, requireMetaAdmin, requireMetaClientId } from "@/lib/meta-ads/api";
import { importMetaAdsCsv } from "@/lib/meta-ads/metaAdsService";

export async function POST(request: NextRequest) {
  try {
    requireMetaAdmin(request);
    const body = (await request.json()) as { csvData?: string; fileName?: string };
    if (!body.csvData) return NextResponse.json({ error: "CSV data is required." }, { status: 400 });
    return NextResponse.json({ upload: importMetaAdsCsv(requireMetaClientId(request), body.csvData, body.fileName) });
  } catch (error) { return metaApiError(error); }
}
