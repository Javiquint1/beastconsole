import { NextResponse } from "next/server";
import { getRequiredServerEnv, stripe } from "@/lib/stripe";

type PortalRequestBody = {
  stripeCustomerId?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PortalRequestBody;
    if (!body.stripeCustomerId) {
      return NextResponse.json({ error: "stripeCustomerId is required." }, { status: 400 });
    }

    const appUrl = getRequiredServerEnv("NEXT_PUBLIC_APP_URL");
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: body.stripeCustomerId,
      return_url: `${appUrl}/dashboard/billing`
    });

    console.info("[stripe] billing portal session created", {
      stripeCustomerId: body.stripeCustomerId
    });
    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("[stripe] billing portal session creation failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create Stripe portal session." },
      { status: 500 }
    );
  }
}
