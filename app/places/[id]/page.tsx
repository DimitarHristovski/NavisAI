"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPlaceholder } from "@/components/maps/map-placeholder";
import { findPlaceById } from "@/lib/recommendation/discovery";
import { PlaceLike } from "@/types";
import { useAppStore } from "@/store/useAppStore";

export default function PlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [item, setItem] = useState<PlaceLike | null>(null);
  const { isFavorite, addFavorite, removeFavorite } = useAppStore();

  useEffect(() => {
    findPlaceById(id).then(setItem);
  }, [id]);

  if (!item) return <main className="container mx-auto px-4 py-8">Loading...</main>;

  const favorite = isFavorite(item.id, item.type);

  return (
    <main className="container mx-auto space-y-6 px-4 py-6">
      <div className="relative h-72 w-full overflow-hidden rounded-lg">
        <Image src={item.image} alt={item.name} fill className="object-cover" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{item.name}</h1>
          <p className="text-sm text-muted-foreground">{item.address}, {item.city}</p>
        </div>
        <Button onClick={() => (favorite ? removeFavorite(item.id, item.type) : addFavorite(item.id, item.type))}>
          {favorite ? "Remove favorite" : "Save to favorites"}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {item.categories.map((cat) => (
          <Badge key={cat} variant="secondary">{cat}</Badge>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border p-4 text-sm">
          <p>Rating: {item.rating.toFixed(1)}</p>
          <p>Distance: {item.distanceKm.toFixed(1)} km</p>
          <p>Popularity: {item.popularityScore}</p>
          <p>Crowded: {item.crowdedScore}</p>
          <p className="mt-2 text-muted-foreground">Why recommended: High rating, local popularity, and proximity.</p>
        </div>
        <MapPlaceholder items={[item]} title="Map placeholder" />
      </div>
      <div className="flex gap-2">
        <Button>Directions (placeholder)</Button>
        <Button variant="outline">Book (placeholder)</Button>
      </div>
    </main>
  );
}
