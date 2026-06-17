import Link from "next/link";

export default function PaymentCancelledPage() {
  return (
    <main className="login-wrap">
      <section className="login-panel">
        <p className="eyebrow">Checkout cancelled</p>
        <h1>Payment cancelled</h1>
        <p className="muted">
          No subscription was started. You can return to the payment page and
          try again whenever you are ready.
        </p>
        <Link className="button" href="/">
          Return to payment page
        </Link>
      </section>
    </main>
  );
}
