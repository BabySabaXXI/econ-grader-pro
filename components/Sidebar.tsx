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
import { motion, AnimatePresence } from "framer-motion";

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
    subtitle: "AI-powered feedback",
    icon: Pen,
  },
  {
    mode: "planner" as const,
    title: "Essay Planner",
    subtitle: "Structure & strategy",
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
      {/* Sidebar Panel */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 flex flex-col z-30",
          "transition-transform duration-500 ease-natural",
          "max-lg:z-40",
          visible
            ? "max-lg:translate-x-0"
            : "max-lg:-translate-x-full"
        )}
        style={{
          width: "17rem",
          background: "white",
          borderRight: "1px solid var(--n-3)",
        }}
      >
        {/* Scrollable Content */}
        <div className="grow overflow-auto scrollbar-none px-5 pt-7 pb-5">
          {/* Brand */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center w-9 h-9"
                style={{
                  borderRadius: "0.5rem",
                  background: "var(--primary-1)",
                }}
              >
                <GraduationCap className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <div className="text-base1 font-inter text-n-7 tracking-tight">
                  EconGrader
                </div>
                <div className="text-caption2 text-n-4 tracking-normal">
                  Edexcel IAL
                </div>
              </div>
            </div>
            <button
              className="hidden max-lg:flex items-center justify-center w-8 h-8 rounded-md hover:bg-n-2 transition-colors duration-200"
              onClick={onClose}
            >
              <X className="w-4 h-4 text-n-4" />
            </button>
          </div>

          {/* Exam Spec Badge */}
          <div
            className="mb-7 px-3.5 py-3"
            style={{
              borderRadius: "0.5rem",
              background: "var(--n-2)",
              border: "1px solid var(--n-3)",
            }}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--success-base)" }}
              />
              <span className="text-caption2 text-n-5 uppercase tracking-wider font-inter">
                Pearson Edexcel IAL
              </span>
            </div>
            <div className="text-caption2 text-n-4">
              AS & A Level Economics
            </div>
          </div>

          {/* Section Label */}
          <div className="mb-2.5 px-3.5 text-caption2 text-n-4 uppercase tracking-widest font-inter">
            Tools
          </div>

          {/* Navigation */}
          <div className="space-y-1 mb-8">
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
                    "menu-item-jp group relative w-full",
                    isActive && "menu-item-jp-active"
                  )}
                >
                  {/* Active indicator line */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                      style={{ background: "var(--primary-1)" }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <div
                    className="flex items-center justify-center w-8 h-8 flex-shrink-0 transition-colors duration-200"
                    style={{
                      borderRadius: "0.375rem",
                      background: isActive ? "rgba(48, 93, 147, 0.08)" : "transparent",
                    }}
                  >
                    <Icon
                      className="w-4 h-4 transition-colors duration-200"
                      style={{
                        color: isActive ? "var(--primary-1)" : "var(--n-4)",
                      }}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <span
                      className="text-base2 font-inter block transition-colors duration-200"
                      style={{
                        color: isActive ? "var(--n-7)" : "var(--n-4)",
                      }}
                    >
                      {item.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Resources Section */}
          <div className="mb-2.5 px-3.5 text-caption2 text-n-4 uppercase tracking-widest font-inter">
            Resources
          </div>

          <div className="space-y-0.5 mb-8">
            <div
              className="flex items-center gap-3.5 w-full px-3.5 text-sm text-n-4 opacity-40"
              style={{ height: "2.75rem", borderRadius: "0.5rem" }}
            >
              <BookOpen className="w-4 h-4" />
              <span className="flex-1 text-left text-base2 font-inter">
                Study Guide
              </span>
              <span
                className="text-2xs font-medium text-n-4 px-1.5 py-0.5"
                style={{
                  background: "var(--n-2)",
                  borderRadius: "0.25rem",
                  border: "1px solid var(--n-3)",
                }}
              >
                Soon
              </span>
            </div>
          </div>

          {/* AI Card */}
          <div
            className="p-4"
            style={{
              borderRadius: "0.5rem",
              background: "var(--n-7)",
            }}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <Zap className="w-3.5 h-3.5" style={{ color: "var(--primary-2)" }} />
              <span className="text-caption1 font-inter" style={{ color: "rgba(255,255,255,0.75)" }}>
                Powered by Claude AI
              </span>
            </div>
            <p className="text-caption2 leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
              Aligned with official Edexcel mark schemes and level descriptors.
            </p>
          </div>

          {/* Bottom Actions */}
          <div className="mt-6 space-y-0.5">
            <div
              className="flex items-center gap-3 w-full px-3.5 text-n-4 opacity-40 cursor-default"
              style={{ height: "2.5rem", borderRadius: "0.5rem", fontSize: "0.875rem" }}
            >
              <CircleHelp className="w-4 h-4" />
              <span className="text-base2 font-inter">Help</span>
            </div>
            <div
              className="flex items-center gap-3 w-full px-3.5 text-n-4 opacity-40 cursor-default"
              style={{ height: "2.5rem", borderRadius: "0.5rem", fontSize: "0.875rem" }}
            >
              <Settings className="w-4 h-4" />
              <span className="text-base2 font-inter">Settings</span>
            </div>
          </div>
        </div>

        {/* Version Footer */}
        <div
          className="shrink-0 px-5 py-3.5"
          style={{ borderTop: "1px solid var(--n-3)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 flex items-center justify-center flex-shrink-0"
              style={{
                borderRadius: "0.375rem",
                background: "rgba(48, 93, 147, 0.08)",
                border: "1px solid var(--n-3)",
              }}
            >
              <span className="text-2xs font-semibold" style={{ color: "var(--primary-1)" }}>E</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-caption1 font-inter text-n-5 truncate">
                EconGrader Pro
              </div>
              <div className="text-2xs text-n-4">v2.0</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-30 hidden max-lg:block"
            style={{ background: "var(--overlay)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>
    </>
  );
}
