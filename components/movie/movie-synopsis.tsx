"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MovieSynopsisProps {
  overview: string;
}

export function MovieSynopsis({ overview }: MovieSynopsisProps) {
  const [expanded, setExpanded] = useState(false);

  if (!overview) return null;

  // Roughly 300 characters before we collapse
  const isLong = overview.length > 300;

  return (
    <div className="rounded-2xl border border-border/50 bg-card/30 p-6 backdrop-blur-md space-y-4 shadow-md">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-heading font-bold tracking-tight">Synopsis</h3>
        <div className="h-0.5 w-8 rounded-full bg-gradient-to-r from-primary to-primary/0" />
      </div>

      <div className="relative">
        <p
          className={`text-muted-foreground leading-relaxed text-sm md:text-base transition-all duration-300 ${
            !expanded && isLong ? "line-clamp-4" : ""
          }`}
        >
          {overview}
        </p>
        
        {/* Gradient overlay when collapsed */}
        {!expanded && isLong && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card/20 to-transparent pointer-events-none" />
        )}
      </div>

      {isLong && (
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-auto font-semibold text-primary hover:text-primary/80 hover:bg-transparent flex items-center gap-1 mt-2"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              Show Less <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Read More <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
