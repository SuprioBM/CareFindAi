'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const allCards = (
  features: { title: string; icon: string; desc: string }[]
) => [
  ...features.map((f) => ({
    key: f.title,
    icon: (
      <span className="material-symbols-outlined text-primary text-3xl">
        {f.icon}
      </span>
    ),
    title: f.title,
    desc: f.desc,
  })),
  {
    key: 'saved-care',
    icon: (
      <span className="material-symbols-outlined text-primary text-4xl">
        favorite
      </span>
    ),
    title: 'Saved Care Team',
    desc:
      'Build your personal roster of trusted doctors, easily accessible for future bookings.',
  },
  {
    key: 'explainable-ai',
    icon: (
      <span className="material-symbols-outlined text-primary text-3xl">
        info
      </span>
    ),
    title: 'Explainable AI',
    desc:
      'Understand exactly why certain conditions and doctors are recommended.',
  },
];

function StackCard({
  card,
  index,
  total,
  progress,
}: any) {
  const targetScale =
    1 - (total - 1 - index) * 0.02;

  const scale = useTransform(
    progress,
    [index / total, 1],
    [1, targetScale]
  );

  return (
    <div
      className="absolute left-0 right-0 sticky"
      style={{
        top: `${index * 12}px`,
        zIndex: index + 10,
      }}
    >
      <motion.div
        style={{
          scale,
          transformOrigin: 'top center',
        }}
        className="w-full px-2"
      >
        <div className="p-6 rounded-3xl bg-section-teal border border-border shadow-md">
          <div className="w-12 h-12 bg-card rounded-2xl shadow-sm flex items-center justify-center mb-4">
            {card.icon}
          </div>

          <h3 className="text-lg font-bold mb-2">
            {card.title}
          </h3>

          <p className="text-text-sub text-sm">
            {card.desc}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function MobileFeatureStack({
  features,
}: {
  features: {
    title: string;
    icon: string;
    desc: string;
  }[];
}) {
  const cards = allCards(features);

  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    container: ref,
  });

  const CARD_H = 250;

  return (
    <div className="md:hidden max-w-md mx-auto">
      <div
        ref={ref}
        className="overflow-y-scroll"
        style={{
          height: '60vh',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div
          className="relative"
          style={{
            height: cards.length * CARD_H,
          }}
        >
          {cards.map((card, i) => (
            <StackCard
              key={card.key}
              card={card}
              index={i}
              total={cards.length}
              progress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </div>
  );
}