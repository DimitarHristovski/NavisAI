'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Star, MapPin, Heart, Calendar, Clock, Users, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { tours } from '@/data/tours';
import { useAppStore } from '@/store/useAppStore';
import { formatPrice, itemTypeToCategory } from '@/lib/utils';

export default function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const tour = tours.find(t => t.id === resolvedParams.id);
  const { isFavorite, addFavorite, removeFavorite } = useAppStore();
  const isFav = tour ? isFavorite(tour.id, itemTypeToCategory(tour.type)) : false;

  if (!tour) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg font-semibold mb-2">Tour not found</p>
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
              src={tour.images[0] || 'https://via.placeholder.com/800x600'}
              alt={tour.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {tour.images.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {tour.images.slice(1, 4).map((img, i) => (
                <div key={i} className="relative h-24 w-full overflow-hidden rounded-lg">
                  <Image src={img} alt={`${tour.name} ${i + 2}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{tour.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{tour.city}, {tour.country}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (isFav) {
                    removeFavorite(tour.id, itemTypeToCategory(tour.type));
                  } else {
                    addFavorite(tour.id, itemTypeToCategory(tour.type));
                  }
                }}
              >
                <Heart className={`h-5 w-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{tour.rating.toFixed(1)}</span>
              </div>
              <span className="text-lg font-semibold text-primary">
                {formatPrice(tour.price)}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {tour.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground">{tour.description}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  <h3 className="font-semibold">Duration</h3>
                </div>
                <p className="text-2xl font-bold">{tour.duration} hours</p>
              </CardContent>
            </Card>
            {tour.maxGroupSize && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" />
                    <h3 className="font-semibold">Group Size</h3>
                  </div>
                  <p className="text-2xl font-bold">Up to {tour.maxGroupSize}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-2 flex items-center gap-2">
                <Languages className="h-4 w-4" />
                Languages
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {tour.languages.map((lang) => (
                  <Badge key={lang} variant="outline">
                    {lang}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-2">Why This Matches</h2>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Perfect {tour.duration}-hour experience</li>
                <li>• Highly rated by travelers</li>
                <li>• Available in multiple languages</li>
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
                <DialogTitle>Book {tour.name}</DialogTitle>
                <DialogDescription>
                  This is a placeholder booking dialog. In a real application, this would redirect to the booking provider.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Source: {tour.source}
                </p>
                <Button className="w-full" onClick={() => {
                  window.open(`https://example.com/book/${tour.id}`, '_blank');
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
