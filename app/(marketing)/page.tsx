'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '@/types';
import { allItems } from '@/data';

const cities = Array.from(new Set(allItems.map(item => item.city))).sort();

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [city, setCity] = useState<string>('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (category !== 'all') params.set('category', category);
    if (city) params.set('city', city);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Hero Section */}
      <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-primary/10 to-background px-4 py-16">
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              Discover Your Next Adventure
            </h1>
            <p className="text-xl text-muted-foreground">
              AI-powered travel aggregator for places, hotels, tours, and local guides
            </p>
          </div>

          {/* Search Bar */}
          <div className="rounded-lg border bg-card p-6 shadow-lg">
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search for places, hotels, tours, or guides..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 h-12 text-base"
                  />
                </div>
                <Button onClick={handleSearch} size="lg" className="h-12 px-8">
                  Search
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Tabs value={category} onValueChange={(v) => setCategory(v as Category | 'all')} className="flex-1">
                  <TabsList className="w-full">
                    <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                    <TabsTrigger value="places" className="flex-1">Places</TabsTrigger>
                    <TabsTrigger value="hotels" className="flex-1">Hotels</TabsTrigger>
                    <TabsTrigger value="tours" className="flex-1">Tours</TabsTrigger>
                    <TabsTrigger value="guides" className="flex-1">Guides</TabsTrigger>
                  </TabsList>
                </Tabs>

                <Select value={city || 'all'} onValueChange={(v) => setCity(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <MapPin className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="All cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All cities</SelectItem>
                    {cities.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border bg-card p-4 text-center">
              <div className="text-2xl font-bold text-primary">{allItems.filter(i => i.type === 'place').length}</div>
              <div className="text-sm text-muted-foreground">Places</div>
            </div>
            <div className="rounded-lg border bg-card p-4 text-center">
              <div className="text-2xl font-bold text-primary">{allItems.filter(i => i.type === 'hotel').length}</div>
              <div className="text-sm text-muted-foreground">Hotels</div>
            </div>
            <div className="rounded-lg border bg-card p-4 text-center">
              <div className="text-2xl font-bold text-primary">{allItems.filter(i => i.type === 'tour').length}</div>
              <div className="text-sm text-muted-foreground">Tours</div>
            </div>
            <div className="rounded-lg border bg-card p-4 text-center">
              <div className="text-2xl font-bold text-primary">{allItems.filter(i => i.type === 'guide').length}</div>
              <div className="text-sm text-muted-foreground">Guides</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
