'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Star, MapPin, Heart, Calendar, Bed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { hotels } from '@/data/hotels';
import { useAppStore } from '@/store/useAppStore';
import { formatPrice } from '@/lib/utils';

export default function HotelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const hotel = hotels.find(h => h.id === resolvedParams.id);
  const { isFavorite, addFavorite, removeFavorite } = useAppStore();
  const isFav = hotel ? isFavorite(hotel.id, hotel.type) : false;

  if (!hotel) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg font-semibold mb-2">Hotel not found</p>
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
        <div className="space-y-4">
          <div className="relative h-[400px] w-full overflow-hidden rounded-lg">
            <Image
              src={hotel.images[0] || 'https://via.placeholder.com/800x600'}
              alt={hotel.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {hotel.images.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {hotel.images.slice(1, 4).map((img, i) => (
                <div key={i} className="relative h-24 w-full overflow-hidden rounded-lg">
                  <Image src={img} alt={`${hotel.name} ${i + 2}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{hotel.city}, {hotel.country}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (isFav) {
                    removeFavorite(hotel.id, hotel.type);
                  } else {
                    addFavorite(hotel.id, hotel.type);
                  }
                }}
              >
                <Heart className={`h-5 w-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{hotel.rating.toFixed(1)}</span>
              </div>
              {hotel.stars && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: hotel.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              )}
              <span className="text-lg font-semibold text-primary">
                {formatPrice(hotel.price)} / night
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {hotel.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground">{hotel.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-2 flex items-center gap-2">
                <Bed className="h-4 w-4" />
                Amenities
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {hotel.amenities.map((amenity) => (
                  <Badge key={amenity} variant="outline">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-2">Why This Matches</h2>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• {hotel.stars || 3}+ star accommodation</li>
                <li>• Highly rated by guests</li>
                <li>• Perfect for {hotel.tags[0]} travelers</li>
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
                <DialogTitle>Book {hotel.name}</DialogTitle>
                <DialogDescription>
                  This is a placeholder booking dialog. In a real application, this would redirect to the booking provider.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Source: {hotel.source}
                </p>
                <Button className="w-full" onClick={() => {
                  window.open(`https://example.com/book/${hotel.id}`, '_blank');
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
