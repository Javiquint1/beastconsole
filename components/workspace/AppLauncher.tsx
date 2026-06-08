"use client";

import { Bot, BriefcaseBusiness, Mail, Megaphone, Music2, PanelsTopLeft } from "lucide-react";
import type { AppAccessDecision } from "@/lib/access/appAccessService";
import type { WorkspaceAppDefinition, WorkspaceAppId } from "./workspace-types";

type AppLauncherProps = {
  apps: WorkspaceAppDefinition[];
  getAccess: (app: WorkspaceAppDefinition) => AppAccessDecision;
  onOpenApp: (appId: WorkspaceAppId) => void;
};

export function AppLauncher({ apps, getAccess, onOpenApp }: AppLauncherProps) {
  return (
    <aside className="app-launcher" aria-label="App launcher">
      <div>
        <p className="eyebrow">Apps</p>
        <h2>Open tools</h2>
      </div>
      <div className="launcher-grid">
        {apps.map((app) => {
          const access = getAccess(app);
          const Icon =
            app.id === "email"
              ? Mail
              : app.id === "ai-helper"
                ? Bot
                : app.id === "meta-ads"
                  ? PanelsTopLeft
                  : app.id === "tiktok-ads"
                    ? Music2
                    : app.id === "linkedin-ads"
                      ? BriefcaseBusiness
                  : Megaphone;

          return (
            <button
              className={`launcher-app ${access.locked ? "locked" : "active"}`}
              key={app.id}
              onClick={() => onOpenApp(app.id)}
              type="button"
            >
              <Icon size={20} aria-hidden="true" />
              <span>{app.title}</span>
              <small>{access.mode}</small>
              {access.reason ? <em>{access.reason}</em> : null}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
