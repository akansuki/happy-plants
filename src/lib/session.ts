// Helpers to load the current user + household, redirecting if unauthenticated
// or if (somehow) the user lacks a household.
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");
  return session;
}

export async function requireHousehold() {
  const session = await requireSession();
  if (!session.user.householdId) redirect("/signin?error=NoHousehold");
  return {
    userId: session.user.id,
    householdId: session.user.householdId,
    user: session.user,
  };
}
