'use client';

import { useState, useEffect } from 'react';
import { SearchFilters, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { allItems } from '@/data';

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  category?: Category;
}

const allTags = Array.from(new Set(allItems.flatMap(item => item.tags))).sort();
const cities = Array.from(new Set(allItems.map(item => item.city))).sort();

export function SearchFiltersComponent({ filters, onFiltersChange, category }: SearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilters = (updates: Partial<SearchFilters>) => {
    const newFilters = { ...localFilters, ...updates };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const removeTag = (tag: string) => {
    const newTags = localFilters.tags?.filter(t => t !== tag) || [];
    updateFilters({ tags: newTags.length > 0 ? newTags : undefined });
  };

  const toggleTag = (tag: string) => {
    const currentTags = localFilters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    updateFilters({ tags: newTags.length > 0 ? newTags : undefined });
  };

  return (
    <div className="space-y-6">
      {/* City Filter */}
      <div>
        <Label htmlFor="city">City</Label>
        <Select
          value={localFilters.city || 'all'}
          onValueChange={(value) => updateFilters({ city: value === 'all' ? undefined : value })}
        >
          <SelectTrigger id="city">
            <SelectValue placeholder="All cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rating Filter */}
      <div>
        <Label>Minimum Rating: {localFilters.minRating?.toFixed(1) || 'Any'}</Label>
        <Slider
          value={[localFilters.minRating || 0]}
          onValueChange={([value]) => updateFilters({ minRating: value > 0 ? value : undefined })}
          min={0}
          max={5}
          step={0.1}
          className="mt-2"
        />
      </div>

      {/* Price Range Filter */}
      <div>
        <Label>Price Range</Label>
        <div className="flex gap-2 mt-2">
          <Input
            type="number"
            placeholder="Min"
            value={localFilters.priceRange?.[0] || ''}
            onChange={(e) => {
              const min = e.target.value ? parseInt(e.target.value) : undefined;
              updateFilters({
                priceRange: min !== undefined
                  ? [min, localFilters.priceRange?.[1] || 500]
                  : undefined,
              });
            }}
          />
          <Input
            type="number"
            placeholder="Max"
            value={localFilters.priceRange?.[1] || ''}
            onChange={(e) => {
              const max = e.target.value ? parseInt(e.target.value) : undefined;
              updateFilters({
                priceRange: max !== undefined
                  ? [localFilters.priceRange?.[0] || 0, max]
                  : undefined,
              });
            }}
          />
        </div>
      </div>

      {/* Distance Filter */}
      <div>
        <Label>Maximum Distance (km): {localFilters.distance || 'Any'}</Label>
        <Slider
          value={[localFilters.distance || 50]}
          onValueChange={([value]) => updateFilters({ distance: value < 50 ? value : undefined })}
          min={1}
          max={50}
          step={1}
          className="mt-2"
        />
      </div>

      {/* Tags Filter */}
      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {allTags.slice(0, 12).map((tag) => {
            const isSelected = localFilters.tags?.includes(tag);
            return (
              <Badge
                key={tag}
                variant={isSelected ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            );
          })}
        </div>
        {localFilters.tags && localFilters.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {localFilters.tags.map((tag) => (
              <Badge key={tag} variant="default" className="gap-1">
                {tag}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Language Filter (for guides/tours) */}
      {(category === 'guides' || category === 'tours') && (
        <div>
          <Label>Languages</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {['English', 'German', 'Spanish', 'French', 'Macedonian', 'Albanian'].map((lang) => {
              const isSelected = localFilters.languages?.includes(lang);
              return (
                <Badge
                  key={lang}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const current = localFilters.languages || [];
                    const newLangs = isSelected
                      ? current.filter(l => l !== lang)
                      : [...current, lang];
                    updateFilters({ languages: newLangs.length > 0 ? newLangs : undefined });
                  }}
                >
                  {lang}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Duration Filter (for tours) */}
      {category === 'tours' && (
        <div>
          <Label>Duration (hours): {localFilters.duration || 'Any'}</Label>
          <Slider
            value={[localFilters.duration || 5]}
            onValueChange={([value]) => updateFilters({ duration: value < 5 ? value : undefined })}
            min={1}
            max={8}
            step={0.5}
            className="mt-2"
          />
        </div>
      )}

      {/* Clear Filters */}
      <Button
        variant="outline"
        onClick={() => {
          const cleared: SearchFilters = {};
          setLocalFilters(cleared);
          onFiltersChange(cleared);
        }}
        className="w-full"
      >
        Clear All Filters
      </Button>
    </div>
  );
}
