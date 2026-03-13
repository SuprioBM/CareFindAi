'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle colour theme"
      className="w-10 h-10 rounded-full bg-section-teal border border-border flex items-center justify-center text-text-sub hover:text-primary hover:border-primary transition-colors"
    >
      <span className="material-symbols-outlined text-xl leading-none" suppressHydrationWarning>
        {mounted ? (isDark ? 'light_mode' : 'dark_mode') : 'dark_mode'}
      </span>
    </button>
  );
}
