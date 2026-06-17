import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <main className="login-wrap">
      <section className="login-panel">
        <p className="eyebrow">Payment received</p>
        <h1>Thank you</h1>
        <p className="muted">
          Your Beast Console account is being prepared. Access is activated from
          Stripe's secure payment confirmation, and your login details will be
          available once setup is complete.
        </p>
        <Link className="button" href="/login">
          Go to login
        </Link>
      </section>
    </main>
  );
}
