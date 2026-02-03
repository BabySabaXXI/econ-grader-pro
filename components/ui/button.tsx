"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent)] text-[var(--bg-0)] shadow-md hover:bg-[var(--accent-hover)] active:scale-[0.98]",
        secondary:
          "bg-[var(--bg-200)] text-[var(--text-200)] shadow-sm hover:bg-[var(--bg-300)] border border-[var(--bg-300)]",
        ghost:
          "hover:bg-[var(--bg-200)] text-[var(--text-300)] hover:text-[var(--text-200)]",
        outline:
          "border border-[var(--bg-300)] bg-transparent hover:bg-[var(--bg-200)] text-[var(--text-200)]",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// Animated button wrapper with framer-motion
interface AnimatedButtonProps extends ButtonProps {
  children: React.ReactNode;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant, size, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        whileHover={disabled ? {} : { scale: 1.02, y: -1 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        disabled={disabled}
        {...(props as HTMLMotionProps<"button">)}
      >
        {children}
      </motion.button>
    );
  }
);
AnimatedButton.displayName = "AnimatedButton";

export { Button, AnimatedButton, buttonVariants };
