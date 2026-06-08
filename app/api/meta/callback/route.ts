import { NextResponse } from "next/server";
export async function GET() { return NextResponse.json({ available: false, message: "Meta OAuth callback is not enabled for the MVP." }, { status: 501 }); }
