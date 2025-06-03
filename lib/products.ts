import { supabase } from "./supabase"

export interface Product {
  id: string
  title: string
  description: string
  price: number
  category: string
  condition: string
  images: string[]
  seller_id: string
  status: string
  created_at: string
  updated_at: string
  seller?: {
    full_name: string
    avatar_url?: string
  }
  isWishlisted?: boolean
}

export interface UserProfile {
  id: string
  full_name: string
  avatar_url?: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
}

export const productService = {
  // Create a new product
  createProduct: async (productData: {
    title: string
    description: string
    price: number
    category: string
    condition: string
    images: string[]
  }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          ...productData,
          seller_id: user.id,
          status: "active",
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get all active products with seller info
  getProducts: async (filters?: {
    category?: string
    search?: string
    minPrice?: number
    maxPrice?: number
    condition?: string[]
  }) => {
    // First, query products
    let query = supabase.from("products").select("*").eq("status", "active").order("created_at", { ascending: false })

    if (filters?.category && filters.category !== "All Categories") {
      query = query.eq("category", filters.category)
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte("price", filters.minPrice)
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte("price", filters.maxPrice)
    }

    if (filters?.condition && filters.condition.length > 0) {
      query = query.in("condition", filters.condition)
    }

    const { data: products, error } = await query

    if (error) throw error

    // If we have products, fetch the seller profiles
    if (products && products.length > 0) {
      // Get unique seller IDs
      const sellerIds = [...new Set(products.map((product) => product.seller_id))]

      // Fetch profiles for these sellers
      const { data: profiles, error: profilesError } = await supabase
        .from("user_profiles")
        .select("id, full_name, avatar_url")
        .in("id", sellerIds)

      if (profilesError) throw profilesError

      // Create a map of seller profiles by ID for quick lookup
      const sellerProfiles = profiles
        ? profiles.reduce(
            (map, profile) => {
              map[profile.id] = profile
              return map
            },
            {} as Record<string, { id: string; full_name: string; avatar_url?: string }>,
          )
        : {}

      // Check if products are in user's wishlist
      const {
        data: { user },
      } = await supabase.auth.getUser()

      let wishlistedProductIds: string[] = []
      if (user) {
        try {
          const { data: wishlistItems } = await supabase.from("wishlists").select("product_id").eq("user_id", user.id)
          wishlistedProductIds = wishlistItems?.map((item) => item.product_id) || []
        } catch (error) {
          console.warn("Could not fetch wishlist items:", error)
        }
      }

      // Add seller info to each product
      const productsWithSellers = products.map((product) => ({
        ...product,
        seller: sellerProfiles[product.seller_id] || { full_name: "Unknown Seller" },
        isWishlisted: wishlistedProductIds.includes(product.id),
      }))

      return productsWithSellers as Product[]
    }

    return products as Product[]
  },

  // Get product by ID
  getProductById: async (productId: string) => {
    const { data: product, error } = await supabase.from("products").select("*").eq("id", productId).single()

    if (error) throw error

    if (product) {
      // Get seller profile
      const { data: sellerProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("id, full_name, avatar_url")
        .eq("id", product.seller_id)
        .single()

      if (profileError && profileError.code !== "PGRST116") throw profileError

      // Check if product is in user's wishlist
      const {
        data: { user },
      } = await supabase.auth.getUser()

      let isWishlisted = false
      if (user) {
        try {
          const { data: wishlistItem, error: wishlistError } = await supabase
            .from("wishlists")
            .select("id")
            .eq("user_id", user.id)
            .eq("product_id", productId)
            .maybeSingle()

          if (wishlistError) {
            console.warn("Error checking wishlist status:", wishlistError)
          } else {
            isWishlisted = !!wishlistItem
          }
        } catch (error) {
          console.warn("Error in wishlist check:", error)
          // Don't throw here, just log and continue with isWishlisted = false
        }
      }

      return {
        ...product,
        seller: sellerProfile || { full_name: "Unknown Seller" },
        isWishlisted,
      } as Product
    }

    return product as Product
  },

  // Get products by seller
  getProductsBySeller: async (sellerId: string) => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data as Product[]
  },

  // Update product
  updateProduct: async (productId: string, updates: Partial<Product>) => {
    const { data, error } = await supabase
      .from("products")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", productId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete product
  deleteProduct: async (productId: string) => {
    const { error } = await supabase.from("products").delete().eq("id", productId)

    if (error) throw error
  },

  // Add product to wishlist
  addToWishlist: async (productId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    try {
      const { data, error } = await supabase
        .from("wishlists")
        .insert([
          {
            user_id: user.id,
            product_id: productId,
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) {
        if (error.code === "23505") {
          // Already in wishlist (unique constraint violation)
          return { alreadyExists: true }
        }
        console.error("Supabase error:", error)
        throw new Error(`Failed to add to wishlist: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Add to wishlist error:", error)
      throw error
    }
  },

  // Remove product from wishlist
  removeFromWishlist: async (productId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    try {
      const { error } = await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId)

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(`Failed to remove from wishlist: ${error.message}`)
      }

      return true
    } catch (error) {
      console.error("Remove from wishlist error:", error)
      throw error
    }
  },

  // Get user's wishlist
  getWishlist: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    try {
      // Get wishlist items
      const { data: wishlistItems, error } = await supabase
        .from("wishlists")
        .select("product_id")
        .eq("user_id", user.id)

      if (error) throw error

      if (wishlistItems && wishlistItems.length > 0) {
        // Get product details for each wishlist item
        const productIds = wishlistItems.map((item) => item.product_id)

        const { data: products, error: productsError } = await supabase
          .from("products")
          .select("*")
          .in("id", productIds)

        if (productsError) throw productsError

        // Get seller profiles
        if (products && products.length > 0) {
          const sellerIds = [...new Set(products.map((product) => product.seller_id))]

          const { data: profiles, error: profilesError } = await supabase
            .from("user_profiles")
            .select("id, full_name, avatar_url")
            .in("id", sellerIds)

          if (profilesError) throw profilesError

          // Create a map of seller profiles
          const sellerProfiles = profiles
            ? profiles.reduce(
                (map, profile) => {
                  map[profile.id] = profile
                  return map
                },
                {} as Record<string, { id: string; full_name: string; avatar_url?: string }>,
              )
            : {}

          // Add seller info to each product
          const productsWithSellers = products.map((product) => ({
            ...product,
            seller: sellerProfiles[product.seller_id] || { full_name: "Unknown Seller" },
            isWishlisted: true,
          }))

          return productsWithSellers as Product[]
        }

        return products as Product[]
      }

      return [] as Product[]
    } catch (error) {
      console.error("Error fetching wishlist:", error)
      return [] as Product[]
    }
  },
}

export const profileService = {
  // Get user profile
  getProfile: async (userId: string) => {
    const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

    if (error && error.code !== "PGRST116") throw error
    return data as UserProfile | null
  },

  // Create or update user profile
  upsertProfile: async (profile: Partial<UserProfile>) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert({
        id: user.id,
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  },
}
