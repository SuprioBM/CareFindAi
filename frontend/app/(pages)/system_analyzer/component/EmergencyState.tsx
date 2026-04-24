import { MaterialIcon } from "./MaterialIcon";
import type { TriageResult } from "@/lib/api/triage";

type EmergencyStateProps = {
  urgency: TriageResult["urgency"];
  nextStep: string;
};

export function EmergencyState({ urgency, nextStep }: EmergencyStateProps) {
  const isEmergency = urgency === "EMERGENCY";

  return (
    <section className="relative w-full overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--sa-error)_30%,transparent)] bg-[color-mix(in_srgb,var(--sa-error-container)_20%,transparent)] p-6 shadow-lg shadow-[color-mix(in_srgb,var(--sa-error)_8%,transparent)]">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <MaterialIcon name="warning" filled className="text-8xl" />
      </div>

      <div className="relative z-10 flex items-start gap-4">
        <div className="flex items-center justify-center rounded-lg bg-(--sa-error) p-2 text-(--sa-on-error)">
          <MaterialIcon name="emergency" filled />
        </div>

        <div className="flex-1">
          <h2 className="mb-1 text-xs font-bold tracking-tight text-(--sa-on-surface) uppercase opacity-60">
            {isEmergency ? "Critical Alert" : "High Priority Alert"}
          </h2>

          <h1 className="mb-2 text-2xl font-extrabold text-(--sa-on-surface)">
            {isEmergency
              ? "Potential medical emergency detected"
              : "High-risk condition requires urgent care"}
          </h1>

          <p className="mb-6 leading-relaxed text-(--sa-on-surface-variant)">
            {nextStep ||
              "Based on your input, seek urgent in-person medical assessment immediately."}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-(--sa-error) px-6 py-3 font-bold text-white shadow-lg shadow-[color-mix(in_srgb,var(--sa-error)_20%,transparent)] transition-all hover:brightness-95 active:scale-95"
            >
              <MaterialIcon name="call" />
              Call Emergency Services
            </button>

            <button
              type="button"
              className="rounded-lg border border-(--sa-outline-variant) bg-(--sa-surface-container-highest) px-6 py-3 font-semibold text-(--sa-on-surface) transition-all hover:bg-(--sa-surface-container-high) active:scale-95"
            >
              Follow Clinical Guidance
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
