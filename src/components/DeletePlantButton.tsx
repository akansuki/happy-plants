"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { deletePlant } from "@/app/actions/plants";

export function DeletePlantButton({ plantId, plantName }: { plantId: string; plantName: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      variant="danger"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (!confirm(`Delete "${plantName}"? This cannot be undone.`)) return;
        startTransition(() => deletePlant(plantId));
      }}
    >
      <Trash2 size={16} />
      Delete
    </Button>
  );
}
