"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Search, ShoppingCart, Filter, X, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"

// Sample product data
const products = [
  {
    id: 1,
    title: "Wireless Bluetooth Headphones",
    description: "Premium noise-cancelling headphones with 20-hour battery life",
    price: 149.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Electronics",
    condition: "New",
    rating: 4.5,
  },
  {
    id: 2,
    title: "Smartphone Stand Holder",
    description: "Adjustable aluminum stand compatible with all smartphones",
    price: 24.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Electronics",
    condition: "New",
    rating: 4.2,
  },
  {
    id: 3,
    title: "Vintage Denim Jacket",
    description: "Classic medium-wash denim jacket with button closure",
    price: 59.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Fashion",
    condition: "Used",
    rating: 4.0,
  },
  {
    id: 4,
    title: "Smart Home Speaker",
    description: "Voice-controlled speaker with premium sound quality",
    price: 129.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Electronics",
    condition: "New",
    rating: 4.7,
  },
  {
    id: 5,
    title: "Ceramic Coffee Mug Set",
    description: "Set of 4 handcrafted ceramic mugs in assorted colors",
    price: 34.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Home",
    condition: "New",
    rating: 4.3,
  },
  {
    id: 6,
    title: "Wooden Cutting Board",
    description: "Premium acacia wood cutting board with juice groove",
    price: 29.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Home",
    condition: "New",
    rating: 4.6,
  },
  {
    id: 7,
    title: "Vintage Leather Backpack",
    description: "Handcrafted genuine leather backpack with multiple compartments",
    price: 89.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Fashion",
    condition: "Used",
    rating: 4.1,
  },
  {
    id: 8,
    title: "Stainless Steel Water Bottle",
    description: "Vacuum insulated bottle that keeps drinks cold for 24 hours",
    price: 19.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Home",
    condition: "New",
    rating: 4.4,
  },
  {
    id: 9,
    title: "Designer Sunglasses",
    description: "UV protection sunglasses with polarized lenses",
    price: 79.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Fashion",
    condition: "New",
    rating: 4.3,
  },
  {
    id: 10,
    title: "Wireless Gaming Mouse",
    description: "High-precision gaming mouse with RGB lighting",
    price: 69.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Electronics",
    condition: "New",
    rating: 4.6,
  },
  {
    id: 11,
    title: "Educational Building Blocks",
    description: "Colorful building blocks set for creative learning",
    price: 39.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Toys",
    condition: "New",
    rating: 4.8,
  },
  {
    id: 12,
    title: "Remote Control Car",
    description: "Fast RC car with rechargeable battery and remote",
    price: 49.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Toys",
    condition: "New",
    rating: 4.4,
  },
]

// Available categories
const categories = ["All Categories", "Electronics", "Fashion", "Home", "Toys"]

export default function ProductListing() {
  const searchParams = useSearchParams()

  // State for filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [priceRange, setPriceRange] = useState([0, 200])
  const [conditions, setConditions] = useState({
    new: true,
    used: true,
  })
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // Set initial category from URL params
  useEffect(() => {
    const categoryParam = searchParams.get("category")
    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategory(categoryParam)
    }
  }, [searchParams])

  // Filter products based on current filters
  const filteredProducts = products.filter((product) => {
    // Filter by search query
    if (
      searchQuery &&
      !product.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !product.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Filter by category
    if (selectedCategory !== "All Categories" && product.category !== selectedCategory) {
      return false
    }

    // Filter by price range
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false
    }

    // Filter by condition
    if ((product.condition === "New" && !conditions.new) || (product.condition === "Used" && !conditions.used)) {
      return false
    }

    return true
  })

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
            defaultValue={[0, 200]}
            max={200}
            step={1}
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
              checked={conditions.new}
              onCheckedChange={(checked) => setConditions({ ...conditions, new: checked === true })}
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
              checked={conditions.used}
              onCheckedChange={(checked) => setConditions({ ...conditions, used: checked === true })}
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
          setPriceRange([0, 200])
          setConditions({ new: true, used: true })
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
              <Link href="/products">
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                  Browse Products
                </Button>
              </Link>
              <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                Login
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Sign Up</Button>
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
                Showing <span className="font-medium">{filteredProducts.length}</span> results
                {selectedCategory !== "All Categories" && (
                  <span>
                    {" "}
                    in <span className="font-medium">{selectedCategory}</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Sort by:</span>
                <Select defaultValue="featured">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest Arrivals</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden border border-gray-200 h-full flex flex-col">
                    <div className="relative pt-[100%] bg-gray-100">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-medium">
                        {product.condition}
                      </div>
                    </div>
                    <CardContent className="flex-1 p-4">
                      <div className="flex items-center mb-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                      </div>
                      <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.title}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                      <p className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">Add to Cart</Button>
                    </CardFooter>
                  </Card>
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
                    setPriceRange([0, 200])
                    setConditions({ new: true, used: true })
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
