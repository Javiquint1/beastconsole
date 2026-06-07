import { NextRequest, NextResponse } from "next/server";
import { emailApiError } from "@/lib/email/api";
import { requireClientId } from "@/lib/email/server-auth";
import { getConnection, saveDraft } from "@/lib/email/store";
import type { ComposeEmailInput } from "@/lib/email/types";

export async function POST(request: NextRequest) {
  try {
    const clientId = requireClientId(request);
    const connection = getConnection(clientId);
    if (!connection) throw new Error("No email connection is configured.");
    const input = (await request.json()) as ComposeEmailInput;
    const now = new Date().toISOString();
    return NextResponse.json({
      draft: saveDraft({
        ...input,
        id: `draft-${Date.now()}`,
        clientId,
        emailConnectionId: connection.id,
        status: "draft",
        createdAt: now,
        updatedAt: now
      })
    });
  } catch (error) {
    return emailApiError(error);
  }
}
