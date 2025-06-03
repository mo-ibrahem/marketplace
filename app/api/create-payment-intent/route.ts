import { type NextRequest, NextResponse } from "next/server"
import { stripeService } from "@/lib/stripe"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabaseClient = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { productId, currency = "EGP" } = body

    // Get product details
    const { data: product, error: productError } = await supabaseClient
      .from("products")
      .select("*")
      .eq("id", productId)
      .single()

    if (productError || !product) {
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
    const { error: paymentError } = await supabaseClient.from("payments").insert({
      id: paymentIntent.id,
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
    console.error("Error creating payment intent:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}
