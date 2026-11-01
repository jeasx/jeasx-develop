/**
 * Picks the offered media type which the Accept header prefers (see RFC 9110, section 12.5.1).
 * On equal weights, the order of the offers decides. Returns undefined if nothing is acceptable.
 * Media type parameters other than "q" are ignored for simplicity.
 *
 * @param {string | undefined} accept
 * @param {string[]} offers Media types in the order the server prefers them.
 */
export function negotiate(accept, offers) {
  // No Accept header means that any type is acceptable.
  if (!accept?.trim()) {
    return offers[0];
  }

  const ranges = accept
    .split(",")
    .map((part) => {
      const [range, ...params] = part.split(";").map((value) => value.trim().toLowerCase());
      const q = params.find((param) => param.startsWith("q="));
      return { range, q: q === undefined ? 1 : Number(q.slice(2)) };
    })
    // Number("x") is NaN, which fails the comparisons, so malformed weights are dropped.
    .filter(({ range, q }) => /^[^/\s]+\/[^/\s]+$/.test(range) && q >= 0 && q <= 1);

  let best;
  let bestQ = 0;
  for (const offer of offers) {
    const q = qualityOf(offer, ranges);
    if (q > bestQ) {
      best = offer;
      bestQ = q;
    }
  }
  return best;
}

/**
 * The most specific matching range decides: "text/csv" beats "text/*", which beats "*\/*".
 * So "text/*, text/csv;q=0" accepts every text type except CSV.
 *
 * @param {string} type
 * @param {{ range: string, q: number }[]} ranges
 */
function qualityOf(type, ranges) {
  const group = `${type.split("/")[0]}/*`;
  let specificity = -1;
  let q = 0;
  for (const { range, q: weight } of ranges) {
    const current = range === type ? 2 : range === group ? 1 : range === "*/*" ? 0 : -1;
    if (current > specificity) {
      specificity = current;
      q = weight;
    }
  }
  return q;
}
