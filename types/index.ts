import { z } from 'zod';

export type Category = 'places' | 'hotels' | 'tours' | 'guides';

export type Vibe = 'family' | 'romantic' | 'nightlife' | 'adventure' | 'cultural' | 'relaxed';

export type BudgetLevel = 'cheap' | 'mid' | 'luxury';

export interface BaseItem {
  id: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  rating: number;
  price: number | { min: number; max: number };
  tags: string[];
  description: string;
  images: string[];
  source: string;
}

export interface Place extends BaseItem {
  type: 'place';
  category: 'attraction' | 'museum' | 'park' | 'landmark' | 'restaurant';
}

export interface Hotel extends BaseItem {
  type: 'hotel';
  stars?: number;
  amenities: string[];
}

export interface Tour extends BaseItem {
  type: 'tour';
  duration: number; // in hours
  languages: string[];
  maxGroupSize?: number;
}

export interface Guide extends BaseItem {
  type: 'guide';
  languages: string[];
  specialties: string[];
  hourlyRate: number;
}

export type Item = Place | Hotel | Tour | Guide;

export interface SearchFilters {
  category?: Category;
  city?: string;
  minRating?: number;
  priceRange?: [number, number];
  tags?: string[];
  distance?: number; // in km
  languages?: string[]; // for guides/tours
  duration?: number; // for tours, in hours
  vibe?: Vibe;
}

export interface SearchQuery {
  text: string;
  filters: SearchFilters;
  sortBy: 'relevance' | 'price' | 'rating' | 'distance';
}

export interface Favorite {
  id: string;
  type: Category;
  addedAt: number;
}

export interface ItineraryDay {
  date: string;
  morning?: Item;
  afternoon?: Item;
  evening?: Item;
}

export interface Itinerary {
  city: string;
  startDate: string;
  endDate: string;
  vibe: Vibe;
  days: ItineraryDay[];
}

export const SearchQuerySchema = z.object({
  text: z.string(),
  filters: z.object({
    category: z.enum(['places', 'hotels', 'tours', 'guides']).optional(),
    city: z.string().optional(),
    minRating: z.number().min(0).max(5).optional(),
    priceRange: z.tuple([z.number(), z.number()]).optional(),
    tags: z.array(z.string()).optional(),
    distance: z.number().optional(),
    languages: z.array(z.string()).optional(),
    duration: z.number().optional(),
    vibe: z.enum(['family', 'romantic', 'nightlife', 'adventure', 'cultural', 'relaxed']).optional(),
  }),
  sortBy: z.enum(['relevance', 'price', 'rating', 'distance']),
});
