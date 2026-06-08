import { NextRequest, NextResponse } from "next/server";
import { getClientAppAccess, registerClientAccessAccount, updateClientAppAccess } from "@/lib/access/appAccessService";
import type { AppAccessId } from "@/lib/access/appAccessService";
import type { ClientAccount } from "@/lib/types";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(request)) return forbidden();
  try { return NextResponse.json(getClientAppAccess(params.id)); }
  catch (error) { return failure(error); }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(request)) return forbidden();
  try {
    const body = (await request.json()) as { apps?: Partial<Record<AppAccessId, boolean>>; client?: ClientAccount };
    if (!body.apps) return NextResponse.json({ error: "Apps object is required." }, { status: 400 });
    if (body.client) registerClientAccessAccount(body.client);
    return NextResponse.json(updateClientAppAccess(params.id, body.apps));
  } catch (error) { return failure(error); }
}

function isAdmin(request: NextRequest) { return request.headers.get("x-beast-role") === "admin"; }
function forbidden() { return NextResponse.json({ error: "Admin access is required." }, { status: 403 }); }
function failure(error: unknown) { return NextResponse.json({ error: error instanceof Error ? error.message : "Access update failed." }, { status: 500 }); }
