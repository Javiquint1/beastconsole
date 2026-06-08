import { NextResponse } from "next/server";
export async function GET() { return NextResponse.json({ available: false, message: "Connect TikTok Ads API — Coming later" }, { status: 501 }); }
