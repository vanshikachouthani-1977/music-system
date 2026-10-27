import { NextResponse } from "next/server";
import catalog from "@/data/songs.json";

export async function GET() {
  const songs = catalog.map((song) => {
    const filename = song.s3Key.split("/").pop();
    const coverFilename = song.coverKey.split("/").pop();
    return {
      ...song,
      streamingUrl: `/songs/${filename}`,
      coverUrl: `/covers/${coverFilename}`
    };
  });
  return NextResponse.json(songs);
}
