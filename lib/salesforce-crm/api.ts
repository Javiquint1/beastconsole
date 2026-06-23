import "server-only";
import { NextRequest, NextResponse } from "next/server";

export function requireSalesforceClientId(request: NextRequest) {
  const id = request.headers.get("x-beast-client-id");
  if (!id) throw new Error("UNAUTHORIZED");
  return id;
}

export function requireSalesforceAdmin(request: NextRequest) {
  if (request.headers.get("x-beast-role") !== "admin") throw new Error("FORBIDDEN");
}

export function salesforceApiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Salesforce CRM request failed.";
  const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
  return NextResponse.json(
    { error: status === 401 ? "A valid client session is required." : status === 403 ? "Admin access is required." : message },
    { status }
  );
}
