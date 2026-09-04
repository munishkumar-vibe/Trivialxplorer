import fs from "fs";
import path from "path";

export function getHikingImages(): string[] {
  const dir = path.join(process.cwd(), "public", "images-hiking");
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp|avif|gif)$/i.test(f))
      .sort()
      .map((f) => `/images-hiking/${f}`);
  } catch {
    return [];
  }
}
