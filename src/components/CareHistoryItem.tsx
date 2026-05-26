"use client";

import { useTransition } from "react";
import { Droplets, Sprout, X } from "lucide-react";
import { deleteCareEvent } from "@/app/actions/plants";
import { relativeShort } from "@/lib/utils";

export function CareHistoryItem({
  eventId,
  plantId,
  type,
  createdAt,
  byName,
}: {
  eventId: string;
  plantId: string;
  type: "WATER" | "FERTILIZE";
  createdAt: Date;
  byName: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const Icon = type === "WATER" ? Droplets : Sprout;
  const color =
    type === "WATER" ? "text-sky-600 dark:text-sky-400" : "text-amber-600 dark:text-amber-400";

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-3 py-2 dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-center gap-3">
        <span className={color}>
          <Icon size={18} />
        </span>
        <div>
          <div className="text-sm font-medium">
            {type === "WATER" ? "Watered" : "Fertilized"}{" "}
            <span className="font-normal text-stone-500">· {relativeShort(createdAt)}</span>
          </div>
          {byName ? (
            <div className="text-xs text-stone-500">by {byName}</div>
          ) : null}
        </div>
      </div>
      <button
        type="button"
        aria-label="Remove event"
        disabled={isPending}
        onClick={() => {
          if (!confirm("Remove this event?")) return;
          startTransition(() => {
            void deleteCareEvent(eventId, plantId);
          });
        }}
        className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
      >
        <X size={16} />
      </button>
    </li>
  );
}
