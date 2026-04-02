"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const sections = [
  { id: "hero", label: "Overview" },
  { id: "billing", label: "Billing" },
  { id: "peak-day", label: "Peak Day" },
  { id: "hours", label: "Hours" },
  { id: "output", label: "Output" },
  { id: "details", label: "Details" },
  { id: "investment", label: "Investment" },
  { id: "projects", label: "Projects" },
  { id: "actions", label: "Actions" },
];

export function SideNav() {
  const [active, setActive] = useState("hero");
  const [timeFormat, setTimeFormat] = useState<"24h" | "12h">("24h");
  const [zoom, setZoom] = useState(100);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: "-30% 0px -30% 0px", threshold: 0 }
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${zoom}%`;
  }, [zoom]);

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light-mode");
    } else {
      document.documentElement.classList.remove("light-mode");
    }
  }, [theme]);

  // Expose time format globally
  useEffect(() => {
    document.documentElement.setAttribute("data-time-format", timeFormat);
    window.dispatchEvent(new CustomEvent("timeFormatChange", { detail: timeFormat }));
  }, [timeFormat]);

  return (
    <div className="fixed top-1/2 right-4 -translate-y-1/2 z-50 hidden lg:block">
      <Card className="bg-card/90 backdrop-blur-xl border-border/50 shadow-2xl">
        <div className="p-3 space-y-3">
          {/* Section dots */}
          <div className="flex flex-col gap-2 items-end">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-2 group"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <span className={`text-[9px] tracking-wider uppercase transition-all duration-300 whitespace-nowrap ${
                  active === s.id ? "text-[#a855f7] opacity-100 translate-x-0" : "text-muted-foreground opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                }`}>
                  {s.label}
                </span>
                <span className={`w-2 h-2 rounded-full transition-all duration-300 shrink-0 ${
                  active === s.id
                    ? "bg-[#a855f7] shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                    : "bg-[rgba(255,255,255,0.15)] hover:bg-[#a855f7] hover:scale-125"
                }`} />
              </a>
            ))}
          </div>

          <Separator className="opacity-30" />

          {/* Controls toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-[9px] text-muted-foreground uppercase tracking-widest text-center hover:text-foreground transition-colors"
          >
            {expanded ? "▾ Controls" : "▸ Controls"}
          </button>

          {expanded && (
            <div className="space-y-3 animate-fade-in">
              {/* Time format */}
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-muted-foreground uppercase tracking-widest">Time</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setTimeFormat("24h")}
                    className={`text-[10px] px-2 py-1 rounded transition-all ${
                      timeFormat === "24h" ? "bg-[#a855f7] text-white" : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    IST
                  </button>
                  <button
                    onClick={() => setTimeFormat("12h")}
                    className={`text-[10px] px-2 py-1 rounded transition-all ${
                      timeFormat === "12h" ? "bg-[#a855f7] text-white" : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    AM/PM
                  </button>
                </div>
              </div>

              {/* Zoom */}
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-muted-foreground uppercase tracking-widest">Zoom {zoom}%</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setZoom(Math.max(80, zoom - 10))}
                    className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                  >
                    −
                  </button>
                  <button
                    onClick={() => setZoom(100)}
                    className="text-[10px] px-2 py-1 rounded bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setZoom(Math.min(140, zoom + 10))}
                    className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Theme */}
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-muted-foreground uppercase tracking-widest">Theme</span>
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="text-[10px] px-2 py-1.5 rounded bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent transition-all flex items-center gap-1.5"
                >
                  {theme === "dark" ? "☀ Light" : "🌙 Dark"}
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
