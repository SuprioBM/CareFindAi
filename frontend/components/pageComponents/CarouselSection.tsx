"use client";

import { useEffect, useRef, useState } from "react";

type Testimonial = {
  quote: string;
  name: string;
  location: string;
};

export default function CarouselSection({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const firstCardRef = useRef<HTMLDivElement | null>(null);
  const firstCloneCardRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const pointerStartXRef = useRef(0);
  const activePointerIdRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const loopWidthRef = useRef(0);

  // Clone testimonials for seamless infinite loop (triple clone for smooth wrap)
  const clonedTestimonials = [...testimonials, ...testimonials, ...testimonials];

  // px/sec speed tuned for readability on mobile and desktop
  const speed = 28;

  const applyTransform = (x: number) => {
    if (!trackRef.current) return;
    trackRef.current.style.transform = `translate3d(${x}px, 0, 0)`;
  };

  const normalizeOffset = (x: number) => {
    const w = loopWidthRef.current;
    if (!w) return x;
    let next = x;
    while (next <= -w) next += w;
    while (next > 0) next -= w;
    return next;
  };

  const measureLoopWidth = () => {
    if (!firstCardRef.current || !firstCloneCardRef.current) return;
    const width = firstCloneCardRef.current.offsetLeft - firstCardRef.current.offsetLeft;
    if (width > 0) {
      loopWidthRef.current = width;
      offsetRef.current = normalizeOffset(offsetRef.current);
      applyTransform(offsetRef.current);
    }
  };

  useEffect(() => {
    measureLoopWidth();
    const onResize = () => measureLoopWidth();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [testimonials.length]);

  useEffect(() => {
    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      if (!isPaused && !isDragging && loopWidthRef.current > 0) {
        offsetRef.current = normalizeOffset(offsetRef.current - speed * dt);
        applyTransform(offsetRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationFrameRef.current != null) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      lastTsRef.current = null;
    };
  }, [isPaused, isDragging]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    activePointerIdRef.current = e.pointerId;
    setIsDragging(true);
    setIsPaused(true);
    pointerStartXRef.current = e.clientX;
    dragStartOffsetRef.current = offsetRef.current;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || activePointerIdRef.current !== e.pointerId) return;
    const deltaX = e.clientX - pointerStartXRef.current;
    offsetRef.current = normalizeOffset(dragStartOffsetRef.current + deltaX);
    applyTransform(offsetRef.current);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    activePointerIdRef.current = null;
    setIsDragging(false);
    setIsPaused(false);
  };

  return (
    <section className="py-24 bg-section-teal border-t border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Patient Stories</h2>
          <p className="text-lg text-text-sub max-w-2xl mx-auto">
            Hear from people who found the right care when they needed it most.
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onMouseEnter={() => !isDragging && setIsPaused(true)}
          onMouseLeave={() => !isDragging && setIsPaused(false)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: "pan-y" }}
        >
          {/* Carousel Track */}
          <div ref={trackRef} className="flex gap-8 will-change-transform">
            {clonedTestimonials.map((t, idx) => (
              <div
                key={idx}
                ref={idx === 0 ? firstCardRef : idx === testimonials.length ? firstCloneCardRef : null}
                className="shrink-0 w-full sm:w-full md:w-[calc(50%-16px)] lg:w-[calc(33.333%-21px)] bg-card p-8 rounded-3xl border border-border shadow-sm relative"
              >
                <span className="material-symbols-outlined text-primary/20 text-6xl absolute top-6 right-6">
                  format_quote
                </span>
                <div className="flex gap-1 text-warning mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-sm">
                      star
                    </span>
                  ))}
                </div>
                <p className="text-text-sub mb-6 relative z-10 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-section-blue shrink-0" />
                  <div>
                    <p className="font-bold text-text-base">{t.name}</p>
                    <p className="text-sm text-text-muted">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
