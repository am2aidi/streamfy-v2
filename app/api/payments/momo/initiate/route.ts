import { NextResponse } from 'next/server'
import { createMockMoMoPayment } from '@/lib/payments/momo-mock'
import type { CreatePaymentRequest, SubscriptionPlanId } from '@/lib/payments/types'

function isE164(phone: string) {
  return /^\+[1-9]\d{7,14}$/.test(phone)
}

function isPlanId(value: unknown): value is SubscriptionPlanId {
  return value === 'movie' || value === 'day' || value === 'week' || value === 'twoWeeks' || value === 'month'
}

const planPricesRwf: Record<SubscriptionPlanId, number> = {
  movie: 100,
  day: 200,
  week: 400,
  twoWeeks: 700,
  month: 1000,
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as null | {
    phone?: string
    planId?: unknown
  }

  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const phone = String(body.phone ?? '').replace(/\s+/g, '')
  const planId = body.planId

  if (!isE164(phone)) return NextResponse.json({ error: 'Invalid phone. Use E.164 like +2507xxxxxxxx' }, { status: 400 })
  if (!isPlanId(planId)) return NextResponse.json({ error: 'Invalid planId' }, { status: 400 })

  // NOTE: This is a MOCK integration until you add real MTN/Airtel MoMo merchant credentials.
  const amountRwf = planPricesRwf[planId]
  const paymentReq: CreatePaymentRequest = { provider: 'momo', phoneE164: phone, amountRwf, planId }
  const payment = createMockMoMoPayment(paymentReq)

  return NextResponse.json({
    paymentId: payment.id,
    status: payment.status,
    provider: payment.provider,
    message: 'Mock MoMo initiated. In production, the user would approve on their phone.',
  })
}
