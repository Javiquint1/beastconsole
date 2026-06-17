import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  createClientAccountFromStripe,
  markClientPaymentFailed,
  suspendClientAccess,
  updateClientSubscriptionStatus
} from "@/lib/createClientAccount";
import { getRequiredServerEnv, stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      getRequiredServerEnv("STRIPE_WEBHOOK_SECRET")
    );
  } catch (error) {
    console.error("[stripe] invalid webhook signature", error);
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  try {
    await handleStripeEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe] webhook handler failed", {
      eventId: event.id,
      eventType: event.type,
      error
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Stripe webhook handler failed." },
      { status: 500 }
    );
  }
}

async function handleStripeEvent(event: Stripe.Event) {
  console.info("[stripe] webhook received", { eventId: event.id, eventType: event.type });

  switch (event.type) {
    case "checkout.session.completed":
      handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
      handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case "customer.subscription.deleted":
      handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case "invoice.paid":
      handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    case "invoice.payment_failed":
      handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    default:
      console.info("[stripe] webhook event ignored", { eventType: event.type });
  }
}

function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata ?? {};
  const email =
    session.customer_details?.email ??
    session.customer_email ??
    metadata.email;
  const stripeCustomerId = getStripeId(session.customer);
  const stripeSubscriptionId = getStripeId(session.subscription);

  if (!email || !stripeCustomerId || !stripeSubscriptionId) {
    throw new Error("Checkout session is missing email, customer ID, or subscription ID.");
  }

  createClientAccountFromStripe({
    stripeCustomerId,
    stripeSubscriptionId,
    email,
    name: metadata.name || session.customer_details?.name || undefined,
    company: metadata.company || undefined,
    phone: metadata.phone || session.customer_details?.phone || undefined,
    plan: metadata.plan || undefined,
    paymentStatus: session.payment_status === "paid" ? "active" : session.payment_status
  });
}

function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const metadata = subscription.metadata ?? {};
  updateClientSubscriptionStatus({
    stripeCustomerId: getStripeId(subscription.customer),
    stripeSubscriptionId: subscription.id,
    email: metadata.email,
    plan: metadata.plan,
    status: subscription.status
  });
}

function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const metadata = subscription.metadata ?? {};
  suspendClientAccess({
    stripeCustomerId: getStripeId(subscription.customer),
    stripeSubscriptionId: subscription.id,
    email: metadata.email,
    plan: metadata.plan,
    status: "canceled"
  });
}

function handleInvoicePaid(invoice: Stripe.Invoice) {
  updateClientSubscriptionStatus({
    stripeCustomerId: getStripeId(invoice.customer),
    stripeSubscriptionId: getStripeId(getInvoiceSubscription(invoice)),
    email: invoice.customer_email ?? undefined,
    status: "active"
  });
}

function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  markClientPaymentFailed({
    stripeCustomerId: getStripeId(invoice.customer),
    stripeSubscriptionId: getStripeId(getInvoiceSubscription(invoice)),
    email: invoice.customer_email ?? undefined
  });
}

function getStripeId(value: string | { id?: string } | null | undefined) {
  if (!value) return undefined;
  return typeof value === "string" ? value : value.id;
}

function getInvoiceSubscription(invoice: Stripe.Invoice) {
  const invoiceWithSubscription = invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
  };
  return invoiceWithSubscription.subscription;
}
