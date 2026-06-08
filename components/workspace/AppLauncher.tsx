"use client";

import { Bot, Mail, Megaphone, Music2, PanelsTopLeft } from "lucide-react";
import type { DashboardBlockStatus } from "@/lib/types";
import type { WorkspaceAppDefinition, WorkspaceAppId } from "./workspace-types";

type AppLauncherProps = {
  apps: WorkspaceAppDefinition[];
  getStatus: (app: WorkspaceAppDefinition) => DashboardBlockStatus;
  onOpenApp: (appId: WorkspaceAppId) => void;
};

export function AppLauncher({ apps, getStatus, onOpenApp }: AppLauncherProps) {
  return (
    <aside className="app-launcher" aria-label="App launcher">
      <div>
        <p className="eyebrow">Apps</p>
        <h2>Open tools</h2>
      </div>
      <div className="launcher-grid">
        {apps.map((app) => {
          const status = getStatus(app);
          const Icon =
            app.id === "email"
              ? Mail
              : app.id === "ai-helper"
                ? Bot
                : app.id === "meta-ads"
                  ? PanelsTopLeft
                  : app.id === "tiktok-ads"
                    ? Music2
                  : Megaphone;

          return (
            <button
              className={`launcher-app ${status}`}
              key={app.id}
              onClick={() => onOpenApp(app.id)}
              type="button"
            >
              <Icon size={20} aria-hidden="true" />
              <span>{app.title}</span>
              <small>{status}</small>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
