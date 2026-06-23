import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ available: false, message: "No Salesforce REST API connection exists in the MVP." });
}
