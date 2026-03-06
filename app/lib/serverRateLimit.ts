import { getAdminDb } from './adminSdk';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetsIn: number;
}

export async function checkServerRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const db = getAdminDb();
  const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
  const docRef = db.collection('rateLimits').doc(safeKey);
  const now = Date.now();

  try {
    const result = await db.runTransaction(async (tx) => {
      const doc = await tx.get(docRef);

      if (!doc.exists) {
        tx.set(docRef, { count: 1, windowStart: now });
        return { count: 1, windowStart: now };
      }

      const data = doc.data()!;
      const windowStart = data.windowStart as number;

      if (now - windowStart > windowMs) {
        tx.set(docRef, { count: 1, windowStart: now });
        return { count: 1, windowStart: now };
      }

      const newCount = (data.count as number) + 1;
      tx.update(docRef, { count: newCount });
      return { count: newCount, windowStart };
    });

    const remaining = Math.max(0, limit - result.count);
    const resetsIn = Math.max(0, windowMs - (now - result.windowStart));

    return { allowed: result.count <= limit, remaining, resetsIn };
  } catch (err) {
    console.error('[serverRateLimit] Firestore error — failing open:', err);
    return { allowed: true, remaining: 1, resetsIn: 0 };
  }
}
