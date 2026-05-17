import { NextRequest, NextResponse } from "next/server";
import { searchMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ results: [], page: 1, total_pages: 0, total_results: 0 });
  try {
    const data = await searchMovies(q);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ results: [], page: 1, total_pages: 0, total_results: 0 }, { status: 500 });
  }
}
