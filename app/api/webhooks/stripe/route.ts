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

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe || !webhookSecret) {
      console.warn("Stripe webhook not configured")
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
    }

    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object

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
          break
        }

        // Get payment details to create order
        const { data: payment } = await supabase
          .from("payments")
          .select("*")
          .eq("stripe_payment_intent_id", paymentIntent.id)
          .single()

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
          }

          // Mark product as sold
          await supabase.from("products").update({ status: "sold" }).eq("id", payment.product_id)
        }

        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object

        // Update payment status to failed
        await supabase.from("payments").update({ status: "failed" }).eq("stripe_payment_intent_id", paymentIntent.id)

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
