"use client";

import { Copy, RefreshCcw, Send } from "lucide-react";
import { useMemo, useState } from "react";
import {
  aiCopyTools,
  createAiGenerationRecord
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedTool = useMemo(
    () =>
      toolId === "business-helper"
        ? helperTool
        : aiCopyTools.find((tool) => tool.id === toolId) ?? aiCopyTools[0],
    [toolId]
  );

  async function generate() {
    if (!prompt.trim()) {
      setError("Enter a prompt before generating.");
      return;
    }

    const input: AiCopyInput = {
      businessName: client.companyName,
      service: prompt,
      offer: prompt,
      tone: "Professional",
      targetAudience: "local customers"
    };

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: [
            `Business: ${client.companyName}`,
            `Task: ${selectedTool.label}`,
            `Request: ${prompt.trim()}`,
            "Tone: Professional",
            "Audience: local customers"
          ].join("\n")
        })
      });
      const data = (await response.json()) as { reply?: string; error?: string };

      if (!response.ok || !data.reply) {
        throw new Error(data.error || "The AI Helper could not generate a response.");
      }

      setOutput(data.reply);
      setHistory((current) => [
        { id: `${Date.now()}`, output: data.reply!, toolId: toolId === "business-helper" ? "promotion-text" : toolId },
        ...current
      ]);

      if (toolId !== "business-helper") {
        const database = loadDatabase();
        saveDatabase({
          ...database,
          ai_generations: [
            createAiGenerationRecord(client.id, toolId, input, data.reply),
            ...database.ai_generations
          ]
        });
      }
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "The AI Helper request failed.");
    } finally {
      setLoading(false);
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
            <button className="button" disabled={loading} onClick={generate} type="button">
              <Send size={16} aria-hidden="true" />
              {loading ? "Generating..." : "Generate"}
            </button>
            <button className="ghost-button light" disabled={loading} onClick={generate} type="button">
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
            {error ? <p role="alert">{error}</p> : <p>{output || "Generated copy will appear here."}</p>}
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
