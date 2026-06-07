import { NextRequest, NextResponse } from "next/server";
import { emailApiError } from "@/lib/email/api";
import { mockEmailMessages } from "@/lib/email/mock-data";
import { requireClientId } from "@/lib/email/server-auth";
import { getConnection, getMessages } from "@/lib/email/store";

export async function GET(request: NextRequest) {
  try {
    const clientId = requireClientId(request);
    const connection = getConnection(clientId);
    const messages = connection ? getMessages(clientId) : mockEmailMessages;
    return NextResponse.json({ messages, demoMode: !connection });
  } catch (error) {
    return emailApiError(error);
  }
}
