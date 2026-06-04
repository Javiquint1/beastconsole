"use client";

import Link from "next/link";
import { ArrowRight, Clock, LockKeyhole } from "lucide-react";
import type { DashboardBlock } from "@/lib/types";

type DashboardToolCardProps = {
  block: DashboardBlock;
};

export function DashboardToolCard({ block }: DashboardToolCardProps) {
  const isActive = block.status === "active";
  const Icon = block.status === "active" ? ArrowRight : block.status === "locked" ? LockKeyhole : Clock;

  const content = (
    <>
      <div className="toolbar">
        <div>
          <p className="eyebrow">{block.status.replace("-", " ")}</p>
          <h3>{block.title}</h3>
        </div>
        <Icon size={20} aria-hidden="true" />
      </div>
      <p className="muted">{block.description}</p>
      <span className={`pill ${block.status}`}>{block.status.replace("-", " ")}</span>
    </>
  );

  if (!isActive) {
    return (
      <article className={`tool-card ${block.status}`} aria-disabled="true">
        {content}
      </article>
    );
  }

  return (
    <Link className="tool-card active" href={block.route}>
      {content}
    </Link>
  );
}
