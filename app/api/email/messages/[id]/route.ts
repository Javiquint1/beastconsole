import { NextRequest, NextResponse } from "next/server";
import { emailApiError } from "@/lib/email/api";
import { mockEmailMessages } from "@/lib/email/mock-data";
import { requireClientId } from "@/lib/email/server-auth";
import { getConnection, getMessage } from "@/lib/email/store";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const clientId = requireClientId(request);
    const { id } = await params;
    const message = getConnection(clientId)
      ? getMessage(clientId, id)
      : mockEmailMessages.find((item) => item.id === id);
    return message
      ? NextResponse.json({ message })
      : NextResponse.json({ error: "Message not found." }, { status: 404 });
  } catch (error) {
    return emailApiError(error);
  }
}
