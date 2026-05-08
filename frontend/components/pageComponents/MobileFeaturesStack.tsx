'use client';
import { useRef, useEffect, useState } from 'react';

const allCards = (features: { title: string; icon: string; desc: string }[]) => [
  ...features.map((f) => ({
    key: f.title,
    icon: <span className="material-symbols-outlined text-primary text-3xl">{f.icon}</span>,
    title: f.title,
    desc: f.desc,
    wide: false,
  })),
  {
    key: 'saved-care',
    icon: <span className="material-symbols-outlined text-primary text-4xl">favorite</span>,
    title: 'Saved Care Team',
    desc: 'Build your personal roster of trusted doctors, easily accessible for future bookings.',
    wide: false,
  },
  {
    key: 'explainable-ai',
    icon: <span className="material-symbols-outlined text-primary text-3xl">info</span>,
    title: 'Explainable AI',
    desc: 'Understand exactly why certain conditions and doctors are recommended.',
    wide: false,
  },
];

function MobileFeatureStack({ features }: { features: { title: string; icon: string; desc: string }[] }) {
  const cards = allCards(features);
  const CARD_COUNT = cards.length;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [stackedCount, setStackedCount] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
const onScroll = () => {
  const scrollTop = el.scrollTop;

  const STEP = CARD_H * 0.45;

  const stacked = Math.floor(scrollTop / STEP);

  setStackedCount(
    Math.max(0, Math.min(stacked + 1, CARD_COUNT))
  );
};
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [CARD_COUNT]);

  const CARD_H = 180;
  const GAP = 16;
  const scrollContentHeight = CARD_COUNT * (CARD_H + GAP) * 1.5;

  return (
    <div className="md:hidden max-w-md mx-auto">
      <div
        ref={scrollRef}
        className="overflow-y-scroll"
        style={{
          height: '40vh',              // ← was 50vh, gives enough room for spread
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div style={{ height: scrollContentHeight }} className="relative">
          <div
            className="sticky top-0 flex flex-col items-center justify-start pt-4"
            style={{ height: '60vh' }} // ← match scroll container height
          >
            {cards.map((card, i) => {
              const isStacked = i < stackedCount;

              // Stacked: always offset DOWNWARD from top-0 by i * peek
              // This anchors card-0 at top:0 forever — nothing goes above it
              const stackedTop = i * 12;
              const naturalTop = i * (CARD_H + GAP);
              const top = isStacked ? stackedTop : naturalTop;

              const zIndex =  10 + i ;

              // ✅ depth can't be negative — no scale > 1 or NaN
              const depth = isStacked ? Math.max(0, stackedCount - 1 - i) : 0;
              const scale = Math.max(0.93, 1 - depth * 0.02);

              return (
                <div
                  key={card.key}
                  className="absolute w-full px-2"
                  style={{
                    top,
                    zIndex,
                    transform: `scale(${scale})`,
                    transition: 'top 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.35s cubic-bezier(0.4,0,0.2,1)',
                    transformOrigin: 'top center',
                  }}
                >
                  <div className="p-6 rounded-3xl bg-section-teal border border-border shadow-md">
                    <div className="w-12 h-12 bg-card rounded-2xl shadow-sm flex items-center justify-center mb-4">
                      {card.icon}
                    </div>
                    <h3 className="text-lg font-bold mb-2">{card.title}</h3>
                    <p className="text-text-sub text-sm">{card.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileFeatureStack;