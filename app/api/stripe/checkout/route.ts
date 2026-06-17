import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

type CheckoutRequestBody = {
  plan?: string;
  email?: string;
  name?: string;
  company?: string;
  phone?: string;
};

const wordpressOrigin = process.env.WORDPRESS_ORIGIN ?? "https://beastconsole.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": wordpressOrigin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin"
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders
  });
}

export async function POST(request: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return jsonError("Stripe secret key is missing.", 500);
    }

    let body: CheckoutRequestBody;
    try {
      body = (await request.json()) as CheckoutRequestBody;
    } catch {
      return jsonError("Invalid JSON body.", 400);
    }

    const email = body.email?.trim().toLowerCase();
    if (!email) {
      return jsonError("Email is required.", 400);
    }

    if (!body.plan) {
      return jsonError("Plan is required.", 400);
    }

    const plan = body.plan === "annual" ? "annual" : "monthly";
    const priceEnvName =
      plan === "annual" ? "STRIPE_PRICE_STARTER_ANNUAL" : "STRIPE_PRICE_STARTER_MONTHLY";
    const priceId = process.env[priceEnvName];
    if (!priceId) {
      return jsonError(`${priceEnvName} price ID is missing.`, 500);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return jsonError("NEXT_PUBLIC_APP_URL is missing.", 500);
    }

    const metadata = {
      plan,
      email,
      name: body.name?.trim() ?? "",
      company: body.company?.trim() ?? "",
      phone: body.phone?.trim() ?? "",
      source: "wordpress_signup"
    };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata,
      subscription_data: { metadata },
      success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/payment/cancelled`
    });

    if (!session.url) {
      console.error("[stripe] checkout session created without url", { sessionId: session.id });
      return jsonError("Stripe Checkout session URL was not created.", 500);
    }

    console.info("[stripe] checkout session created", { sessionId: session.id, email, plan });
    return jsonResponse({ url: session.url });
  } catch (error) {
    console.error("[stripe] checkout session creation failed", error);
    return jsonError("Stripe session creation failed.", 500);
  }
}

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: corsHeaders
  });
}

function jsonError(error: string, status: number) {
  return jsonResponse({ error }, status);
}
