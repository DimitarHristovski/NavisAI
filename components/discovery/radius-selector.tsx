"use client";

import { RadiusKm } from "@/types";
import { Button } from "@/components/ui/button";

const OPTIONS: RadiusKm[] = [1, 3, 5, 10, 25];

interface Props {
  value: RadiusKm;
  onChange: (value: RadiusKm) => void;
}

export function RadiusSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((radius) => (
        <Button
          key={radius}
          size="sm"
          variant={value === radius ? "default" : "outline"}
          onClick={() => onChange(radius)}
        >
          {radius} km
        </Button>
      ))}
    </div>
  );
}
