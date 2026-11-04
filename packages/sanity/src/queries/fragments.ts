/**
 * Shared projection fragments, interpolated into the queries next door. Plain
 * `const` strings so `sanity typegen` can resolve them statically.
 */

export const IMAGE = `{
  alt,
  "asset": asset->{ _id, url, metadata { dimensions { width, height, aspectRatio } } }
}`;
