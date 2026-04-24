"use client";

import styles from "./SystemAnalyzer.module.css";
import { MaterialIcon } from "./MaterialIcon";
import type { TriageQuestion } from "@/lib/api/triage";
import type { TriageMessageItem } from "../hooks/useTriageSession";

type ClinicalIntakePanelProps = {
  sessionId: string | null;
  hasStarted: boolean;
  messages: TriageMessageItem[];
  nextQuestion: TriageQuestion | null;
  loading: boolean;
  error: string | null;
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onSelectOption: (option: string) => void;
  isEmergencyStop: boolean;
  isComplete: boolean;
  age: string;
  onAgeChange: (value: string) => void;
  gender: string;
  onGenderChange: (value: string) => void;
  duration: string;
  onDurationChange: (value: string) => void;
};

export function ClinicalIntakePanel({
  sessionId,
  hasStarted,
  messages,
  nextQuestion,
  loading,
  error,
  input,
  onInputChange,
  onSubmit,
  onSelectOption,
  isEmergencyStop,
  isComplete,
  age,
  onAgeChange,
  gender,
  onGenderChange,
  duration,
  onDurationChange,
}: ClinicalIntakePanelProps) {
  const shownSessionId = sessionId ? sessionId.slice(0, 8).toUpperCase() : "UNASSIGNED";

  return (
    <section className="overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--sa-outline-variant)_30%,transparent)] bg-(--sa-surface-container-low) shadow-xl">
      <div className="flex items-center justify-between border-b border-[color-mix(in_srgb,var(--sa-outline-variant)_30%,transparent)] bg-(--sa-surface-container-lowest) p-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-(--sa-primary)" />
          <span className="text-xs font-bold tracking-widest text-(--sa-on-surface-variant) uppercase">
            Clinical Session Active
          </span>
        </div>

        <span className="font-mono text-xs text-[color-mix(in_srgb,var(--sa-on-surface-variant)_60%,transparent)]">
          ID: {shownSessionId}
        </span>
      </div>

      <div className="space-y-8 p-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.role === "user" ? "flex flex-row-reverse gap-4" : "flex gap-4"}
          >
            <div
              className={
                message.role === "user"
                  ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--sa-surface-container-highest) text-(--sa-on-surface-variant)"
                  : "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--sa-primary-container) text-(--sa-primary)"
              }
            >
              <MaterialIcon
                name={message.role === "user" ? "person" : "clinical_notes"}
                filled={message.role !== "user"}
                className="text-sm"
              />
            </div>

            <div
              className={
                message.role === "user"
                  ? "max-w-[85%] rounded-tl-2xl rounded-bl-2xl rounded-br-2xl border border-[color-mix(in_srgb,var(--sa-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--sa-primary)_10%,transparent)] p-4"
                  : "max-w-[85%] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl border border-[color-mix(in_srgb,var(--sa-outline-variant)_20%,transparent)] bg-(--sa-surface-container) p-4"
              }
            >
              <p className="leading-relaxed text-(--sa-on-surface)">{message.text}</p>
            </div>
          </div>
        ))}

        {nextQuestion && nextQuestion.options.length > 0 ? (
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--sa-primary-container) text-(--sa-primary)">
              <MaterialIcon name="checklist" filled className="text-sm" />
            </div>

            <div className="max-w-[85%] space-y-4">
              <div className="flex flex-wrap gap-2">
                {nextQuestion.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onSelectOption(option)}
                    disabled={loading || isComplete || isEmergencyStop}
                    className="rounded-full border border-(--sa-outline-variant) bg-(--sa-surface-container-high) px-5 py-2.5 text-sm font-medium transition-all hover:border-(--sa-primary) hover:text-(--sa-primary) disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center gap-3 border-t border-[color-mix(in_srgb,var(--sa-outline-variant)_20%,transparent)] pt-4">
            <div className="flex h-6 w-12 items-center justify-center">
              <svg className="h-full w-full text-(--sa-primary)" viewBox="0 0 50 20">
                <path
                  className={styles.pulseLine}
                  d="M0 10 L10 10 L13 2 L17 18 L21 10 L35 10 L38 5 L42 15 L45 10 L50 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <span className="text-xs font-medium text-(--sa-on-surface-variant) italic">
              Analyzing clinical pattern...
            </span>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-[color-mix(in_srgb,var(--sa-error)_40%,transparent)] bg-[color-mix(in_srgb,var(--sa-error)_12%,transparent)] p-3 text-sm text-(--sa-on-surface)">
            {error}
          </div>
        ) : null}
      </div>

      <div className="border-t border-[color-mix(in_srgb,var(--sa-outline-variant)_30%,transparent)] bg-(--sa-surface-container-lowest) p-4">
        {!hasStarted ? (
          <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-3">
            <input
              type="number"
              min={0}
              value={age}
              onChange={(event) => onAgeChange(event.target.value)}
              placeholder="Age"
              className="rounded-lg border border-(--sa-outline-variant) bg-(--sa-surface-container-high) px-3 py-2 text-sm text-(--sa-on-surface) outline-none placeholder:text-[color-mix(in_srgb,var(--sa-on-surface-variant)_40%,transparent)] focus:border-(--sa-primary)"
            />

            <select
              value={gender}
              onChange={(event) => onGenderChange(event.target.value)}
              className="rounded-lg border border-(--sa-outline-variant) bg-(--sa-surface-container-high) px-3 py-2 text-sm text-(--sa-on-surface) outline-none focus:border-(--sa-primary)"
            >
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <input
              type="text"
              value={duration}
              onChange={(event) => onDurationChange(event.target.value)}
              placeholder="Duration (e.g. 2 hours)"
              className="rounded-lg border border-(--sa-outline-variant) bg-(--sa-surface-container-high) px-3 py-2 text-sm text-(--sa-on-surface) outline-none placeholder:text-[color-mix(in_srgb,var(--sa-on-surface-variant)_40%,transparent)] focus:border-(--sa-primary)"
            />
          </div>
        ) : null}

        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void onSubmit();
              }
            }}
            disabled={loading || isComplete || isEmergencyStop}
            placeholder={
              isEmergencyStop
                ? "Emergency detected. Go to hospital immediately."
                : isComplete
                ? "Triage complete. Start a new session to continue."
                : "Specify additional symptoms..."
            }
            className="w-full rounded-xl border border-(--sa-outline-variant) bg-(--sa-surface-container-high) py-3 pr-12 pl-4 text-(--sa-on-surface) outline-none transition-all placeholder:text-[color-mix(in_srgb,var(--sa-on-surface-variant)_40%,transparent)] focus:border-(--sa-primary) focus:ring-1 focus:ring-(--sa-primary)"
          />
          <button
            type="button"
            aria-label="Send symptom details"
            onClick={() => {
              void onSubmit();
            }}
            disabled={loading || isComplete || isEmergencyStop}
            className="absolute right-2 rounded-lg p-2 text-(--sa-primary) transition-colors hover:bg-[color-mix(in_srgb,var(--sa-primary)_10%,transparent)]"
          >
            <MaterialIcon name="send" />
          </button>
        </div>
      </div>
    </section>
  );
}
