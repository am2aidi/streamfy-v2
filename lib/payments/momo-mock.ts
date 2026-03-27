import type { CreatePaymentRequest, PaymentRecord } from '@/lib/payments/types'
import { cleanupOldPayments, savePayment, updatePayment, getPayment } from '@/lib/payments/store'

function nowIso() {
  return new Date().toISOString()
}

export function createMockMoMoPayment(req: CreatePaymentRequest): PaymentRecord {
  cleanupOldPayments()

  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
  const record: PaymentRecord = {
    id,
    provider: req.provider,
    phoneE164: req.phoneE164,
    amountRwf: req.amountRwf,
    planId: req.planId,
    status: 'pending',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    providerRef: `mock:${id}`,
  }

  savePayment(record)
  return record
}

export function approveMockMoMoPayment(id: string) {
  return updatePayment(id, { status: 'succeeded' })
}

export function failMockMoMoPayment(id: string, reason = 'Payment failed') {
  return updatePayment(id, { status: 'failed', failureReason: reason })
}

export function getMockMoMoPayment(id: string) {
  return getPayment(id)
}

