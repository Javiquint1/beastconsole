import "server-only";
import { NextRequest, NextResponse } from "next/server";

export function requireSemrushClientId(request: NextRequest) {
  const id = request.headers.get("x-beast-client-id");
  if (!id) throw new Error("UNAUTHORIZED");
  return id;
}

export function semrushApiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Semrush SEO request failed.";
  const status = message === "UNAUTHORIZED" ? 401 : 500;
  return NextResponse.json(
    { error: status === 401 ? "A valid client session is required." : message },
    { status }
  );
}
