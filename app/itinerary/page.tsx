import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ItineraryPage() {
  return (
    <main className="container mx-auto space-y-4 px-4 py-6">
      <h1 className="text-2xl font-bold">Itinerary</h1>
      <p className="text-sm text-muted-foreground">Itinerary planning is coming soon. Explore nearby recommendations for now.</p>
      <Link href="/nearby">
        <Button>Go to Nearby Discovery</Button>
      </Link>
    </main>
  );
}
