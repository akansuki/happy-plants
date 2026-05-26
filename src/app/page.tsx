import Link from "next/link";
import { Plus } from "lucide-react";
import { requireHousehold } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import { PlantCard } from "@/components/PlantCard";
import { SortDropdown, type SortKey } from "@/components/SortDropdown";

type SearchParams = Promise<{ sort?: string }>;

const VALID_SORTS: SortKey[] = ["watered", "fertilized", "name", "added"];

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const { householdId } = await requireHousehold();
  const sp = await searchParams;
  const sort: SortKey = (VALID_SORTS as string[]).includes(sp.sort ?? "")
    ? (sp.sort as SortKey)
    : "watered";

  const plants = await prisma.plant.findMany({
    where: { householdId },
    include: {
      careEvents: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  const decorated = plants.map((p) => {
    const lastWater = p.careEvents.find((e) => e.type === "WATER");
    const lastFert = p.careEvents.find((e) => e.type === "FERTILIZE");
    return {
      id: p.id,
      name: p.name,
      species: p.species,
      photoUrl: p.photoUrl,
      createdAt: p.createdAt,
      lastWateredAt: lastWater?.createdAt ?? null,
      lastFertilizedAt: lastFert?.createdAt ?? null,
    };
  });

  // Sort. "Needs water" = nulls (never watered) first, then oldest watering first.
  decorated.sort((a, b) => {
    switch (sort) {
      case "name":
        return a.name.localeCompare(b.name);
      case "added":
        return b.createdAt.getTime() - a.createdAt.getTime();
      case "fertilized": {
        const av = a.lastFertilizedAt?.getTime() ?? 0;
        const bv = b.lastFertilizedAt?.getTime() ?? 0;
        return av - bv;
      }
      case "watered":
      default: {
        const av = a.lastWateredAt?.getTime() ?? 0;
        const bv = b.lastWateredAt?.getTime() ?? 0;
        return av - bv;
      }
    }
  });

  return (
    <>
      <AppHeader title="Happy Plants" />
      <main className="mx-auto max-w-3xl px-4 pt-4 pb-28">
        <div className="mb-4 flex items-center justify-between gap-3">
          <SortDropdown current={sort} />
          <span className="text-sm text-stone-500">{plants.length} plant{plants.length === 1 ? "" : "s"}</span>
        </div>

        {decorated.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {decorated.map((p) => (
              <li key={p.id}>
                <PlantCard {...p} />
              </li>
            ))}
          </ul>
        )}
      </main>

      <Link
        href="/plants/new"
        className="fixed right-5 bottom-5 z-20 inline-flex h-14 w-14 items-center justify-center rounded-full bg-leaf-600 text-white shadow-lg shadow-leaf-600/30 transition active:scale-95 hover:bg-leaf-700"
        aria-label="Add plant"
      >
        <Plus size={26} />
      </Link>
    </>
  );
}

function EmptyState() {
  return (
    <div className="mt-12 rounded-2xl border border-dashed border-stone-300 p-10 text-center dark:border-stone-700">
      <div className="text-5xl" aria-hidden>🪴</div>
      <h2 className="mt-3 text-lg font-semibold">No plants yet</h2>
      <p className="mt-1 text-sm text-stone-500">
        Tap the + button to add your first plant.
      </p>
    </div>
  );
}
