"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, TestTube, CheckCircle, XCircle } from "lucide-react"
import CheckoutForm from "@/components/checkout-form"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"

const testCards = [
  {
    number: "4242 4242 4242 4242",
    type: "Success",
    description: "Payment succeeds",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    number: "4000 0000 0000 0002",
    type: "Declined",
    description: "Payment declined",
    color: "bg-red-100 text-red-800 border-red-200",
  },
  {
    number: "4000 0000 0000 9995",
    type: "Insufficient Funds",
    description: "Insufficient funds",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  {
    number: "4000 0025 0000 3155",
    type: "3D Secure",
    description: "Requires authentication",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
]

const testProduct = {
  id: "test-product",
  title: "Test Product for Egypt",
  description: "This is a test product to verify Stripe payments work correctly in Egypt",
  price: 100,
  category: "Electronics",
  condition: "New",
  images: ["/placeholder.svg?height=200&width=200"],
  seller_id: "test-seller",
  status: "active",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  seller: {
    full_name: "Test Seller",
    avatar_url: "/placeholder.svg",
  },
}

export default function TestPaymentPage() {
  const { user } = useAuth()
  const [showCheckout, setShowCheckout] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleTestPayment = () => {
    if (!user) {
      alert("Please sign in first to test payments")
      return
    }
    setShowCheckout(true)
  }

  const handlePaymentSuccess = () => {
    setShowCheckout(false)
    setTestResult({
      success: true,
      message: "🎉 Payment test successful! Your Stripe integration is working perfectly for Egypt.",
    })
  }

  const handlePaymentCancel = () => {
    setShowCheckout(false)
    setTestResult({
      success: false,
      message: "Payment test cancelled. You can try again anytime.",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <TestTube className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Stripe Payment Testing for Egypt 🇪🇬</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Test your Stripe integration with Egyptian-specific scenarios. Use the test cards below to simulate
            different payment outcomes.
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8 text-center">
          <Link href="/">
            <Button variant="outline" className="mr-4">
              ← Back to Homepage
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline">Browse Real Products</Button>
          </Link>
        </div>

        {/* Test Result */}
        {testResult && (
          <Alert
            className={`mb-6 ${testResult.success ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50"}`}
          >
            {testResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-blue-600" />
            )}
            <AlertDescription className={testResult.success ? "text-green-800" : "text-blue-800"}>
              {testResult.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Test Card Numbers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Use these test card numbers to simulate different payment scenarios:
              </p>

              {testCards.map((card, index) => (
                <div key={index} className={`p-4 rounded-lg border ${card.color}`}>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="font-mono text-sm">
                      {card.number}
                    </Badge>
                    <Badge variant="secondary">{card.type}</Badge>
                  </div>
                  <p className="text-sm">{card.description}</p>
                </div>
              ))}

              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <h4 className="font-medium mb-2">For all test cards:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    • <strong>Expiry:</strong> Any future date (e.g., 12/25)
                  </li>
                  <li>
                    • <strong>CVC:</strong> Any 3 digits (e.g., 123)
                  </li>
                  <li>
                    • <strong>ZIP:</strong> Any 5 digits (e.g., 12345)
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Test Product */}
          <Card>
            <CardHeader>
              <CardTitle>Test Product</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src="/placeholder.svg?height=80&width=80"
                    alt="Test Product"
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <div>
                    <h3 className="font-semibold">{testProduct.title}</h3>
                    <p className="text-sm text-gray-600">{testProduct.description}</p>
                    <p className="text-lg font-bold text-blue-600">${testProduct.price.toFixed(2)}</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Test Features:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>✅ Egyptian Pound (EGP) conversion</li>
                    <li>✅ Egyptian governorate selection</li>
                    <li>✅ Local address format</li>
                    <li>✅ Arabic-friendly interface</li>
                  </ul>
                </div>

                {user ? (
                  <Button onClick={handleTestPayment} className="w-full bg-green-600 hover:bg-green-700" size="lg">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Test Payment Flow
                  </Button>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">Sign in to test payments</p>
                    <Link href="/auth">
                      <Button className="w-full">Sign In to Test</Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Egyptian Payment Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🇪🇬 Egypt-Specific Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2">Supported Currencies</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>🇪🇬 Egyptian Pound (EGP)</li>
                  <li>🇺🇸 US Dollar (USD)</li>
                  <li>🇪🇺 Euro (EUR)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Payment Methods</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>💳 Visa & Mastercard</li>
                  <li>🇪🇬 Meeza (Egyptian cards)</li>
                  <li>🏦 Local bank cards</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Settlement</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>🏦 Egyptian bank account</li>
                  <li>⏱️ 2-7 business days</li>
                  <li>💱 Auto currency conversion</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checkout Modal */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Test Payment Checkout</h2>
                  <Button variant="outline" onClick={handlePaymentCancel}>
                    ✕ Close
                  </Button>
                </div>
                <CheckoutForm
                  product={testProduct as any}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handlePaymentCancel}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
