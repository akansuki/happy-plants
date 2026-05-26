"use client";

import { useTransition } from "react";
import { Droplets, Sprout } from "lucide-react";
import { logCare } from "@/app/actions/plants";
import { Button } from "@/components/ui/Button";

export function QuickCareButtons({
  plantId,
  size = "md",
  compact = false,
}: {
  plantId: string;
  size?: "md" | "lg";
  compact?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function fire(type: "WATER" | "FERTILIZE") {
    startTransition(async () => {
      await logCare(plantId, type);
    });
  }

  return (
    <div className={compact ? "flex gap-2" : "grid grid-cols-2 gap-3"}>
      <Button
        variant="water"
        size={size}
        disabled={isPending}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          fire("WATER");
        }}
        aria-label="Log watering"
      >
        <Droplets size={size === "lg" ? 22 : 18} />
        {!compact && <span>Water</span>}
      </Button>
      <Button
        variant="fertilize"
        size={size}
        disabled={isPending}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          fire("FERTILIZE");
        }}
        aria-label="Log fertilizing"
      >
        <Sprout size={size === "lg" ? 22 : 18} />
        {!compact && <span>Fertilize</span>}
      </Button>
    </div>
  );
}
