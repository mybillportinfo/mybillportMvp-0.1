import { PROVIDER_REGISTRY } from './providerRegistry';

function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenOverlap(a: string, b: string): number {
  const tokensA = normalize(a).split(' ');
  const tokensB = normalize(b).split(' ');
  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  let matches = 0;
  for (const ta of tokensA) {
    for (const tb of tokensB) {
      if (ta === tb || ta.includes(tb) || tb.includes(ta)) {
        matches++;
        break;
      }
    }
  }
  return matches / Math.max(tokensA.length, tokensB.length);
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export interface FuzzyMatchResult {
  providerId: string;
  providerName: string;
  category: string;
  types: string[];
  score: number;
}

export function fuzzyMatchProvider(vendorName: string): FuzzyMatchResult | null {
  if (!vendorName || vendorName.trim().length === 0) return null;

  const normalizedVendor = normalize(vendorName);
  let bestMatch: FuzzyMatchResult | null = null;
  let bestScore = 0;

  for (const [id, entry] of Object.entries(PROVIDER_REGISTRY)) {
    const normalizedProvider = normalize(entry.name);

    if (normalizedVendor === normalizedProvider) {
      return { providerId: id, providerName: entry.name, category: entry.category, types: entry.types, score: 1.0 };
    }

    if (normalizedVendor.includes(normalizedProvider) || normalizedProvider.includes(normalizedVendor)) {
      const score = 0.9;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { providerId: id, providerName: entry.name, category: entry.category, types: entry.types, score };
      }
      continue;
    }

    const overlap = tokenOverlap(vendorName, entry.name);
    const maxLen = Math.max(normalizedVendor.length, normalizedProvider.length);
    const dist = levenshtein(normalizedVendor, normalizedProvider);
    const levenScore = maxLen > 0 ? 1 - dist / maxLen : 0;

    const combined = overlap * 0.6 + levenScore * 0.4;

    if (combined > bestScore && combined >= 0.4) {
      bestScore = combined;
      bestMatch = { providerId: id, providerName: entry.name, category: entry.category, types: entry.types, score: combined };
    }
  }

  return bestMatch;
}

export function getCategoryFromProvider(providerId: string): { category: string; subcategory: string } | null {
  const entry = PROVIDER_REGISTRY[providerId];
  if (!entry) return null;
  return { category: entry.category, subcategory: entry.types[0] || '' };
}
