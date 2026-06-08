"use client";

import { useEffect, useMemo, useState } from "react";
import { getAppIdForBlock, getClientDashboardAccessForAccount } from "@/lib/access/appAccessService";
import type { AppAccessDecision } from "@/lib/access/appAccessService";
import type { ClientAccount } from "@/lib/types";
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
  const dashboardAccess = useMemo(() => getClientDashboardAccessForAccount(client), [client]);

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

  function getAccess(app: WorkspaceAppDefinition): AppAccessDecision {
    const appId = getAppIdForBlock(app.blockId);
    return appId
      ? dashboardAccess.apps[appId]
      : { enabled: false, locked: true, mode: "disabled", reason: "This app is not enabled for this account." };
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
      <AppLauncher apps={workspaceApps} getAccess={getAccess} onOpenApp={openApp} />
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
            {renderWindowContent(app, client, getAccess(app))}
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
  access: AppAccessDecision
) {
  if (access.locked) {
    return (
      <div className="locked-app-content">
        <p className="eyebrow">Locked</p>
        <h2>{app.title}</h2>
        <p className="muted">
          {access.mode === "disabled"
            ? `${app.title} is not enabled for this account. Please contact your administrator.`
            : access.reason || `${app.title} is not enabled for this account. Please contact your administrator.`}
        </p>
      </div>
    );
  }

  const content =
    app.id === "email" ? <EmailApp client={client} /> :
    app.id === "ai-helper" ? <AIHelperApp client={client} /> :
    app.id === "meta-ads" ? <MetaAdsManagerApp client={client} /> :
    app.id === "tiktok-ads" ? <TikTokAdsManagerApp client={client} /> :
    app.id === "linkedin-ads" ? <LinkedInAdsManagerApp client={client} /> :
    <GoogleAdsManagerApp client={client} />;

  return (
    <>
      {access.mode === "trial" ? (
        <div className="trial-access-banner">This app is available in trial/demo mode only.</div>
      ) : null}
      {content}
    </>
  );
}
