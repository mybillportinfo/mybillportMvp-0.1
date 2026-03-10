export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  return Response.json({ success: true, message: 'Stripe webhook temporarily disabled' });
}
