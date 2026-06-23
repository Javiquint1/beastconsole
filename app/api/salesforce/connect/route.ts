import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ available: false, message: "Connect Salesforce REST API — Coming later" }, { status: 501 });
}
