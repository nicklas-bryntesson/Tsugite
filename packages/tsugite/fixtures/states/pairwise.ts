// Pairwise cover: the fewest rows, picked from a set of valid rows, such that every pair of
// axis values that can meet at all meets in at least one of them. CSS couples two axes
// through a selector that names both, so a pair that renders correctly in some row renders
// correctly in every row; the full product repeats each pair hundreds of times.
//
// The candidates are the full product, constraints already applied — a pair that no valid
// row holds is not owed. Greedy: take the candidate covering the most uncovered pairs, ties
// to the earliest, so the cover is the same on every build.

export type Row = Record<string, string>;

const pairsOf = (row: Row): string[] => {
  const cells = Object.entries(row).map(([axis, value]) => `${axis}=${value}`);
  const out: string[] = [];
  for (let i = 0; i < cells.length; i++)
    for (let j = i + 1; j < cells.length; j++) out.push(`${cells[i]}&${cells[j]}`);
  return out;
};

/** Every pair the candidates hold — what a cover owes. */
export const pairsIn = (rows: Row[]): Set<string> => new Set(rows.flatMap(pairsOf));

export function pairwise(candidates: Row[]): Row[] {
  const uncovered = pairsIn(candidates);
  const pairs = candidates.map(pairsOf);
  const cover: Row[] = [];
  while (uncovered.size > 0) {
    let best = -1;
    let bestGain = 0;
    pairs.forEach((p, i) => {
      const gain = p.filter((pair) => uncovered.has(pair)).length;
      if (gain > bestGain) [best, bestGain] = [i, gain];
    });
    cover.push(candidates[best]);
    for (const pair of pairs[best]) uncovered.delete(pair);
  }
  return cover;
}
