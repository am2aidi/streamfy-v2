import { NextResponse } from 'next/server'
import { approveMockMoMoPayment } from '@/lib/payments/momo-mock'

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 })
  }

  const body = (await req.json().catch(() => null)) as null | { paymentId?: string }
  const paymentId = String(body?.paymentId ?? '')
  if (!paymentId) return NextResponse.json({ error: 'paymentId required' }, { status: 400 })

  const updated = approveMockMoMoPayment(paymentId)
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ payment: updated })
}

