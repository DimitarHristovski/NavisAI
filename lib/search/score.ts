import { Item, SearchFilters, BudgetLevel, Vibe } from '@/types';
import { calculateDistance, itemTypeToCategory } from '@/lib/utils';
import { ParsedQuery } from './parseQuery';

export interface ScoredItem {
  item: Item;
  score: number;
  reasons: string[];
}

function getPriceValue(price: number | { min: number; max: number }): number {
  if (typeof price === 'number') return price;
  return (price.min + price.max) / 2;
}

function matchesBudget(item: Item, budget?: BudgetLevel): boolean {
  if (!budget) return true;
  const price = getPriceValue(item.price);
  
  if (budget === 'cheap') return price < 50;
  if (budget === 'mid') return price >= 50 && price < 150;
  if (budget === 'luxury') return price >= 150;
  
  return true;
}

function getVibeFromTags(tags: string[]): Vibe | null {
  const vibeMap: Record<string, Vibe> = {
    family: 'family',
    romantic: 'romantic',
    nightlife: 'nightlife',
    adventure: 'adventure',
    cultural: 'cultural',
    relaxed: 'relaxed',
  };
  
  for (const tag of tags) {
    if (vibeMap[tag]) return vibeMap[tag];
  }
  return null;
}

function fuzzyMatch(text: string, query: string): number {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  if (lowerText.includes(lowerQuery)) return 1.0;
  
  const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2);
  if (queryWords.length === 0) return 0;
  
  let matches = 0;
  for (const word of queryWords) {
    if (lowerText.includes(word)) matches++;
  }
  
  return matches / queryWords.length;
}

export function scoreItems(
  items: Item[],
  parsedQuery: ParsedQuery,
  filters: SearchFilters,
  userLocation: { lat: number; lng: number } | null
): ScoredItem[] {
  const scored: ScoredItem[] = [];

  for (const item of items) {
    let score = 0;
    const reasons: string[] = [];

    // Text matching (name, description, tags)
    const searchableText = `${item.name} ${item.description} ${item.tags.join(' ')}`;
    const textScore = fuzzyMatch(searchableText, parsedQuery.text);
    score += textScore * 0.4;
    if (textScore > 0.5) {
      reasons.push('Matches your search');
    }

    // Rating boost
    const ratingBoost = (item.rating - 3) * 0.1;
    score += ratingBoost;
    if (item.rating >= 4.5) {
      reasons.push('Highly rated');
    }

    // Budget matching
    if (parsedQuery.constraints.budget) {
      if (matchesBudget(item, parsedQuery.constraints.budget)) {
        score += 0.2;
        reasons.push(`Fits ${parsedQuery.constraints.budget} budget`);
      } else {
        score -= 0.3;
      }
    }

    // Vibe matching
    if (parsedQuery.constraints.vibe) {
      const itemVibe = getVibeFromTags(item.tags);
      if (itemVibe === parsedQuery.constraints.vibe) {
        score += 0.3;
        reasons.push(`Perfect for ${parsedQuery.constraints.vibe} travelers`);
      }
    }

    // City filter
    if (filters.city && item.city.toLowerCase() !== filters.city.toLowerCase()) {
      continue; // Skip if city doesn't match
    }
    if (parsedQuery.constraints.city && item.city.toLowerCase() !== parsedQuery.constraints.city.toLowerCase()) {
      continue;
    }

    // Category filter
    if (filters.category && itemTypeToCategory(item.type) !== filters.category) {
      continue;
    }

    // Rating filter
    if (filters.minRating && item.rating < filters.minRating) {
      continue;
    }

    // Price range filter
    if (filters.priceRange) {
      const price = getPriceValue(item.price);
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        continue;
      }
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasTag = filters.tags.some(tag => item.tags.includes(tag));
      if (!hasTag) continue;
    }

    // Distance scoring
    let distance: number | null = null;
    if (userLocation) {
      distance = calculateDistance(userLocation.lat, userLocation.lng, item.lat, item.lng);
      if (filters.distance && distance > filters.distance) {
        continue;
      }
      // Boost for closer items
      const distanceScore = Math.max(0, 0.2 * (1 - distance / 50)); // Max boost at 0km, decays to 0 at 50km
      score += distanceScore;
      if (distance < 5) {
        reasons.push('Very close to you');
      }
    }

    // Language filter (for guides and tours)
    if (filters.languages && filters.languages.length > 0) {
      if (item.type === 'guide' || item.type === 'tour') {
        const itemLanguages = item.type === 'guide' 
          ? item.languages 
          : item.languages;
        const hasLanguage = filters.languages.some(lang => 
          itemLanguages.some(il => il.toLowerCase().includes(lang.toLowerCase()))
        );
        if (!hasLanguage) continue;
      }
    }

    // Duration filter (for tours)
    if (filters.duration && item.type === 'tour') {
      if (Math.abs(item.duration - filters.duration) > 2) {
        continue;
      }
      if (Math.abs(item.duration - filters.duration) <= 1) {
        score += 0.1;
        reasons.push('Perfect duration');
      }
    }

    // Tag boost
    const tagMatches = item.tags.filter(tag => 
      parsedQuery.text.toLowerCase().includes(tag.toLowerCase())
    ).length;
    score += tagMatches * 0.05;

    scored.push({
      item,
      score: Math.max(0, score),
      reasons: reasons.length > 0 ? reasons : ['Recommended'],
    });
  }

  return scored;
}

export function sortScoredItems(
  scored: ScoredItem[],
  sortBy: 'relevance' | 'price' | 'rating' | 'distance',
  userLocation: { lat: number; lng: number } | null
): ScoredItem[] {
  const sorted = [...scored];

  if (sortBy === 'relevance') {
    sorted.sort((a, b) => b.score - a.score);
  } else if (sortBy === 'price') {
    sorted.sort((a, b) => {
      const priceA = getPriceValue(a.item.price);
      const priceB = getPriceValue(b.item.price);
      return priceA - priceB;
    });
  } else if (sortBy === 'rating') {
    sorted.sort((a, b) => b.item.rating - a.item.rating);
  } else if (sortBy === 'distance' && userLocation) {
    sorted.sort((a, b) => {
      const distA = calculateDistance(userLocation.lat, userLocation.lng, a.item.lat, a.item.lng);
      const distB = calculateDistance(userLocation.lat, userLocation.lng, b.item.lat, b.item.lng);
      return distA - distB;
    });
  }

  return sorted;
}
