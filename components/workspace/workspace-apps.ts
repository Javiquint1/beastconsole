import type { WorkspaceAppDefinition } from "./workspace-types";

export const workspaceApps: WorkspaceAppDefinition[] = [
  {
    id: "email",
    blockId: "email",
    title: "Email",
    description: "Connect a mailbox, read messages, and send business email.",
    paid: false,
    accent: "#ffc400",
    defaultPosition: { x: 32, y: 104 },
    defaultSize: { width: 900, height: 640 }
  },
  {
    id: "ai-helper",
    blockId: "free-ai",
    title: "AI Helper App",
    description: "Generate marketing copy and business ideas.",
    paid: false,
    accent: "#ffffff",
    defaultPosition: { x: 250, y: 150 },
    defaultSize: { width: 720, height: 560 }
  },
  {
    id: "google-ads",
    blockId: "google-ads",
    title: "Google Ads Manager App",
    description: "Review campaigns, budget, metrics, and recommendations.",
    paid: true,
    accent: "#e1251b",
    defaultPosition: { x: 480, y: 88 },
    defaultSize: { width: 820, height: 620 }
  },
  {
    id: "meta-ads",
    blockId: "meta-ads",
    title: "Meta Ads Manager",
    description: "Facebook & Instagram ad performance",
    paid: false,
    accent: "#1877f2",
    defaultPosition: { x: 340, y: 120 },
    defaultSize: { width: 940, height: 650 }
  },
  {
    id: "tiktok-ads",
    blockId: "tiktok-ads",
    title: "TikTok Ads Manager",
    description: "TikTok ad performance and reporting",
    paid: false,
    accent: "#25f4ee",
    defaultPosition: { x: 390, y: 150 },
    defaultSize: { width: 940, height: 650 }
  },
  {
    id: "linkedin-ads",
    blockId: "linkedin-ads",
    title: "LinkedIn Ads Manager",
    description: "LinkedIn campaign performance and B2B ad reporting",
    paid: false,
    accent: "#0a66c2",
    defaultPosition: { x: 420, y: 135 },
    defaultSize: { width: 960, height: 660 }
  },
  {
    id: "hubspot-crm",
    blockId: "hubspot-crm",
    title: "HubSpot CRM Manager",
    description: "Contacts, deals, pipeline value, lead sources, tasks, and CRM activity.",
    paid: false,
    accent: "#ff5c35",
    defaultPosition: { x: 460, y: 120 },
    defaultSize: { width: 1000, height: 680 }
  }
];
