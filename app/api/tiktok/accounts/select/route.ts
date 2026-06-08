import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ available: false, message: "TikTok advertiser selection is coming later." }, { status: 501 }); }
