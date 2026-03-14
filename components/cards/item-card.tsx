'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Heart } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Item } from '@/types';
import { formatPrice, calculateDistance, itemTypeToCategory } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { ScoredItem } from '@/lib/search/score';
import { generateMatchSnippet } from '@/lib/search/snippets';

interface ItemCardProps {
  scoredItem: ScoredItem;
  userLocation?: { lat: number; lng: number } | null;
}

export function ItemCard({ scoredItem, userLocation }: ItemCardProps) {
  const { item } = scoredItem;
  const { isFavorite, addFavorite, removeFavorite } = useAppStore();
  const isFav = isFavorite(item.id, itemTypeToCategory(item.type));
  const snippet = generateMatchSnippet(scoredItem);

  const distance = userLocation
    ? calculateDistance(userLocation.lat, userLocation.lng, item.lat, item.lng)
    : null;

  const getDetailUrl = () => {
    return `/${item.type}s/${item.id}`;
  };

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={getDetailUrl()}>
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <Image
            src={item.images[0] || 'https://via.placeholder.com/400x300'}
            alt={item.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute right-2 top-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isFav) {
                  removeFavorite(item.id, itemTypeToCategory(item.type));
                } else {
                  addFavorite(item.id, itemTypeToCategory(item.type));
                }
              }}
            >
              <Heart
                className={`h-4 w-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`}
              />
            </Button>
          </div>
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={getDetailUrl()}>
              <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors">
                {item.name}
              </h3>
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <MapPin className="h-3 w-3" />
              <span>{item.city}, {item.country}</span>
              {distance !== null && (
                <span className="text-xs">• {distance.toFixed(1)} km away</span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{item.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm font-semibold text-primary">
                {formatPrice(item.price)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {snippet}
            </p>
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
