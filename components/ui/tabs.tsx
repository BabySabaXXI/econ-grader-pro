"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-full bg-stone-100 p-1 text-stone-500",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-all",
      "hover:text-stone-900",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// Animated Pill Tabs with morphing indicator
interface PillTabItem {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

interface AnimatedPillTabsProps {
  items: PillTabItem[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

function AnimatedPillTabs({
  items,
  value,
  onValueChange,
  className,
}: AnimatedPillTabsProps) {
  const [indicator, setIndicator] = React.useState<{
    left: number;
    width: number;
  } | null>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const triggerRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  const measure = React.useCallback(() => {
    const list = listRef.current;
    const activeEl = triggerRefs.current[value];
    if (!list || !activeEl) {
      setIndicator(null);
      return;
    }
    const listRect = list.getBoundingClientRect();
    const tRect = activeEl.getBoundingClientRect();
    setIndicator({
      left: tRect.left - listRect.left,
      width: tRect.width,
    });
  }, [value]);

  React.useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  return (
    <div
      ref={listRef}
      className={cn(
        "relative inline-flex items-center gap-1 p-1.5 rounded-full",
        "bg-stone-100/80 backdrop-blur-sm border border-stone-200/50",
        className
      )}
    >
      {/* Animated pill indicator */}
      {indicator && (
        <motion.div
          layout
          initial={false}
          animate={{
            left: indicator.left,
            width: indicator.width,
          }}
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 30,
          }}
          className="absolute top-1.5 bottom-1.5 rounded-full bg-white shadow-sm"
          style={{
            left: indicator.left,
            width: indicator.width,
          }}
        />
      )}

      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <button
            key={item.value}
            ref={(el) => {
              triggerRefs.current[item.value] = el;
            }}
            onClick={() => onValueChange(item.value)}
            className={cn(
              "relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors",
              isActive ? "text-stone-900" : "text-stone-500 hover:text-stone-700"
            )}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, AnimatedPillTabs };
export type { PillTabItem };
