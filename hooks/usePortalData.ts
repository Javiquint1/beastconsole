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

  function persist(
    update: ClientAccount[] | ((current: ClientAccount[]) => ClientAccount[])
  ) {
    setClients((current) => {
      const nextClients =
        typeof update === "function" ? update(current) : update;
      saveClients(nextClients);
      return nextClients;
    });
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

    persist((current) => [...current, client]);
    return client;
  }

  function updateClient(
    clientId: string,
    updates: Partial<Omit<ClientAccount, "id">>
  ) {
    persist((current) =>
      current.map((client) =>
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
    persist((current) =>
      current.map((client) => {
        if (client.id !== clientId) return client;

        const enabledBlocks = client.enabledBlocks.includes(blockId)
          ? client.enabledBlocks.filter((id) => id !== blockId)
          : [...client.enabledBlocks, blockId];

        return { ...client, enabledBlocks, updatedAt: new Date().toISOString() };
      })
    );
  }

  function updateAccessSettings(
    clientId: string,
    settings: Pick<ClientAccount, "paymentStatus" | "status" | "enabledBlocks">
  ) {
    updateClient(clientId, settings);
  }

  return {
    activeClients,
    addClient,
    clients,
    ready,
    setPaymentStatus,
    setUserStatus,
    toggleBlock,
    updateAccessSettings,
    updateClient
  };
}
