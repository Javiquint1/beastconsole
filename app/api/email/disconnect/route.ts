import { NextRequest, NextResponse } from "next/server";
import { emailApiError } from "@/lib/email/api";
import { requireClientId } from "@/lib/email/server-auth";
import { disconnectConnection } from "@/lib/email/store";

export async function POST(request: NextRequest) {
  try {
    disconnectConnection(requireClientId(request));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return emailApiError(error);
  }
}
