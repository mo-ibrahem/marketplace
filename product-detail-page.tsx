"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Heart,
  Share2,
  MessageCircle,
  ShoppingCart,
  Star,
  MapPin,
  Calendar,
  Package,
  Shield,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { productService, type Product } from "@/lib/products"
import CheckoutForm from "@/components/checkout-form"
import Image from "next/image"

interface ProductDetailPageProps {
  productId: string
}

export default function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    loadProduct()
  }, [productId])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const product = await productService.getProductById(productId)
      setProduct(product)
      setIsWishlisted(product.isWishlisted || false)
    } catch (error) {
      console.error("Error loading product:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousImage = () => {
    if (product?.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))
    }
  }

  const handleNextImage = () => {
    if (product?.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
    }
  }

  const handleContactSeller = () => {
    if (!user) {
      router.push("/auth")
      return
    }
    // In a real app, this would open a messaging interface
    alert("Messaging feature coming soon! For now, you can contact the seller via email.")
  }

  const handleBuyNow = () => {
    if (!user) {
      router.push("/auth")
      return
    }

    if (!product) {
      setMessage({ type: "error", text: "Product not found" })
      return
    }

    if (product.seller_id === user.id) {
      setMessage({ type: "error", text: "You cannot purchase your own product" })
      return
    }

    if (product.status !== "active") {
      setMessage({ type: "error", text: "This product is no longer available" })
      return
    }

    setShowCheckout(true)
  }

  const handlePaymentSuccess = () => {
    setShowCheckout(false)
    setMessage({ type: "success", text: "Payment successful! Your order has been confirmed." })
    // Reload product to update status
    loadProduct()
  }

  const handleAddToWishlist = async () => {
    if (!user) {
      router.push("/auth")
      return
    }

    if (!product) {
      setMessage({ type: "error", text: "Product not found" })
      return
    }

    setMessage(null)

    try {
      if (isWishlisted) {
        console.log("Removing from wishlist:", product.id)
        await productService.removeFromWishlist(product.id)
        setIsWishlisted(false)
        setMessage({ type: "success", text: "Product removed from wishlist" })
      } else {
        console.log("Adding to wishlist:", product.id)
        const result = await productService.addToWishlist(product.id)

        if (result?.alreadyExists) {
          setMessage({ type: "success", text: "Product is already in your wishlist" })
          setIsWishlisted(true)
        } else {
          setIsWishlisted(true)
          setMessage({ type: "success", text: "Product added to wishlist" })
        }
      }
    } catch (error) {
      console.error("Error updating wishlist:", error)

      // Better error message handling
      let errorMessage = "Failed to update wishlist"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      setMessage({ type: "error", text: errorMessage })
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.title,
        text: product?.description,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      setMessage({ type: "success", text: "Link copied to clipboard!" })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center">
                   <Image 
                                  src="/egbay.svg" // Path from the public directory
                                  alt="EgyBay Logo" 
                                  width={120} // Example width, adjust as needed
                                  height={40} // Example height, adjust as needed
                                />
                  
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center">
                    <Image 
                                          src="/egbay.svg" // Path from the public directory
                                          alt="EgyBay Logo" 
                                          width={120} // Example width, adjust as needed
                                          height={40} // Example height, adjust as needed
                                        />
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-4">The product you're looking for doesn't exist or has been removed.</p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const images =
    product.images && product.images.length > 0 ? product.images : ["/placeholder.svg?height=400&width=400"]

  const isOwnProduct = user?.id === product.seller_id
  const isProductAvailable = product.status === "active"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                  <Image 
                                        src="/egbay.svg" // Path from the public directory
                                        alt="EgyBay Logo" 
                                        width={120} // Example width, adjust as needed
                                        height={40} // Example height, adjust as needed
                                      />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/products">
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                  Browse Products
                </Button>
              </Link>
              {user && (
                <Link href="/profile">
                  <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                    Profile
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/products" className="text-blue-600 hover:text-blue-800">
              Products
            </Link>
            <span className="text-gray-400">/</span>
            <Link href={`/products?category=${product.category}`} className="text-blue-600 hover:text-blue-800">
              {product.category}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 truncate">{product.title}</span>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {message && (
          <Alert
            className={`mb-6 ${message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
          >
            {message.type === "error" ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <Shield className="h-4 w-4 text-green-600" />
            )}
            <AlertDescription className={message.type === "error" ? "text-red-800" : "text-green-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {!isProductAvailable && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              This product is no longer available for purchase.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="relative aspect-square bg-gray-100">
                <img
                  src={images[currentImageIndex] || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={handlePreviousImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={product.condition === "New" ? "default" : "secondary"}>{product.condition}</Badge>
                </div>
                {!isProductAvailable && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg px-4 py-2">
                      {product.status === "sold" ? "SOLD" : "UNAVAILABLE"}
                    </Badge>
                  </div>
                )}
              </div>
            </Card>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex ? "border-blue-500" : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              <div className="flex items-center justify-between">
                <p className="text-4xl font-bold text-blue-600">${product.price.toFixed(2)}</p>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={handleAddToWishlist}>
                    <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Category:</span>
                    <p className="text-gray-900">{product.category}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Condition:</span>
                    <p className="text-gray-900">{product.condition}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Listed:</span>
                    <p className="text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(product.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Status:</span>
                    <p className="text-gray-900 flex items-center">
                      <Package className="h-4 w-4 mr-1" />
                      {product.status}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={product.seller?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{product.seller?.full_name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{product.seller?.full_name || "Unknown Seller"}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span>4.8 (124 reviews)</span>
                    </div>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Shield className="h-4 w-4 mr-2" />
                    <span>Verified seller</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>Ships from Egypt</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!isOwnProduct && isProductAvailable && (
                <Button
                  onClick={handleBuyNow}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                  size="lg"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Buy Now - ${product.price.toFixed(2)}
                </Button>
              )}

              <Button
                onClick={handleContactSeller}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                size="lg"
                disabled={isOwnProduct}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                {isOwnProduct ? "This is your product" : "Contact Seller"}
              </Button>

              {!isOwnProduct && (
                <Button variant="outline" className="w-full py-3 text-lg" size="lg" onClick={handleAddToWishlist}>
                  <Heart className={`h-5 w-5 mr-2 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                  {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                </Button>
              )}
            </div>

            {/* Payment Methods */}
            {!isOwnProduct && isProductAvailable && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <h4 className="font-medium text-blue-800 mb-1">Payment Methods</h4>
                      <p className="text-blue-700 mb-2">
                        We accept all major credit and debit cards. Pay in Egyptian Pounds (EGP), US Dollars (USD), or
                        Euros (EUR).
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-white px-2 py-1 rounded">Visa</span>
                        <span className="text-xs bg-white px-2 py-1 rounded">Mastercard</span>
                        <span className="text-xs bg-white px-2 py-1 rounded">EGP</span>
                        <span className="text-xs bg-white px-2 py-1 rounded">USD</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Safety Notice */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <h4 className="font-medium text-yellow-800 mb-1">Safety Tips</h4>
                    <ul className="text-yellow-700 space-y-1">
                      <li>• Secure payment processing with Stripe</li>
                      <li>• Buyer protection included</li>
                      <li>• Verify seller information before purchase</li>
                      <li>• Report suspicious activity</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">More from this category</h2>
          <div className="text-center py-8 text-gray-500">
            <p>Related products feature coming soon...</p>
          </div>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Your Purchase</DialogTitle>
          </DialogHeader>
          {product && (
            <CheckoutForm product={product} onSuccess={handlePaymentSuccess} onCancel={() => setShowCheckout(false)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                     <Image 
                        src="/egbay.svg" // Path from the public directory
                        alt="EgyBay Logo" 
                        width={120} // Example width, adjust as needed
                        height={40} // Example height, adjust as needed
                      />
                  </div>
                  <p className="text-gray-400">© 2025 Egbay. All rights reserved.</p>
                </div>
              </div>
            </footer>
    </div>
  )
}
