export type PaymentProvider = 'momo'

export type PaymentStatus = 'created' | 'pending' | 'succeeded' | 'failed' | 'cancelled'

export type SubscriptionPlanId = 'movie' | 'day' | 'week' | 'twoWeeks' | 'month'

export type CreatePaymentRequest = {
  provider: PaymentProvider
  phoneE164: string
  amountRwf: number
  planId: SubscriptionPlanId
}

export type PaymentRecord = {
  id: string
  provider: PaymentProvider
  phoneE164: string
  amountRwf: number
  planId: SubscriptionPlanId
  status: PaymentStatus
  createdAt: string
  updatedAt: string
  providerRef?: string
  failureReason?: string
}

