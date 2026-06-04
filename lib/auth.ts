"use client";

import { loadClients, saveSession } from "./storage";
import type { ClientAccount, SessionUser } from "./types";

export type LoginResult =
  | { ok: true; user: SessionUser }
  | { ok: false; message: string };

export async function hashPassword(password: string) {
  const bytes = new TextEncoder().encode(password);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function loginWithEmailPassword(
  email: string,
  password: string
): Promise<LoginResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await hashPassword(password);
  const account = loadClients().find(
    (client) => client.email.toLowerCase() === normalizedEmail
  );

  if (!account || account.passwordHash !== passwordHash) {
    return { ok: false, message: "Email or password is incorrect." };
  }

  if (account.status !== "active") {
    return {
      ok: false,
      message: "This account is not active. Please contact support."
    };
  }

  const session = toSessionUser(account);
  saveSession(session);
  return { ok: true, user: session };
}

export function toSessionUser(account: ClientAccount): SessionUser {
  return {
    id: account.id,
    role: account.role,
    clientId: account.role === "client" ? account.id : undefined,
    name: account.name,
    email: account.email,
    status: account.status,
    paymentStatus: account.paymentStatus,
    enabledBlocks: account.enabledBlocks
  };
}
