import { z } from "zod";

export type LocationPermissionState =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "error"
  | "unsupported";

export type AppCategory =
  | "all"
  | "attractions"
  | "hotels"
  | "restaurants"
  | "cafes"
  | "nightlife";

export type SortOption =
  | "best_match"
  | "closest"
  | "highest_rated"
  | "most_popular"
  | "most_crowded"
  | "cheapest";

export type Vibe = "family" | "romantic" | "nightlife" | "culture" | "relaxed";

export type DiscoveryMode = "popular_nearby" | "crowded_now" | "quiet_gems";

export type RadiusKm = 1 | 3 | 5 | 10 | 25;

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Place {
  id: string;
  type: "place";
  name: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  country: string;
  rating: number;
  reviewCount: number;
  priceLevel: 1 | 2 | 3 | 4;
  categories: string[];
  description: string;
  image: string;
  source: string;
  popularityScore: number;
  crowdedScore: number;
  distanceKm: number;
}

export interface Hotel {
  id: string;
  type: "hotel";
  name: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  country: string;
  rating: number;
  reviewCount: number;
  priceLevel: 1 | 2 | 3 | 4;
  categories: string[];
  description: string;
  image: string;
  source: string;
  popularityScore: number;
  crowdedScore: number;
  distanceKm: number;
}

export type PlaceLike = Place | Hotel;

export interface Recommendation {
  item: PlaceLike;
  reason: string;
  score: number;
  mode: DiscoveryMode;
}

export interface Filters {
  radiusKm: RadiusKm;
  category: AppCategory;
  sort: SortOption;
  vibe: Vibe | "all";
}

export interface Favorite {
  id: string;
  type: PlaceLike["type"];
  addedAt: number;
}

export const FiltersSchema = z.object({
  radiusKm: z.union([z.literal(1), z.literal(3), z.literal(5), z.literal(10), z.literal(25)]),
  category: z.enum(["all", "attractions", "hotels", "restaurants", "cafes", "nightlife"]),
  sort: z.enum([
    "best_match",
    "closest",
    "highest_rated",
    "most_popular",
    "most_crowded",
    "cheapest",
  ]),
  vibe: z.enum(["all", "family", "romantic", "nightlife", "culture", "relaxed"]),
});
