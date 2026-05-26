"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { requireHousehold } from "@/lib/session";

const plantSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  species: z.string().trim().max(120).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});

async function maybeUploadPhoto(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Photo upload not configured. Set BLOB_READ_WRITE_TOKEN in your environment."
    );
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const blob = await put(`plants/${Date.now()}-${safeName}`, file, {
    access: "public",
    addRandomSuffix: true,
  });
  return blob.url;
}

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createPlant(formData: FormData): Promise<ActionResult> {
  const { householdId } = await requireHousehold();
  const parsed = plantSchema.safeParse({
    name: formData.get("name"),
    species: formData.get("species") ?? "",
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const photo = formData.get("photo") as File | null;
  let photoUrl: string | null = null;
  try {
    photoUrl = await maybeUploadPhoto(photo);
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  const plant = await prisma.plant.create({
    data: {
      householdId,
      name: parsed.data.name,
      species: parsed.data.species || null,
      description: parsed.data.description || null,
      photoUrl,
    },
  });

  revalidatePath("/");
  redirect(`/plants/${plant.id}`);
}

export async function updatePlant(plantId: string, formData: FormData): Promise<ActionResult> {
  const { householdId } = await requireHousehold();
  const existing = await prisma.plant.findFirst({
    where: { id: plantId, householdId },
  });
  if (!existing) return { ok: false, error: "Plant not found" };

  const parsed = plantSchema.safeParse({
    name: formData.get("name"),
    species: formData.get("species") ?? "",
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const photo = formData.get("photo") as File | null;
  let newPhotoUrl: string | null = null;
  try {
    newPhotoUrl = await maybeUploadPhoto(photo);
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  // If a new photo was uploaded, try to delete the old one (best-effort).
  if (newPhotoUrl && existing.photoUrl) {
    try {
      await del(existing.photoUrl);
    } catch {
      // ignore — orphaned blobs are not fatal
    }
  }

  await prisma.plant.update({
    where: { id: plantId },
    data: {
      name: parsed.data.name,
      species: parsed.data.species || null,
      description: parsed.data.description || null,
      ...(newPhotoUrl ? { photoUrl: newPhotoUrl } : {}),
    },
  });

  revalidatePath("/");
  revalidatePath(`/plants/${plantId}`);
  redirect(`/plants/${plantId}`);
}

export async function deletePlant(plantId: string): Promise<void> {
  const { householdId } = await requireHousehold();
  const existing = await prisma.plant.findFirst({
    where: { id: plantId, householdId },
  });
  if (!existing) return;

  if (existing.photoUrl) {
    try {
      await del(existing.photoUrl);
    } catch {
      // ignore
    }
  }

  // CareEvents cascade-delete via the schema relation.
  await prisma.plant.delete({ where: { id: plantId } });
  revalidatePath("/");
  redirect("/");
}

/** Record a watering or fertilizing for a plant. Called from the quick-action buttons. */
export async function logCare(
  plantId: string,
  type: "WATER" | "FERTILIZE",
  notes?: string
): Promise<ActionResult> {
  const { householdId, userId } = await requireHousehold();
  const plant = await prisma.plant.findFirst({
    where: { id: plantId, householdId },
    select: { id: true },
  });
  if (!plant) return { ok: false, error: "Plant not found" };

  await prisma.careEvent.create({
    data: { plantId, userId, type, notes: notes?.trim() || null },
  });

  revalidatePath("/");
  revalidatePath(`/plants/${plantId}`);
  return { ok: true };
}

/** Undo the most recent care event of a given type for a plant. */
export async function undoLastCare(
  plantId: string,
  type: "WATER" | "FERTILIZE"
): Promise<ActionResult> {
  const { householdId } = await requireHousehold();
  const plant = await prisma.plant.findFirst({
    where: { id: plantId, householdId },
    select: { id: true },
  });
  if (!plant) return { ok: false, error: "Plant not found" };

  const last = await prisma.careEvent.findFirst({
    where: { plantId, type },
    orderBy: { createdAt: "desc" },
  });
  if (!last) return { ok: false, error: "No event to undo" };

  await prisma.careEvent.delete({ where: { id: last.id } });
  revalidatePath("/");
  revalidatePath(`/plants/${plantId}`);
  return { ok: true };
}

export async function deleteCareEvent(eventId: string, plantId: string): Promise<ActionResult> {
  const { householdId } = await requireHousehold();
  const ev = await prisma.careEvent.findFirst({
    where: { id: eventId, plant: { householdId } },
  });
  if (!ev) return { ok: false, error: "Event not found" };
  await prisma.careEvent.delete({ where: { id: eventId } });
  revalidatePath(`/plants/${plantId}`);
  return { ok: true };
}
