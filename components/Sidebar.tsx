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
} from "lucide-react";

type SidebarProps = {
  activeMode: "grader" | "planner";
  onModeChange: (mode: "grader" | "planner") => void;
  visible: boolean;
  onClose: () => void;
};

export default function Sidebar({
  activeMode,
  onModeChange,
  visible,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Sidebar Panel */}
      <div
        className={cn(
          "fixed top-5 left-5 bottom-5 flex flex-col w-72 bg-white rounded-3xl z-30",
          "transition-transform duration-300 ease-spring",
          "max-lg:top-0 max-lg:left-0 max-lg:bottom-0 max-lg:z-40 max-lg:w-75 max-lg:rounded-none",
          "max-md:w-full max-md:p-4",
          visible
            ? "max-lg:translate-x-0"
            : "max-lg:-translate-x-full"
        )}
        style={{
          border: "1px solid rgba(0, 0, 0, 0.06)",
          boxShadow:
            "0 1px 3px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Scrollable Content */}
        <div className="grow overflow-auto scrollbar-none p-6 max-md:p-0">
          {/* Brand Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, #5472b8, #a0b0d6)",
                  boxShadow: "0 2px 8px rgba(84, 114, 184, 0.25)",
                }}
              >
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-label-md font-inter text-[--strong-950]">
                  EconGrader
                </div>
                <div className="text-p-xs text-[--text-soft-400]">
                  Edexcel IAL
                </div>
              </div>
            </div>
            <button
              className="hidden max-lg:flex items-center justify-center w-8 h-8 rounded-full hover:bg-[--bg-weak-50] transition-colors"
              onClick={onClose}
            >
              <X className="w-4 h-4 text-[--text-sub-600]" />
            </button>
          </div>

          {/* Exam Info Badge */}
          <div className="mb-8 p-3.5 rounded-xl bg-[--bg-weak-50] border border-[--stroke-soft-200]">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#4a9e72" }}
              />
              <span className="text-label-xs font-inter text-[--text-sub-600] uppercase tracking-wider">
                Pearson Edexcel IAL
              </span>
            </div>
            <div className="text-p-xs text-[--text-soft-400]">
              AS & A Level Economics · Units 1–4
            </div>
          </div>

          {/* Navigation */}
          <div className="mb-2.5 text-label-xs font-inter text-[--text-soft-400] px-3.5">
            Tools
          </div>

          {/* Exam Grader Link */}
          <button
            onClick={() => {
              onModeChange("grader");
              onClose();
            }}
            className={cn(
              "sidebar-link w-full mb-1",
              activeMode === "grader" && "sidebar-link-active"
            )}
          >
            <Pen
              className={cn(
                "w-[18px] h-[18px] transition-colors",
                activeMode === "grader"
                  ? "text-[--blue-600]"
                  : "text-[--text-sub-600]"
              )}
            />
            <span className="flex-1 text-left">Exam Grader</span>
            {activeMode === "grader" && (
              <ChevronRight className="w-3.5 h-3.5 text-[--blue-500]" />
            )}
          </button>

          {/* Essay Planner Link */}
          <button
            onClick={() => {
              onModeChange("planner");
              onClose();
            }}
            className={cn(
              "sidebar-link w-full mb-1",
              activeMode === "planner" && "sidebar-link-active"
            )}
          >
            <FileText
              className={cn(
                "w-[18px] h-[18px] transition-colors",
                activeMode === "planner"
                  ? "text-[--blue-600]"
                  : "text-[--text-sub-600]"
              )}
            />
            <span className="flex-1 text-left">Essay Planner</span>
            {activeMode === "planner" && (
              <ChevronRight className="w-3.5 h-3.5 text-[--blue-500]" />
            )}
          </button>

          {/* Resources Section */}
          <div className="mt-10 mb-2.5 text-label-xs font-inter text-[--text-soft-400] px-3.5">
            Resources
          </div>

          <div className="sidebar-link cursor-default opacity-50">
            <BookOpen className="w-[18px] h-[18px] text-[--text-sub-600]" />
            <span className="flex-1 text-left">Study Guide</span>
            <span className="text-[10px] font-medium text-[--text-soft-400] bg-[--bg-soft-200] px-2 py-0.5 rounded-full">
              Soon
            </span>
          </div>

          {/* AI Info Card */}
          <div
            className="mt-10 p-4 rounded-2xl text-white"
            style={{
              background: "linear-gradient(135deg, #1c2640, #324478)",
              boxShadow: "0 2px 12px rgba(28, 38, 64, 0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[--blue-300]" />
              <span className="text-label-sm font-inter text-white/90">
                Powered by AI
              </span>
            </div>
            <p className="text-p-xs text-white/50 leading-relaxed">
              Get AI-powered feedback aligned with official Edexcel mark
              schemes and level descriptors.
            </p>
          </div>

          {/* Bottom Actions */}
          <div className="mt-8">
            <div className="sidebar-link cursor-default opacity-50">
              <CircleHelp className="w-[18px] h-[18px] text-[--text-sub-600]" />
              <span>Help</span>
            </div>
            <div className="sidebar-link cursor-default opacity-50">
              <Settings className="w-[18px] h-[18px] text-[--text-sub-600]" />
              <span>Settings</span>
            </div>
          </div>
        </div>

        {/* Version Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-[--stroke-soft-200]">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #5472b8, #a0b0d6)",
                boxShadow: "0 1px 4px rgba(84, 114, 184, 0.2)",
              }}
            >
              <span className="text-[11px] font-bold text-white">E</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-label-sm font-inter text-[--strong-950] truncate">
                EconGrader Pro
              </div>
              <div className="text-p-xs text-[--text-soft-400]">v2.0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-[--overlay] backdrop-blur-sm transition-all hidden max-lg:block",
          visible
            ? "visible opacity-100"
            : "invisible opacity-0"
        )}
        onClick={onClose}
      />
    </>
  );
}
