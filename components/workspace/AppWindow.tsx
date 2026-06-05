"use client";

import { Maximize2, Minus, RotateCcw, X } from "lucide-react";
import { useRef } from "react";
import type { AppWindowState, WorkspaceAppId } from "./workspace-types";

type AppWindowProps = {
  id: WorkspaceAppId;
  title: string;
  children: React.ReactNode;
  state: AppWindowState;
  isActive: boolean;
  onFocus: (id: WorkspaceAppId) => void;
  onChange: (id: WorkspaceAppId, updates: Partial<AppWindowState>) => void;
  onMinimize: (id: WorkspaceAppId) => void;
  onClose: (id: WorkspaceAppId) => void;
};

type PointerMode = "drag" | "right" | "bottom" | "corner";

export function AppWindow({
  id,
  title,
  children,
  state,
  isActive,
  onFocus,
  onChange,
  onMinimize,
  onClose
}: AppWindowProps) {
  const pointerRef = useRef<{
    mode: PointerMode;
    startX: number;
    startY: number;
    startState: AppWindowState;
  } | null>(null);

  if (!state.isOpen || state.isMinimized) return null;

  const style = state.isMaximized
    ? {
        left: 12,
        top: 12,
        width: "calc(100% - 24px)",
        height: "calc(100% - 24px)",
        zIndex: state.zIndex
      }
    : {
        left: state.x,
        top: state.y,
        width: state.width,
        height: state.height,
        zIndex: state.zIndex
      };

  function startPointer(
    event: React.PointerEvent<HTMLElement>,
    mode: PointerMode
  ) {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerRef.current = {
      mode,
      startX: event.clientX,
      startY: event.clientY,
      startState: state
    };
    onFocus(id);
  }

  function movePointer(event: React.PointerEvent<HTMLElement>) {
    const activePointer = pointerRef.current;
    if (!activePointer || state.isMaximized) return;

    const deltaX = event.clientX - activePointer.startX;
    const deltaY = event.clientY - activePointer.startY;

    if (activePointer.mode === "drag") {
      onChange(id, {
        x: Math.max(0, activePointer.startState.x + deltaX),
        y: Math.max(0, activePointer.startState.y + deltaY)
      });
      return;
    }

    onChange(id, {
      width:
        activePointer.mode === "right" || activePointer.mode === "corner"
          ? Math.max(360, activePointer.startState.width + deltaX)
          : activePointer.startState.width,
      height:
        activePointer.mode === "bottom" || activePointer.mode === "corner"
          ? Math.max(300, activePointer.startState.height + deltaY)
          : activePointer.startState.height
    });
  }

  function endPointer(event: React.PointerEvent<HTMLElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    pointerRef.current = null;
  }

  return (
    <section
      className={`app-window ${isActive ? "active" : ""}`}
      onPointerDown={() => onFocus(id)}
      style={style}
    >
      <header
        className="app-window-titlebar"
        onPointerDown={(event) => startPointer(event, "drag")}
        onPointerMove={movePointer}
        onPointerUp={endPointer}
      >
        <strong>{title}</strong>
        <div className="window-controls" onPointerDown={(event) => event.stopPropagation()}>
          <button onClick={() => onMinimize(id)} title="Minimize" type="button">
            <Minus size={14} aria-hidden="true" />
          </button>
          <button
            onClick={() => onChange(id, { isMaximized: !state.isMaximized })}
            title={state.isMaximized ? "Restore" : "Maximize"}
            type="button"
          >
            {state.isMaximized ? (
              <RotateCcw size={14} aria-hidden="true" />
            ) : (
              <Maximize2 size={14} aria-hidden="true" />
            )}
          </button>
          <button onClick={() => onClose(id)} title="Close" type="button">
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      </header>
      <div className="app-window-body">{children}</div>
      {!state.isMaximized ? (
        <>
          <div
            className="resize-handle right"
            onPointerDown={(event) => startPointer(event, "right")}
            onPointerMove={movePointer}
            onPointerUp={endPointer}
          />
          <div
            className="resize-handle bottom"
            onPointerDown={(event) => startPointer(event, "bottom")}
            onPointerMove={movePointer}
            onPointerUp={endPointer}
          />
          <div
            className="resize-handle corner"
            onPointerDown={(event) => startPointer(event, "corner")}
            onPointerMove={movePointer}
            onPointerUp={endPointer}
          />
        </>
      ) : null}
    </section>
  );
}
