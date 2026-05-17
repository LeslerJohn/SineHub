import { NextResponse } from "next/server";
import { getGenres } from "@/lib/tmdb";

export async function GET() {
  try {
    const data = await getGenres();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ genres: [] }, { status: 500 });
  }
}
