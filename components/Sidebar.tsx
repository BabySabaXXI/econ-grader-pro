"use client";

import { cn } from "@/lib/utils";
import {
  GraduationCap,
  Pen,
  FileText,
  Settings,
  CircleHelp,
  X,
  BookOpen,
  Zap,
} from "lucide-react";

type SidebarProps = {
  activeMode: "grader" | "planner";
  onModeChange: (mode: "grader" | "planner") => void;
  visible: boolean;
  onClose: () => void;
};

const NAV_ITEMS = [
  {
    mode: "grader" as const,
    title: "Exam Grader",
    description: "AI essay marking",
    icon: Pen,
  },
  {
    mode: "planner" as const,
    title: "Essay Planner",
    description: "Structure builder",
    icon: FileText,
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
      <div
        className={cn(
          "fixed top-0 left-0 bottom-0 flex flex-col z-30 bg-white",
          "transition-transform duration-200",
          "max-lg:z-40",
          visible
            ? "max-lg:translate-x-0"
            : "max-lg:-translate-x-full"
        )}
        style={{
          width: "16.5rem",
          borderRight: "1px solid var(--n-3)",
        }}
      >
        <div className="grow overflow-auto scrollbar-none px-4 pt-5 pb-4">
          {/* Brand */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center w-8 h-8"
                style={{
                  borderRadius: "0.5rem",
                  background: "var(--n-7)",
                }}
              >
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-n-7 tracking-[-0.01em]">
                  EconGrader
                </div>
                <div className="text-[11px] text-n-4 tracking-[-0.01em]">
                  AI Exam Assistant
                </div>
              </div>
            </div>
            <button
              className="hidden max-lg:flex items-center justify-center w-7 h-7 rounded-md hover:bg-n-2 transition-colors"
              onClick={onClose}
            >
              <X className="w-4 h-4 text-n-4" />
            </button>
          </div>

          {/* Spec badge */}
          <div
            className="mb-5 px-3 py-2.5"
            style={{
              borderRadius: "0.5rem",
              background: "var(--n-1)",
              border: "1px solid var(--n-3)",
            }}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--accent-5)" }}
              />
              <span className="text-[11px] font-medium text-n-5 uppercase tracking-wider">
                Pearson Edexcel IAL
              </span>
            </div>
            <div className="text-[11px] text-n-4 pl-3.5">
              Economics Units 1–4
            </div>
          </div>

          {/* Section */}
          <div className="mb-1.5 px-3 text-[10px] font-semibold text-n-4 uppercase tracking-[0.08em]">
            Tools
          </div>

          {/* Navigation */}
          <div className="space-y-0.5 mb-6">
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
                    "flex items-center gap-3 w-full px-3 text-left transition-all duration-150",
                    "rounded-md",
                    isActive
                      ? "bg-n-2 text-n-7"
                      : "text-n-5 hover:bg-n-1 hover:text-n-7"
                  )}
                  style={{ height: "2.5rem" }}
                >
                  <Icon
                    className="w-4 h-4 flex-shrink-0"
                    style={{
                      color: isActive ? "var(--primary-1)" : undefined,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-medium">
                      {item.title}
                    </span>
                  </div>
                  {isActive && (
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: "var(--primary-1)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Resources */}
          <div className="mb-1.5 px-3 text-[10px] font-semibold text-n-4 uppercase tracking-[0.08em]">
            Resources
          </div>

          <div className="space-y-0.5 mb-6">
            <div
              className="flex items-center gap-3 w-full px-3 text-n-4 opacity-50"
              style={{ height: "2.5rem", borderRadius: "0.375rem" }}
            >
              <BookOpen className="w-4 h-4" />
              <span className="flex-1 text-[13px]">Study Guide</span>
              <span
                className="text-[10px] font-medium text-n-4 px-1.5 py-0.5"
                style={{
                  background: "var(--n-2)",
                  borderRadius: "0.25rem",
                }}
              >
                Soon
              </span>
            </div>
          </div>

          {/* AI card */}
          <div
            className="p-3.5"
            style={{
              borderRadius: "0.5rem",
              background: "var(--n-7)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5" style={{ color: "var(--primary-2)" }} />
              <span className="text-[12px] font-medium text-white/80">
                Powered by Claude
              </span>
            </div>
            <p className="text-[11px] text-white/35 leading-relaxed">
              AI feedback aligned with Edexcel mark schemes and level descriptors.
            </p>
          </div>

          {/* Bottom */}
          <div className="mt-6 space-y-0.5">
            <div
              className="flex items-center gap-3 w-full px-3 text-n-4 opacity-40 cursor-default"
              style={{ height: "2.25rem", borderRadius: "0.375rem" }}
            >
              <CircleHelp className="w-4 h-4" />
              <span className="text-[13px]">Help</span>
            </div>
            <div
              className="flex items-center gap-3 w-full px-3 text-n-4 opacity-40 cursor-default"
              style={{ height: "2.25rem", borderRadius: "0.375rem" }}
            >
              <Settings className="w-4 h-4" />
              <span className="text-[13px]">Settings</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="shrink-0 px-4 py-3"
          style={{ borderTop: "1px solid var(--n-3)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 flex items-center justify-center flex-shrink-0"
              style={{
                borderRadius: "0.375rem",
                background: "var(--primary-1)",
              }}
            >
              <span className="text-[10px] font-bold text-white">E</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium text-n-7 truncate">
                EconGrader Pro
              </div>
              <div className="text-[10px] text-n-4">v2.0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-all hidden max-lg:block",
          visible
            ? "visible opacity-100"
            : "invisible opacity-0"
        )}
        onClick={onClose}
      />
    </>
  );
}
