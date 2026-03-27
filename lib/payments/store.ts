import type { PaymentRecord } from '@/lib/payments/types'

const payments = new Map<string, PaymentRecord>()

function nowIso() {
  return new Date().toISOString()
}

export function savePayment(record: PaymentRecord) {
  payments.set(record.id, record)
}

export function getPayment(id: string) {
  return payments.get(id) ?? null
}

export function updatePayment(id: string, patch: Partial<PaymentRecord>) {
  const existing = payments.get(id)
  if (!existing) return null
  const updated: PaymentRecord = { ...existing, ...patch, updatedAt: nowIso() }
  payments.set(id, updated)
  return updated
}

// Best-effort cleanup for dev servers.
export function cleanupOldPayments(maxAgeMs = 1000 * 60 * 60) {
  const cutoff = Date.now() - maxAgeMs
  for (const [id, record] of payments.entries()) {
    const createdMs = Date.parse(record.createdAt)
    if (Number.isFinite(createdMs) && createdMs < cutoff) payments.delete(id)
  }
}

