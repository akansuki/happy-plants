"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export type SortKey = "watered" | "fertilized" | "name" | "added";

const options: { value: SortKey; label: string }[] = [
  { value: "watered", label: "Needs water (oldest first)" },
  { value: "fertilized", label: "Needs fertilizing" },
  { value: "name", label: "Name (A–Z)" },
  { value: "added", label: "Recently added" },
];

export function SortDropdown({ current }: { current: SortKey }) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
      <span>Sort by</span>
      <select
        value={current}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          next.set("sort", e.target.value);
          startTransition(() => router.replace(`/?${next.toString()}`));
        }}
        className="h-9 rounded-lg border border-stone-300 bg-white px-2 text-sm dark:border-stone-700 dark:bg-stone-900"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
