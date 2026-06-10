import OpenAI from "openai";
import { NextResponse } from "next/server";

const MAX_MESSAGE_LENGTH = 4000;
const PLACEHOLDER_API_KEY = "PASTE_MY_OPENAI_API_KEY_HERE";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === PLACEHOLDER_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured." },
      { status: 500 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "A JSON request body is required." }, { status: 400 });
  }

  const message =
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof body.message === "string"
      ? body.message.trim()
      : "";

  if (!message) {
    return NextResponse.json({ error: "A message is required." }, { status: 400 });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` },
      { status: 400 }
    );
  }

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      instructions:
        "You are a concise business and marketing assistant. Provide practical, accurate copy or advice based on the user's request.",
      input: message
    });
    const reply = response.output_text.trim();

    if (!reply) {
      return NextResponse.json({ error: "OpenAI returned an empty response." }, { status: 502 });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("OpenAI request failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "OpenAI request failed." }, { status: 502 });
  }
}
