'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, Map, List, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { ItemCard } from '@/components/cards/item-card';
import { SearchFiltersComponent } from '@/components/filters/search-filters';
import { allItems } from '@/data';
import { Category, SearchFilters } from '@/types';
import { parseQuery } from '@/lib/search/parseQuery';
import { scoreItems, sortScoredItems } from '@/lib/search/score';
import { useAppStore } from '@/store/useAppStore';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState<Category | 'all'>(
    (searchParams.get('category') as Category) || 'all'
  );
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [loading, setLoading] = useState(true);
  const { searchFilters, setSearchFilters, userLocation, setUserLocation } = useAppStore();

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, category, searchFilters]);

  // Request geolocation
  useEffect(() => {
    if (navigator.geolocation && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Silently fail
        }
      );
    }
  }, [userLocation, setUserLocation]);

  // Filter and score items
  const results = useMemo(() => {
    setLoading(true);
    let filtered = allItems;

    // Apply category filter
    if (category !== 'all') {
      filtered = filtered.filter(item => item.type === category);
    }

    // Parse query
    const parsed = parseQuery(searchQuery);

    // Merge parsed constraints with filters
    const combinedFilters: SearchFilters = {
      ...searchFilters,
      category: category !== 'all' ? category : undefined,
      city: parsed.constraints.city || searchFilters.city,
    };

    // Score items
    const scored = scoreItems(filtered, parsed, combinedFilters, userLocation);

    // Sort
    const sorted = sortScoredItems(scored, 'relevance', userLocation);

    setTimeout(() => setLoading(false), 100);
    return sorted;
  }, [searchQuery, category, searchFilters, userLocation]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (category !== 'all') params.set('category', category);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as Category | 'all')}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="places">Places</SelectItem>
              <SelectItem value="hotels">Hotels</SelectItem>
              <SelectItem value="tours">Tours</SelectItem>
              <SelectItem value="guides">Guides</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>Search</Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {loading ? (
              <span>Searching...</span>
            ) : (
              <span>{results.length} results found</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <SearchFiltersComponent
                    filters={searchFilters}
                    onFiltersChange={setSearchFilters}
                    category={category !== 'all' ? category : undefined}
                  />
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-r-none"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                className="rounded-l-none"
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {viewMode === 'list' ? (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((scoredItem) => (
                <ItemCard
                  key={`${scoredItem.item.type}-${scoredItem.item.id}`}
                  scoredItem={scoredItem}
                  userLocation={userLocation}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg font-semibold mb-2">No results found</p>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border bg-muted h-[600px] flex items-center justify-center">
          <div className="text-center space-y-2">
            <Map className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Map view coming soon</p>
            <p className="text-sm text-muted-foreground">
              {results.length} locations found
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
