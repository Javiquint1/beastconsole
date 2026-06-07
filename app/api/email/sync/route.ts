import { NextRequest, NextResponse } from "next/server";
import { emailApiError } from "@/lib/email/api";
import { requireClientId } from "@/lib/email/server-auth";
import { syncInbox } from "@/lib/email/service";

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({
      ok: true,
      messages: await syncInbox(requireClientId(request)),
      syncedAt: new Date().toISOString()
    });
  } catch (error) {
    return emailApiError(error);
  }
}
