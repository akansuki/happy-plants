import Link from "next/link";
import { Settings } from "lucide-react";

export function AppHeader({ title, back }: { title: string; back?: string }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200/70 bg-stone-50/85 px-4 py-3 backdrop-blur dark:border-stone-800/70 dark:bg-stone-950/85">
      <div className="flex items-center gap-3">
        {back ? (
          <Link
            href={back}
            className="rounded-lg px-2 py-1 text-stone-600 hover:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-800"
            aria-label="Back"
          >
            ←
          </Link>
        ) : (
          <span className="text-2xl" aria-hidden>
            🪴
          </span>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <Link
        href="/settings"
        className="rounded-lg p-2 text-stone-600 hover:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-800"
        aria-label="Settings"
      >
        <Settings size={20} />
      </Link>
    </header>
  );
}
