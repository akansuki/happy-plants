import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-xl border border-stone-300 bg-white px-3 text-base outline-none transition focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/30 dark:border-stone-700 dark:bg-stone-900",
          className
        )}
        {...rest}
      />
    );
  }
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-24 w-full rounded-xl border border-stone-300 bg-white p-3 text-base outline-none transition focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/30 dark:border-stone-700 dark:bg-stone-900",
        className
      )}
      {...rest}
    />
  );
});

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300"
    >
      {children}
    </label>
  );
}
