import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ available: false, message: "Meta account selection is coming later." }, { status: 501 }); }
