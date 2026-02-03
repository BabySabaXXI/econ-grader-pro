"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, children, ...props }, ref) => {
    return (
      <div className="relative">
        {label && (
          <label className="block text-[11px] font-medium tracking-wider uppercase text-stone-500 mb-2.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              "flex h-11 w-full appearance-none rounded-xl border border-stone-200 bg-white/80 backdrop-blur-sm",
              "px-4 pr-10 text-sm text-stone-900",
              "transition-colors duration-200",
              "focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "cursor-pointer",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
