"use client";

import { useMemo, useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import {
  aiCopyTools,
  createAiGenerationRecord,
  generateAiCopy
} from "@/lib/ai-copy-tools";
import { loadDatabase, saveDatabase } from "@/lib/storage";
import type { AiCopyInput, AiCopyToolId } from "@/lib/ai-copy-tools";

type AiToolsAssistantProps = {
  clientId: string;
  defaultBusinessName: string;
};

const toneOptions = ["Friendly", "Professional", "Bold", "Warm", "Urgent"];

export function AiToolsAssistant({
  clientId,
  defaultBusinessName
}: AiToolsAssistantProps) {
  const [toolId, setToolId] = useState<AiCopyToolId>("social-post");
  const [form, setForm] = useState<AiCopyInput>({
    businessName: defaultBusinessName,
    service: "",
    offer: "",
    tone: "Friendly",
    targetAudience: ""
  });
  const [generatedCopy, setGeneratedCopy] = useState("");

  const selectedTool = useMemo(
    () => aiCopyTools.find((tool) => tool.id === toolId) ?? aiCopyTools[0],
    [toolId]
  );

  function updateField(field: keyof AiCopyInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const output = generateAiCopy(toolId, form);
    const database = loadDatabase();

    saveDatabase({
      ...database,
      ai_generations: [
        createAiGenerationRecord(clientId, toolId, form, output),
        ...database.ai_generations
      ]
    });

    setGeneratedCopy(output);
  }

  return (
    <div className="ai-tools">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Free AI</p>
          <h1>AI tools for business owners</h1>
          <p className="muted">
            Generate simple marketing copy with preset templates. This MVP is
            ready for future OpenAI, Claude, Gemini, prompt library, and saved
            content integrations.
          </p>
        </div>
        <div className="status-summary">
          <div>
            <span className="summary-label">Mode</span>
            <strong>Template MVP</strong>
          </div>
          <div>
            <span className="summary-label">Current tool</span>
            <strong>{selectedTool.label}</strong>
          </div>
          <div>
            <span className="summary-label">Cost</span>
            <strong>Free</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Create</p>
            <h2>What do you want to create?</h2>
          </div>
        </div>
        <div className="ai-tool-picker" role="list">
          {aiCopyTools.map((tool) => (
            <button
              className={`ai-tool-button ${tool.id === toolId ? "selected" : ""}`}
              key={tool.id}
              onClick={() => setToolId(tool.id)}
              type="button"
            >
              <Sparkles size={18} aria-hidden="true" />
              <span>{tool.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="grid two ai-workspace">
        <form className="panel form" onSubmit={submit}>
          <div>
            <p className="eyebrow">{selectedTool.label}</p>
            <h2>Fill in the details</h2>
            <p className="muted">{selectedTool.description}</p>
          </div>

          <div className="field">
            <label htmlFor="businessName">Business name</label>
            <input
              id="businessName"
              onChange={(event) => updateField("businessName", event.target.value)}
              value={form.businessName}
            />
          </div>
          <div className="field">
            <label htmlFor="service">Service/product</label>
            <input
              id="service"
              onChange={(event) => updateField("service", event.target.value)}
              placeholder="Dental cleaning, web design, tax prep..."
              value={form.service}
            />
          </div>
          <div className="field">
            <label htmlFor="offer">Offer</label>
            <input
              id="offer"
              onChange={(event) => updateField("offer", event.target.value)}
              placeholder="20% off, free consultation, limited-time package..."
              value={form.offer}
            />
          </div>
          <div className="field">
            <label htmlFor="tone">Tone</label>
            <select
              id="tone"
              onChange={(event) => updateField("tone", event.target.value)}
              value={form.tone}
            >
              {toneOptions.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="targetAudience">Target audience</label>
            <input
              id="targetAudience"
              onChange={(event) => updateField("targetAudience", event.target.value)}
              placeholder="Local homeowners, busy parents, new customers..."
              value={form.targetAudience}
            />
          </div>

          <button className="button" type="submit">
            <Bot size={16} aria-hidden="true" />
            Generate copy
          </button>
        </form>

        <section className="panel generated-copy-panel">
          <p className="eyebrow">Generated copy</p>
          <h2>{selectedTool.label}</h2>
          {generatedCopy ? (
            <div className="generated-copy">{generatedCopy}</div>
          ) : (
            <div className="empty-state">
              Your generated copy will appear here after you fill in the form.
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
