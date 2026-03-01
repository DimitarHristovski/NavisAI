# NavisAI - Travel Aggregator UI

A frontend-only AI-powered travel aggregator built with Next.js, TypeScript, TailwindCSS, and shadcn/ui.

## Features

- 🔍 Smart search with client-side RAG-like logic
- 🏛️ Browse Places, Hotels, Tours, and Local Guides
- ⭐ Favorites with localStorage persistence
- 📅 Itinerary generator with day-by-day planning
- 🎨 Modern, responsive UI with shadcn/ui components

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **TailwindCSS**
- **shadcn/ui** components
- **Zustand** for state management
- **Zod** for validation
- **Fuse.js** for fuzzy search

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /(marketing)     # Landing page
  /search          # Search results
  /places/[id]     # Place details
  /hotels/[id]     # Hotel details
  /tours/[id]      # Tour details
  /guides/[id]     # Guide details
  /favorites       # Saved favorites
  /itinerary       # Itinerary generator
/components        # Reusable components
/data              # Mock data
/lib               # Utilities and search logic
/store             # Zustand stores
/types             # TypeScript types
```

## Notes

- All data is mock data stored locally
- No backend, database, or external APIs required
- Search uses client-side fuzzy matching and scoring
- Favorites persist in localStorage
- Itinerary generation uses rule-based logic
