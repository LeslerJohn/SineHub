import { Film } from "lucide-react";
import { Container } from "@/components/ui/container";

export default function Home() {
  return (
    <Container className="py-24">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <Film className="h-16 w-16 text-primary" />
        <h1 className="text-4xl font-heading font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          All movies. All malls. <br className="hidden sm:inline" />
          <span className="text-primary">One app.</span>
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Discover your next favorite movie and find the best showtimes near you seamlessly.
          <br />
          <span className="text-sm font-semibold">(Discovery Hub Coming Soon)</span>
        </p>
      </div>
    </Container>
  );
}
