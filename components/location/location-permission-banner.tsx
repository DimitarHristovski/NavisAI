"use client";

import { MapPin, AlertTriangle, CheckCircle2, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LocationPermissionState } from "@/types";

interface Props {
  permission: LocationPermissionState;
  isLocating: boolean;
  onRetry: () => void;
}

export function LocationPermissionBanner({ permission, isLocating, onRetry }: Props) {
  const base = "mb-4 border";

  if (permission === "granted") {
    return (
      <Card className={base}>
        <CardContent className="flex items-center gap-3 py-3">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <p className="text-sm">Location detected. Showing nearby recommendations around you.</p>
        </CardContent>
      </Card>
    );
  }

  if (permission === "requesting" || isLocating) {
    return (
      <Card className={base}>
        <CardContent className="flex items-center gap-3 py-3">
          <LocateFixed className="h-5 w-5 animate-spin text-primary" />
          <p className="text-sm">Requesting location access and finding nearby places...</p>
        </CardContent>
      </Card>
    );
  }

  if (permission === "denied" || permission === "error" || permission === "unsupported") {
    return (
      <Card className={base}>
        <CardContent className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
            <p className="text-sm">Location access is needed for nearby recommendations. You can continue with city-based browsing.</p>
          </div>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <MapPin className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
