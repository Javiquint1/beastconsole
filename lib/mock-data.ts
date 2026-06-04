import type { ClientAccount } from "./types";

export const initialClients: ClientAccount[] = [
  {
    id: "admin-main",
    name: "Beast Console Admin",
    companyName: "Beast Console",
    email: "admin@beastconsole.test",
    phone: "",
    businessWebsite: "https://beastconsole.test",
    passwordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
    role: "admin",
    status: "active",
    paymentStatus: "paid",
    createdAt: "2026-06-04T00:00:00.000Z",
    updatedAt: "2026-06-04T00:00:00.000Z",
    enabledBlocks: ["google-ads", "email", "free-ai"],
    monthlyBudget: 0,
    leadGoal: 0
  },
  {
    id: "northstar-dental",
    name: "Morgan Lee",
    companyName: "Northstar Dental",
    email: "ops@northstardental.test",
    phone: "(555) 018-4401",
    businessWebsite: "https://northstardental.test",
    passwordHash: "186474c1f2c2f735a54c2cf82ee8e87f2a5cd30940e280029363fecedfc5328c",
    role: "client",
    status: "active",
    paymentStatus: "paid",
    createdAt: "2026-06-04T00:00:00.000Z",
    updatedAt: "2026-06-04T00:00:00.000Z",
    enabledBlocks: ["google-ads", "email", "free-ai"],
    monthlyBudget: 4500,
    leadGoal: 85
  },
  {
    id: "verde-studio",
    name: "Ari Gomez",
    companyName: "Verde Studio",
    email: "hello@verdestudio.test",
    phone: "(555) 012-9210",
    businessWebsite: "https://verdestudio.test",
    passwordHash: "8f6ca7f4cfa6fe1bb11e3d2833d8ac03dac11915f28b775ec6f0d17c05ce5659",
    role: "client",
    status: "active",
    paymentStatus: "unpaid",
    createdAt: "2026-06-04T00:00:00.000Z",
    updatedAt: "2026-06-04T00:00:00.000Z",
    enabledBlocks: ["free-ai"],
    monthlyBudget: 1200,
    leadGoal: 30
  }
];
