import Stripe from "stripe"

const stripeKey = process.env.STRIPE_SECRET_KEY

export const stripe = stripeKey
  ? new Stripe(stripeKey, {
      apiVersion: "2024-06-20",
    })
  : null

export interface PaymentIntentData {
  amount: number
  currency: string
  productId: string
  sellerId: string
  buyerId: string
  metadata?: Record<string, string>
}

export const stripeService = {
  // Create payment intent for Egyptian customers
  createPaymentIntent: async (data: PaymentIntentData) => {
    if (!stripe) throw new Error("Stripe not configured")
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents/piastres
        currency: data.currency.toLowerCase(),
        metadata: {
          productId: data.productId,
          sellerId: data.sellerId,
          buyerId: data.buyerId,
          ...data.metadata,
        },
        // Enable payment methods popular in Egypt
        payment_method_types: ["card"],
        // Automatic payment methods for Egypt
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never", // Keep it simple for now
        },
      })

      return paymentIntent
    } catch (error) {
      console.error("Error creating payment intent:", error)
      throw error
    }
  },

  // Get payment intent
  getPaymentIntent: async (paymentIntentId: string) => {
    if (!stripe) throw new Error("Stripe not configured")
    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId)
    } catch (error) {
      console.error("Error retrieving payment intent:", error)
      throw error
    }
  },

  // Create customer for repeat purchases
  createCustomer: async (email: string, name?: string) => {
    if (!stripe) throw new Error("Stripe not configured")
    try {
      return await stripe.customers.create({
        email,
        name,
      })
    } catch (error) {
      console.error("Error creating customer:", error)
      throw error
    }
  },

  // Get supported currencies for Egypt
  getSupportedCurrencies: () => {
    return [
      { code: "EGP", name: "Egyptian Pound", symbol: "ج.م" },
      { code: "USD", name: "US Dollar", symbol: "$" },
      { code: "EUR", name: "Euro", symbol: "€" },
    ]
  },

  // Convert currency (simplified - in production use a real exchange rate API)
  convertCurrency: async (amount: number, from: string, to: string) => {
    // Simplified conversion rates (use a real API in production)
    const rates: Record<string, Record<string, number>> = {
      USD: { EGP: 31.0, EUR: 0.85 },
      EGP: { USD: 0.032, EUR: 0.027 },
      EUR: { USD: 1.18, EGP: 36.5 },
    }

    if (from === to) return amount

    const rate = rates[from]?.[to]
    if (!rate) throw new Error(`Conversion rate not available for ${from} to ${to}`)

    return Math.round(amount * rate * 100) / 100
  },
}
