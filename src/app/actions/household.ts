"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireHousehold } from "@/lib/session";

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address");

export type InviteResult =
  | { ok: true; status: "invited" | "joined-existing-user" | "already-member" | "already-invited" }
  | { ok: false; error: string };

/**
 * Whitelist invite flow:
 *   - If the email already belongs to a user, we just move them into this household (no email sent).
 *   - Otherwise we create a pending Invitation; the next Google sign-in for that email auto-joins.
 */
export async function inviteByEmail(formData: FormData): Promise<InviteResult> {
  const { householdId } = await requireHousehold();

  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid email" };
  }
  const email = parsed.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, householdId: true },
  });

  if (existingUser) {
    if (existingUser.householdId === householdId) {
      return { ok: true, status: "already-member" };
    }
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { householdId },
    });
    revalidatePath("/settings");
    return { ok: true, status: "joined-existing-user" };
  }

  const existingInvite = await prisma.invitation.findUnique({
    where: { email_householdId: { email, householdId } },
  });
  if (existingInvite && !existingInvite.acceptedAt) {
    return { ok: true, status: "already-invited" };
  }

  await prisma.invitation.upsert({
    where: { email_householdId: { email, householdId } },
    create: { email, householdId },
    update: { acceptedAt: null, createdAt: new Date() },
  });

  revalidatePath("/settings");
  return { ok: true, status: "invited" };
}

export async function cancelInvitation(invitationId: string): Promise<void> {
  const { householdId } = await requireHousehold();
  await prisma.invitation.deleteMany({
    where: { id: invitationId, householdId, acceptedAt: null },
  });
  revalidatePath("/settings");
}

export async function removeMember(userId: string): Promise<void> {
  const { householdId, userId: me } = await requireHousehold();
  if (userId === me) return; // cannot remove yourself this way
  await prisma.user.updateMany({
    where: { id: userId, householdId },
    data: { householdId: null },
  });
  revalidatePath("/settings");
}

export async function renameHousehold(formData: FormData): Promise<void> {
  const { householdId } = await requireHousehold();
  const name = (formData.get("name") as string | null)?.trim();
  if (!name) return;
  await prisma.household.update({ where: { id: householdId }, data: { name } });
  revalidatePath("/settings");
}
