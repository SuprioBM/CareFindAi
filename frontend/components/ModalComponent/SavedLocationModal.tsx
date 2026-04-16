'use client';

import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  address: string;
  latitude: number;
  longitude: number;
  onSave: (data: any) => Promise<void>;
}

export default function SavedLocationModal({
  open,
  onClose,
  address,
  latitude,
  longitude,
  onSave,
}: Props) {
  const [label, setLabel] = useState<"home" | "office" | "other">("home");
  const [customLabel, setCustomLabel] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSave() {
    try {
      setLoading(true);

      await onSave({
        label,
        customLabel: label === "other" ? customLabel : "",
        address,
        latitude,
        longitude,
      });

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      
      {/* Modal Card */}
      <div className="w-[420px] max-w-[92vw] rounded-2xl border border-border bg-card shadow-xl">

        {/* Header */}
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-base">
            Save Location
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Choose a label for quick access later
          </p>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">

          {/* Address Card */}
          <div className="rounded-xl border border-border bg-section-teal p-3">
            <p className="text-xs text-text-muted mb-1">Selected Address</p>
            <p className="text-sm text-text-base leading-relaxed">
              {address}
            </p>
          </div>

          {/* Label Selector */}
          <div>
            <p className="text-xs text-text-muted mb-2">Label</p>

            <div className="flex gap-2">
              {(["home", "office", "other"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLabel(l)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all
                    ${
                      label === l
                        ? "bg-primary text-white border-primary"
                        : "bg-surface text-text-sub border-border hover:border-primary/40"
                    }`}
                >
                  {l === "home" ? "🏠 Home" : l === "office" ? "🏢 Office" : "📍 Other"}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Label */}
          {label === "other" && (
            <div>
              <p className="text-xs text-text-muted mb-1">Custom label</p>
              <input
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="e.g. Gym, Parents house"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-base outline-none focus:border-primary"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-border">

          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-border text-text-sub hover:bg-section-teal transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-hover transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Location"}
          </button>
        </div>

      </div>
    </div>
  );
}