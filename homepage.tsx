"use client"

import { Search, ShoppingCart, User, Smartphone, Shirt, Home, Baby, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { auth } from "@/lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Component() {
  const { user, loading } = useAuth()

  const categories = [
    {
      id: 1,
      name: "Electronics",
      icon: Smartphone,
      description: "Latest gadgets and tech",
      slug: "electronics",
    },
    {
      id: 2,
      name: "Fashion",
      icon: Shirt,
      description: "Clothing and accessories",
      slug: "fashion",
    },
    {
      id: 3,
      name: "Home",
      icon: Home,
      description: "Home and garden essentials",
      slug: "home",
    },
    {
      id: 4,
      name: "Toys",
      icon: Baby,
      description: "Fun for all ages",
      slug: "toys",
    },
  ]

  const handleSignOut = async () => {
    await auth.signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-2xl font-bold text-gray-900">MarketPlace</span>
              </Link>
            </div>

            {/* Centered Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search for anything..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <Link href="/products">
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                  Browse Products
                </Button>
              </Link>

              {!loading && (
                <>
                  {user ? (
                    <>
                      <Link href="/auth?tab=sell">
                        <Button
                          variant="ghost"
                          className="text-gray-700 hover:text-gray-900 hidden sm:flex items-center"
                        >
                          <Tag className="h-4 w-4 mr-2" />
                          Sell
                        </Button>
                      </Link>
                      <Link href="/profile">
                        <Button variant="ghost" className="text-gray-700 hover:text-gray-900 flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback className="text-xs">
                              {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="hidden md:block">
                            {user.user_metadata?.full_name || user.email?.split("@")[0]}
                          </span>
                        </Button>
                      </Link>
                      <Button variant="ghost" onClick={handleSignOut} className="text-gray-700 hover:text-gray-900">
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth?tab=sell">
                        <Button
                          variant="ghost"
                          className="text-gray-700 hover:text-gray-900 hidden sm:flex items-center"
                        >
                          <Tag className="h-4 w-4 mr-2" />
                          Sell
                        </Button>
                      </Link>
                      <Link href="/auth">
                        <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                          <User className="h-4 w-4 mr-2" />
                          Login
                        </Button>
                      </Link>
                      <Link href="/auth?tab=signup">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">Sign Up</Button>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {user ? `Welcome back, ${user.user_metadata?.full_name || "there"}!` : "Welcome to MarketPlace"}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover amazing deals on millions of items from trusted sellers worldwide
            </p>
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="What are you looking for today?"
                  className="block w-full pl-12 pr-4 py-4 text-lg border-0 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-lg text-gray-600">Explore our most popular categories and find exactly what you need</p>
          </div>

          {/* Responsive Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <Link key={category.id} href={`/products?category=${category.name}`}>
                  <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-gray-200 hover:border-blue-300">
                    <CardContent className="p-8 text-center">
                      <div className="mb-4 flex justify-center">
                        <div className="p-4 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors duration-300">
                          <IconComponent className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 text-sm">{category.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Additional Content Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Shipping</h3>
              <p className="text-gray-600">Free shipping on orders over $50</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Trusted Sellers</h3>
              <p className="text-gray-600">Buy with confidence from verified sellers</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Returns</h3>
              <p className="text-gray-600">30-day return policy on most items</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sell Your Products CTA */}
      <section className="bg-gray-50 py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="md:flex items-center justify-between">
              <div className="mb-6 md:mb-0 md:mr-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {user ? "Ready to sell more products?" : "Ready to sell your products?"}
                </h2>
                <p className="text-blue-100 text-lg">
                  {user
                    ? "List another item and reach millions of buyers worldwide."
                    : "Join thousands of sellers and reach millions of buyers worldwide."}
                </p>
              </div>
              <Link href="/auth?tab=sell">
                <Button className="w-full md:w-auto bg-white hover:bg-gray-100 text-blue-600 font-semibold py-3 px-6 text-lg">
                  <Tag className="mr-2 h-5 w-5" />
                  {user ? "List Product" : "Start Selling"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

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
