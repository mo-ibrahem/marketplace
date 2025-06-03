"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import {
  Eye,
  EyeOff,
  Upload,
  X,
  ShoppingCart,
  User,
  Mail,
  Lock,
  Tag,
  DollarSign,
  FileText,
  ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function AuthSellPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")

  // Set default tab based on URL parameter
  const [activeTab, setActiveTab] = useState("login")

  useEffect(() => {
    if (tabParam === "signup") {
      setActiveTab("signup")
    } else if (tabParam === "sell") {
      setActiveTab("sell")
    }
  }, [tabParam])

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Sign up form state
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [showSignupPassword, setShowSignupPassword] = useState(false)

  // Sell product form state
  const [productData, setProductData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
  })
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  // Categories for the sell product form
  const categories = ["Electronics", "Fashion", "Home", "Toys", "Books", "Sports", "Beauty", "Automotive"]

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newImages: string[] = []
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string)
            if (newImages.length === files.length) {
              setUploadedImages((prev) => [...prev, ...newImages])
            }
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  // Remove uploaded image
  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Handle form submissions
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login data:", loginData)
    // Handle login logic here
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Signup data:", signupData)
    // Handle signup logic here
  }

  const handleSellProduct = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Product data:", productData)
    console.log("Uploaded images:", uploadedImages)
    // Handle product submission logic here
  }

  const handleGoogleSignIn = () => {
    console.log("Sign in with Google")
    // Handle Google sign in logic here
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-2xl font-bold text-gray-900">MarketPlace</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/products">
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to MarketPlace</h1>
          <p className="text-gray-600">Sign in to your account, create a new one, or start selling your products</p>
        </div>

        <Card className="w-full">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Sign Up
              </TabsTrigger>
              <TabsTrigger value="sell" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Sell Product
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Sign In</CardTitle>
                <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        id="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <Label htmlFor="remember-me" className="text-sm">
                        Remember me
                      </Label>
                    </div>
                    <Button variant="link" className="text-sm text-blue-600 hover:text-blue-800 p-0">
                      Forgot password?
                    </Button>
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Sign In
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </Button>
              </CardContent>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Create Account</CardTitle>
                <CardDescription className="text-center">
                  Join MarketPlace and start buying and selling today
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        className="pl-10"
                        value={signupData.name}
                        onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className="pl-10 pr-10"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                      >
                        {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="terms"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      required
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{" "}
                      <Button variant="link" className="text-blue-600 hover:text-blue-800 p-0 h-auto">
                        Terms of Service
                      </Button>{" "}
                      and{" "}
                      <Button variant="link" className="text-blue-600 hover:text-blue-800 p-0 h-auto">
                        Privacy Policy
                      </Button>
                    </Label>
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Create Account
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign up with Google
                </Button>
              </CardContent>
            </TabsContent>

            {/* Sell Product Tab */}
            <TabsContent value="sell">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Sell Your Product</CardTitle>
                <CardDescription className="text-center">
                  List your item and reach thousands of potential buyers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSellProduct} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="product-title">Product Title</Label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="product-title"
                          type="text"
                          placeholder="Enter product title"
                          className="pl-10"
                          value={productData.title}
                          onChange={(e) => setProductData({ ...productData, title: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="product-price">Price ($)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="product-price"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="pl-10"
                          value={productData.price}
                          onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-category">Category</Label>
                    <Select
                      value={productData.category}
                      onValueChange={(value) => setProductData({ ...productData, category: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-description">Description</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Textarea
                        id="product-description"
                        placeholder="Describe your product in detail..."
                        className="pl-10 min-h-[120px] resize-none"
                        value={productData.description}
                        onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Product Images</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center space-y-2">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag
                          and drop
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                      </label>
                    </div>

                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Listing Guidelines</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Use clear, high-quality images</li>
                      <li>• Write detailed, honest descriptions</li>
                      <li>• Set competitive pricing</li>
                      <li>• Respond promptly to buyer inquiries</li>
                    </ul>
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3">
                    <Upload className="mr-2 h-5 w-5" />
                    List Product
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <ShoppingCart className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-2xl font-bold">MarketPlace</span>
            </div>
            <p className="text-gray-400">© 2024 MarketPlace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
