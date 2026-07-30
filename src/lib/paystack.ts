export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!
export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!

export interface PaystackInitResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
    id: number
    status: string
    reference: string
    amount: number
    paid_at: string
    channel: string
    currency: string
    metadata: any
  }
}

export async function initializePaystackPayment(params: {
  email: string
  amount: number
  reference: string
  metadata?: Record<string, any>
}): Promise<PaystackInitResponse> {
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amount * 100),
      reference: params.reference,
      currency: 'GHS',
      metadata: params.metadata,
    }),
  })
  return response.json()
}

export async function verifyPaystackPayment(reference: string): Promise<PaystackVerifyResponse> {
  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
  })
  return response.json()
}

export interface PaystackRefundResponse {
  status: boolean
  message: string
  data?: Record<string, unknown>
}

export async function refundPaystackPayment(reference: string): Promise<PaystackRefundResponse> {
  const response = await fetch('https://api.paystack.co/refund', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transaction: reference }),
  })
  return response.json()
}
