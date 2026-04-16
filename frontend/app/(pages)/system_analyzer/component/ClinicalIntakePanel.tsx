import styles from "./SystemAnalyzer.module.css";
import { MaterialIcon } from "./MaterialIcon";

export function ClinicalIntakePanel() {
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
          ID: CX-9921
        </span>
      </div>

      <div className="space-y-8 p-6">
        <div className="flex gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--sa-primary-container) text-(--sa-primary)">
            <MaterialIcon name="clinical_notes" filled className="text-sm" />
          </div>
          <div className="max-w-[85%] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl border border-[color-mix(in_srgb,var(--sa-outline-variant)_20%,transparent)] bg-(--sa-surface-container) p-4">
            <p className="leading-relaxed text-(--sa-on-surface)">
              Please describe your symptoms.
            </p>
          </div>
        </div>

        <div className="flex flex-row-reverse gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--sa-surface-container-highest) text-(--sa-on-surface-variant)">
            <MaterialIcon name="person" className="text-sm" />
          </div>
          <div className="max-w-[85%] rounded-tl-2xl rounded-bl-2xl rounded-br-2xl border border-[color-mix(in_srgb,var(--sa-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--sa-primary)_10%,transparent)] p-4">
            <p className="leading-relaxed text-(--sa-on-surface)">
              I have persistent chest pain.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--sa-primary-container) text-(--sa-primary)">
            <MaterialIcon name="clinical_notes" filled className="text-sm" />
          </div>

          <div className="max-w-[85%] space-y-4">
            <div className="rounded-tr-2xl rounded-br-2xl rounded-bl-2xl border border-[color-mix(in_srgb,var(--sa-outline-variant)_20%,transparent)] bg-(--sa-surface-container) p-4">
              <p className="leading-relaxed text-(--sa-on-surface)">
                Is the pain sudden or gradual?
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-full border border-(--sa-outline-variant) bg-(--sa-surface-container-high) px-5 py-2.5 text-sm font-medium transition-all hover:border-(--sa-primary) hover:text-(--sa-primary)"
              >
                Sudden
              </button>

              <button
                type="button"
                className="rounded-full border border-(--sa-outline-variant) bg-(--sa-surface-container-high) px-5 py-2.5 text-sm font-medium transition-all hover:border-(--sa-primary) hover:text-(--sa-primary)"
              >
                Gradual
              </button>
            </div>
          </div>
        </div>

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
      </div>

      <div className="border-t border-[color-mix(in_srgb,var(--sa-outline-variant)_30%,transparent)] bg-(--sa-surface-container-lowest) p-4">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Specify additional symptoms..."
            className="w-full rounded-xl border border-(--sa-outline-variant) bg-(--sa-surface-container-high) py-3 pr-12 pl-4 text-(--sa-on-surface) outline-none transition-all placeholder:text-[color-mix(in_srgb,var(--sa-on-surface-variant)_40%,transparent)] focus:border-(--sa-primary) focus:ring-1 focus:ring-(--sa-primary)"
          />
          <button
            type="button"
            aria-label="Send symptom details"
            className="absolute right-2 rounded-lg p-2 text-(--sa-primary) transition-colors hover:bg-[color-mix(in_srgb,var(--sa-primary)_10%,transparent)]"
          >
            <MaterialIcon name="send" />
          </button>
        </div>
      </div>
    </section>
  );
}
