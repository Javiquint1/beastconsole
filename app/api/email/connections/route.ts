import { NextRequest, NextResponse } from "next/server";
import { emailApiError } from "@/lib/email/api";
import { createEmailConnection } from "@/lib/email/service";
import { requireClientId } from "@/lib/email/server-auth";
import { getConnection, publicConnection } from "@/lib/email/store";
import type { EmailConnectionInput } from "@/lib/email/types";

export async function GET(request: NextRequest) {
  try {
    const clientId = requireClientId(request);
    return NextResponse.json({ connection: publicConnection(getConnection(clientId)) });
  } catch (error) {
    return emailApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientId = requireClientId(request);
    const input = (await request.json()) as EmailConnectionInput;
    validateConnectionInput(input);
    const connection = await createEmailConnection(clientId, input);
    return NextResponse.json({ connection: publicConnection(connection) });
  } catch (error) {
    return emailApiError(error);
  }
}

function validateConnectionInput(input: Partial<EmailConnectionInput>) {
  if (!input.emailAddress || !input.displayName || !input.smtpHost || !input.smtpPort) {
    throw new Error("VALIDATION:Email address, display name, SMTP host, and SMTP port are required.");
  }
  if (!input.username || !input.password) {
    throw new Error("VALIDATION:Username and password or app password are required.");
  }
}
