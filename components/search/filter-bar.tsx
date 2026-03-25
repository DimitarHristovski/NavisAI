"use client";

import { AppCategory, SortOption, Vibe } from "@/types";
import { RadiusSelector } from "@/components/discovery/radius-selector";
import { useAppStore } from "@/store/useAppStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORY_LABELS } from "@/lib/utils/categories";

export function FilterBar() {
  const { filters, setRadiusKm, setCategory, setSort, setVibe } = useAppStore();

  const categories: AppCategory[] = ["all", "attractions", "hotels", "restaurants", "cafes", "nightlife"];
  const sorts: { value: SortOption; label: string }[] = [
    { value: "best_match", label: "Best match" },
    { value: "closest", label: "Closest" },
    { value: "highest_rated", label: "Highest rated" },
    { value: "most_popular", label: "Most popular" },
    { value: "most_crowded", label: "Most crowded" },
    { value: "cheapest", label: "Cheapest" },
  ];

  const vibes: (Vibe | "all")[] = ["all", "family", "romantic", "nightlife", "culture", "relaxed"];

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div>
        <p className="mb-2 text-sm font-medium">Radius</p>
        <RadiusSelector value={filters.radiusKm} onChange={setRadiusKm} />
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <Select value={filters.category} onValueChange={(v) => setCategory(v as AppCategory)}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.sort} onValueChange={(v) => setSort(v as SortOption)}>
          <SelectTrigger>
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {sorts.map((sort) => (
              <SelectItem key={sort.value} value={sort.value}>
                {sort.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.vibe} onValueChange={(v) => setVibe(v as Vibe | "all")}>
          <SelectTrigger>
            <SelectValue placeholder="Vibe" />
          </SelectTrigger>
          <SelectContent>
            {vibes.map((v) => (
              <SelectItem key={v} value={v}>
                {v === "all" ? "All vibes" : v[0].toUpperCase() + v.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
