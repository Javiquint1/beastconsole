import type { PortalDatabase } from "./database-schema";

const now = "2026-06-04T00:00:00.000Z";

export const initialDatabase: PortalDatabase = {
  users: [
    {
      id: "admin-main",
      name: "Beast Console Admin",
      email: "admin@beastconsole.test",
      passwordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
      role: "admin",
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "user-northstar-dental",
      clientId: "northstar-dental",
      name: "Morgan Lee",
      email: "ops@northstardental.test",
      passwordHash: "186474c1f2c2f735a54c2cf82ee8e87f2a5cd30940e280029363fecedfc5328c",
      role: "client",
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "user-verde-studio",
      clientId: "verde-studio",
      name: "Ari Gomez",
      email: "hello@verdestudio.test",
      passwordHash: "8f6ca7f4cfa6fe1bb11e3d2833d8ac03dac11915f28b775ec6f0d17c05ce5659",
      role: "client",
      status: "active",
      createdAt: now,
      updatedAt: now
    }
  ],
  clients: [
    {
      id: "northstar-dental",
      name: "Morgan Lee",
      companyName: "Northstar Dental",
      email: "ops@northstardental.test",
      phone: "(555) 018-4401",
      businessWebsite: "https://northstardental.test",
      monthlyBudget: 4500,
      leadGoal: 85,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "verde-studio",
      name: "Ari Gomez",
      companyName: "Verde Studio",
      email: "hello@verdestudio.test",
      phone: "(555) 012-9210",
      businessWebsite: "https://verdestudio.test",
      monthlyBudget: 1200,
      leadGoal: 30,
      createdAt: now,
      updatedAt: now
    }
  ],
  client_blocks: [
    {
      id: "northstar-google-ads",
      clientId: "northstar-dental",
      blockType: "google-ads",
      enabled: true,
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "northstar-email",
      clientId: "northstar-dental",
      blockType: "email",
      enabled: true,
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "northstar-meta-ads",
      clientId: "northstar-dental",
      blockType: "meta-ads",
      enabled: true,
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "northstar-tiktok-ads",
      clientId: "northstar-dental",
      blockType: "tiktok-ads",
      enabled: true,
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "northstar-free-ai",
      clientId: "northstar-dental",
      blockType: "free-ai",
      enabled: true,
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "verde-google-ads",
      clientId: "verde-studio",
      blockType: "google-ads",
      enabled: false,
      status: "locked",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "verde-email",
      clientId: "verde-studio",
      blockType: "email",
      enabled: false,
      status: "locked",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "verde-meta-ads",
      clientId: "verde-studio",
      blockType: "meta-ads",
      enabled: false,
      status: "locked",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "verde-tiktok-ads",
      clientId: "verde-studio",
      blockType: "tiktok-ads",
      enabled: false,
      status: "locked",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "verde-free-ai",
      clientId: "verde-studio",
      blockType: "free-ai",
      enabled: true,
      status: "active",
      createdAt: now,
      updatedAt: now
    }
  ],
  google_ads_reports: [
    {
      id: "gar-northstar-2026-06",
      clientId: "northstar-dental",
      campaignName: "Emergency Dental Lead Campaign",
      budget: "$4,500/month",
      clicks: 684,
      impressions: 28410,
      ctr: "2.41%",
      cost: "$2,814.62",
      conversions: 76,
      status: "Active",
      notes: [
        "Conversion pace is close to the monthly lead target.",
        "Mobile search terms are driving the strongest appointment intent.",
        "Shift more spend toward emergency and same-day appointment keywords."
      ],
      lastUpdated: "2026-06-04",
      createdAt: now,
      updatedAt: now
    }
  ],
  meta_ads_reports: [],
  meta_ads_campaigns: [],
  meta_ads_uploads: [],
  tiktok_ads_reports: [],
  tiktok_ads_campaigns: [],
  tiktok_ads_uploads: [],
  email_reports: [
    {
      id: "email-northstar-june-recall",
      clientId: "northstar-dental",
      campaignName: "June Hygiene Recall",
      subject: "Time for your mid-year smile check?",
      sentDate: "2026-06-04",
      recipients: 1280,
      opens: 486,
      clicks: 94,
      status: "Sent",
      suggestedNextEmailIdea:
        "Create a short follow-up for patients who opened the recall email but did not click, with a direct appointment booking CTA.",
      source: "manual-admin",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "email-northstar-emergency",
      clientId: "northstar-dental",
      campaignName: "Emergency Appointment Reminder",
      subject: "Same-day dental help is available",
      sentDate: "2026-05-20",
      recipients: 910,
      opens: 338,
      clicks: 81,
      status: "Sent",
      source: "manual-admin",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "email-northstar-welcome",
      clientId: "northstar-dental",
      campaignName: "New Patient Welcome",
      subject: "What to expect at Northstar Dental",
      sentDate: "2026-05-05",
      recipients: 264,
      opens: 143,
      clicks: 36,
      status: "Sent",
      source: "manual-admin",
      createdAt: now,
      updatedAt: now
    }
  ],
  ai_generations: [],
  payments: [
    {
      id: "payment-northstar-current",
      clientId: "northstar-dental",
      status: "paid",
      source: "manual-admin",
      period: "2026-06",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "payment-verde-current",
      clientId: "verde-studio",
      status: "unpaid",
      source: "manual-admin",
      period: "2026-06",
      createdAt: now,
      updatedAt: now
    }
  ]
};
