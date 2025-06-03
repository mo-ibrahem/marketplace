-- Drop the table if it exists to recreate it properly
DROP TABLE IF EXISTS public.wishlists;

-- Create wishlist table
CREATE TABLE public.wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON public.wishlists(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_product ON public.wishlists(user_id, product_id);

-- Enable Row Level Security
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own wishlists" ON public.wishlists;
DROP POLICY IF EXISTS "Users can insert into their own wishlists" ON public.wishlists;
DROP POLICY IF EXISTS "Users can delete from their own wishlists" ON public.wishlists;

-- Create policies for wishlists
CREATE POLICY "Users can view their own wishlists" ON public.wishlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own wishlists" ON public.wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own wishlists" ON public.wishlists
  FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.wishlists TO authenticated;
GRANT ALL ON public.wishlists TO service_role;
