import type { Bill } from './firebase';

export interface SpikeInfo {
  type: 'increase' | 'decrease' | null;
  percent: number;
  comparedTo: 'previous' | 'average';
}

export interface AnnualProjection {
  billerName: string;
  category?: string;
  monthlyAvg: number;
  annualEstimate: number;
  billCount: number;
  trend: 'rising' | 'falling' | 'stable';
  trendPercent: number;
}

export interface SavingsScore {
  score: number;
  label: 'Optimized' | 'Good' | 'Moderate' | 'Needs Attention';
  color: string;
  factors: { label: string; impact: 'positive' | 'negative' | 'neutral'; detail: string }[];
}

export function detectSpike(bill: Bill, allBills: Bill[]): SpikeInfo {
  const sameBiller = allBills
    .filter(b => b.companyName.toLowerCase() === bill.companyName.toLowerCase() && b.id !== bill.id)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  if (sameBiller.length === 0) return { type: null, percent: 0, comparedTo: 'previous' };

  const last3 = sameBiller.slice(-3);
  const avg = last3.reduce((s, b) => s + b.totalAmount, 0) / last3.length;

  if (avg === 0) return { type: null, percent: 0, comparedTo: 'average' };

  const pctChange = ((bill.totalAmount - avg) / avg) * 100;

  if (Math.abs(pctChange) >= 20) {
    return {
      type: pctChange > 0 ? 'increase' : 'decrease',
      percent: Math.round(Math.abs(pctChange)),
      comparedTo: sameBiller.length >= 3 ? 'average' : 'previous',
    };
  }

  return { type: null, percent: 0, comparedTo: 'average' };
}

export function calculateAnnualProjections(bills: Bill[]): { perBiller: AnnualProjection[]; totalAnnual: number } {
  const grouped = new Map<string, Bill[]>();

  for (const bill of bills) {
    const key = bill.companyName.toLowerCase().trim();
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(bill);
  }

  const projections: AnnualProjection[] = [];

  for (const [, group] of grouped) {
    const sorted = [...group].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    const amounts = sorted.map(b => b.totalAmount);
    const last3 = amounts.slice(-3);
    const monthlyAvg = last3.reduce((s, v) => s + v, 0) / last3.length;

    let multiplier = 12;
    const bill = sorted[sorted.length - 1];
    if (bill.billingCycle === 'biweekly') multiplier = 26;
    else if (bill.billingCycle === 'annual') multiplier = 1;
    else if (bill.recurringFrequency === 'quarterly') multiplier = 4;
    else if (bill.recurringFrequency === 'yearly') multiplier = 1;

    let trend: 'rising' | 'falling' | 'stable' = 'stable';
    let trendPercent = 0;
    if (amounts.length >= 2) {
      const firstHalf = amounts.slice(0, Math.ceil(amounts.length / 2));
      const secondHalf = amounts.slice(Math.ceil(amounts.length / 2));
      const firstAvg = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length;
      trendPercent = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
      if (trendPercent > 5) trend = 'rising';
      else if (trendPercent < -5) trend = 'falling';
    }

    projections.push({
      billerName: sorted[sorted.length - 1].companyName,
      category: sorted[sorted.length - 1].category,
      monthlyAvg: Math.round(monthlyAvg * 100) / 100,
      annualEstimate: Math.round(monthlyAvg * multiplier * 100) / 100,
      billCount: sorted.length,
      trend,
      trendPercent: Math.round(trendPercent),
    });
  }

  projections.sort((a, b) => b.annualEstimate - a.annualEstimate);
  const totalAnnual = projections.reduce((s, p) => s + p.annualEstimate, 0);

  return { perBiller: projections, totalAnnual: Math.round(totalAnnual * 100) / 100 };
}

export function calculateSavingsScore(bills: Bill[]): SavingsScore {
  if (bills.length === 0) {
    return { score: 50, label: 'Moderate', color: 'text-yellow-500', factors: [{ label: 'No bills', impact: 'neutral', detail: 'Add bills to get a personalized score.' }] };
  }

  let score = 75;
  const factors: SavingsScore['factors'] = [];

  const grouped = new Map<string, Bill[]>();
  for (const bill of bills) {
    const key = bill.companyName.toLowerCase().trim();
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(bill);
  }

  let totalSpikes = 0;
  for (const [, group] of grouped) {
    if (group.length < 2) continue;
    const amounts = group.map(b => b.totalAmount);
    const avg = amounts.reduce((s, v) => s + v, 0) / amounts.length;
    for (const amt of amounts) {
      if (Math.abs(amt - avg) > avg * 0.2) totalSpikes++;
    }
  }

  if (totalSpikes === 0) {
    score += 10;
    factors.push({ label: 'Stable spending', impact: 'positive', detail: 'No unusual bill spikes detected.' });
  } else if (totalSpikes <= 2) {
    score -= 5;
    factors.push({ label: 'Minor spikes', impact: 'negative', detail: `${totalSpikes} bill amount spike${totalSpikes > 1 ? 's' : ''} detected.` });
  } else {
    score -= 10;
    factors.push({ label: 'Frequent spikes', impact: 'negative', detail: `${totalSpikes} bill spikes detected. Review your plans.` });
  }

  const recurringBills = bills.filter(b => b.isRecurring);
  const recurringPct = (recurringBills.length / bills.length) * 100;
  if (recurringPct >= 60) {
    score += 5;
    factors.push({ label: 'Well-tracked recurring', impact: 'positive', detail: `${recurringBills.length} of ${bills.length} bills are recurring and tracked.` });
  }

  const paidBills = bills.filter(b => b.status === 'paid');
  const paidPct = (paidBills.length / bills.length) * 100;
  if (paidPct >= 80) {
    score += 10;
    factors.push({ label: 'Great payment record', impact: 'positive', detail: `${Math.round(paidPct)}% of bills are paid on time.` });
  } else if (paidPct >= 50) {
    factors.push({ label: 'Moderate payment record', impact: 'neutral', detail: `${Math.round(paidPct)}% of bills are paid.` });
  } else {
    score -= 10;
    factors.push({ label: 'Unpaid bills', impact: 'negative', detail: `Only ${Math.round(paidPct)}% of bills are paid. Prioritize overdue bills.` });
  }

  const overdueBills = bills.filter(b => {
    if (b.status === 'paid') return false;
    const due = new Date(b.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < new Date(new Date().setHours(0, 0, 0, 0));
  });
  if (overdueBills.length > 0) {
    score -= overdueBills.length * 5;
    factors.push({ label: 'Overdue bills', impact: 'negative', detail: `${overdueBills.length} overdue bill${overdueBills.length > 1 ? 's' : ''}. Pay these first to avoid late fees.` });
  } else if (bills.filter(b => b.status !== 'paid').length > 0) {
    score += 5;
    factors.push({ label: 'No overdue bills', impact: 'positive', detail: 'All unpaid bills are still within their due dates.' });
  }

  const amounts = bills.map(b => b.totalAmount);
  const stdDev = Math.sqrt(amounts.reduce((s, v) => s + Math.pow(v - amounts.reduce((a, b) => a + b, 0) / amounts.length, 2), 0) / amounts.length);
  const avgAmount = amounts.reduce((s, v) => s + v, 0) / amounts.length;
  const cv = avgAmount > 0 ? (stdDev / avgAmount) * 100 : 0;
  if (cv < 30) {
    score += 5;
    factors.push({ label: 'Predictable bills', impact: 'positive', detail: 'Your bill amounts are consistent and predictable.' });
  } else if (cv > 60) {
    score -= 5;
    factors.push({ label: 'Variable bills', impact: 'negative', detail: 'Large variation in bill amounts. Consider fixed-rate plans.' });
  }

  score = Math.max(0, Math.min(100, score));

  let label: SavingsScore['label'];
  let color: string;
  if (score >= 80) { label = 'Optimized'; color = 'text-green-500'; }
  else if (score >= 65) { label = 'Good'; color = 'text-teal-500'; }
  else if (score >= 45) { label = 'Moderate'; color = 'text-yellow-500'; }
  else { label = 'Needs Attention'; color = 'text-red-500'; }

  return { score, label, color, factors };
}
