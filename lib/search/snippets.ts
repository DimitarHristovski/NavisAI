import { ScoredItem } from './score';

export function generateMatchSnippet(scoredItem: ScoredItem): string {
  const { item, reasons } = scoredItem;
  
  if (reasons.length > 0) {
    return reasons.slice(0, 2).join(' • ');
  }

  // Fallback snippets based on item type
  if (item.type === 'place') {
    return `Popular ${item.tags[0] || 'attraction'} in ${item.city}`;
  }
  if (item.type === 'hotel') {
    return `${item.rating >= 4.5 ? 'Highly rated' : 'Well-reviewed'} accommodation`;
  }
  if (item.type === 'tour') {
    return `${item.duration}-hour ${item.tags[0] || 'tour'} experience`;
  }
  if (item.type === 'guide') {
    return `Expert ${item.specialties[0] || 'local'} guide`;
  }

  return 'Great match for your search';
}
