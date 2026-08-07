"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

// Subtle on-scroll entrance for section headers/cards. Renders children
// invisible-until-observed only once an IntersectionObserver actually exists
// and has fired — so server-rendered HTML, no-JS visitors, and browsers
// without IntersectionObserver support all just see the final state
// immediately, never a stuck-invisible element.
export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${visible ? "animate-fade-slide-up" : "opacity-0"} ${className}`}
      style={visible && delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
