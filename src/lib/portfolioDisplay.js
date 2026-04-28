/** Collections that have at least one piece (for profile rails, stats, empty checks). */
export function effectiveCollections(user) {
  const raw = user?.collections;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.filter((c) => (c.pieces?.length ?? c.pieceCount ?? 0) > 0);
  }
  return [];
}

/**
 * Split profile portfolio into:
 * - railCollections: true collections (2+ pieces)
 * - railWorks: single standalone works (from 1-piece collections)
 */
export function splitPortfolioForRails(user) {
  const cols = effectiveCollections(user);
  const railCollections = cols.filter((c) => (c.pieces?.length ?? c.pieceCount ?? 0) > 1);
  const railWorks = cols
    .filter((c) => (c.pieces?.length ?? c.pieceCount ?? 0) === 1)
    .map((c) => c.pieces?.[0])
    .filter(Boolean);
  return { railCollections, railWorks };
}
