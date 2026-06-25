import { NextRequest, NextResponse } from "next/server";
import { requireSemrushClientId, semrushApiError } from "@/lib/semrush-seo/api";
import { getSemrushSeoDashboard } from "@/lib/semrush-seo/semrushSeoService";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(getSemrushSeoDashboard(requireSemrushClientId(request)));
  } catch (error) {
    return semrushApiError(error);
  }
}
