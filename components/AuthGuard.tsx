"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/storage";
import type { SessionUser, UserRole } from "@/lib/types";

type AuthGuardProps = {
  allowedRole?: UserRole;
  children: (user: SessionUser) => React.ReactNode;
};

export function AuthGuard({ allowedRole, children }: AuthGuardProps) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const session = loadSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    if (session.status !== "active") {
      clearExpiredSession();
      router.replace("/login");
      return;
    }

    if (allowedRole && session.role !== allowedRole) {
      router.replace(session.role === "admin" ? "/admin" : "/dashboard");
      return;
    }

    setUser(session);
    setChecked(true);
  }, [allowedRole, router]);

  if (!checked || !user) {
    return (
      <div className="shell">
        <main className="main">
          <div className="notice">Checking access...</div>
        </main>
      </div>
    );
  }

  return <>{children(user)}</>;
}

function clearExpiredSession() {
  window.localStorage.removeItem("beast-console.session");
}
