"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useGeolocation } from "@/components/location/use-geolocation";
import { FilterBar } from "@/components/search/filter-bar";
import { PlaceCard } from "@/components/cards/place-card";
import { MapPlaceholder } from "@/components/maps/map-placeholder";
import { Recommendation } from "@/types";
import { searchNearby } from "@/lib/recommendation/discovery";
import { Skeleton } from "@/components/ui/skeleton";

export default function NearbyPage() {
  const { filters, selectedCityFallback } = useAppStore();
  const { coordinates, permission } = useGeolocation(true);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    const fallback = selectedCityFallback === "Ohrid" ? { lat: 41.1172, lng: 20.8019 } : selectedCityFallback === "Hannover" ? { lat: 52.3759, lng: 9.732 } : { lat: 52.52, lng: 13.405 };
    const active = permission === "granted" && coordinates ? coordinates : fallback;

    setLoading(true);
    searchNearby(active.lat, active.lng, filters)
      .then(setRecommendations)
      .finally(() => setLoading(false));
  }, [permission, coordinates, filters, selectedCityFallback]);

  return (
    <main className="container mx-auto space-y-5 px-4 py-6">
      <h1 className="text-2xl font-bold">Nearby Recommendations</h1>
      <FilterBar />
      <MapPlaceholder items={recommendations.map((r) => r.item)} title="Nearby pins" />

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-52" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec) => (
            <PlaceCard key={`${rec.item.type}-${rec.item.id}`} recommendation={rec} />
          ))}
        </div>
      )}
    </main>
  );
}
