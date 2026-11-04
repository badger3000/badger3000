import { imageUrl } from "@badger3000/sanity";

/**
 * A square Sanity image for a fixed slot (a logo, an avatar): cropped on the
 * CDN to `size` CSS px, with a 2x variant, so a 44px slot no longer downloads
 * the original upload. `imageUrl` only sets the width; the height and crop are
 * added here because these slots are always square.
 */
export function thumb(
  assetUrl: string | null | undefined,
  size: number,
): { src: string; srcset: string } | undefined {
  const at = (scale: number) => {
    const url = imageUrl(assetUrl, { width: size * scale });
    if (!url) return undefined;
    const square = new URL(url);
    square.searchParams.set("h", String(size * scale));
    square.searchParams.set("fit", "crop");
    return square.toString();
  };
  const src = at(1);
  const double = at(2);
  return src && double ? { src, srcset: `${src} 1x, ${double} 2x` } : undefined;
}
