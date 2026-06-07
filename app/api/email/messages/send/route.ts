import { NextRequest, NextResponse } from "next/server";
import { emailApiError } from "@/lib/email/api";
import { sendEmail } from "@/lib/email/service";
import { requireClientId } from "@/lib/email/server-auth";
import type { ComposeEmailInput } from "@/lib/email/types";

export async function POST(request: NextRequest) {
  try {
    const clientId = requireClientId(request);
    const input = (await request.json()) as ComposeEmailInput;
    if (!input.to || !input.subject || !input.body) {
      return NextResponse.json({ error: "To, subject, and body are required." }, { status: 400 });
    }
    return NextResponse.json(await sendEmail(clientId, input));
  } catch (error) {
    return emailApiError(error);
  }
}
