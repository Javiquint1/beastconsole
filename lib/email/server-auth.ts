import "server-only";

import { NextRequest } from "next/server";

export function requireClientId(request: NextRequest) {
  const clientId = request.headers.get("x-beast-client-id");
  if (!clientId || clientId.length > 128) throw new Error("UNAUTHORIZED");
  return clientId;
}

// TODO: Replace this MVP header with an HttpOnly server session. All routes
// already scope reads and writes to this clientId boundary.
