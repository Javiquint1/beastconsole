import { NextRequest, NextResponse } from "next/server";
import { emailApiError } from "@/lib/email/api";
import { requireClientId } from "@/lib/email/server-auth";
import { getSendLogs } from "@/lib/email/store";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ logs: getSendLogs(requireClientId(request)) });
  } catch (error) {
    return emailApiError(error);
  }
}
