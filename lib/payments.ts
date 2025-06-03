import { supabase } from "./supabase"
import { stripeService } from "./stripe"

export interface Payment {
  id: string
  product_id: string
  buyer_id: string
  seller_id: string
  amount: number
  currency: string
  status: string
  stripe_payment_intent_id: string
  created_at: string
  completed_at?: string
  metadata?: any
}

export interface Order {
  id: string
  payment_id: string
  product_id: string
  buyer_id: string
  seller_id: string
  status: string
  shipping_address?: any
  tracking_number?: string
  notes?: string
  created_at: string
  shipped_at?: string
  delivered_at?: string
}

// Add this helper function at the top of the file
const formatEgyptianCurrency = (amount: number, currency: string) => {
  const formatters = {
    EGP: new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" }),
    USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
    EUR: new Intl.NumberFormat("en-EU", { style: "currency", currency: "EUR" }),
  }
  return formatters[currency as keyof typeof formatters]?.format(amount) || `${amount} ${currency}`
}

export const paymentService = {
  // Create payment intent
  createPaymentIntent: async (productId: string, currency = "EGP") => {
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          currency,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return {
        ...data,
        formattedAmount: formatEgyptianCurrency(data.amount, data.currency),
      }
    } catch (error) {
      console.error("Payment intent creation failed:", error)
      throw new Error(error instanceof Error ? error.message : "Failed to create payment intent. Please try again.")
    }
  },

  // Get user's payments
  getUserPayments: async (userId: string) => {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        products (
          title,
          images,
          category
        )
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data as (Payment & { products: any })[]
  },

  // Get user's orders
  getUserOrders: async (userId: string) => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        products (
          title,
          images,
          category,
          price
        ),
        payments (
          amount,
          currency,
          status
        )
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data as (Order & { products: any; payments: any })[]
  },

  // Update order status (for sellers)
  updateOrderStatus: async (orderId: string, status: string, updates?: Partial<Order>) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
      ...updates,
    }

    if (status === "shipped") {
      updateData.shipped_at = new Date().toISOString()
    } else if (status === "delivered") {
      updateData.delivered_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .eq("seller_id", user.id) // Ensure only seller can update
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get supported currencies
  getSupportedCurrencies: () => stripeService.getSupportedCurrencies(),

  // Convert currency
  convertCurrency: (amount: number, from: string, to: string) => stripeService.convertCurrency(amount, from, to),

  // Add a new function for Egyptian payment methods
  getEgyptianPaymentMethods: () => {
    return [
      { id: "card", name: "Credit/Debit Card", icon: "💳", description: "Visa, Mastercard, Meeza" },
      { id: "bank_transfer", name: "Bank Transfer", icon: "🏦", description: "Coming soon" },
      { id: "wallet", name: "Mobile Wallet", icon: "📱", description: "Coming soon" },
    ]
  },
}
