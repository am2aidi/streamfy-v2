import 'server-only'

import { allRows, asNumber, asString, firstRow, runQuery } from '@/lib/server/d1'
import type { CreatePaymentRequest, PaymentRecord, PaymentStatus } from '@/lib/payments/types'

type PaymentRow = {
  id: string
  user_id: string | null
  provider: string
  phone_e164: string
  amount_rwf: number
  plan_id: string
  status: PaymentStatus
  provider_ref: string | null
  failure_reason: string | null
  created_at: string
  updated_at: string
}

type PlanRow = {
  id: string
  access_type: 'single_movie' | 'time_pass'
  duration_days: number | null
}

function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

function mapPayment(row: PaymentRow): PaymentRecord {
  return {
    id: row.id,
    provider: row.provider as PaymentRecord['provider'],
    phoneE164: row.phone_e164,
    amountRwf: asNumber(row.amount_rwf),
    planId: row.plan_id as PaymentRecord['planId'],
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    providerRef: asString(row.provider_ref) || undefined,
    failureReason: asString(row.failure_reason) || undefined,
  }
}

async function appendPaymentEvent(paymentId: string, status: string, payload?: Record<string, unknown>) {
  await runQuery(
    `
      INSERT INTO payment_events (id, payment_id, status, payload_json, created_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
    [uid('payment-event'), paymentId, status, payload ? JSON.stringify(payload) : null],
  )
}

async function activateSubscriptionForPayment(payment: PaymentRow) {
  if (!payment.user_id) return

  const plan = await firstRow<PlanRow>('SELECT id, access_type, duration_days FROM subscription_plans WHERE id = ? LIMIT 1', [
    payment.plan_id,
  ])
  if (!plan) return

  const subscriptionId = uid('subscription')
  const endsAtModifier =
    typeof plan.duration_days === 'number'
      ? `+${plan.duration_days} days`
      : plan.access_type === 'single_movie'
        ? '+1 days'
        : null

  await runQuery(
    `
      INSERT INTO subscriptions (
        id, user_id, plan_id, status, starts_at, ends_at, auto_renew, payment_method, created_at, updated_at
      ) VALUES (
        ?, ?, ?, 'active', CURRENT_TIMESTAMP,
        ${endsAtModifier ? "datetime(CURRENT_TIMESTAMP, ?)" : 'NULL'},
        0, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `,
    endsAtModifier
      ? [subscriptionId, payment.user_id, payment.plan_id, endsAtModifier, payment.provider]
      : [subscriptionId, payment.user_id, payment.plan_id, payment.provider],
  )

  await runQuery(
    `
      INSERT INTO user_settings (user_id, theme, accent_theme, language, audio_quality, subscription_plan, payment_method, updated_at)
      VALUES (?, 'dark', 'gold', 'en', 'High', ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        subscription_plan = excluded.subscription_plan,
        payment_method = excluded.payment_method,
        updated_at = CURRENT_TIMESTAMP
    `,
    [payment.user_id, payment.plan_id, payment.provider],
  )
}

export async function createPaymentInDb(input: CreatePaymentRequest & { userId?: string | null }) {
  const paymentId = uid('payment')
  const providerRef = `mock:${paymentId}`

  await runQuery(
    `
      INSERT INTO payments (
        id, user_id, provider, phone_e164, amount_rwf, plan_id, status, provider_ref, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    [paymentId, input.userId || null, input.provider, input.phoneE164, input.amountRwf, input.planId, providerRef],
  )
  await appendPaymentEvent(paymentId, 'pending', { providerRef, planId: input.planId })

  const created = await firstRow<PaymentRow>('SELECT * FROM payments WHERE id = ? LIMIT 1', [paymentId])
  return created ? mapPayment(created) : null
}

export async function getPaymentFromDb(id: string) {
  const payment = await firstRow<PaymentRow>('SELECT * FROM payments WHERE id = ? LIMIT 1', [id])
  return payment ? mapPayment(payment) : null
}

export async function updatePaymentInDb(id: string, patch: { status: PaymentStatus; failureReason?: string }) {
  await runQuery(
    `
      UPDATE payments
      SET status = ?, failure_reason = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [patch.status, patch.failureReason || null, id],
  )
  await appendPaymentEvent(id, patch.status, patch.failureReason ? { failureReason: patch.failureReason } : undefined)

  const updated = await firstRow<PaymentRow>('SELECT * FROM payments WHERE id = ? LIMIT 1', [id])
  if (!updated) return null

  if (patch.status === 'succeeded') {
    await activateSubscriptionForPayment(updated)
  }

  return mapPayment(updated)
}

export async function listRecentPaymentsFromDb(limit = 50) {
  const rows = await allRows<PaymentRow>('SELECT * FROM payments ORDER BY created_at DESC LIMIT ?', [limit])
  return rows.map(mapPayment)
}
