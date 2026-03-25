"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

export function useGeolocation(autoRequest = true) {
  const requestedRef = useRef(false);
  const [isLocating, setIsLocating] = useState(false);
  const {
    userCoordinates,
    locationPermission,
    setCoordinates,
    setLocationPermission,
  } = useAppStore();

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationPermission("unsupported");
      return;
    }

    setLocationPermission("requesting");
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationPermission("granted");
        setIsLocating(false);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationPermission("denied");
        } else {
          setLocationPermission("error");
        }
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (!autoRequest || requestedRef.current) return;
    requestedRef.current = true;
    requestLocation();
  }, [autoRequest]);

  return {
    coordinates: userCoordinates,
    permission: locationPermission,
    isLocating,
    requestLocation,
  };
}
