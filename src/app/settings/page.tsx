import { LogOut, X } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { InviteForm } from "@/components/InviteForm";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { requireHousehold } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { signOut } from "@/auth";
import {
  cancelInvitation,
  removeMember,
  renameHousehold,
} from "@/app/actions/household";

export const metadata = { title: "Settings · Happy Plants" };

export default async function SettingsPage() {
  const { householdId, userId } = await requireHousehold();

  const [household, members, invitations] = await Promise.all([
    prisma.household.findUnique({ where: { id: householdId } }),
    prisma.user.findMany({
      where: { householdId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, image: true },
    }),
    prisma.invitation.findMany({
      where: { householdId, acceptedAt: null },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <>
      <AppHeader title="Settings" back="/" />
      <main className="mx-auto max-w-xl space-y-8 px-4 py-5">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
            Household
          </h2>
          <form action={renameHousehold} className="space-y-2">
            <Label htmlFor="household-name">Name</Label>
            <div className="flex gap-2">
              <Input
                id="household-name"
                name="name"
                defaultValue={household?.name ?? ""}
                maxLength={80}
              />
              <Button type="submit" variant="secondary">
                Save
              </Button>
            </div>
          </form>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
            Members ({members.length})
          </h2>
          <ul className="space-y-2">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {m.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.image} alt="" className="h-9 w-9 rounded-full" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-200 dark:bg-stone-700">
                      {m.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {m.name ?? m.email}
                      {m.id === userId ? (
                        <span className="ml-2 text-xs text-stone-500">(you)</span>
                      ) : null}
                    </div>
                    <div className="truncate text-xs text-stone-500">{m.email}</div>
                  </div>
                </div>
                {m.id !== userId ? (
                  <form
                    action={async () => {
                      "use server";
                      await removeMember(m.id);
                    }}
                  >
                    <button
                      type="submit"
                      aria-label="Remove member"
                      className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-red-600 dark:hover:bg-stone-800"
                    >
                      <X size={16} />
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <InviteForm />
          {invitations.length > 0 ? (
            <div className="mt-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
                Pending invites
              </h3>
              <ul className="space-y-2">
                {invitations.map((inv) => (
                  <li
                    key={inv.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-3 py-2 dark:border-stone-800 dark:bg-stone-900"
                  >
                    <span className="truncate text-sm">{inv.email}</span>
                    <form
                      action={async () => {
                        "use server";
                        await cancelInvitation(inv.id);
                      }}
                    >
                      <button
                        type="submit"
                        aria-label="Cancel invite"
                        className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-red-600 dark:hover:bg-stone-800"
                      >
                        <X size={16} />
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/signin" });
            }}
          >
            <Button type="submit" variant="secondary" className="w-full">
              <LogOut size={16} />
              Sign out
            </Button>
          </form>
        </section>
      </main>
    </>
  );
}
