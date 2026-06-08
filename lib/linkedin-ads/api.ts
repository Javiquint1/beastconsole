import "server-only";
import { NextRequest, NextResponse } from "next/server";
export function requireLinkedInClientId(request: NextRequest) {
  const id = request.headers.get("x-beast-client-id"); if (!id) throw new Error("UNAUTHORIZED"); return id;
}
export function requireLinkedInAdmin(request: NextRequest) {
  if (request.headers.get("x-beast-role") !== "admin") throw new Error("FORBIDDEN");
}
export function linkedInApiError(error: unknown) {
  const message = error instanceof Error ? error.message : "LinkedIn Ads request failed.";
  const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
  return NextResponse.json({ error: status === 401 ? "A valid client session is required." : status === 403 ? "Admin access is required." : message }, { status });
}
