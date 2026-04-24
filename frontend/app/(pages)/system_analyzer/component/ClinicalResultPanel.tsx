import { MaterialIcon } from "./MaterialIcon";
import type { TriageResult } from "@/lib/api/triage";

type ClinicalResultPanelProps = {
  triageResult: TriageResult | null;
  loading: boolean;
  isComplete: boolean;
  onReset: () => void;
};

function getUrgencyClass(urgency: TriageResult["urgency"]) {
  if (urgency === "EMERGENCY") {
    return {
      badge: "bg-(--sa-error)",
      iconWrap:
        "border-[color-mix(in_srgb,var(--sa-error)_30%,transparent)] bg-[color-mix(in_srgb,var(--sa-error)_20%,transparent)] text-(--sa-error)",
      title: "Immediate Clinical Intervention Required",
    };
  }

  if (urgency === "HIGH") {
    return {
      badge: "bg-[color-mix(in_srgb,var(--sa-error)_80%,black)]",
      iconWrap:
        "border-[color-mix(in_srgb,var(--sa-error)_25%,transparent)] bg-[color-mix(in_srgb,var(--sa-error)_14%,transparent)] text-(--sa-error)",
      title: "High-Risk Clinical Priority",
    };
  }

  if (urgency === "MEDIUM") {
    return {
      badge: "bg-amber-600",
      iconWrap:
        "border-[color-mix(in_srgb,orange_35%,transparent)] bg-[color-mix(in_srgb,orange_18%,transparent)] text-amber-600",
      title: "Moderate Clinical Risk",
    };
  }

  return {
    badge: "bg-emerald-600",
    iconWrap:
      "border-[color-mix(in_srgb,green_30%,transparent)] bg-[color-mix(in_srgb,green_18%,transparent)] text-emerald-600",
    title: "Low Immediate Risk",
  };
}

function getSpecialtyBarWidth(index: number, total: number, score: number) {
  const normalizedScore = Math.max(45, Math.min(100, score || 75));

  if (total <= 1) {
    return normalizedScore;
  }

  const width = normalizedScore - index * 18;
  return Math.max(28, width);
}

export function ClinicalResultPanel({
  triageResult,
  loading,
  isComplete,
  onReset,
}: ClinicalResultPanelProps) {
  const urgency = triageResult?.urgency ?? "LOW";
  const score = triageResult?.score ?? 0;
  const specialties = triageResult?.specialties ?? [];
  const reasons = triageResult?.reasons ?? [];
  const nextStep = triageResult?.next_step ?? "";
  const urgencyStyle = getUrgencyClass(urgency);

  return (
    <section className="overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--sa-outline-variant)_30%,transparent)] bg-(--sa-surface-container) shadow-2xl">
      <div className="border-b border-[color-mix(in_srgb,var(--sa-outline-variant)_20%,transparent)] bg-[color-mix(in_srgb,var(--sa-surface-container-low)_50%,transparent)] p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl border ${urgencyStyle.iconWrap}`}
            >
              <MaterialIcon name="emergency_home" filled className="text-3xl" />
            </div>

            <div>
              <div className="mb-0.5 flex items-center gap-2">
                <span className="text-xs font-black tracking-[0.15em] text-(--sa-on-surface-variant) uppercase">
                  Status
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase ${urgencyStyle.badge}`}
                >
                  {urgency}
                </span>
              </div>
              <h2 className="text-2xl leading-none font-bold tracking-tight text-(--sa-on-surface)">
                {urgencyStyle.title}
              </h2>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="mb-1 text-[10px] font-bold text-(--sa-on-surface-variant) uppercase">
              Triage Score
            </span>
            <div className="flex items-center gap-3">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-(--sa-surface-container-highest)">
                <div
                  className="h-full rounded-full bg-(--sa-primary)"
                  style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
                />
              </div>
              <span className="text-xs font-bold text-(--sa-primary)">{score}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8 p-6">
        {!triageResult ? (
          <div className="rounded-xl border border-[color-mix(in_srgb,var(--sa-outline-variant)_30%,transparent)] bg-(--sa-surface-container-low) p-5 text-sm text-(--sa-on-surface-variant)">
            {loading
              ? "Processing clinical inputs..."
              : "No triage result yet. Continue entering symptoms to get a live assessment."}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-bold tracking-widest text-(--sa-on-surface-variant) uppercase">
              <MaterialIcon name="analytics" className="text-sm" />
              Recommended Specialties
            </h3>

            <div className="space-y-4">
              {specialties.length === 0 ? (
                <p className="text-sm text-(--sa-on-surface-variant)">
                  Specialty mapping pending additional clinical evidence.
                </p>
              ) : (
                specialties.map((specialty, index) => (
                  <div key={specialty} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-(--sa-on-surface)">{specialty}</span>
                      <span className="font-mono text-xs text-(--sa-on-surface-variant)">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-(--sa-surface-container-highest)">
                      <div
                        className="h-full rounded-full bg-(--sa-primary)"
                        style={{
                          width: `${getSpecialtyBarWidth(index, specialties.length, score)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-[color-mix(in_srgb,var(--sa-outline-variant)_30%,transparent)] bg-(--sa-surface-container-low) p-5">
            <h3 className="flex items-center gap-2 text-xs font-bold tracking-widest text-(--sa-error) uppercase">
              <MaterialIcon name="report" filled className="text-sm" />
              Clinical Reasons
            </h3>
            <ul className="space-y-2">
              {reasons.length === 0 ? (
                <li className="text-sm text-(--sa-on-surface-variant)">
                  No reasons available yet.
                </li>
              ) : (
                reasons.map((reason) => (
                  <li key={reason} className="flex items-center gap-2 text-sm text-(--sa-on-surface)">
                    <span className="h-1.5 w-1.5 rounded-full bg-(--sa-error)" />
                    {reason}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--sa-outline-variant)_20%,transparent)]">
          <button
            type="button"
            className="flex w-full items-center justify-between bg-(--sa-surface-container-low) p-4"
          >
            <div className="flex items-center gap-3">
              <MaterialIcon name="fact_check" className="text-(--sa-primary)" />
              <span className="text-sm font-bold">Clinical Reasoning Logic</span>
            </div>
            <MaterialIcon name="expand_more" className="text-(--sa-on-surface-variant)" />
          </button>

          <div className="border-t border-[color-mix(in_srgb,var(--sa-outline-variant)_20%,transparent)] bg-[color-mix(in_srgb,var(--sa-surface-container-lowest)_30%,transparent)] p-4">
            <ul className="space-y-3">
              {reasons.length === 0 ? (
                <li className="text-sm text-(--sa-on-surface-variant)">
                  Reasoning details will appear as the state machine progresses.
                </li>
              ) : (
                reasons.map((reason) => (
                  <li
                    key={`logic-${reason}`}
                    className="flex items-start gap-3 text-sm text-(--sa-on-surface-variant)"
                  >
                    <MaterialIcon
                      name="check_circle"
                      className="mt-0.5 text-xs text-(--sa-primary)"
                    />
                    {reason}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border-2 border-[color-mix(in_srgb,var(--sa-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--sa-primary)_5%,transparent)] p-6">
          <div className="absolute -right-8 -bottom-8 opacity-[0.03]">
            <MaterialIcon name="medical_services" className="text-[180px]" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row">
            <div className="flex-1 space-y-2">
              <span className="text-xs font-black tracking-widest text-(--sa-primary) uppercase">
                Adaptive Next-Step Guidance
              </span>
              <h4 className="text-xl font-bold text-(--sa-on-surface)">
                {nextStep || "Awaiting recommended next step"}
              </h4>
            </div>

            <button
              type="button"
              onClick={onReset}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--sa-primary) px-8 py-4 font-bold text-(--sa-on-primary) shadow-lg shadow-[color-mix(in_srgb,var(--sa-primary)_20%,transparent)] transition-all hover:scale-[1.02] active:scale-95 md:w-auto"
            >
              <MaterialIcon name={isComplete ? "refresh" : "clinical_notes"} />
              {isComplete ? "Start New Session" : "Reset Session"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
