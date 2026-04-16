'use client';

import { SavedLocation } from "@/lib/useSavedLocations";

interface Props {
  locations: SavedLocation[];
  activeId?: string;
  onSelect: (loc: SavedLocation) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export default function SavedLocationBar({
  locations,
  activeId,
  onSelect,
  onDelete,
  onAdd,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2 items-center">

      {locations.map((loc) => {
        const label =
          loc.label === "home"
            ? "🏠 Home"
            : loc.label === "office"
            ? "🏢 Office"
            : "📍 Other";

        return (
          <div
            key={loc._id}
            className={`flex items-center gap-2 h-8 px-3 rounded-full border text-sm whitespace-nowrap cursor-pointer transition-colors
              ${
                activeId === loc._id
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-surface border-border text-text-base hover:border-primary/50"
              }`}
            onClick={() => onSelect(loc)}
          >
            {/* LABEL */}
            <span className="font-medium">{label}</span>

            {/* DELETE */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(loc._id);
              }}
              className="ml-1 text-text-muted hover:text-error transition"
            >
              ×
            </button>
          </div>
        );
      })}

      {/* ADD BUTTON */}
      <button
        onClick={onAdd}
        className="flex h-8 items-center gap-1 rounded-full border border-primary bg-primary/10 text-primary px-3 text-sm font-medium hover:bg-primary/20 transition-colors"
      >
        + Add
      </button>

    </div>
  );
}