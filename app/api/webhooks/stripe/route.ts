import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Handle missing Stripe configuration
let stripe: any = null
try {
  const { stripe: stripeClient } = require("@/lib/stripe")
  stripe = stripeClient
} catch (error) {
  console.warn("Stripe not configured for webhooks")
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
const isDevelopment = process.env.NODE_ENV === 'development'

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe || !webhookSecret) {
      const error = "Stripe or webhook secret not configured"
      console.warn(error, { 
        stripeConfigured: !!stripe, 
        webhookSecretConfigured: !!webhookSecret,
        nodeEnv: process.env.NODE_ENV 
      })
      return NextResponse.json({ error }, { status: 500 })
    }

    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      console.warn("No Stripe signature found in webhook request")
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      if (isDevelopment) {
        console.log("Webhook event received:", {
          type: event.type,
          id: event.id,
          object: event.data.object.id
        })
      }
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ 
        error: "Invalid signature",
        details: isDevelopment ? err.message : undefined 
      }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object
        if (isDevelopment) {
          console.log("Processing payment_intent.succeeded:", paymentIntent.id)
        }

        // Update payment status
        const { error: paymentError } = await supabase
          .from("payments")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            payment_method_id: paymentIntent.payment_method,
          })
          .eq("stripe_payment_intent_id", paymentIntent.id)

        if (paymentError) {
          console.error("Error updating payment:", paymentError)
          if (isDevelopment) {
            return NextResponse.json({ error: "Payment update failed", details: paymentError }, { status: 500 })
          }
          break
        }

        // Get payment details to create order
        const { data: payment, error: fetchError } = await supabase
          .from("payments")
          .select("*")
          .eq("stripe_payment_intent_id", paymentIntent.id)
          .single()

        if (fetchError) {
          console.error("Error fetching payment:", fetchError)
          if (isDevelopment) {
            return NextResponse.json({ error: "Payment fetch failed", details: fetchError }, { status: 500 })
          }
          break
        }

        if (payment) {
          // Create order
          const { error: orderError } = await supabase.from("orders").insert({
            payment_id: payment.id,
            product_id: payment.product_id,
            buyer_id: payment.buyer_id,
            seller_id: payment.seller_id,
            status: "confirmed",
          })

          if (orderError) {
            console.error("Error creating order:", orderError)
            if (isDevelopment) {
              return NextResponse.json({ error: "Order creation failed", details: orderError }, { status: 500 })
            }
          }

          // Mark product as sold
          const { error: productError } = await supabase
            .from("products")
            .update({ status: "sold" })
            .eq("id", payment.product_id)

          if (productError && isDevelopment) {
            console.error("Error updating product status:", productError)
          }
        }

        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object
        if (isDevelopment) {
          console.log("Processing payment_intent.payment_failed:", paymentIntent.id)
        }

        // Update payment status to failed
        const { error: updateError } = await supabase
          .from("payments")
          .update({ status: "failed" })
          .eq("stripe_payment_intent_id", paymentIntent.id)

        if (updateError && isDevelopment) {
          console.error("Error updating payment status to failed:", updateError)
          return NextResponse.json({ error: "Payment status update failed", details: updateError }, { status: 500 })
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json({ 
      error: "Webhook handler failed", 
      details: isDevelopment ? error.message : undefined 
    }, { status: 500 })
  }
}
