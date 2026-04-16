import { MaterialIcon } from "./MaterialIcon";

export function ClinicalResultPanel() {
  return (
    <section className="overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--sa-outline-variant)_30%,transparent)] bg-(--sa-surface-container) shadow-2xl">
      <div className="border-b border-[color-mix(in_srgb,var(--sa-outline-variant)_20%,transparent)] bg-[color-mix(in_srgb,var(--sa-surface-container-low)_50%,transparent)] p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--sa-error)_30%,transparent)] bg-[color-mix(in_srgb,var(--sa-error)_20%,transparent)] text-(--sa-error)">
              <MaterialIcon name="emergency_home" filled className="text-3xl" />
            </div>

            <div>
              <div className="mb-0.5 flex items-center gap-2">
                <span className="text-xs font-black tracking-[0.15em] text-(--sa-on-surface-variant) uppercase">
                  Status
                </span>
                <span className="rounded-full bg-(--sa-error) px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
                  Emergency
                </span>
              </div>
              <h2 className="text-2xl leading-none font-bold tracking-tight text-(--sa-on-surface)">
                Immediate Clinical Intervention Required
              </h2>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="mb-1 text-[10px] font-bold text-(--sa-on-surface-variant) uppercase">
              Model Confidence
            </span>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="h-1.5 w-5 rounded-full bg-(--sa-primary)" />
                <div className="h-1.5 w-5 rounded-full bg-(--sa-primary)" />
                <div className="h-1.5 w-5 rounded-full bg-(--sa-primary)" />
                <div className="h-1.5 w-5 rounded-full bg-(--sa-surface-container-highest)" />
              </div>
              <span className="text-xs font-bold text-(--sa-primary)">High (89%)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8 p-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-bold tracking-widest text-(--sa-on-surface-variant) uppercase">
              <MaterialIcon name="analytics" className="text-sm" />
              Specialty Probability Distribution
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-(--sa-on-surface)">Cardiology</span>
                  <span className="font-mono text-(--sa-primary)">0.61</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-(--sa-surface-container-highest)">
                  <div className="h-full w-[61%] rounded-full bg-(--sa-primary)" />
                </div>
              </div>

              <div className="space-y-1.5 opacity-60">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-(--sa-on-surface)">Emergency Medicine</span>
                  <span className="font-mono text-(--sa-on-surface-variant)">0.22</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-(--sa-surface-container-highest)">
                  <div className="h-full w-[22%] rounded-full bg-(--sa-on-surface-variant)" />
                </div>
              </div>

              <div className="space-y-1.5 opacity-40">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-(--sa-on-surface)">Pulmonology</span>
                  <span className="font-mono text-(--sa-on-surface-variant)">0.11</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-(--sa-surface-container-highest)">
                  <div className="h-full w-[11%] rounded-full bg-(--sa-on-surface-variant)" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-[color-mix(in_srgb,var(--sa-outline-variant)_30%,transparent)] bg-(--sa-surface-container-low) p-5">
            <h3 className="flex items-center gap-2 text-xs font-bold tracking-widest text-(--sa-error) uppercase">
              <MaterialIcon name="report" filled className="text-sm" />
              Critical Exclusions
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-(--sa-on-surface)">
                <span className="h-1.5 w-1.5 rounded-full bg-(--sa-error)" />
                Acute Myocardial Infarction
              </li>
              <li className="flex items-center gap-2 text-sm text-(--sa-on-surface)">
                <span className="h-1.5 w-1.5 rounded-full bg-(--sa-error)" />
                Pulmonary Embolism
              </li>
              <li className="flex items-center gap-2 text-sm text-(--sa-on-surface)">
                <span className="h-1.5 w-1.5 rounded-full bg-(--sa-error)" />
                Aortic Dissection
              </li>
            </ul>
          </div>
        </div>

        <div className="group overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--sa-outline-variant)_20%,transparent)]">
          <button
            type="button"
            className="flex w-full items-center justify-between bg-(--sa-surface-container-low) p-4 transition-colors hover:bg-[color-mix(in_srgb,var(--sa-surface-container-highest)_20%,transparent)]"
          >
            <div className="flex items-center gap-3">
              <MaterialIcon name="fact_check" className="text-(--sa-primary)" />
              <span className="text-sm font-bold">Clinical Reasoning Logic</span>
            </div>
            <MaterialIcon
              name="expand_more"
              className="text-(--sa-on-surface-variant) transition-transform group-hover:rotate-180"
            />
          </button>

          <div className="border-t border-[color-mix(in_srgb,var(--sa-outline-variant)_20%,transparent)] bg-[color-mix(in_srgb,var(--sa-surface-container-lowest)_30%,transparent)] p-4">
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-(--sa-on-surface-variant)">
                <MaterialIcon
                  name="check_circle"
                  className="mt-0.5 text-xs text-(--sa-primary)"
                />
                Persistent substernal chest discomfort matches primary diagnostic
                criteria for cardiac ischemia.
              </li>
              <li className="flex items-start gap-3 text-sm text-(--sa-on-surface-variant)">
                <MaterialIcon
                  name="check_circle"
                  className="mt-0.5 text-xs text-(--sa-primary)"
                />
                Symptom profile exceeds low-risk triage thresholds; requires
                immediate objective clinical assessment (ECG/Troponin).
              </li>
              <li className="flex items-start gap-3 text-sm text-(--sa-on-surface-variant)">
                <MaterialIcon
                  name="check_circle"
                  className="mt-0.5 text-xs text-(--sa-primary)"
                />
                Absence of pleuritic features reduces the relative probability
                of musculoskeletal origin.
              </li>
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
                Transport to Emergency Department
              </h4>
              <p className="text-sm leading-relaxed text-(--sa-on-surface-variant)">
                Present this assessment ID
                <span className="font-mono font-bold text-(--sa-primary)">
                  {" "}
                  CX-9921
                </span>
                {" "}
                to the triage nurse upon arrival. Do not attempt to drive
                yourself; seek immediate transport via ambulance.
              </p>
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--sa-primary) px-8 py-4 font-bold text-(--sa-on-primary) shadow-lg shadow-[color-mix(in_srgb,var(--sa-primary)_20%,transparent)] transition-all hover:scale-[1.02] active:scale-95 md:w-auto"
            >
              <MaterialIcon name="directions_run" />
              Find Nearest ER
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
