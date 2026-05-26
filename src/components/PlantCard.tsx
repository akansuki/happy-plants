import Link from "next/link";
import { Droplets, Sprout } from "lucide-react";
import { relativeShort, daysSince, cn } from "@/lib/utils";
import { QuickCareButtons } from "@/components/QuickCareButtons";

type PlantCardProps = {
  id: string;
  name: string;
  species: string | null;
  photoUrl: string | null;
  lastWateredAt: Date | null;
  lastFertilizedAt: Date | null;
};

function staleness(d: Date | null, thresholdDays: number): string {
  const days = daysSince(d);
  if (days === null) return "text-stone-500";
  if (days >= thresholdDays) return "text-amber-600 dark:text-amber-400";
  return "text-stone-600 dark:text-stone-400";
}

export function PlantCard(p: PlantCardProps) {
  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm transition hover:shadow-md dark:border-stone-800 dark:bg-stone-900">
      <Link href={`/plants/${p.id}`} className="flex gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800">
          {p.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.photoUrl}
              alt={p.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl" aria-hidden>
              🪴
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-semibold">{p.name}</div>
          {p.species ? (
            <div className="truncate text-xs text-stone-500">{p.species}</div>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
            <span className={cn("inline-flex items-center gap-1", staleness(p.lastWateredAt, 7))}>
              <Droplets size={14} /> {relativeShort(p.lastWateredAt)}
            </span>
            <span className={cn("inline-flex items-center gap-1", staleness(p.lastFertilizedAt, 30))}>
              <Sprout size={14} /> {relativeShort(p.lastFertilizedAt)}
            </span>
          </div>
        </div>
      </Link>
      <QuickCareButtons plantId={p.id} size="md" />
    </div>
  );
}
