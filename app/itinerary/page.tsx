'use client';

import { useState } from 'react';
import { Calendar, MapPin, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { allItems } from '@/data';
import { Itinerary, ItineraryDay, Vibe, Item, Place } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { formatPrice } from '@/lib/utils';

const cities = Array.from(new Set(allItems.map(item => item.city))).sort();
const vibes: Vibe[] = ['family', 'romantic', 'nightlife', 'adventure', 'cultural', 'relaxed'];

function generateItinerary(
  city: string,
  startDate: string,
  endDate: string,
  vibe: Vibe
): Itinerary {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days: ItineraryDay[] = [];

  // Filter items by city
  const cityItems = allItems.filter(item => item.city.toLowerCase() === city.toLowerCase());

  // Filter by vibe tags
  const vibeItems = cityItems.filter(item => {
    const vibeMap: Record<Vibe, string[]> = {
      family: ['family'],
      romantic: ['romantic'],
      nightlife: ['nightlife'],
      adventure: ['adventure'],
      cultural: ['cultural'],
      relaxed: ['relaxed'],
    };
    return item.tags.some(tag => vibeMap[vibe].includes(tag));
  });

  // Get items by type
  const places = vibeItems.filter((i): i is Place => i.type === 'place');
  const tours = vibeItems.filter(i => i.type === 'tour');
  const restaurants = places.filter(p => p.tags.includes('restaurant') || p.category === 'restaurant');
  const attractions = places.filter(p => p.category !== 'restaurant');
  const nightlife = places.filter(p => p.tags.includes('nightlife'));

  let currentDate = new Date(start);
  let placeIndex = 0;
  let tourIndex = 0;
  let restaurantIndex = 0;
  let nightlifeIndex = 0;

  while (currentDate <= end) {
    const day: ItineraryDay = {
      date: currentDate.toISOString().split('T')[0],
    };

    // Morning: attraction
    if (attractions.length > 0 && placeIndex < attractions.length) {
      day.morning = attractions[placeIndex % attractions.length];
      placeIndex++;
    }

    // Afternoon: tour or museum
    if (tours.length > 0 && tourIndex < tours.length) {
      day.afternoon = tours[tourIndex % tours.length];
      tourIndex++;
    } else if (attractions.length > 0 && placeIndex < attractions.length) {
      day.afternoon = attractions[placeIndex % attractions.length];
      placeIndex++;
    }

    // Evening: restaurant or nightlife
    if (vibe === 'nightlife' && nightlife.length > 0 && nightlifeIndex < nightlife.length) {
      day.evening = nightlife[nightlifeIndex % nightlife.length];
      nightlifeIndex++;
    } else if (restaurants.length > 0 && restaurantIndex < restaurants.length) {
      day.evening = restaurants[restaurantIndex % restaurants.length];
      restaurantIndex++;
    } else if (attractions.length > 0 && placeIndex < attractions.length) {
      day.evening = attractions[placeIndex % attractions.length];
      placeIndex++;
    }

    days.push(day);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    city,
    startDate,
    endDate,
    vibe,
    days,
  };
}

export default function ItineraryPage() {
  const { itinerary, setItinerary } = useAppStore();
  const [city, setCity] = useState(itinerary?.city || 'Berlin');
  const [startDate, setStartDate] = useState(
    itinerary?.startDate || new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    itinerary?.endDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [vibe, setVibe] = useState<Vibe>(itinerary?.vibe || 'cultural');

  const handleGenerate = () => {
    const newItinerary = generateItinerary(city, startDate, endDate, vibe);
    setItinerary(newItinerary);
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Your Itinerary</h1>
        <p className="text-muted-foreground">
          Generate a personalized day-by-day travel plan
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Itinerary Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger id="city">
                    <MapPin className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>

              <div>
                <Label htmlFor="vibe">Preferred Vibe</Label>
                <Select value={vibe} onValueChange={(v) => setVibe(v as Vibe)}>
                  <SelectTrigger id="vibe">
                    <Sparkles className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vibes.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleGenerate} className="w-full" size="lg">
                <Calendar className="h-4 w-4 mr-2" />
                Generate Itinerary
              </Button>

              {itinerary && (
                <Button
                  onClick={handleRegenerate}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Itinerary Display */}
        <div className="lg:col-span-2">
          {itinerary ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{itinerary.city} Itinerary</h2>
                  <p className="text-muted-foreground">
                    {formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}
                  </p>
                </div>
                <Badge variant="secondary">{itinerary.vibe}</Badge>
              </div>

              <div className="space-y-4">
                {itinerary.days.map((day, index) => (
                  <Card key={day.date}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Day {index + 1}: {formatDate(day.date)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {day.morning && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Morning</Badge>
                            <span className="font-semibold">{day.morning.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {day.morning.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <span>⭐</span>
                              {day.morning.rating.toFixed(1)}
                            </span>
                            <span className="text-primary font-semibold">
                              {formatPrice(day.morning.price)}
                            </span>
                          </div>
                        </div>
                      )}

                      {day.afternoon && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Afternoon</Badge>
                            <span className="font-semibold">{day.afternoon.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {day.afternoon.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <span>⭐</span>
                              {day.afternoon.rating.toFixed(1)}
                            </span>
                            <span className="text-primary font-semibold">
                              {formatPrice(day.afternoon.price)}
                            </span>
                          </div>
                        </div>
                      )}

                      {day.evening && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Evening</Badge>
                            <span className="font-semibold">{day.evening.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {day.evening.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <span>⭐</span>
                              {day.evening.rating.toFixed(1)}
                            </span>
                            <span className="text-primary font-semibold">
                              {formatPrice(day.evening.price)}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">No itinerary yet</p>
                <p className="text-muted-foreground">
                  Fill in the form and generate your personalized itinerary
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
