import { initialDatabase } from "./database-seed";
import type { PortalDatabase } from "./database-schema";
import type { BlockId, ClientAccount } from "./types";

const allBlockIds: BlockId[] = ["google-ads", "meta-ads", "tiktok-ads", "linkedin-ads", "email", "free-ai"];

export function buildClientAccounts(database: PortalDatabase): ClientAccount[] {
  const clientAccounts = database.clients.map((client) => {
    const user = database.users.find((item) => item.clientId === client.id);
    const payment = getLatestPayment(database, client.id);

    return {
      ...client,
      passwordHash: user?.passwordHash ?? "",
      role: "client" as const,
      status: user?.status ?? "inactive",
      paymentStatus: payment?.status ?? "unpaid",
      enabledBlocks: getEnabledBlockIds(database, client.id)
    };
  });

  const adminAccounts = database.users
    .filter((user) => user.role === "admin")
    .map((user) => ({
      id: user.id,
      name: user.name,
      companyName: "Beast Console",
      email: user.email,
      phone: "",
      businessWebsite: "https://beastconsole.test",
      passwordHash: user.passwordHash,
      role: "admin" as const,
      status: user.status,
      paymentStatus: "paid" as const,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      enabledBlocks: ["google-ads", "meta-ads", "tiktok-ads", "linkedin-ads", "email", "free-ai"] as BlockId[],
      monthlyBudget: 0,
      leadGoal: 0
    }));

  return [...adminAccounts, ...clientAccounts];
}

export function createDatabaseFromClientAccounts(
  clients: ClientAccount[],
  baseDatabase: PortalDatabase = initialDatabase
): PortalDatabase {
  return {
    ...baseDatabase,
    users: clients.map((client) => ({
      id: client.role === "admin" ? client.id : `user-${client.id}`,
      clientId: client.role === "client" ? client.id : undefined,
      name: client.name,
      email: client.email,
      passwordHash: client.passwordHash,
      role: client.role,
      status: client.status,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt
    })),
    clients: clients
      .filter((client) => client.role === "client")
      .map((client) => ({
        id: client.id,
        name: client.name,
        companyName: client.companyName,
        email: client.email,
        phone: client.phone,
        businessWebsite: client.businessWebsite,
        monthlyBudget: client.monthlyBudget,
        leadGoal: client.leadGoal,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt
      })),
    client_blocks: clients.flatMap((client) =>
      client.role === "client"
        ? allBlockIds.map((blockType) => ({
            id: `${client.id}-${blockType}`,
            clientId: client.id,
            blockType,
            enabled: client.enabledBlocks.includes(blockType),
            status: client.enabledBlocks.includes(blockType)
              ? ("active" as const)
              : ("locked" as const),
            createdAt: client.createdAt,
            updatedAt: client.updatedAt
          }))
        : []
    ),
    payments: clients
      .filter((client) => client.role === "client")
      .map((client) => ({
        id: `payment-${client.id}-current`,
        clientId: client.id,
        status: client.paymentStatus,
        source: "manual-admin" as const,
        period: "current",
        createdAt: client.createdAt,
        updatedAt: client.updatedAt
      }))
  };
}

export function getLatestPayment(database: PortalDatabase, clientId: string) {
  return database.payments
    .filter((payment) => payment.clientId === clientId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

export function getEnabledBlockIds(database: PortalDatabase, clientId: string) {
  return database.client_blocks
    .filter((block) => block.clientId === clientId && block.enabled)
    .map((block) => block.blockType);
}
