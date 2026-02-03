"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <div className="relative">
        {label && (
          <label className="block text-[11px] font-medium tracking-wider uppercase text-stone-500 mb-2.5">
            {label}
          </label>
        )}
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            animate={{
              boxShadow: isFocused
                ? "0 0 0 3px rgba(120, 113, 108, 0.1)"
                : "0 0 0 0px rgba(120, 113, 108, 0)",
            }}
            transition={{ duration: 0.2 }}
          />
          <textarea
            className={cn(
              "flex min-h-[180px] w-full rounded-xl border border-stone-200 bg-white/80 backdrop-blur-sm",
              "px-4 py-4 text-sm text-stone-900 placeholder:text-stone-400",
              "transition-colors duration-200",
              "focus:outline-none focus:border-stone-400",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "resize-y",
              className
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
        </div>
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
