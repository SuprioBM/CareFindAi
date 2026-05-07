"use client";

import { useEffect, useRef, useState } from "react";

type UseInViewOptions = {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  once?: boolean;
};

export default function useInView({
  threshold = 0.25,
  root = null,
  rootMargin = "0px",
  once = true,
}: UseInViewOptions = {}) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    let observer: IntersectionObserver | null = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once && observer) {
            observer.unobserve(entry.target);
            observer.disconnect();
            observer = null;
          }
          return;
        }

        if (!once) {
          setInView(false);
        }
      },
      { threshold, root, rootMargin },
    );

    observer.observe(node);

    return () => {
      if (observer) observer.disconnect();
    };
  }, [threshold, root, rootMargin, once]);

  return { ref, inView };
}
