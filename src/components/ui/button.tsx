import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
  {
    variants: {
      variant: {
        // Primary: dark ink panel, paper-colored text
        primary:
          "bg-panel text-paper-on-panel hover:bg-panel-2 active:bg-panel-2",
        // Quiet / outline: hairline border on paper
        outline:
          "border border-hairline bg-transparent text-ink hover:bg-card active:bg-card",
        // Accent: muted teal fill
        accent:
          "bg-accent text-paper-on-panel hover:opacity-90 active:opacity-90",
        // Ghost: no chrome until hover
        ghost: "bg-transparent text-ink hover:bg-card active:bg-card",
        // Link: underline-on-hover, label-ish editorial action
        link: "bg-transparent text-ink underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-none",
        md: "h-10 px-5 rounded-none",
        lg: "h-12 px-7 text-[15px] rounded-none",
        icon: "h-10 w-10 rounded-none",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
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
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
