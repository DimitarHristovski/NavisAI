import { Coordinates } from "@/types";

export function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function getDistanceKm(from: Coordinates, to: Coordinates): number {
  const earthRadius = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}
