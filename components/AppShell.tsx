"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { clearSession } from "@/lib/storage";
import type { SessionUser } from "@/lib/types";

type AppShellProps = {
  user: Pick<SessionUser, "role" | "name"> & {
    companyName?: string;
  };
  children: React.ReactNode;
};

export function AppShell({ user, children }: AppShellProps) {
  const router = useRouter();

  function signOut() {
    clearSession();
    router.push("/login");
  }

  return (
    <div className="shell">
      <header className="topbar">
        <Link className="brand" href={user.role === "admin" ? "/admin" : "/dashboard"}>
          <Image
            className="brand-logo"
            src="/beast-console-logo.webp"
            alt="Beast Console"
            height={52}
            width={67}
            priority
          />
          <span>
            Beast Console
            {user.companyName ? (
              <small className="company-name">{user.companyName}</small>
            ) : null}
          </span>
        </Link>
        <nav className="nav" aria-label="Main navigation">
          {user.role === "admin" ? (
            <>
              <Link href="/admin">Admin</Link>
              <Link href="/admin/clients">Clients</Link>
              <Link href="/admin/clients/new">New Client</Link>
            </>
          ) : (
            <Link href="/dashboard">Dashboard</Link>
          )}
          <button className="ghost-button" onClick={signOut} type="button">
            <LogOut size={16} aria-hidden="true" />
            Sign out
          </button>
        </nav>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}
