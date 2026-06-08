import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ available: false, message: "TikTok Marketing API sync is coming later." }, { status: 501 }); }
