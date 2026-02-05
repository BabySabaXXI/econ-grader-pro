"use client";

import { cn } from "@/lib/utils";
import {
  GraduationCap,
  Pen,
  FileText,
  Settings,
  CircleHelp,
  X,
  Sparkles,
  BookOpen,
  ChevronRight,
  Zap,
} from "lucide-react";

type SidebarProps = {
  activeMode: "grader" | "planner";
  onModeChange: (mode: "grader" | "planner") => void;
  visible: boolean;
  onClose: () => void;
};

// Brainwave-style navigation with colored icon backgrounds
const NAV_ITEMS = [
  {
    mode: "grader" as const,
    title: "Exam Grader",
    icon: Pen,
    color: "#0084FF",
    bgColor: "rgba(0, 132, 255, 0.12)",
  },
  {
    mode: "planner" as const,
    title: "Essay Planner",
    icon: FileText,
    color: "#8E55EA",
    bgColor: "rgba(142, 85, 234, 0.12)",
  },
];

export default function Sidebar({
  activeMode,
  onModeChange,
  visible,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Sidebar Panel — Brainwave LeftSidebar pattern */}
      <div
        className={cn(
          "fixed top-0 left-0 bottom-0 flex flex-col z-30 bg-n-1",
          "transition-transform duration-300 ease-spring",
          "max-lg:z-40",
          visible
            ? "max-lg:translate-x-0"
            : "max-lg:-translate-x-full"
        )}
        style={{
          width: "20rem",
          borderRight: "1px solid var(--n-3)",
        }}
      >
        {/* Scrollable Content */}
        <div className="grow overflow-auto scrollbar-none px-6 pt-8 pb-6">
          {/* Brand Header — Brainwave Logo pattern */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3.5">
              <div
                className="flex items-center justify-center w-11 h-11"
                style={{
                  borderRadius: "0.75rem",
                  background: "linear-gradient(135deg, var(--primary-1), var(--accent-3))",
                  boxShadow: "0 0.25rem 1rem rgba(0, 132, 255, 0.3)",
                }}
              >
                <GraduationCap className="w-5.5 h-5.5 text-white" />
              </div>
              <div>
                <div className="text-h6 font-inter text-n-7">
                  EconGrader
                </div>
                <div className="text-caption1 text-n-4">
                  AI Exam Assistant
                </div>
              </div>
            </div>
            <button
              className="hidden max-lg:flex items-center justify-center w-9 h-9 rounded-lg hover:bg-n-2 transition-colors"
              onClick={onClose}
            >
              <X className="w-5 h-5 text-n-4" />
            </button>
          </div>

          {/* Exam Info Badge — Brainwave caption style */}
          <div
            className="mb-8 px-4 py-3.5"
            style={{
              borderRadius: "0.75rem",
              background: "var(--n-2)",
              border: "2px solid var(--n-3)",
            }}
          >
            <div className="flex items-center gap-2.5 mb-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "var(--primary-2)" }}
              />
              <span className="text-caption1 font-inter text-n-5 uppercase tracking-wider">
                Pearson Edexcel IAL
              </span>
            </div>
            <div className="text-caption1 text-n-4">
              AS & A Level Economics · Units 1–4
            </div>
          </div>

          {/* Section Label */}
          <div className="mb-3 px-4 text-caption2 font-inter text-n-4 uppercase tracking-widest">
            Tools
          </div>

          {/* Navigation — Brainwave Menu pattern with colored icon bgs */}
          <div className="space-y-1.5 mb-10">
            {NAV_ITEMS.map((item) => {
              const isActive = activeMode === item.mode;
              const Icon = item.icon;

              return (
                <button
                  key={item.mode}
                  onClick={() => {
                    onModeChange(item.mode);
                    onClose();
                  }}
                  className={cn(
                    "menu-item-bw",
                    isActive && "!border-transparent"
                  )}
                  style={
                    isActive
                      ? {
                          borderColor: "transparent",
                          boxShadow:
                            "0 0 1rem 0.25rem rgba(0,0,0,0.04), 0 2rem 2rem -1rem rgba(0,0,0,0.1)",
                        }
                      : undefined
                  }
                >
                  {/* Colored icon background — key Brainwave pattern */}
                  <div
                    className="flex items-center justify-center w-9 h-9 flex-shrink-0"
                    style={{
                      borderRadius: "0.5rem",
                      background: isActive ? item.bgColor : "var(--n-2)",
                    }}
                  >
                    <Icon
                      className="w-[18px] h-[18px]"
                      style={{ color: isActive ? item.color : "var(--n-4)" }}
                    />
                  </div>
                  <span
                    className="flex-1 text-left text-base2 font-inter"
                    style={{
                      color: isActive ? "var(--n-7)" : "var(--n-4)",
                    }}
                  >
                    {item.title}
                  </span>
                  <ChevronRight
                    className="w-4 h-4 transition-all"
                    style={{
                      color: isActive ? item.color : "var(--n-3)",
                      transform: isActive ? "translateX(2px)" : "none",
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Resources Section */}
          <div className="mb-3 px-4 text-caption2 font-inter text-n-4 uppercase tracking-widest">
            Resources
          </div>

          <div className="space-y-1 mb-10">
            <div
              className="flex items-center gap-3.5 w-full px-4 text-sm text-n-4 opacity-50"
              style={{ height: "3rem", borderRadius: "0.75rem" }}
            >
              <BookOpen className="w-[18px] h-[18px]" />
              <span className="flex-1 text-left text-base2 font-inter">
                Study Guide
              </span>
              <span
                className="text-caption2 font-semibold text-n-4 px-2 py-0.5"
                style={{
                  background: "var(--n-2)",
                  borderRadius: "0.375rem",
                }}
              >
                Soon
              </span>
            </div>
          </div>

          {/* AI Info Card — Brainwave dark gradient pattern */}
          <div
            className="p-5 text-white"
            style={{
              borderRadius: "1.25rem",
              background: "linear-gradient(135deg, var(--n-7), var(--n-6))",
              boxShadow: "0 0.75rem 2.5rem -0.75rem rgba(0, 0, 0, 0.25)",
            }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="flex items-center justify-center w-8 h-8"
                style={{
                  borderRadius: "0.5rem",
                  background: "rgba(0, 132, 255, 0.2)",
                }}
              >
                <Zap className="w-4 h-4 text-primary-1" />
              </div>
              <span className="text-base2 font-inter text-white/90">
                Powered by AI
              </span>
            </div>
            <p className="text-caption1 text-white/40 leading-relaxed">
              Claude AI provides feedback aligned with official Edexcel mark
              schemes and level descriptors.
            </p>
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 space-y-0.5">
            <div
              className="flex items-center gap-3.5 w-full px-4 text-n-4 opacity-50 cursor-default"
              style={{
                height: "2.75rem",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
              }}
            >
              <CircleHelp className="w-[18px] h-[18px]" />
              <span className="text-base2 font-inter">Help</span>
            </div>
            <div
              className="flex items-center gap-3.5 w-full px-4 text-n-4 opacity-50 cursor-default"
              style={{
                height: "2.75rem",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
              }}
            >
              <Settings className="w-[18px] h-[18px]" />
              <span className="text-base2 font-inter">Settings</span>
            </div>
          </div>
        </div>

        {/* Version Footer — Brainwave profile pattern */}
        <div
          className="shrink-0 px-6 py-4"
          style={{ borderTop: "1px solid var(--n-3)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 flex items-center justify-center flex-shrink-0"
              style={{
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary-1), var(--accent-3))",
                boxShadow: "0 0 0 0.25rem var(--n-1), 0 2px 6px rgba(0,132,255,0.2)",
              }}
            >
              <span className="text-xs font-bold text-white">E</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base2 font-inter text-n-7 truncate">
                EconGrader Pro
              </div>
              <div className="text-caption2 text-n-4">v2.0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay — Brainwave 75% opacity */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-n-7/75 backdrop-blur-sm transition-all hidden max-lg:block",
          visible
            ? "visible opacity-100"
            : "invisible opacity-0"
        )}
        onClick={onClose}
      />
    </>
  );
}
