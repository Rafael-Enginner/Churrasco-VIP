import { useEffect, useRef, type ReactNode } from "react";

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

export function Reveal({
  children,
  from = "up",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  from?: "up" | "left" | "right";
  delay?: number;
  className?: string;
}) {
  const ref = useInView<HTMLDivElement>();
  const dir = from === "left" ? "reveal-left" : from === "right" ? "reveal-right" : "";
  return (
    <div ref={ref} className={`reveal ${dir} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/** Espeto que desliza na tela ao rolar */
export function SkewerDivider({ reverse = false }: { reverse?: boolean }) {
  const ref = useInView<HTMLDivElement>();
  const chunks = [140, 230, 320, 410, 500, 590];
  return (
    <div ref={ref} aria-hidden className="mx-auto max-w-6xl overflow-hidden px-5 py-6">
      <svg
        viewBox="0 0 800 80"
        className={`skewer ${reverse ? "skewer-right" : ""} h-14 w-full`}
        style={reverse ? { scale: "-1 1" } : undefined}
      >
        <line x1="40" y1="40" x2="760" y2="40" stroke="var(--color-muted-foreground)" strokeWidth="4" strokeLinecap="round" />
        <polygon points="760,34 795,40 760,46" fill="var(--color-muted-foreground)" />
        <rect x="10" y="30" width="40" height="20" rx="6" fill="var(--color-secondary)" stroke="var(--color-border)" />
        {chunks.map((x, i) => (
          <g key={x} className="skewer-chunk" style={{ animationDelay: `${i * 0.15}s` }}>
            <rect
              x={x}
              y="20"
              width="62"
              height="40"
              rx="12"
              fill={i % 3 === 2 ? "var(--color-secondary)" : "var(--color-primary)"}
              opacity={i % 3 === 2 ? 1 : 0.9}
            />
            <line x1={x + 14} y1="24" x2={x + 14} y2="56" stroke="var(--color-charcoal)" strokeWidth="3" opacity=".5" />
            <line x1={x + 40} y1="24" x2={x + 40} y2="56" stroke="var(--color-charcoal)" strokeWidth="3" opacity=".5" />
            <circle className="ember-spark" style={{ animationDelay: `${i * 0.4}s` }} cx={x + 30} cy="16" r="2.5" fill="var(--color-primary)" />
          </g>
        ))}
      </svg>
    </div>
  );
}
