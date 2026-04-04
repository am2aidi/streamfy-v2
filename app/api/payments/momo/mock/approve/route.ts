import { NextResponse } from 'next/server'
import { updatePaymentInDb } from '@/lib/server/payments-db'
import { requireAdminUser } from '@/lib/server/route-auth'

export async function POST(req: Request) {
  const { response } = await requireAdminUser(req)
  if (response) return response

  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 })
  }

  const body = (await req.json().catch(() => null)) as null | { paymentId?: string }
  const paymentId = String(body?.paymentId ?? '')
  if (!paymentId) return NextResponse.json({ error: 'paymentId required' }, { status: 400 })

  const updated = await updatePaymentInDb(paymentId, { status: 'succeeded' })
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ payment: updated })
}
