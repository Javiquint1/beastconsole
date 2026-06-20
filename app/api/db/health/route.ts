import { NextResponse } from "next/server";
import { getSql } from "@/lib/db/client";

export const runtime = "nodejs";

export async function GET() {
  try {
    const sql = getSql();
    const rows = await sql`select 1 as ok`;
    return NextResponse.json({ ok: rows[0]?.ok === 1 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Database health check failed." },
      { status: 500 }
    );
  }
}
