import { NextResponse } from 'next/server'
import { getMockMoMoPayment } from '@/lib/payments/momo-mock'

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const payment = getMockMoMoPayment(id)
  if (!payment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ payment })
}

