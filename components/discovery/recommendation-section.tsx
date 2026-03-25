import { Recommendation } from "@/types";
import { PlaceCard } from "@/components/cards/place-card";

interface Props {
  title: string;
  recommendations: Recommendation[];
}

export function RecommendationSection({ title, recommendations }: Props) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {recommendations.length === 0 ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">No results for this section in selected filters.</div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec) => (
            <PlaceCard key={`${rec.item.type}-${rec.item.id}-${title}`} recommendation={rec} />
          ))}
        </div>
      )}
    </section>
  );
}
