import { NextResponse } from 'next/server'
import { getPaymentFromDb } from '@/lib/server/payments-db'

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const payment = await getPaymentFromDb(id)
  if (!payment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ payment })
}
