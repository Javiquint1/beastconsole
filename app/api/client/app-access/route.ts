import { NextRequest, NextResponse } from "next/server";
import { getClientAppAccess } from "@/lib/access/appAccessService";

export async function GET(request: NextRequest) {
  const clientId = request.headers.get("x-beast-client-id");
  const role = request.headers.get("x-beast-role");
  if (!clientId || role !== "client") {
    return NextResponse.json({ error: "A valid client session is required." }, { status: 401 });
  }
  try { return NextResponse.json(getClientAppAccess(clientId)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Access lookup failed." }, { status: 404 }); }
}
