import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken, sanitizeString } from '../../../lib/authVerify';
import { getAdminDb } from '../../../lib/adminSdk';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toDateStr(val: any): string {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString().split('T')[0];
  if (val instanceof Timestamp) return val.toDate().toISOString().split('T')[0];
  if (val?.seconds) return new Date(val.seconds * 1000).toISOString().split('T')[0];
  return String(val).split('T')[0];
}

export async function POST(req: NextRequest) {
  const auth = await verifyFirebaseToken(req.headers.get('authorization'));
  if (!auth.valid || !auth.uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const userId = auth.uid;
  const { startDate, endDate, biller, status } = body;

  try {
    const db = getAdminDb();
    let query: FirebaseFirestore.Query = db.collection('bills').where('userId', '==', userId);

    const snap = await query.get();
    let bills = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        billerName: data.companyName || data.billerName || '',
        amount: data.totalAmount || data.amount || 0,
        paidAmount: data.paidAmount || 0,
        dueDate: toDateStr(data.dueDate),
        status: data.status || 'unpaid',
        category: data.category || 'Other',
        subcategory: data.subcategory || '',
        isRecurring: data.isRecurring || false,
        billingCycle: data.billingCycle || '',
        accountNumber: data.accountNumber || '',
        paidAt: data.paidAt ? toDateStr(data.paidAt) : null,
      };
    });

    if (startDate) {
      const start = sanitizeString(startDate, 10);
      bills = bills.filter(b => b.dueDate >= start);
    }
    if (endDate) {
      const end = sanitizeString(endDate, 10);
      bills = bills.filter(b => b.dueDate <= end);
    }
    if (biller) {
      const billerLower = sanitizeString(biller, 100).toLowerCase();
      bills = bills.filter(b => b.billerName.toLowerCase().includes(billerLower));
    }
    if (status) {
      const validStatuses = ['upcoming', 'paid', 'overdue', 'unpaid', 'partial'];
      const s = sanitizeString(status, 20).toLowerCase();
      if (validStatuses.includes(s)) {
        if (s === 'upcoming') {
          const today = new Date().toISOString().split('T')[0];
          bills = bills.filter(b => b.status !== 'paid' && b.dueDate >= today);
        } else if (s === 'overdue') {
          const today = new Date().toISOString().split('T')[0];
          bills = bills.filter(b => b.status !== 'paid' && b.dueDate < today);
        } else {
          bills = bills.filter(b => b.status === s);
        }
      }
    }

    bills.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    return NextResponse.json({
      success: true,
      bills,
      total: bills.length,
    });
  } catch (err: any) {
    console.error('[bills/query]', err.message);
    return NextResponse.json({ error: 'Failed to query bills' }, { status: 500 });
  }
}
