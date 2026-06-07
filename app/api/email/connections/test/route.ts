import { NextRequest, NextResponse } from "next/server";
import { emailApiError } from "@/lib/email/api";
import { testEmailConnection } from "@/lib/email/service";
import { requireClientId } from "@/lib/email/server-auth";
import type { EmailConnectionInput } from "@/lib/email/types";

export async function POST(request: NextRequest) {
  try {
    requireClientId(request);
    const input = (await request.json()) as EmailConnectionInput;
    return NextResponse.json({ ok: true, result: await testEmailConnection(input) });
  } catch (error) {
    return emailApiError(error);
  }
}
