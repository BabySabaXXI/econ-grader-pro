"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn(
        "w-14 h-8 rounded-full bg-muted animate-pulse",
        className
      )} />
    )
  }

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative w-14 h-8 rounded-full transition-all duration-300",
        "bg-secondary border border-border/50",
        "hover:border-border focus:outline-none focus:ring-2 focus:ring-ring/20",
        className
      )}
      style={{
        boxShadow: "var(--shadow-inner)"
      }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {/* Track background gradient */}
      <div className={cn(
        "absolute inset-0.5 rounded-full transition-all duration-300",
        isDark
          ? "bg-gradient-to-r from-slate-800 to-slate-700"
          : "bg-gradient-to-r from-sky-100 to-amber-50"
      )} />

      {/* Thumb */}
      <div
        className={cn(
          "absolute top-1 w-6 h-6 rounded-full transition-all duration-300",
          "flex items-center justify-center",
          isDark
            ? "left-7 bg-slate-900 shadow-lg"
            : "left-1 bg-white shadow-md"
        )}
        style={{
          boxShadow: isDark
            ? "0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
            : "0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)"
        }}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-slate-300" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
      </div>
    </button>
  )
}
