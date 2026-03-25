import { DiscoveryMode, PlaceLike } from "@/types";

function normalize(value: number, max: number): number {
  if (max === 0) return 0;
  return value / max;
}

export function scorePopularNearby(item: PlaceLike): number {
  const ratingScore = item.rating / 5;
  const reviewScore = normalize(item.reviewCount, 20000);
  const popularity = normalize(item.popularityScore, 100);
  const distancePenalty = Math.max(0, 1 - item.distanceKm / 25);
  return ratingScore * 0.35 + reviewScore * 0.3 + popularity * 0.25 + distancePenalty * 0.1;
}

export function scoreCrowdedNow(item: PlaceLike): number {
  const nightlifeBoost = item.categories.includes("nightlife") ? 0.15 : 0;
  const restaurantBoost = item.categories.includes("restaurant") || item.categories.includes("cafe") ? 0.08 : 0;
  const attractionBoost = item.categories.includes("attraction") || item.categories.includes("landmark") ? 0.08 : 0;
  const centralityBoost = item.distanceKm <= 5 ? 0.1 : 0;
  const popularity = normalize(item.popularityScore, 100) * 0.35;
  const crowded = normalize(item.crowdedScore, 100) * 0.24;
  const reviews = normalize(item.reviewCount, 20000) * 0.12;
  return popularity + crowded + reviews + nightlifeBoost + restaurantBoost + attractionBoost + centralityBoost;
}

export function scoreQuietGems(item: PlaceLike): number {
  const rating = item.rating / 5;
  const moderatePopularity = item.popularityScore >= 45 && item.popularityScore <= 75 ? 0.2 : 0.05;
  const quietBoost = item.categories.some((c) => ["park", "scenic", "quiet", "culture", "museum"].includes(c)) ? 0.2 : 0;
  const notTooCrowded = item.crowdedScore <= 55 ? 0.15 : 0;
  const distancePenalty = Math.max(0, 1 - item.distanceKm / 25) * 0.1;
  return rating * 0.4 + moderatePopularity + quietBoost + notTooCrowded + distancePenalty;
}

export function scoreByMode(item: PlaceLike, mode: DiscoveryMode): number {
  if (mode === "popular_nearby") return scorePopularNearby(item);
  if (mode === "crowded_now") return scoreCrowdedNow(item);
  return scoreQuietGems(item);
}

export function recommendationReason(item: PlaceLike, mode: DiscoveryMode): string {
  if (mode === "popular_nearby") {
    return `${item.rating.toFixed(1)} rating with ${item.reviewCount.toLocaleString()} reviews`;
  }
  if (mode === "crowded_now") {
    if (item.categories.includes("nightlife")) return "Nightlife hotspot with strong local activity";
    return `High activity area with crowded score ${item.crowdedScore}`;
  }
  if (item.categories.includes("park") || item.categories.includes("scenic")) {
    return "Relaxed and scenic option away from tourist crowds";
  }
  return "Highly rated hidden gem with balanced popularity";
}
