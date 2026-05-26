import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "water" | "fertilize";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-leaf-600 text-white hover:bg-leaf-700 active:bg-leaf-800 disabled:bg-leaf-300",
  secondary:
    "bg-stone-200 text-stone-900 hover:bg-stone-300 active:bg-stone-400 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700",
  ghost:
    "bg-transparent text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
  water:
    "bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700",
  fertilize:
    "bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-lg",
  md: "h-11 px-4 text-base rounded-xl",
  lg: "h-14 px-6 text-lg rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...rest}
    />
  );
});
