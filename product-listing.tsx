"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Search, ShoppingCart, Filter, X, UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { productService, type Product } from "@/lib/products"
import { useAuth } from "@/hooks/useAuth"

// Available categories
const categories = [
  "All Categories",
  "Electronics",
  "Fashion",
  "Home",
  "Toys",
  "Books",
  "Sports",
  "Beauty",
  "Automotive",
]

export default function ProductListing() {
  const searchParams = useSearchParams()
  const { user } = useAuth()

  // State for filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [conditions, setConditions] = useState({
    New: true,
    Used: true,
  })
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Set initial category from URL params
  useEffect(() => {
    const categoryParam = searchParams.get("category")
    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategory(categoryParam)
    }
  }, [searchParams])

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const conditionFilters = Object.entries(conditions)
          .filter(([_, enabled]) => enabled)
          .map(([condition]) => condition)

        const filters = {
          category: selectedCategory,
          search: searchQuery,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          condition: conditionFilters,
        }

        const data = await productService.getProducts(filters)
        setProducts(data)
      } catch (error) {
        console.error("Error loading products:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [searchQuery, selectedCategory, priceRange, conditions])

  // Sidebar filter component
  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Categories</h3>
        <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Category" />
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

      <div>
        <h3 className="text-lg font-medium mb-3">Price Range</h3>
        <div className="px-2">
          <Slider
            defaultValue={[0, 1000]}
            max={1000}
            step={10}
            value={priceRange}
            onValueChange={(value) => setPriceRange(value)}
            className="mb-6"
          />
          <div className="flex items-center justify-between">
            <div className="bg-gray-100 px-3 py-1 rounded-md">${priceRange[0]}</div>
            <div className="bg-gray-100 px-3 py-1 rounded-md">${priceRange[1]}</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Condition</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="new"
              checked={conditions.New}
              onCheckedChange={(checked) => setConditions({ ...conditions, New: checked === true })}
            />
            <label
              htmlFor="new"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              New
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="used"
              checked={conditions.Used}
              onCheckedChange={(checked) => setConditions({ ...conditions, Used: checked === true })}
            />
            <label
              htmlFor="used"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Used
            </label>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setSearchQuery("")
          setSelectedCategory("All Categories")
          setPriceRange([0, 1000])
          setConditions({ New: true, Used: true })
        }}
      >
        Reset Filters
      </Button>
    </div>
  )

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
            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search for anything..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              {user && (
                <Link href="/profile">
                  <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
              )}
              <Link href="/auth">
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                  {user ? "Account" : "Login"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedCategory === "All Categories" ? "All Products" : `${selectedCategory} Products`}
          </h1>
          <p className="text-gray-600 mt-2">
            {selectedCategory === "All Categories"
              ? "Browse our complete collection of products"
              : `Discover amazing ${selectedCategory.toLowerCase()} products`}
          </p>
        </div>

        {/* Mobile Search Bar */}
        <div className="mb-6 md:hidden">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search products..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Mobile Filter Button */}
        <div className="mb-6 md:hidden">
          <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full flex items-center justify-center">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileFilterOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <FilterSidebar />
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <FilterSidebar />
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Top Filter Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{products.length}</span> results
                {selectedCategory !== "All Categories" && (
                  <span>
                    {" "}
                    in <span className="font-medium">{selectedCategory}</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Sort by:</span>
                <Select defaultValue="newest">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden border border-gray-200 h-full flex flex-col animate-pulse">
                    <div className="pt-[100%] bg-gray-200"></div>
                    <CardContent className="flex-1 p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`}>
                    <Card className="overflow-hidden border border-gray-200 h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="relative pt-[100%] bg-gray-100">
                        <img
                          src={product.images?.[0] || "/placeholder.svg?height=200&width=200"}
                          alt={product.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-medium">
                          {product.condition}
                        </div>
                      </div>
                      <CardContent className="flex-1 p-4">
                        <div className="flex items-center mb-2">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={product.seller?.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {product.seller?.full_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">{product.seller?.full_name || "Unknown Seller"}</span>
                        </div>
                        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.title}</h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                        <p className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={(e) => e.preventDefault()}>
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("All Categories")
                    setPriceRange([0, 1000])
                    setConditions({ New: true, Used: true })
                  }}
                >
                  Reset All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
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
