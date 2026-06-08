"use client";

import { useEffect, useMemo, useState } from "react";
import { getDashboardBlockStatus } from "@/lib/access-control";
import type { ClientAccount, DashboardBlockStatus } from "@/lib/types";
import { AIHelperApp } from "@/components/apps/ai/AIHelperApp";
import { EmailApp } from "@/components/apps/email/EmailApp";
import { GoogleAdsManagerApp } from "@/components/apps/google-ads/GoogleAdsManagerApp";
import { MetaAdsManagerApp } from "@/components/apps/meta-ads/MetaAdsManagerApp";
import { TikTokAdsManagerApp } from "@/components/apps/tiktok-ads/TikTokAdsManagerApp";
import { LinkedInAdsManagerApp } from "@/components/apps/linkedin-ads/LinkedInAdsManagerApp";
import { AppWindow } from "./AppWindow";
import { AppLauncher } from "./AppLauncher";
import { workspaceApps } from "./workspace-apps";
import type {
  AppWindowState,
  WorkspaceAppDefinition,
  WorkspaceAppId
} from "./workspace-types";

type WindowManagerProps = {
  client: ClientAccount;
};

const baseZIndex = 20;

export function WindowManager({ client }: WindowManagerProps) {
  const storageKey = `beast-console.workspace.${client.id}`;
  const [windows, setWindows] = useState<Record<WorkspaceAppId, AppWindowState>>(
    () => createInitialWindowState()
  );
  const [activeWindowId, setActiveWindowId] = useState<WorkspaceAppId>("email");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;

    try {
      setWindows({ ...createInitialWindowState(), ...JSON.parse(saved) });
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(windows));
  }, [storageKey, windows]);

  const minimizedApps = useMemo(
    () =>
      workspaceApps.filter((app) => {
        const state = windows[app.id];
        return state?.isOpen && state.isMinimized;
      }),
    [windows]
  );

  function getStatus(app: WorkspaceAppDefinition): DashboardBlockStatus {
    return getDashboardBlockStatus(client, app.blockId, app.paid);
  }

  function updateWindow(
    id: WorkspaceAppId,
    updates: Partial<AppWindowState>
  ) {
    setWindows((current) => ({
      ...current,
      [id]: { ...current[id], ...updates }
    }));
  }

  function focusWindow(id: WorkspaceAppId) {
    setActiveWindowId(id);
    setWindows((current) => {
      const highestZ = Math.max(
        ...Object.values(current).map((state) => state.zIndex)
      );

      return {
        ...current,
        [id]: { ...current[id], zIndex: highestZ + 1 }
      };
    });
  }

  function openApp(id: WorkspaceAppId) {
    updateWindow(id, {
      isOpen: true,
      isMinimized: false
    });
    focusWindow(id);
  }

  function minimizeApp(id: WorkspaceAppId) {
    updateWindow(id, { isMinimized: true });
  }

  function closeApp(id: WorkspaceAppId) {
    updateWindow(id, { isOpen: false, isMinimized: false, isMaximized: false });
  }

  return (
    <>
      <AppLauncher apps={workspaceApps} getStatus={getStatus} onOpenApp={openApp} />
      <div className="workspace-stage">
        {workspaceApps.map((app) => (
          <AppWindow
            id={app.id}
            isActive={activeWindowId === app.id}
            key={app.id}
            onChange={updateWindow}
            onClose={closeApp}
            onFocus={focusWindow}
            onMinimize={minimizeApp}
            state={windows[app.id]}
            title={app.title}
          >
            {renderWindowContent(app, client, getStatus(app))}
          </AppWindow>
        ))}
      </div>
      <footer className="workspace-dock" aria-label="Minimized apps">
        <span>Dock</span>
        {minimizedApps.length ? (
          minimizedApps.map((app) => (
            <button key={app.id} onClick={() => openApp(app.id)} type="button">
              {app.title}
            </button>
          ))
        ) : (
          <small>No minimized apps</small>
        )}
      </footer>
    </>
  );
}

function createInitialWindowState() {
  return workspaceApps.reduce(
    (state, app, index) => ({
      ...state,
      [app.id]: {
        id: app.id,
        x: app.defaultPosition.x,
        y: app.defaultPosition.y,
        width: app.defaultSize.width,
        height: app.defaultSize.height,
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        zIndex: baseZIndex + index
      }
    }),
    {} as Record<WorkspaceAppId, AppWindowState>
  );
}

function renderWindowContent(
  app: WorkspaceAppDefinition,
  client: ClientAccount,
  status: DashboardBlockStatus
) {
  if (status !== "active") {
    return (
      <div className="locked-app-content">
        <p className="eyebrow">Locked</p>
        <h2>{app.title}</h2>
        <p className="muted">
          {app.id === "meta-ads"
            ? "Meta Ads Manager is not enabled for this account."
            : app.id === "tiktok-ads"
              ? "TikTok Ads Manager is not enabled for this account."
              : app.id === "linkedin-ads"
                ? "LinkedIn Ads Manager is not enabled for this account."
            : "This app is not available for the current payment status or admin block settings. Contact support to activate access."}
        </p>
      </div>
    );
  }

  if (app.id === "email") return <EmailApp client={client} />;
  if (app.id === "ai-helper") return <AIHelperApp client={client} />;
  if (app.id === "meta-ads") return <MetaAdsManagerApp client={client} />;
  if (app.id === "tiktok-ads") return <TikTokAdsManagerApp client={client} />;
  if (app.id === "linkedin-ads") return <LinkedInAdsManagerApp client={client} />;
  return <GoogleAdsManagerApp client={client} />;
}
