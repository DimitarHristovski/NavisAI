"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useGeolocation } from "@/components/location/use-geolocation";
import { LocationPermissionBanner } from "@/components/location/location-permission-banner";
import { FilterBar } from "@/components/search/filter-bar";
import { RecommendationSection } from "@/components/discovery/recommendation-section";
import { DiscoveryTabs } from "@/components/discovery/discovery-tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getDiscoveryBuckets } from "@/lib/recommendation/discovery";
import { Recommendation } from "@/types";

const fallbackCoordinates: Record<string, { lat: number; lng: number }> = {
  Berlin: { lat: 52.52, lng: 13.405 },
  Hannover: { lat: 52.3759, lng: 9.732 },
  Ohrid: { lat: 41.1172, lng: 20.8019 },
};

export default function HomePage() {
  const { coordinates, permission, isLocating, requestLocation } = useGeolocation(true);
  const {
    filters,
    selectedCityFallback,
    setSelectedCityFallback,
    discoveryMode,
    setDiscoveryMode,
  } = useAppStore();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<{
    popularNearby: Recommendation[];
    crowdedNow: Recommendation[];
    quietGems: Recommendation[];
    hotelsAround: Recommendation[];
  }>({
    popularNearby: [],
    crowdedNow: [],
    quietGems: [],
    hotelsAround: [],
  });

  const activeCoordinates = useMemo(() => {
    if (permission === "granted" && coordinates) return coordinates;
    return fallbackCoordinates[selectedCityFallback] ?? fallbackCoordinates.Berlin;
  }, [permission, coordinates, selectedCityFallback]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getDiscoveryBuckets(activeCoordinates.lat, activeCoordinates.lng, filters)
      .then((data) => {
        if (!cancelled) setSections(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCoordinates.lat, activeCoordinates.lng, filters]);

  const filteredSections = useMemo(() => {
    if (!query.trim()) return sections;
    const q = query.toLowerCase();
    const filter = (list: Recommendation[]) =>
      list.filter((rec) => `${rec.item.name} ${rec.item.description}`.toLowerCase().includes(q));
    return {
      popularNearby: filter(sections.popularNearby),
      crowdedNow: filter(sections.crowdedNow),
      quietGems: filter(sections.quietGems),
      hotelsAround: filter(sections.hotelsAround),
    };
  }, [query, sections]);

  return (
    <main className="container mx-auto space-y-6 px-4 py-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl">Discover what’s best around you</h1>
        <p className="text-sm text-muted-foreground">NAVISAI finds nearby places, hotels, and local hotspots instantly.</p>
      </div>

      <LocationPermissionBanner permission={permission} isLocating={isLocating} onRetry={requestLocation} />

      {permission !== "granted" ? (
        <div className="rounded-lg border p-4">
          <p className="mb-2 text-sm font-medium">Choose a city to continue browsing</p>
          <Select value={selectedCityFallback} onValueChange={setSelectedCityFallback}>
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(fallbackCoordinates).map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" placeholder="Search nearby places" />
        </div>
        <Link href="/nearby">
          <Button variant="outline">See all nearby</Button>
        </Link>
      </div>

      <FilterBar />
      <DiscoveryTabs mode={discoveryMode} onChange={setDiscoveryMode} />

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-52 w-full" />
          ))}
        </div>
      ) : (
        <>
          <RecommendationSection title="Popular Near You" recommendations={filteredSections.popularNearby} />
          <RecommendationSection title="Crowded Right Now" recommendations={filteredSections.crowdedNow} />
          <RecommendationSection title="Quiet Gems Nearby" recommendations={filteredSections.quietGems} />
          <RecommendationSection title="Best Hotels Around You" recommendations={filteredSections.hotelsAround} />
        </>
      )}
    </main>
  );
}
