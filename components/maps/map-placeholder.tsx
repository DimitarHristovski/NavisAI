import { PlaceLike } from "@/types";

interface Props {
  items: PlaceLike[];
  title?: string;
}

export function MapPlaceholder({ items, title = "Map Preview" }: Props) {
  return (
    <div className="rounded-lg border bg-muted/40 p-4">
      <p className="mb-3 text-sm font-medium">{title}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.slice(0, 6).map((item) => (
          <div key={item.id} className="rounded-md border bg-background p-2 text-xs">
            <p className="truncate font-medium">{item.name}</p>
            <p className="text-muted-foreground">{item.distanceKm.toFixed(1)} km</p>
          </div>
        ))}
      </div>
      {items.length === 0 ? <p className="text-sm text-muted-foreground">No pins to show yet.</p> : null}
    </div>
  );
}
