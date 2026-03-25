"use client";

import { useEffect, useState } from "react";
import { PlaceCard } from "@/components/cards/place-card";
import { useAppStore } from "@/store/useAppStore";
import { findPlaceById } from "@/lib/recommendation/discovery";
import { Recommendation } from "@/types";

export default function FavoritesPage() {
  const { favorites } = useAppStore();
  const [items, setItems] = useState<Recommendation[]>([]);

  useEffect(() => {
    Promise.all(
      favorites.map(async (fav) => {
        const split = fav.id.split("-");
        const id = split.slice(1).join("-");
        const item = await findPlaceById(id);
        if (!item) return null;
        return { item, score: item.rating, reason: "Saved by you", mode: "popular_nearby" as const };
      })
    ).then((result) => setItems(result.filter(Boolean) as Recommendation[]));
  }, [favorites]);

  return (
    <main className="container mx-auto space-y-5 px-4 py-6">
      <h1 className="text-2xl font-bold">Favorites</h1>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No favorites yet. Save places to build your list.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((rec) => (
            <PlaceCard key={`${rec.item.type}-${rec.item.id}`} recommendation={rec} />
          ))}
        </div>
      )}
    </main>
  );
}
