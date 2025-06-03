"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Lock, AlertCircle } from "lucide-react"
import { paymentService } from "@/lib/payments"
import type { Product } from "@/lib/products"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutFormProps {
  product: Product
  onSuccess: () => void
  onCancel: () => void
}

function CheckoutFormContent({ product, onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currency, setCurrency] = useState("EGP")
  const [convertedAmount, setConvertedAmount] = useState(product.price)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    address: "",
    city: "",
    governorate: "",
    postal_code: "",
    phone: "",
  })

  const currencies = paymentService.getSupportedCurrencies()

  // Add Egyptian governorates list after the currencies constant
  const egyptianGovernorates = [
    "Cairo",
    "Alexandria",
    "Giza",
    "Qalyubia",
    "Port Said",
    "Suez",
    "Luxor",
    "Aswan",
    "Asyut",
    "Beheira",
    "Beni Suef",
    "Dakahlia",
    "Damietta",
    "Fayyum",
    "Gharbia",
    "Ismailia",
    "Kafr el-Sheikh",
    "Matrouh",
    "Minya",
    "Monufia",
    "New Valley",
    "North Sinai",
    "Qena",
    "Red Sea",
    "Sharqia",
    "Sohag",
    "South Sinai",
  ]

  // Convert currency when selection changes
  useEffect(() => {
    const convertPrice = async () => {
      try {
        if (currency !== "USD") {
          const converted = await paymentService.convertCurrency(product.price, "USD", currency)
          setConvertedAmount(converted)
        } else {
          setConvertedAmount(product.price)
        }
      } catch (error) {
        console.error("Currency conversion error:", error)
      }
    }
    convertPrice()
  }, [currency, product.price])

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const { clientSecret } = await paymentService.createPaymentIntent(product.id, currency)
        setClientSecret(clientSecret)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to initialize payment")
      }
    }
    createPaymentIntent()
  }, [product.id, currency])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setLoading(true)
    setError(null)

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError("Card element not found")
      setLoading(false)
      return
    }

    // Confirm payment
    const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: shippingAddress.name,
          phone: shippingAddress.phone,
          address: {
            line1: shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.governorate,
            postal_code: shippingAddress.postal_code,
            country: "EG",
          },
        },
      },
      shipping: {
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        address: {
          line1: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.governorate,
          postal_code: shippingAddress.postal_code,
          country: "EG",
        },
      },
    })

    if (paymentError) {
      setError(paymentError.message || "Payment failed")
      setLoading(false)
    } else if (paymentIntent?.status === "succeeded") {
      onSuccess()
    }
  }

  const selectedCurrency = currencies.find((c) => c.code === currency)

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Secure Checkout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Product Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <img
                src={product.images?.[0] || "/placeholder.svg?height=80&width=80"}
                alt={product.title}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{product.title}</h3>
                <p className="text-sm text-gray-600">{product.category}</p>
                <p className="text-sm text-gray-600">Condition: {product.condition}</p>
              </div>
            </div>
          </div>

          {/* Currency Selection */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.name} ({curr.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Display */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Amount:</span>
              <span className="text-2xl font-bold text-blue-600">
                {selectedCurrency?.symbol}
                {convertedAmount.toFixed(2)} {currency}
              </span>
            </div>
            {currency !== "USD" && (
              <p className="text-sm text-gray-600 mt-1">Original price: ${product.price.toFixed(2)} USD</p>
            )}
          </div>

          <Separator />

          {/* Shipping Address */}
          <div className="space-y-4">
            <h3 className="font-semibold">Shipping Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={shippingAddress.name}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  required
                />
              </div>
              {/* Update the governorate input field to use a Select component */}
              <div className="space-y-2">
                <Label htmlFor="governorate">Governorate</Label>
                <Select
                  value={shippingAddress.governorate}
                  onValueChange={(value) => setShippingAddress({ ...shippingAddress, governorate: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select governorate" />
                  </SelectTrigger>
                  <SelectContent>
                    {egyptianGovernorates.map((gov) => (
                      <SelectItem key={gov} value={gov}>
                        {gov}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Card Information</Label>
              <div className="p-3 border rounded-md">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#424770",
                        "::placeholder": {
                          color: "#aab7c4",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Update the payment methods info section */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-medium text-blue-800 mb-1">Payment Methods for Egypt 🇪🇬</h4>
                  <p className="text-blue-700 mb-2">
                    We accept Egyptian and international cards. Pay in EGP, USD, or EUR with real-time conversion.
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-white px-2 py-1 rounded">💳 Visa</span>
                    <span className="text-xs bg-white px-2 py-1 rounded">💳 Mastercard</span>
                    <span className="text-xs bg-white px-2 py-1 rounded">🇪🇬 Meeza</span>
                    <span className="text-xs bg-white px-2 py-1 rounded">ج.م EGP</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={!stripe || loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Pay {selectedCurrency?.symbol}
                    {convertedAmount.toFixed(2)}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CheckoutForm({ product, onSuccess, onCancel }: CheckoutFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormContent product={product} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  )
}
