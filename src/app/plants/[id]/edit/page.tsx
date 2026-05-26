import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { PlantForm } from "@/components/PlantForm";
import { requireHousehold } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Edit plant · Happy Plants" };

export default async function EditPlantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { householdId } = await requireHousehold();
  const plant = await prisma.plant.findFirst({ where: { id, householdId } });
  if (!plant) notFound();

  return (
    <>
      <AppHeader title="Edit plant" back={`/plants/${plant.id}`} />
      <main className="mx-auto max-w-xl px-4 py-5">
        <PlantForm initial={plant} />
      </main>
    </>
  );
}
