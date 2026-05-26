import { AppHeader } from "@/components/AppHeader";
import { PlantForm } from "@/components/PlantForm";
import { requireHousehold } from "@/lib/session";

export const metadata = { title: "Add plant · Happy Plants" };

export default async function NewPlantPage() {
  await requireHousehold();
  return (
    <>
      <AppHeader title="Add plant" back="/" />
      <main className="mx-auto max-w-xl px-4 py-5">
        <PlantForm />
      </main>
    </>
  );
}
