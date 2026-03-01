import { SearchFilters, BudgetLevel, Vibe } from '@/types';

export interface ParsedQuery {
  text: string;
  constraints: {
    budget?: BudgetLevel;
    vibe?: Vibe;
    city?: string;
    duration?: number;
    languages?: string[];
  };
}

const budgetKeywords: Record<string, BudgetLevel> = {
  cheap: 'cheap',
  budget: 'cheap',
  affordable: 'cheap',
  inexpensive: 'cheap',
  mid: 'mid',
  moderate: 'mid',
  medium: 'mid',
  luxury: 'luxury',
  luxurious: 'luxury',
  expensive: 'luxury',
  premium: 'luxury',
};

const vibeKeywords: Record<string, Vibe> = {
  family: 'family',
  families: 'family',
  kids: 'family',
  children: 'family',
  romantic: 'romantic',
  romance: 'romantic',
  couple: 'romantic',
  nightlife: 'nightlife',
  night: 'nightlife',
  party: 'nightlife',
  club: 'nightlife',
  adventure: 'adventure',
  adventurous: 'adventure',
  cultural: 'cultural',
  culture: 'cultural',
  relaxed: 'relaxed',
  relaxing: 'relaxed',
  chill: 'relaxed',
};

const cityNames = ['berlin', 'hannover', 'ohrid'];

const durationPattern = /(\d+)\s*(hour|hours|hr|hrs|h)/i;

export function parseQuery(query: string): ParsedQuery {
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(/\s+/);

  const constraints: ParsedQuery['constraints'] = {};

  // Extract budget
  for (const [keyword, level] of Object.entries(budgetKeywords)) {
    if (lowerQuery.includes(keyword)) {
      constraints.budget = level;
      break;
    }
  }

  // Extract vibe
  for (const [keyword, vibe] of Object.entries(vibeKeywords)) {
    if (lowerQuery.includes(keyword)) {
      constraints.vibe = vibe;
      break;
    }
  }

  // Extract city
  for (const city of cityNames) {
    if (lowerQuery.includes(city)) {
      constraints.city = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }

  // Extract duration
  const durationMatch = lowerQuery.match(durationPattern);
  if (durationMatch) {
    constraints.duration = parseInt(durationMatch[1], 10);
  }

  // Extract languages (simple pattern)
  const languageKeywords = ['english', 'german', 'spanish', 'french', 'macedonian', 'albanian'];
  const foundLanguages: string[] = [];
  for (const lang of languageKeywords) {
    if (lowerQuery.includes(lang)) {
      foundLanguages.push(lang.charAt(0).toUpperCase() + lang.slice(1));
    }
  }
  if (foundLanguages.length > 0) {
    constraints.languages = foundLanguages;
  }

  // Clean text (remove constraint keywords for better matching)
  let cleanText = query;
  Object.keys(budgetKeywords).forEach((kw) => {
    cleanText = cleanText.replace(new RegExp(kw, 'gi'), '');
  });
  Object.keys(vibeKeywords).forEach((kw) => {
    cleanText = cleanText.replace(new RegExp(kw, 'gi'), '');
  });
  cityNames.forEach((city) => {
    cleanText = cleanText.replace(new RegExp(city, 'gi'), '');
  });
  cleanText = cleanText.replace(durationPattern, '');
  languageKeywords.forEach((lang) => {
    cleanText = cleanText.replace(new RegExp(lang, 'gi'), '');
  });
  cleanText = cleanText.trim().replace(/\s+/g, ' ');

  return {
    text: cleanText || query,
    constraints,
  };
}
