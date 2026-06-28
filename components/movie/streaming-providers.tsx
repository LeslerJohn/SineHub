import { Tv } from "lucide-react";
import { TMDBWatchProviderRegion, TMDBWatchProvider } from "@/types/tmdb";
import { getTMDBImageUrl } from "@/lib/tmdb";

interface StreamingProvidersProps {
  providers: TMDBWatchProviderRegion | null;
}

function ProviderLogo({ provider }: { provider: TMDBWatchProvider }) {
  return (
    <div className="group/provider relative" title={provider.provider_name}>
      <img
        src={getTMDBImageUrl(provider.logo_path, "w92")}
        alt={provider.provider_name}
        width={40}
        height={40}
        className="rounded-lg shadow-md border border-border/30 transition-transform duration-200 group-hover/provider:scale-110"
      />
      <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-muted-foreground bg-popover/90 backdrop-blur-sm px-1.5 py-0.5 rounded border border-border/30 opacity-0 group-hover/provider:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
        {provider.provider_name}
      </span>
    </div>
  );
}

export function StreamingProviders({ providers }: StreamingProvidersProps) {
  if (!providers) return null;

  const allProviders: TMDBWatchProvider[] = [];
  const seenIds = new Set<number>();

  const categories: (keyof TMDBWatchProviderRegion)[] = ["flatrate", "free", "ads", "rent", "buy"];

  for (const category of categories) {
    const list = providers[category];
    if (Array.isArray(list)) {
      for (const p of list) {
        if (!seenIds.has(p.provider_id)) {
          seenIds.add(p.provider_id);
          allProviders.push(p);
        }
      }
    }
  }

  if (allProviders.length === 0) return null;

  const streamingProviders = providers.flatrate || providers.free || providers.ads || [];
  const purchaseProviders = [...(providers.rent || []), ...(providers.buy || [])];
  const seenPurchaseIds = new Set<number>();
  const uniquePurchase = purchaseProviders.filter((p) => {
    if (seenPurchaseIds.has(p.provider_id)) return false;
    if (streamingProviders.some((s) => s.provider_id === p.provider_id)) return false;
    seenPurchaseIds.add(p.provider_id);
    return true;
  });

  return (
    <div className="rounded-2xl border border-border/50 bg-card/30 p-6 backdrop-blur-md shadow-md space-y-5">
      <div className="flex items-center gap-2 border-b pb-4 border-border/40">
        <Tv className="h-5 w-5 text-primary" />
        <h3 className="font-heading font-bold text-lg">Available In</h3>
      </div>

      {streamingProviders.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Stream
          </span>
          <div className="flex flex-wrap gap-3 pb-2">
            {streamingProviders.map((provider) => (
              <ProviderLogo key={provider.provider_id} provider={provider} />
            ))}
          </div>
        </div>
      )}

      {uniquePurchase.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Rent / Buy
          </span>
          <div className="flex flex-wrap gap-3 pb-2">
            {uniquePurchase.map((provider) => (
              <ProviderLogo key={provider.provider_id} provider={provider} />
            ))}
          </div>
        </div>
      )}

      {providers.link && (
        <a
          href={providers.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors pt-1"
        >
          Powered by JustWatch
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      )}
    </div>
  );
}
