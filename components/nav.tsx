"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Nav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/search", label: "Search", icon: Search },
    { href: "/nearby", label: "Nearby", icon: Compass },
    { href: "/favorites", label: "Favorites", icon: Heart },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">NAVISAI</span>
        </Link>
        <div className="flex items-center space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <Button variant={isActive ? "default" : "ghost"} className={cn("flex items-center space-x-2")}>
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
