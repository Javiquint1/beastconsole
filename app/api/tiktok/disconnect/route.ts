import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ available: false, message: "No TikTok API connection exists in the MVP." }); }
