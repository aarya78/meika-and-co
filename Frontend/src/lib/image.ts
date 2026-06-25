export function buildSrcSet(url: string, widths: number[] = [480, 800, 1200]) {
  // expects URL to end with .jpg|.jpeg|.png
  const extMatch = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  if (!extMatch) return null;

  const ext = extMatch[1];
  const base = url.replace(new RegExp(`\\.${ext}($|\\?)`), "");

  const webp = widths.map((w) => `${base}-${w}.webp ${w}w`).join(", ");
  const avif = widths.map((w) => `${base}-${w}.avif ${w}w`).join(", ");
  const fallback = widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(", ");

  return { avif, webp, fallback };
}
