import { AppCategory, PlaceLike, Vibe } from "@/types";

export const CATEGORY_LABELS: Record<AppCategory, string> = {
  all: "All",
  attractions: "Attractions",
  hotels: "Hotels",
  restaurants: "Restaurants",
  cafes: "Cafes",
  nightlife: "Nightlife",
};

export function matchesCategory(item: PlaceLike, category: AppCategory): boolean {
  if (category === "all") return true;
  if (category === "hotels") return item.type === "hotel";
  if (category === "attractions") return item.categories.some((c) => ["attraction", "museum", "landmark", "park"].includes(c));
  if (category === "restaurants") return item.categories.includes("restaurant");
  if (category === "cafes") return item.categories.includes("cafe");
  if (category === "nightlife") return item.categories.includes("nightlife");
  return true;
}

export function matchesVibe(item: PlaceLike, vibe: Vibe | "all"): boolean {
  if (vibe === "all") return true;
  if (vibe === "family") return item.categories.some((c) => ["park", "museum", "attraction", "hotel-family"].includes(c));
  if (vibe === "romantic") return item.categories.some((c) => ["romantic", "scenic", "restaurant", "hotel-boutique"].includes(c));
  if (vibe === "nightlife") return item.categories.some((c) => ["nightlife", "bar", "restaurant"].includes(c));
  if (vibe === "culture") return item.categories.some((c) => ["museum", "landmark", "historical", "cultural"].includes(c));
  if (vibe === "relaxed") return item.categories.some((c) => ["park", "scenic", "cafe", "quiet"].includes(c));
  return true;
}
