import { googlePlacesProvider } from "@/lib/providers/googlePlaces";
import { matchesCategory, matchesVibe } from "@/lib/utils/categories";
import { DiscoveryMode, Filters, PlaceLike, Recommendation } from "@/types";
import { recommendationReason, scoreByMode } from "./scoring";

function sortItems(items: PlaceLike[], sort: Filters["sort"]): PlaceLike[] {
  const clone = [...items];
  if (sort === "closest") return clone.sort((a, b) => a.distanceKm - b.distanceKm);
  if (sort === "highest_rated") return clone.sort((a, b) => b.rating - a.rating);
  if (sort === "most_popular") return clone.sort((a, b) => b.popularityScore - a.popularityScore);
  if (sort === "most_crowded") return clone.sort((a, b) => b.crowdedScore - a.crowdedScore);
  if (sort === "cheapest") return clone.sort((a, b) => a.priceLevel - b.priceLevel);
  return clone;
}

function toRecommendations(items: PlaceLike[], mode: DiscoveryMode): Recommendation[] {
  return items.map((item) => ({
    item,
    mode,
    score: scoreByMode(item, mode),
    reason: recommendationReason(item, mode),
  }));
}

export async function getDiscoveryBuckets(lat: number, lng: number, filters: Filters) {
  const [popular, crowded, quiet, hotels] = await Promise.all([
    googlePlacesProvider.getPopularPlaces(lat, lng, filters.radiusKm),
    googlePlacesProvider.getCrowdedPlaces(lat, lng, filters.radiusKm),
    googlePlacesProvider.getQuietPlaces(lat, lng, filters.radiusKm),
    googlePlacesProvider.getRecommendedHotels(lat, lng, filters.radiusKm),
  ]);

  const filterAndSort = (items: PlaceLike[]) =>
    sortItems(
      items.filter((item) => matchesCategory(item, filters.category) && matchesVibe(item, filters.vibe)),
      filters.sort
    );

  const popularFiltered = filterAndSort(popular);
  const crowdedFiltered = filterAndSort(crowded);
  const quietFiltered = filterAndSort(quiet);
  const hotelFiltered = filterAndSort(hotels);

  return {
    popularNearby: toRecommendations(popularFiltered, "popular_nearby"),
    crowdedNow: toRecommendations(crowdedFiltered, "crowded_now"),
    quietGems: toRecommendations(quietFiltered, "quiet_gems"),
    hotelsAround: toRecommendations(hotelFiltered, "popular_nearby"),
  };
}

export async function searchNearby(lat: number, lng: number, filters: Filters): Promise<Recommendation[]> {
  const items = await googlePlacesProvider.searchNearbyPlaces(lat, lng, filters.radiusKm, filters.category);
  const filtered = sortItems(items.filter((item) => matchesVibe(item, filters.vibe)), filters.sort);
  return toRecommendations(filtered, "popular_nearby");
}

export async function findPlaceById(id: string): Promise<PlaceLike | null> {
  const all = await googlePlacesProvider.searchNearbyPlaces(52.52, 13.405, 25, "all");
  return all.find((item) => item.id === id) ?? null;
}
