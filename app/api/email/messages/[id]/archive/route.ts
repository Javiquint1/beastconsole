import { NextRequest, NextResponse } from "next/server";
import { emailApiError } from "@/lib/email/api";
import { requireClientId } from "@/lib/email/server-auth";
import { updateMessage } from "@/lib/email/store";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const clientId = requireClientId(request);
    return NextResponse.json({ message: updateMessage(clientId, params.id, { folder: "archive" }) });
  } catch (error) {
    return emailApiError(error);
  }
}
