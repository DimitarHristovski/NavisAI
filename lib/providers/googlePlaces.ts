import { PlacesProvider } from "@/lib/providers/provider";
import { getDistanceKm } from "@/lib/utils/distance";
import { AppCategory, Hotel, PlaceLike, RadiusKm } from "@/types";

type OverpassElement = {
  id: number;
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type WikipediaGeo = {
  title: string;
  dist: number;
  pageid: number;
};

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const WIKI_GEO_URL = "https://en.wikipedia.org/w/api.php";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800";

const typeRank: Record<string, number> = {
  attraction: 85,
  museum: 80,
  landmark: 82,
  park: 62,
  restaurant: 70,
  cafe: 58,
  nightlife: 78,
  hotel: 68,
};

const cacheByArea = new Map<string, PlaceLike[]>();

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
}

function pickLatLng(el: OverpassElement): { lat: number; lng: number } | null {
  if (typeof el.lat === "number" && typeof el.lon === "number") {
    return { lat: el.lat, lng: el.lon };
  }
  if (el.center && typeof el.center.lat === "number" && typeof el.center.lon === "number") {
    return { lat: el.center.lat, lng: el.center.lon };
  }
  return null;
}

function inferCategories(tags: Record<string, string>): string[] {
  const categories: string[] = [];
  const tourism = tags.tourism;
  const amenity = tags.amenity;
  const leisure = tags.leisure;

  if (tourism === "hotel") categories.push("hotel");
  if (tourism === "attraction") categories.push("attraction");
  if (tourism === "museum") categories.push("museum");
  if (tourism === "viewpoint") categories.push("scenic");

  if (amenity === "restaurant") categories.push("restaurant");
  if (amenity === "cafe") categories.push("cafe");
  if (amenity === "bar" || amenity === "nightclub") categories.push("nightlife");

  if (leisure === "park") categories.push("park", "relaxed", "quiet");

  if (tags.historic) categories.push("historical", "landmark", "culture");
  if (tags.wikidata || tags.wikipedia) categories.push("known");
  if (categories.length === 0) categories.push("attraction");

  return Array.from(new Set(categories));
}

function inferPriceLevel(tags: Record<string, string>): 1 | 2 | 3 | 4 {
  const text = `${tags.price_range ?? ""} ${tags.stars ?? ""} ${tags.tourism ?? ""}`.toLowerCase();
  if (text.includes("$$$$") || text.includes("5")) return 4;
  if (text.includes("$$$") || text.includes("4")) return 3;
  if (text.includes("$$") || text.includes("3")) return 2;
  return 1;
}

function categoryBaseScore(categories: string[]): number {
  for (const c of categories) {
    if (typeRank[c]) return typeRank[c];
  }
  return 55;
}

function crowdedBoost(categories: string[]): number {
  if (categories.includes("nightlife")) return 22;
  if (categories.includes("restaurant") || categories.includes("cafe")) return 16;
  if (categories.includes("attraction") || categories.includes("landmark")) return 12;
  return 4;
}

async function fetchWikipediaGeo(lat: number, lng: number, radiusKm: RadiusKm): Promise<WikipediaGeo[]> {
  const radiusM = Math.max(1000, Math.min(25000, radiusKm * 1000));
  const params = new URLSearchParams({
    action: "query",
    list: "geosearch",
    gscoord: `${lat}|${lng}`,
    gsradius: String(radiusM),
    gslimit: "50",
    format: "json",
    origin: "*",
  });

  const response = await fetch(`${WIKI_GEO_URL}?${params.toString()}`);
  if (!response.ok) return [];
  const json = (await response.json()) as {
    query?: { geosearch?: Array<{ title: string; dist: number; pageid: number }> };
  };
  return json.query?.geosearch ?? [];
}

function findWikiMatch(name: string, wikiItems: WikipediaGeo[]): WikipediaGeo | null {
  const normalized = normalizeName(name);
  for (const w of wikiItems) {
    const wn = normalizeName(w.title);
    if (normalized.includes(wn) || wn.includes(normalized)) return w;
  }
  return null;
}

async function fetchOverpass(lat: number, lng: number, radiusKm: RadiusKm): Promise<OverpassElement[]> {
  const radiusM = Math.max(1000, Math.min(25000, radiusKm * 1000));
  const query = `
[out:json][timeout:25];
(
  node(around:${radiusM},${lat},${lng})["tourism"~"attraction|museum|hotel|viewpoint"];
  way(around:${radiusM},${lat},${lng})["tourism"~"attraction|museum|hotel|viewpoint"];
  relation(around:${radiusM},${lat},${lng})["tourism"~"attraction|museum|hotel|viewpoint"];

  node(around:${radiusM},${lat},${lng})["amenity"~"restaurant|cafe|bar|nightclub"];
  way(around:${radiusM},${lat},${lng})["amenity"~"restaurant|cafe|bar|nightclub"];
  relation(around:${radiusM},${lat},${lng})["amenity"~"restaurant|cafe|bar|nightclub"];

  node(around:${radiusM},${lat},${lng})["leisure"="park"];
  way(around:${radiusM},${lat},${lng})["leisure"="park"];
);
out center 250;
`;

  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    body: query,
    headers: { "Content-Type": "text/plain" },
  });

  if (!response.ok) {
    throw new Error("Failed to retrieve nearby places from Overpass");
  }

  const json = (await response.json()) as { elements?: OverpassElement[] };
  return json.elements ?? [];
}

function mapToPlaceLike(
  elements: OverpassElement[],
  lat: number,
  lng: number,
  wikiItems: WikipediaGeo[]
): PlaceLike[] {
  const seen = new Set<string>();
  const mapped: PlaceLike[] = [];

  for (const el of elements) {
    const tags = el.tags ?? {};
    const name = tags.name?.trim();
    if (!name) continue;

    const point = pickLatLng(el);
    if (!point) continue;

    const key = `${normalizeName(name)}-${Math.round(point.lat * 1000)}-${Math.round(point.lng * 1000)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const categories = inferCategories(tags);
    const distanceKm = getDistanceKm({ lat, lng }, point);
    const wikiMatch = findWikiMatch(name, wikiItems);

    const basePopularity = categoryBaseScore(categories);
    const popularityScore = Math.min(
      99,
      Math.round(
        basePopularity +
          (tags.wikidata || tags.wikipedia ? 12 : 0) +
          (wikiMatch ? Math.max(6, 20 - Math.floor(wikiMatch.dist / 500)) : 0)
      )
    );

    const inferredReviewCount = Math.max(50, Math.round(popularityScore * 90 + (wikiMatch ? 2500 : 0)));
    const inferredRating = Number((3.8 + popularityScore / 80).toFixed(1));
    const crowdedScore = Math.min(
      99,
      Math.round(crowdedBoost(categories) + popularityScore * 0.65 + Math.max(0, 18 - distanceKm * 1.3))
    );

    const city = tags["addr:city"] ?? "Nearby";
    const country = tags["addr:country"] ?? "Unknown";
    const addressParts = [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean);
    const address = addressParts.length > 0 ? addressParts.join(" ") : tags["addr:full"] ?? `${city}`;

    const isHotel = categories.includes("hotel");
    mapped.push({
      id: `${isHotel ? "h" : "p"}-${el.type}-${el.id}`,
      type: isHotel ? "hotel" : "place",
      name,
      lat: point.lat,
      lng: point.lng,
      address,
      city,
      country,
      rating: Math.min(5, inferredRating),
      reviewCount: inferredReviewCount,
      priceLevel: inferPriceLevel(tags),
      categories,
      description: wikiMatch
        ? `Referenced on Wikipedia as "${wikiMatch.title}". Popular nearby destination.`
        : "Discovered from live OpenStreetMap nearby search.",
      image: FALLBACK_IMAGE,
      source: "OpenStreetMap + Wikipedia",
      popularityScore,
      crowdedScore,
      distanceKm,
    });
  }

  return mapped;
}

function byCategory(items: PlaceLike[], category: AppCategory): PlaceLike[] {
  if (category === "all") return items;
  if (category === "hotels") return items.filter((item) => item.type === "hotel");
  if (category === "attractions") {
    return items.filter((item) => item.categories.some((c) => ["attraction", "museum", "park", "landmark"].includes(c)));
  }
  if (category === "restaurants") return items.filter((item) => item.categories.includes("restaurant"));
  if (category === "cafes") return items.filter((item) => item.categories.includes("cafe"));
  if (category === "nightlife") return items.filter((item) => item.categories.includes("nightlife"));
  return items;
}

function inRadius(items: PlaceLike[], radiusKm: RadiusKm): PlaceLike[] {
  return items.filter((item) => item.distanceKm <= radiusKm);
}

async function getLiveItems(lat: number, lng: number, radiusKm: RadiusKm): Promise<PlaceLike[]> {
  const key = `${lat.toFixed(3)}-${lng.toFixed(3)}-${radiusKm}`;
  if (cacheByArea.has(key)) return cacheByArea.get(key) ?? [];

  const [overpassItems, wikiItems] = await Promise.allSettled([
    fetchOverpass(lat, lng, radiusKm),
    fetchWikipediaGeo(lat, lng, radiusKm),
  ]);

  const osm = overpassItems.status === "fulfilled" ? overpassItems.value : [];
  const wiki = wikiItems.status === "fulfilled" ? wikiItems.value : [];
  const mapped = mapToPlaceLike(osm, lat, lng, wiki);

  cacheByArea.set(key, mapped);
  return mapped;
}

export const googlePlacesProvider: PlacesProvider = {
  async searchNearbyPlaces(lat, lng, radiusKm, category) {
    const all = await getLiveItems(lat, lng, radiusKm);
    return byCategory(inRadius(all, radiusKm), category);
  },

  async getRecommendedHotels(lat, lng, radiusKm) {
    const all = await getLiveItems(lat, lng, radiusKm);
    return all
      .filter((item): item is Hotel => item.type === "hotel")
      .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount);
  },

  async getPopularPlaces(lat, lng, radiusKm) {
    const all = await getLiveItems(lat, lng, radiusKm);
    return inRadius(all, radiusKm).sort(
      (a, b) => b.popularityScore + b.reviewCount / 1000 - (a.popularityScore + a.reviewCount / 1000)
    );
  },

  async getCrowdedPlaces(lat, lng, radiusKm) {
    const all = await getLiveItems(lat, lng, radiusKm);
    return inRadius(all, radiusKm).sort((a, b) => b.crowdedScore - a.crowdedScore);
  },

  async getQuietPlaces(lat, lng, radiusKm) {
    const all = await getLiveItems(lat, lng, radiusKm);
    return inRadius(all, radiusKm)
      .filter((item) => item.rating >= 4.2 && item.popularityScore <= 78)
      .sort((a, b) => b.rating - a.rating || a.popularityScore - b.popularityScore);
  },
};
