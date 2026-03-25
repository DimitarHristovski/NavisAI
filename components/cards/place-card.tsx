"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Star, Users } from "lucide-react";
import { PlaceLike, Recommendation } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface Props {
  recommendation: Recommendation;
}

export function PlaceCard({ recommendation }: Props) {
  const item = recommendation.item;
  const { isFavorite, addFavorite, removeFavorite } = useAppStore();
  const favorite = isFavorite(item.id, item.type);

  const href = item.type === "hotel" ? `/hotels/${item.id}` : `/places/${item.id}`;

  return (
    <Card className="w-[280px] shrink-0 overflow-hidden sm:w-full">
      <div className="relative h-40 w-full">
        <Image src={item.image} alt={item.name} fill className="object-cover" />
      </div>
      <CardContent className="space-y-2 pt-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={href} className="font-semibold hover:text-primary">
            {item.name}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => (favorite ? removeFavorite(item.id, item.type) : addFavorite(item.id, item.type))}
          >
            <Heart className={`h-4 w-4 ${favorite ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            {item.rating.toFixed(1)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {item.reviewCount.toLocaleString()}
          </span>
          <span>{item.distanceKm.toFixed(1)} km</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {item.categories.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <p className="text-xs text-muted-foreground">{recommendation.reason}</p>
      </CardFooter>
    </Card>
  );
}
