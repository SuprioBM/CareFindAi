import clsx from "clsx";
import type { CSSProperties } from "react";

type MaterialIconProps = {
  name: string;
  className?: string;
  filled?: boolean;
  weight?: number;
  grad?: number;
  opsz?: number;
};

export function MaterialIcon({
  name,
  className,
  filled = false,
  weight = 400,
  grad = 0,
  opsz = 24,
}: MaterialIconProps) {
  const iconStyle: CSSProperties = {
    fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grad}, 'opsz' ${opsz}`,
  };

  return (
    <span
      aria-hidden="true"
      className={clsx("material-symbols-outlined", className)}
      style={iconStyle}
    >
      {name}
    </span>
  );
}
