import { NextRequest, NextResponse } from "next/server";
import { registerClientAccessAccount, updateClientAccountStatus, updateClientPaymentStatus } from "@/lib/access/appAccessService";
import type { ClientAccount, PaymentStatus, UserStatus } from "@/lib/types";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (request.headers.get("x-beast-role") !== "admin") {
    return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  }
  try {
    const body = (await request.json()) as { paymentStatus?: PaymentStatus; accountStatus?: UserStatus; client?: ClientAccount };
    if (body.client) registerClientAccessAccount(body.client);
    const { id } = await params;
    if (body.paymentStatus) updateClientPaymentStatus(id, body.paymentStatus);
    if (body.accountStatus) updateClientAccountStatus(id, body.accountStatus);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Status update failed." }, { status: 500 });
  }
}
