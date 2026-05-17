"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQueryState } from "nuqs";
import { Search } from "lucide-react";

export function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useQueryState("q");
  
  // Local state for the input field
  const [localQuery, setLocalQuery] = useState(q || "");

  // Sync local state if URL changes externally
  useEffect(() => {
    setLocalQuery(q || "");
  }, [q]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = localQuery.trim();
    
    if (pathname === "/search") {
      // If already on search page, just update the query state
      setQ(trimmed || null);
    } else {
      // If on another page, navigate to search page
      if (trimmed) {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      } else {
        router.push(`/search`);
      }
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative hidden lg:flex items-center">
      <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
      <input
        type="search"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        placeholder="Search movies..."
        className="h-9 w-64 rounded-md border border-input bg-transparent px-8 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    </form>
  );
}
