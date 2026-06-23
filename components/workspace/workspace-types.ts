import type { BlockId } from "@/lib/types";

export type WorkspaceAppId = "email" | "ai-helper" | "google-ads" | "meta-ads" | "tiktok-ads" | "linkedin-ads" | "hubspot-crm" | "salesforce-crm";

export type WorkspaceAppDefinition = {
  id: WorkspaceAppId;
  blockId: BlockId;
  title: string;
  description: string;
  paid: boolean;
  accent: string;
  defaultPosition: {
    x: number;
    y: number;
  };
  defaultSize: {
    width: number;
    height: number;
  };
};

export type AppWindowState = {
  id: WorkspaceAppId;
  x: number;
  y: number;
  width: number;
  height: number;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
};
