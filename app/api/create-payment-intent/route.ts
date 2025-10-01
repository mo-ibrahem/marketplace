import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

// Add error handling for missing Stripe
let stripeService: any = null
try {
  const { stripeService: stripe } = require("@/lib/stripe")
  stripeService = stripe
} catch (error) {
  console.warn("Stripe not configured:", error)
}

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripeService) {
      return NextResponse.json({ error: "Payment system not configured" }, { status: 500 })
    }

    // Get cookies store first
    const cookieStore = cookies()

    // Create Supabase client for auth
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore 
    })

    // Get the session using the cookie-initialized client
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    if (!session) {
      console.error("No session found")
      return NextResponse.json({ error: "Please sign in to make a payment" }, { status: 401 })
    }

    const user = session.user
    if (!user || !user.id) {
      console.error("No user in session")
      return NextResponse.json({ error: "User not found in session" }, { status: 401 })
    }

    // Log successful auth
    console.log("User authenticated:", user.id)

    const body = await request.json()
    const { productId, currency = "EGP" } = body

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single()

    if (productError) {
      console.error("Product fetch error:", productError)
      return NextResponse.json({ error: "Failed to fetch product details" }, { status: 500 })
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Prevent self-purchase
    if (product.seller_id === user.id) {
      return NextResponse.json({ error: "Cannot purchase your own product" }, { status: 400 })
    }

    // Convert price to selected currency if needed
    let amount = product.price
    if (currency !== "USD") {
      amount = await stripeService.convertCurrency(product.price, "USD", currency)
    }

    // Create payment intent
    const paymentIntent = await stripeService.createPaymentIntent({
      amount,
      currency,
      productId: product.id,
      sellerId: product.seller_id,
      buyerId: user.id,
      metadata: {
        productTitle: product.title,
        productCategory: product.category,
      },
    })

    // Store payment record in database
    const { error: paymentError } = await supabase.from("payments").insert({
      product_id: productId,
      buyer_id: user.id,
      seller_id: product.seller_id,
      amount,
      currency,
      status: "pending",
      stripe_payment_intent_id: paymentIntent.id,
    })

    if (paymentError) {
      console.error("Error storing payment record:", paymentError)
      // Continue anyway - the payment intent was created successfully
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      currency,
    })
  } catch (error) {
    console.error("Error creating payment intent:", error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: "Failed to create payment intent. Please try again." },
      { status: 500 }
    )
  }
}
