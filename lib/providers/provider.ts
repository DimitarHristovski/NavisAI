import { AppCategory, Coordinates, Hotel, Place, PlaceLike, RadiusKm } from "@/types";

export interface PlacesProvider {
  searchNearbyPlaces: (
    lat: number,
    lng: number,
    radiusKm: RadiusKm,
    category: AppCategory
  ) => Promise<PlaceLike[]>;
  getRecommendedHotels: (lat: number, lng: number, radiusKm: RadiusKm) => Promise<Hotel[]>;
  getPopularPlaces: (lat: number, lng: number, radiusKm: RadiusKm) => Promise<PlaceLike[]>;
  getCrowdedPlaces: (lat: number, lng: number, radiusKm: RadiusKm) => Promise<PlaceLike[]>;
  getQuietPlaces: (lat: number, lng: number, radiusKm: RadiusKm) => Promise<PlaceLike[]>;
}

export function withDistance<T extends PlaceLike>(items: T[], user: Coordinates): T[] {
  return items.map((item) => ({ ...item }));
}
