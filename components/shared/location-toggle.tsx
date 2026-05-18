"use client";

import { useEffect } from "react";
import { MapPin } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocationStore } from "@/hooks/use-location-store";

const CITIES = [
  { value: "Zamboanga City", label: "Zamboanga City" },
  { value: "Pagadian City", label: "Pagadian City" },
  { value: "Cebu City", label: "Cebu City" },
  { value: "Makati City", label: "Makati City" },
  { value: "Metro Manila", label: "Metro Manila" },
];

export function LocationToggle() {
  const { location, setLocation, isHydrated, setHydrated } = useLocationStore();

  useEffect(() => {
    // On mount, check if there's a saved location in localStorage or cookie
    const savedLoc = localStorage.getItem("sinehub_location");
    if (savedLoc && CITIES.some(c => c.value === savedLoc)) {
      useLocationStore.setState({ location: savedLoc });
    }
    setHydrated(true);
  }, [setHydrated]);

  if (!isHydrated) {
    return (
      <div className="flex items-center gap-2 h-9 px-3 border border-input rounded-md text-sm text-muted-foreground opacity-50" aria-label="Loading location">
        <MapPin className="h-4 w-4" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <Select value={location} onValueChange={(val) => { if (val) setLocation(val); }}>
      <SelectTrigger className="w-[180px] h-9 hidden lg:flex gap-2" aria-label="Select City">
        <MapPin className="h-4 w-4" />
        <SelectValue placeholder="Select City" />
      </SelectTrigger>
      <SelectContent>
        {CITIES.map((city) => (
          <SelectItem key={city.value} value={city.value}>
            {city.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
