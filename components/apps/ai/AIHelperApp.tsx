"use client";

import { Copy, RefreshCcw, Send } from "lucide-react";
import { useMemo, useState } from "react";
import {
  aiCopyTools,
  createAiGenerationRecord,
  generateAiCopy
} from "@/lib/ai-copy-tools";
import { loadDatabase, saveDatabase } from "@/lib/storage";
import type { AiCopyInput, AiCopyToolId } from "@/lib/ai-copy-tools";
import type { ClientAccount } from "@/lib/types";

type AIHelperAppProps = {
  client: ClientAccount;
};

type HistoryItem = {
  id: string;
  output: string;
  toolId: AiCopyToolId;
};

const helperTool = {
  id: "business-helper" as const,
  label: "General business helper"
};

export function AIHelperApp({ client }: AIHelperAppProps) {
  const [toolId, setToolId] = useState<AiCopyToolId | "business-helper">("social-post");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const selectedTool = useMemo(
    () =>
      toolId === "business-helper"
        ? helperTool
        : aiCopyTools.find((tool) => tool.id === toolId) ?? aiCopyTools[0],
    [toolId]
  );

  function generate() {
    const input: AiCopyInput = {
      businessName: client.companyName,
      service: prompt || "your service",
      offer: prompt || "a helpful business update",
      tone: "Professional",
      targetAudience: "local customers"
    };
    const generated =
      toolId === "business-helper"
        ? `${client.companyName} should focus on one clear next action: ${prompt || "choose a weekly promotion, define the audience, and publish it consistently."}`
        : generateAiCopy(toolId, input);

    setOutput(generated);
    setHistory((current) => [
      { id: `${Date.now()}`, output: generated, toolId: toolId === "business-helper" ? "promotion-text" : toolId },
      ...current
    ]);

    if (toolId !== "business-helper") {
      const database = loadDatabase();
      saveDatabase({
        ...database,
        ai_generations: [
          createAiGenerationRecord(client.id, toolId, input, generated),
          ...database.ai_generations
        ]
      });
    }
  }

  return (
    <div className="workspace-app-content ai-helper-app">
      <div className="app-grid ai-layout">
        <aside className="app-sidebar">
          <h3>Tool selector</h3>
          {[...aiCopyTools, helperTool].map((tool) => (
            <button
              className={`campaign-list-item ${tool.id === toolId ? "selected" : ""}`}
              key={tool.id}
              onClick={() => setToolId(tool.id)}
              type="button"
            >
              <strong>{tool.label}</strong>
            </button>
          ))}
        </aside>

        <main className="app-main-panel">
          <div className="app-section-header">
            <div>
              <p className="eyebrow">AI Helper</p>
              <h2>{selectedTool.label}</h2>
            </div>
          </div>
          <div className="field">
            <label htmlFor="aiPrompt">Prompt input</label>
            <textarea
              id="aiPrompt"
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe what you want to create..."
              rows={8}
              value={prompt}
            />
          </div>
          <div className="app-actions">
            <button className="button" onClick={generate} type="button">
              <Send size={16} aria-hidden="true" />
              Generate
            </button>
            <button className="ghost-button light" onClick={generate} type="button">
              <RefreshCcw size={16} aria-hidden="true" />
              Regenerate
            </button>
            <button
              className="ghost-button light"
              onClick={() => navigator.clipboard?.writeText(output)}
              type="button"
            >
              <Copy size={16} aria-hidden="true" />
              Copy
            </button>
          </div>
          <section className="mini-panel output-panel">
            <h3>Output area</h3>
            <p>{output || "Generated copy will appear here."}</p>
          </section>
        </main>

        <aside className="app-side-panel">
          <h3>History</h3>
          {history.length ? (
            history.map((item) => (
              <button className="history-item" key={item.id} onClick={() => setOutput(item.output)} type="button">
                {item.output}
              </button>
            ))
          ) : (
            <div className="empty-state">No generated content yet.</div>
          )}
        </aside>
      </div>
    </div>
  );
}
