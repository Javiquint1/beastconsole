export type UserRole = "admin" | "client";

export type UserStatus = "active" | "inactive" | "suspended";

export type PaymentStatus = "paid" | "unpaid" | "trial";

export type BlockId = "google-ads" | "meta-ads" | "email" | "free-ai";

export type DashboardBlockStatus = "active" | "locked" | "coming-soon";

export type ClientAccount = {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  businessWebsite: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  enabledBlocks: BlockId[];
  monthlyBudget: number;
  leadGoal: number;
};

export type SessionUser = {
  id: string;
  role: UserRole;
  clientId?: string;
  name: string;
  email: string;
  status: UserStatus;
  paymentStatus: PaymentStatus;
  enabledBlocks: BlockId[];
};

export type MarketingBlock = {
  id: BlockId;
  name: string;
  category: "Ads" | "Email" | "AI";
  paid: boolean;
  description: string;
};

export type DashboardBlock = {
  id: string;
  title: string;
  description: string;
  status: DashboardBlockStatus;
  route: string;
};
