"use client";

import type { ElementType, ReactNode } from "react";
import useInView from "../hooks/useInView";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  threshold?: number;
  delayMs?: number;
  once?: boolean;
  id?: string;
};

export default function ScrollReveal({
  children,
  className = "",
  as: Tag = "div",
  threshold = 0.25,
  delayMs = 0,
  once = true,
  id,
}: ScrollRevealProps) {
  const { ref, inView } = useInView({ threshold, once });

  return (
    <Tag
      ref={ref}
      id={id}
      className={`${className} transition-all duration-700 ease-out will-change-transform motion-reduce:transition-none ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </Tag>
  );
}
