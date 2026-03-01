'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ItemCard } from '@/components/cards/item-card';
import { useAppStore } from '@/store/useAppStore';
import { allItems } from '@/data';
import { scoreItems } from '@/lib/search/score';
import { parseQuery } from '@/lib/search/parseQuery';

export default function FavoritesPage() {
  const { favorites, userLocation } = useAppStore();

  const favoriteItems = useMemo(() => {
    const favoriteMap = new Map(
      favorites.map(f => [f.id, f])
    );

    const items = allItems.filter(item => {
      const itemId = `${item.type}-${item.id}`;
      return favoriteMap.has(itemId);
    });

    // Score items for display
    const parsed = parseQuery('');
    const scored = scoreItems(items, parsed, {}, userLocation);
    return scored;
  }, [favorites, userLocation]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
          <p className="text-muted-foreground">
            {favoriteItems.length} saved {favoriteItems.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Link href="/search">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </Link>
      </div>

      {favoriteItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favoriteItems.map((scoredItem) => (
            <ItemCard
              key={`${scoredItem.item.type}-${scoredItem.item.id}`}
              scoredItem={scoredItem}
              userLocation={userLocation}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Heart className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-semibold mb-2">No favorites yet</p>
          <p className="text-muted-foreground mb-6">
            Start exploring and save items you like
          </p>
          <Link href="/search">
            <Button>Explore Now</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
