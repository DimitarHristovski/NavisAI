"use client";

import { DiscoveryMode } from "@/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  mode: DiscoveryMode;
  onChange: (mode: DiscoveryMode) => void;
}

export function DiscoveryTabs({ mode, onChange }: Props) {
  return (
    <Tabs value={mode} onValueChange={(v) => onChange(v as DiscoveryMode)}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="popular_nearby">Popular Nearby</TabsTrigger>
        <TabsTrigger value="crowded_now">Crowded Now</TabsTrigger>
        <TabsTrigger value="quiet_gems">Quiet Gems</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
