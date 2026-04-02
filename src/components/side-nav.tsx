"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Sun, Moon, ZoomIn, ZoomOut, Clock, RotateCcw,
  LayoutDashboard, Building2, CreditCard, Flame, GitCommit,
  FileSearch, Wallet, Lightbulb, CheckCircle, Download,
  type LucideIcon,
} from "lucide-react";

const sections: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "hero", label: "Overview", icon: LayoutDashboard },
  { id: "company-work", label: "Evolphin", icon: Building2 },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "peak-day", label: "Peak Day", icon: Flame },
  { id: "hours", label: "Hours", icon: Clock },
  { id: "output", label: "Output", icon: GitCommit },
  { id: "details", label: "Details", icon: FileSearch },
  { id: "investment", label: "Invest", icon: Wallet },
  { id: "projects", label: "Projects", icon: Lightbulb },
  { id: "actions", label: "Actions", icon: CheckCircle },
  { id: "downloads", label: "Downloads", icon: Download },
];

export function SideNav() {
  const [active, setActive] = useState("hero");
  const [timeFormat, setTimeFormat] = useState<"24h" | "12h">("24h");
  const [zoom, setZoom] = useState(100);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [scrollProgress, setScrollProgress] = useState(0);

  // Intersection observer for active section
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

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? scrollTop / docHeight : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Zoom
  useEffect(() => {
    document.documentElement.style.fontSize = `${zoom}%`;
  }, [zoom]);

  // Theme
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light-mode");
    } else {
      document.documentElement.classList.remove("light-mode");
    }
  }, [theme]);

  // Time format (global event)
  useEffect(() => {
    document.documentElement.setAttribute("data-time-format", timeFormat);
    window.dispatchEvent(new CustomEvent("timeFormatChange", { detail: timeFormat }));
  }, [timeFormat]);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const activeIndex = sections.findIndex((s) => s.id === active);

  return (
    <div className="fixed top-1/2 right-3 -translate-y-1/2 z-50 hidden lg:flex flex-col items-end gap-3">
      {/* Main panel */}
      <div className="relative bg-[rgba(20,20,20,0.75)] backdrop-blur-2xl border border-white/[0.06] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.4),0_0_0_1px_rgba(168,85,247,0.06)] overflow-hidden">

        {/* Scroll progress bar — left edge */}
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/[0.04]">
          <div
            className="w-full bg-gradient-to-b from-[#a855f7] to-[#7c3aed] transition-all duration-300 ease-out rounded-full"
            style={{ height: `${scrollProgress * 100}%` }}
          />
        </div>

        <div className="p-2.5 pl-4">
          {/* Section navigation */}
          <nav className="flex flex-col gap-[1px] relative">
            {sections.map((s, i) => {
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`
                    relative text-right pl-3 pr-3 py-[5px] rounded-lg text-[10px] tracking-wider uppercase
                    transition-all duration-200 ease-out cursor-pointer
                    ${isActive
                      ? "text-white font-semibold"
                      : "text-[rgba(255,255,255,0.35)] hover:text-[rgba(255,255,255,0.7)] hover:bg-white/[0.04]"
                    }
                  `}
                >
                  {/* Active highlight pill */}
                  {isActive && (
                    <span className="absolute inset-0 rounded-lg bg-[#a855f7]/[0.12] border border-[#a855f7]/20 shadow-[inset_0_1px_0_rgba(168,85,247,0.1),0_0_12px_rgba(168,85,247,0.08)]" />
                  )}
                  {/* Active right accent bar */}
                  {isActive && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[2.5px] h-3.5 rounded-full bg-[#a855f7] shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5 justify-end">
                    <s.icon className={`h-3 w-3 ${isActive ? "text-[#a855f7]" : ""}`} />
                    {s.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="my-2.5 mx-2 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

          {/* Controls — always visible */}
          <div className="flex flex-col gap-2 px-1">
            {/* Time format — segmented control */}
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-[rgba(255,255,255,0.3)] shrink-0" />
              <div className="flex flex-1 bg-white/[0.05] rounded-md p-[2px]">
                <button
                  onClick={() => setTimeFormat("24h")}
                  className={`flex-1 text-[9px] font-medium tracking-wider px-2 py-[3px] rounded-[4px] transition-all duration-200 ${
                    timeFormat === "24h"
                      ? "bg-[#a855f7] text-white shadow-[0_1px_4px_rgba(168,85,247,0.3)]"
                      : "text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.7)]"
                  }`}
                >
                  IST
                </button>
                <button
                  onClick={() => setTimeFormat("12h")}
                  className={`flex-1 text-[9px] font-medium tracking-wider px-2 py-[3px] rounded-[4px] transition-all duration-200 ${
                    timeFormat === "12h"
                      ? "bg-[#a855f7] text-white shadow-[0_1px_4px_rgba(168,85,247,0.3)]"
                      : "text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.7)]"
                  }`}
                >
                  AM/PM
                </button>
              </div>
            </div>

            {/* Zoom — inline control */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-[rgba(255,255,255,0.3)] tabular-nums w-7 shrink-0">{zoom}%</span>
              <div className="flex flex-1 items-center bg-white/[0.05] rounded-md p-[2px] gap-[1px]">
                <button
                  onClick={() => setZoom(Math.max(80, zoom - 10))}
                  className="flex-1 flex items-center justify-center py-[3px] rounded-[4px] text-[rgba(255,255,255,0.4)] hover:text-white hover:bg-white/[0.08] transition-all duration-150"
                >
                  <ZoomOut className="h-2.5 w-2.5" />
                </button>
                <button
                  onClick={() => setZoom(100)}
                  className="flex-1 flex items-center justify-center py-[3px] rounded-[4px] text-[9px] text-[rgba(255,255,255,0.4)] hover:text-white hover:bg-white/[0.08] transition-all duration-150"
                >
                  <RotateCcw className="h-2.5 w-2.5" />
                </button>
                <button
                  onClick={() => setZoom(Math.min(140, zoom + 10))}
                  className="flex-1 flex items-center justify-center py-[3px] rounded-[4px] text-[rgba(255,255,255,0.4)] hover:text-white hover:bg-white/[0.08] transition-all duration-150"
                >
                  <ZoomIn className="h-2.5 w-2.5" />
                </button>
              </div>
            </div>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-2 px-1 py-[3px] rounded-md hover:bg-white/[0.04] transition-all duration-200 group"
            >
              {theme === "dark" ? (
                <Sun className="h-3 w-3 text-[rgba(255,255,255,0.3)] group-hover:text-amber-400 transition-colors duration-200 shrink-0" />
              ) : (
                <Moon className="h-3 w-3 text-[rgba(255,255,255,0.3)] group-hover:text-[#c084fc] transition-colors duration-200 shrink-0" />
              )}
              <span className="text-[9px] tracking-wider uppercase text-[rgba(255,255,255,0.3)] group-hover:text-[rgba(255,255,255,0.7)] transition-colors duration-200">
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </span>
            </button>

            {/* GitHub repo link */}
            <a
              href="https://github.com/luv-jeri/usage-report"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-1 py-[3px] rounded-md hover:bg-white/[0.04] transition-all duration-200 group"
            >
              <svg className="h-3 w-3 text-[rgba(255,255,255,0.3)] group-hover:text-white transition-colors duration-200 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              <span className="text-[9px] tracking-wider uppercase text-[rgba(255,255,255,0.3)] group-hover:text-[rgba(255,255,255,0.7)] transition-colors duration-200">
                Source
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
