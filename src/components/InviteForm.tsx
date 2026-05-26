"use client";

import { useState, useTransition } from "react";
import { Mail } from "lucide-react";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { inviteByEmail, type InviteResult } from "@/app/actions/household";

const messages: Record<Extract<InviteResult, { ok: true }>["status"], string> = {
  invited: "Invited! They'll join automatically the next time they sign in with Google.",
  "joined-existing-user": "Added to your household.",
  "already-member": "That person is already a member.",
  "already-invited": "An invite for that email is already pending.",
};

export function InviteForm() {
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setFeedback(null);
    startTransition(async () => {
      const result = await inviteByEmail(formData);
      if (result.ok) {
        setFeedback({ kind: "ok", text: messages[result.status] });
      } else {
        setFeedback({ kind: "err", text: result.error });
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <Label htmlFor="invite-email">Invite by email</Label>
      <div className="flex gap-2">
        <Input
          id="invite-email"
          name="email"
          type="email"
          required
          placeholder="partner@gmail.com"
        />
        <Button type="submit" disabled={isPending}>
          <Mail size={16} />
          Invite
        </Button>
      </div>
      {feedback ? (
        <p
          className={
            feedback.kind === "ok"
              ? "rounded-lg bg-leaf-100 px-3 py-2 text-sm text-leaf-800 dark:bg-leaf-900/40 dark:text-leaf-200"
              : "rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300"
          }
        >
          {feedback.text}
        </p>
      ) : null}
      <p className="text-xs text-stone-500">
        Whoever signs in with this Gmail will share your plants. No email is sent — just give them
        the app URL.
      </p>
    </form>
  );
}
