'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Star, MapPin, Heart, Calendar, Languages, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { guides } from '@/data/guides';
import { useAppStore } from '@/store/useAppStore';
import { formatPrice } from '@/lib/utils';

export default function GuideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const guide = guides.find(g => g.id === resolvedParams.id);
  const { isFavorite, addFavorite, removeFavorite } = useAppStore();
  const isFav = guide ? isFavorite(guide.id, guide.type) : false;

  if (!guide) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg font-semibold mb-2">Guide not found</p>
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
              src={guide.images[0] || 'https://via.placeholder.com/800x600'}
              alt={guide.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{guide.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{guide.city}, {guide.country}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (isFav) {
                    removeFavorite(guide.id, guide.type);
                  } else {
                    addFavorite(guide.id, guide.type);
                  }
                }}
              >
                <Heart className={`h-5 w-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{guide.rating.toFixed(1)}</span>
              </div>
              <span className="text-lg font-semibold text-primary">
                {formatPrice(guide.hourlyRate)} / hour
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {guide.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-2">About</h2>
              <p className="text-muted-foreground">{guide.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-2 flex items-center gap-2">
                <Languages className="h-4 w-4" />
                Languages
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {guide.languages.map((lang) => (
                  <Badge key={lang} variant="outline">
                    {lang}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-2 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Specialties
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {guide.specialties.map((specialty) => (
                  <Badge key={specialty} variant="default">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-2">Why This Matches</h2>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Expert {guide.specialties[0] || 'local'} guide</li>
                <li>• Highly rated by travelers</li>
                <li>• Speaks {guide.languages.length} languages</li>
              </ul>
            </CardContent>
          </Card>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full" size="lg">
                <Calendar className="h-4 w-4 mr-2" />
                Contact Guide
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Contact {guide.name}</DialogTitle>
                <DialogDescription>
                  This is a placeholder contact dialog. In a real application, this would allow you to message or book the guide.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Source: {guide.source}
                </p>
                <Button className="w-full" onClick={() => {
                  window.open(`https://example.com/contact/${guide.id}`, '_blank');
                }}>
                  Continue to Contact
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
