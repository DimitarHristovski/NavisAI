'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Star, MapPin, Heart, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { places } from '@/data/places';
import { useAppStore } from '@/store/useAppStore';
import { formatPrice, itemTypeToCategory } from '@/lib/utils';

export default function PlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const place = places.find(p => p.id === resolvedParams.id);
  const { isFavorite, addFavorite, removeFavorite } = useAppStore();
  const isFav = place ? isFavorite(place.id, itemTypeToCategory(place.type)) : false;

  if (!place) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg font-semibold mb-2">Place not found</p>
        <Link href="/search">
          <Button variant="outline">Back to Search</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/search">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative h-[400px] w-full overflow-hidden rounded-lg">
            <Image
              src={place.images[0] || 'https://via.placeholder.com/800x600'}
              alt={place.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {place.images.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {place.images.slice(1, 4).map((img, i) => (
                <div key={i} className="relative h-24 w-full overflow-hidden rounded-lg">
                  <Image src={img} alt={`${place.name} ${i + 2}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{place.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{place.city}, {place.country}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (isFav) {
                    removeFavorite(place.id, itemTypeToCategory(place.type));
                  } else {
                    addFavorite(place.id, itemTypeToCategory(place.type));
                  }
                }}
              >
                <Heart className={`h-5 w-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{place.rating.toFixed(1)}</span>
              </div>
              <span className="text-lg font-semibold text-primary">
                {formatPrice(place.price)}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {place.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground">{place.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-2">Why This Matches</h2>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Highly rated {place.category}</li>
                <li>• Perfect for {place.tags[0]} travelers</li>
                <li>• Located in the heart of {place.city}</li>
              </ul>
            </CardContent>
          </Card>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full" size="lg">
                <Calendar className="h-4 w-4 mr-2" />
                Book Now
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Book {place.name}</DialogTitle>
                <DialogDescription>
                  This is a placeholder booking dialog. In a real application, this would redirect to the booking provider.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Source: {place.source}
                </p>
                <Button className="w-full" onClick={() => {
                  // Simulate redirect
                  window.open(`https://example.com/book/${place.id}`, '_blank');
                }}>
                  Continue to Booking
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
