import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Droplets, Sprout } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { QuickCareButtons } from "@/components/QuickCareButtons";
import { DeletePlantButton } from "@/components/DeletePlantButton";
import { CareHistoryItem } from "@/components/CareHistoryItem";
import { requireHousehold } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { relativeShort } from "@/lib/utils";

export default async function PlantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { householdId } = await requireHousehold();
  const plant = await prisma.plant.findFirst({
    where: { id, householdId },
    include: {
      careEvents: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });
  if (!plant) notFound();

  const lastWater = plant.careEvents.find((e) => e.type === "WATER");
  const lastFert = plant.careEvents.find((e) => e.type === "FERTILIZE");

  return (
    <>
      <AppHeader title={plant.name} back="/" />
      <main className="mx-auto max-w-2xl px-4 pb-12">
        <div className="-mx-4 aspect-[4/3] w-[calc(100%+2rem)] overflow-hidden bg-stone-100 dark:bg-stone-900 sm:mx-0 sm:aspect-[16/9] sm:w-full sm:rounded-2xl">
          {plant.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={plant.photoUrl} alt={plant.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-7xl" aria-hidden>
              🪴
            </div>
          )}
        </div>

        <section className="mt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">{plant.name}</h2>
              {plant.species ? (
                <p className="text-sm text-stone-500">{plant.species}</p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Link
                href={`/plants/${plant.id}/edit`}
                className="inline-flex h-9 items-center gap-1 rounded-lg bg-stone-200 px-3 text-sm hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700"
              >
                <Pencil size={14} /> Edit
              </Link>
              <DeletePlantButton plantId={plant.id} plantName={plant.name} />
            </div>
          </div>

          {plant.description ? (
            <p className="mt-3 whitespace-pre-line text-stone-700 dark:text-stone-300">
              {plant.description}
            </p>
          ) : null}
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3">
          <StatPill
            icon={<Droplets size={18} />}
            label="Last watered"
            value={relativeShort(lastWater?.createdAt)}
            tone="water"
          />
          <StatPill
            icon={<Sprout size={18} />}
            label="Last fertilized"
            value={relativeShort(lastFert?.createdAt)}
            tone="fertilize"
          />
        </section>

        <section className="mt-6">
          <QuickCareButtons plantId={plant.id} size="lg" />
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Care history
            </h3>
            <span className="text-xs text-stone-400">last 60 days</span>
          </div>
          {plant.careEvents.length === 0 ? (
            <p className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500 dark:border-stone-700">
              No care events yet. Tap Water or Fertilize above.
            </p>
          ) : (
            <ul className="space-y-2">
              {plant.careEvents.map((e) => (
                <CareHistoryItem
                  key={e.id}
                  eventId={e.id}
                  plantId={plant.id}
                  type={e.type}
                  createdAt={e.createdAt}
                  byName={e.user?.name ?? e.user?.email ?? null}
                />
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}

function StatPill({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "water" | "fertilize";
}) {
  const toneClass =
    tone === "water"
      ? "bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-200"
      : "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200";
  return (
    <div className={`rounded-2xl p-3 ${toneClass}`}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide opacity-80">
        {icon} {label}
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
