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

  // Roughly 200 characters or less means we don't really need a toggle
  const isLong = overview.length > 250;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-heading font-bold">Synopsis</h3>
      <div className="relative">
        <p
          className={`text-muted-foreground leading-relaxed transition-all duration-300 ${
            !expanded && isLong ? "line-clamp-4" : ""
          }`}
        >
          {overview}
        </p>
        
        {/* Gradient overlay when collapsed */}
        {!expanded && isLong && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        )}
      </div>

      {isLong && (
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-auto font-semibold text-primary hover:text-primary/80 hover:bg-transparent"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              Show Less <ChevronUp className="ml-1 h-4 w-4" />
            </>
          ) : (
            <>
              Read More <ChevronDown className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
