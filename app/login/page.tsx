"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { loginWithEmailPassword } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const result = await loginWithEmailPassword(
      String(form.get("email") || ""),
      String(form.get("password") || "")
    );

    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    router.push(result.user.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <main className="login-wrap">
      <section className="login-panel">
        <Image
          className="login-logo"
          src="/beast-console-logo.webp"
          alt="Beast Console"
          height={142}
          width={184}
          priority
        />
        <p className="eyebrow">Secure access</p>
        <h1>Beast Console</h1>
        <p className="muted">
          Sign in with your assigned email and password. Admin users are routed to
          client management, and client users are routed to their own dashboard.
        </p>

        <div className="notice login-help">
          Demo login credentials are: ops@northstardental.test / client123
        </div>

        <form className="form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              autoComplete="email"
              id="email"
              name="email"
              placeholder="client@email.com"
              required
              type="email"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              autoComplete="current-password"
              id="password"
              name="password"
              required
              type="password"
            />
          </div>
          {error ? <div className="notice error">{error}</div> : null}
          <button className="button" disabled={loading} type="submit">
            <LockKeyhole size={16} aria-hidden="true" />
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
