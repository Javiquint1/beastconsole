import "server-only";

import { NextResponse } from "next/server";

export function emailApiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Email request failed.";
  const status =
    message === "UNAUTHORIZED"
      ? 401
      : message.startsWith("VALIDATION:")
        ? 400
        : 500;
  return NextResponse.json(
    {
      error:
        status === 401
          ? "A valid client session is required."
          : message.replace(/^VALIDATION:/, "")
    },
    { status }
  );
}
