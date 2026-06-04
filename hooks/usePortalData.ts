"use client";

import { useEffect, useMemo, useState } from "react";
import { loadClients, saveClients } from "@/lib/storage";
import { hashPassword } from "@/lib/auth";
import type {
  BlockId,
  ClientAccount,
  PaymentStatus,
  UserStatus
} from "@/lib/types";

export function usePortalData() {
  const [clients, setClients] = useState<ClientAccount[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setClients(loadClients());
    setReady(true);
  }, []);

  const activeClients = useMemo(
    () =>
      clients.filter(
        (client) => client.role === "client" && client.status === "active"
      ),
    [clients]
  );

  function persist(nextClients: ClientAccount[]) {
    setClients(nextClients);
    saveClients(nextClients);
  }

  async function addClient(
    input: Omit<
      ClientAccount,
      "id" | "passwordHash" | "role" | "createdAt" | "updatedAt"
    > & { password: string }
  ) {
    const now = new Date().toISOString();
    const id = input.companyName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const { password, ...clientInput } = input;
    const client: ClientAccount = {
      ...clientInput,
      id: `${id || "client"}-${Date.now().toString(36)}`,
      passwordHash: await hashPassword(password),
      role: "client",
      createdAt: now,
      updatedAt: now
    };

    persist([...clients, client]);
    return client;
  }

  function updateClient(
    clientId: string,
    updates: Partial<Omit<ClientAccount, "id">>
  ) {
    persist(
      clients.map((client) =>
        client.id === clientId
          ? { ...client, ...updates, updatedAt: new Date().toISOString() }
          : client
      )
    );
  }

  function setPaymentStatus(clientId: string, paymentStatus: PaymentStatus) {
    updateClient(clientId, { paymentStatus });
  }

  function setUserStatus(clientId: string, status: UserStatus) {
    updateClient(clientId, { status });
  }

  function toggleBlock(clientId: string, blockId: BlockId) {
    const client = clients.find((item) => item.id === clientId);
    if (!client) return;

    const enabledBlocks = client.enabledBlocks.includes(blockId)
      ? client.enabledBlocks.filter((id) => id !== blockId)
      : [...client.enabledBlocks, blockId];

    updateClient(clientId, { enabledBlocks });
  }

  return {
    activeClients,
    addClient,
    clients,
    ready,
    setPaymentStatus,
    setUserStatus,
    toggleBlock,
    updateClient
  };
}
