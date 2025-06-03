"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Eye,
  ShoppingCart,
  Package,
  Settings,
  Lock,
  Save,
  X,
  Heart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { auth } from "@/lib/supabase"
import { productService, profileService, type Product, type UserProfile } from "@/lib/products"

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [userProducts, setUserProducts] = useState<Product[]>([])
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [profileData, setProfileData] = useState({
    full_name: "",
    phone: "",
    address: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  // Load user profile and products
  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    try {
      setIsLoading(true)

      // Load profile
      const profileData = await profileService.getProfile(user.id)
      setProfile(profileData)

      if (profileData) {
        setProfileData({
          full_name: profileData.full_name || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
        })
      } else {
        // Initialize with user metadata
        setProfileData({
          full_name: user.user_metadata?.full_name || "",
          phone: "",
          address: "",
        })
      }

      // Load user's products
      const products = await productService.getProductsBySeller(user.id)
      setUserProducts(products)

      // Load user's wishlist
      try {
        const wishlist = await productService.getWishlist()
        setWishlistProducts(wishlist)
      } catch (error) {
        console.error("Error loading wishlist:", error)
        // Don't fail the entire load if wishlist fails
        setWishlistProducts([])
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      setMessage({ type: "error", text: "Failed to load profile data" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setIsLoading(true)
      setMessage(null)

      await profileService.upsertProfile(profileData)
      setMessage({ type: "success", text: "Profile updated successfully!" })
      setIsEditing(false)
      await loadUserData()
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ type: "error", text: "Failed to update profile" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords don't match" })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long" })
      return
    }

    try {
      setIsLoading(true)
      setMessage(null)

      // Note: Supabase doesn't require current password for password updates
      // In a production app, you might want to implement additional verification
      const { error } = await auth.supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) {
        setMessage({ type: "error", text: error.message })
      } else {
        setMessage({ type: "success", text: "Password updated successfully!" })
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update password" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      setIsLoading(true)
      await productService.deleteProduct(productId)
      setMessage({ type: "success", text: "Product deleted successfully!" })
      await loadUserData() // Reload products
    } catch (error) {
      console.error("Error deleting product:", error)
      setMessage({ type: "error", text: "Failed to delete product" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      setIsLoading(true)
      console.log("Removing product from wishlist:", productId)

      await productService.removeFromWishlist(productId)
      setMessage({ type: "success", text: "Product removed from wishlist!" })

      // Update wishlist state
      setWishlistProducts(wishlistProducts.filter((product) => product.id !== productId))
    } catch (error) {
      console.error("Error removing from wishlist:", error)

      let errorMessage = "Failed to remove from wishlist"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      setMessage({ type: "error", text: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
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
              <Link href="/auth?tab=sell">
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                  Sell Product
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleSignOut} className="text-gray-700 hover:text-gray-900">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl">
                {profileData.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {profileData.full_name || user.email?.split("@")[0] || "User"}
              </h1>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary">
                  <Package className="h-3 w-3 mr-1" />
                  {userProducts.length} Products Listed
                </Badge>
                <Badge variant="secondary">
                  <Heart className="h-3 w-3 mr-1" />
                  {wishlistProducts.length} Wishlisted
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <Alert
            className={`mb-6 ${message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
          >
            <AlertDescription className={message.type === "error" ? "text-red-800" : "text-green-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              My Products
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Wishlist
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Manage your personal information and contact details</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="full_name"
                            type="text"
                            placeholder="Enter your full name"
                            className="pl-10"
                            value={profileData.full_name}
                            onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="Enter your phone number"
                            className="pl-10"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="address"
                          type="text"
                          placeholder="Enter your address"
                          className="pl-10"
                          value={profileData.address}
                          onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button type="submit" disabled={isLoading}>
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          // Reset form data
                          if (profile) {
                            setProfileData({
                              full_name: profile.full_name || "",
                              phone: profile.phone || "",
                              address: profile.address || "",
                            })
                          }
                        }}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Full Name</p>
                          <p className="text-gray-900">{profileData.full_name || "Not provided"}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="text-gray-900">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phone</p>
                          <p className="text-gray-900">{profileData.phone || "Not provided"}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Address</p>
                          <p className="text-gray-900">{profileData.address || "Not provided"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Products</CardTitle>
                    <CardDescription>Manage your listed products</CardDescription>
                  </div>
                  <Link href="/auth?tab=sell">
                    <Button>
                      <Package className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {userProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userProducts.map((product) => (
                      <Card key={product.id} className="overflow-hidden">
                        <div className="relative pt-[60%] bg-gray-100">
                          <img
                            src={product.images?.[0] || "/placeholder.svg?height=150&width=200"}
                            alt={product.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant={product.status === "active" ? "default" : "secondary"}>
                              {product.status}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.title}</h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                          <p className="text-lg font-bold text-blue-600 mb-3">${product.price.toFixed(2)}</p>
                          <div className="flex space-x-2">
                            <Link href={`/products/${product.id}`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={isLoading}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products listed yet</h3>
                    <p className="text-gray-500 mb-4">Start selling by adding your first product</p>
                    <Link href="/auth?tab=sell">
                      <Button>
                        <Package className="h-4 w-4 mr-2" />
                        List Your First Product
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Wishlist</CardTitle>
                    <CardDescription>Products you've saved for later</CardDescription>
                  </div>
                  <Link href="/products">
                    <Button variant="outline">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Browse Products
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {wishlistProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlistProducts.map((product) => (
                      <Card key={product.id} className="overflow-hidden">
                        <div className="relative pt-[60%] bg-gray-100">
                          <img
                            src={product.images?.[0] || "/placeholder.svg?height=150&width=200"}
                            alt={product.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant={product.condition === "New" ? "default" : "secondary"}>
                              {product.condition}
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute top-2 left-2 bg-white/80 hover:bg-white"
                            onClick={() => handleRemoveFromWishlist(product.id)}
                          >
                            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                          </Button>
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-center mb-2">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={product.seller?.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">
                                {product.seller?.full_name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">
                              {product.seller?.full_name || "Unknown Seller"}
                            </span>
                          </div>
                          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.title}</h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                          <p className="text-lg font-bold text-blue-600 mb-3">${product.price.toFixed(2)}</p>
                          <div className="flex space-x-2">
                            <Link href={`/products/${product.id}`} className="flex-1">
                              <Button className="w-full bg-blue-600 hover:bg-blue-700">View Details</Button>
                            </Link>
                            <Button
                              variant="outline"
                              onClick={() => handleRemoveFromWishlist(product.id)}
                              disabled={isLoading}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-500 mb-4">Save products you're interested in by clicking the heart icon</p>
                    <Link href="/products">
                      <Button>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Browse Products
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              {/* Change Password */}
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="current-password"
                          type="password"
                          placeholder="Enter current password"
                          className="pl-10"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Enter new password"
                          className="pl-10"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirm new password"
                          className="pl-10"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={isLoading}>
                      <Lock className="h-4 w-4 mr-2" />
                      {isLoading ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                  <CardDescription>Manage your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" onClick={handleSignOut} className="w-full">
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
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
