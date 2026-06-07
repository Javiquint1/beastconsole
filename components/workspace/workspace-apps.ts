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
  }
];
