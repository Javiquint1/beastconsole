import { NextResponse } from "next/server";
export async function GET() { return NextResponse.json({ available: false, message: "Connect Meta Ads API — Coming later" }, { status: 501 }); }
