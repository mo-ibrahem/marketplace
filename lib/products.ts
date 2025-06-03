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

      // Add seller info to each product
      const productsWithSellers = products.map((product) => ({
        ...product,
        seller: sellerProfiles[product.seller_id] || { full_name: "Unknown Seller" },
      }))

      return productsWithSellers as Product[]
    }

    return products as Product[]
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
