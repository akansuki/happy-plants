"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { createPlant, updatePlant, type ActionResult } from "@/app/actions/plants";

type Initial = {
  id?: string;
  name?: string;
  species?: string | null;
  description?: string | null;
  photoUrl?: string | null;
};

export function PlantForm({ initial }: { initial?: Initial }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [photoPreview, setPhotoPreview] = useState<string | null>(initial?.photoUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result: ActionResult | void = initial?.id
        ? await updatePlant(initial.id, formData)
        : await createPlant(formData);
      // Server actions that redirect throw NEXT_REDIRECT internally; only failures return here.
      if (result && !result.ok) setError(result.error);
    });
  }

  return (
    <form action={onSubmit} className="space-y-5">
      <div>
        <Label>Photo</Label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative block h-48 w-full overflow-hidden rounded-2xl border-2 border-dashed border-stone-300 bg-stone-100 transition hover:border-leaf-500 dark:border-stone-700 dark:bg-stone-900"
        >
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoPreview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full flex-col items-center justify-center gap-2 text-stone-500">
              <Camera size={28} />
              <span className="text-sm">Tap to choose a photo</span>
            </span>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          name="photo"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          className="hidden"
        />
      </div>

      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={120}
          defaultValue={initial?.name ?? ""}
          placeholder="Monstera in the corner"
        />
      </div>

      <div>
        <Label htmlFor="species">Species</Label>
        <Input
          id="species"
          name="species"
          maxLength={120}
          defaultValue={initial?.species ?? ""}
          placeholder="Monstera deliciosa"
        />
      </div>

      <div>
        <Label htmlFor="description">Description / notes</Label>
        <Textarea
          id="description"
          name="description"
          maxLength={2000}
          defaultValue={initial?.description ?? ""}
          placeholder="Loves bright indirect light. Water every ~7 days."
        />
      </div>

      {error ? (
        <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? "Saving…" : initial?.id ? "Save changes" : "Add plant"}
        </Button>
        <Link
          href={initial?.id ? `/plants/${initial.id}` : "/"}
          className="inline-flex h-11 items-center justify-center rounded-xl px-4 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          Cancel
        </Link>
      </div>

      <noscript>
        <p className="text-xs text-stone-500">JavaScript is required for photo previews.</p>
      </noscript>
    </form>
  );
}
