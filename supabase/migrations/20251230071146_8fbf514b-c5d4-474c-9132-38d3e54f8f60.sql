-- Create category enum
CREATE TYPE public.product_category AS ENUM ('hoodie', 't-shirt', 'shirt');

-- Create order status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  category product_category NOT NULL,
  image_url TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  sizes TEXT[] DEFAULT ARRAY['S', 'M', 'L', 'XL'],
  colors TEXT[] DEFAULT ARRAY['Black'],
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_on_sale BOOLEAN DEFAULT false,
  sale_price NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'pending',
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  size TEXT NOT NULL,
  color TEXT,
  price_at_purchase NUMERIC(10,2) NOT NULL CHECK (price_at_purchase >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Products policies (public read, admin write)
CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT
  USING (true);

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view their own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for their orders"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for auto-creating profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample products
INSERT INTO public.products (name, description, price, category, image_url, images, stock_quantity, sizes, colors, is_featured, is_new) VALUES
  ('VOID OVERSIZED HOODIE', 'Premium heavyweight cotton hoodie with oversized fit. Features embroidered BROKEBOY logo.', 149.00, 'hoodie', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800', ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800', 'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800'], 50, ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Black', 'Gray'], true, true),
  ('UNDEFINED TEE', 'Classic fit tee with bold typography. 100% organic cotton.', 59.00, 't-shirt', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'], 100, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'White'], true, false),
  ('BROKE ESSENTIAL TEE', 'Minimal design tee for everyday wear. Soft premium fabric.', 49.00, 't-shirt', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800', ARRAY['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800'], 150, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'White', 'Gray'], false, false),
  ('STREET PROPHET HOODIE', 'Relaxed fit hoodie with back graphic print. Double-lined hood.', 139.00, 'hoodie', 'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800', ARRAY['https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800'], 30, ARRAY['M', 'L', 'XL'], ARRAY['Black'], true, true),
  ('CHAOS BUTTON-UP', 'Oversized button-up shirt with contrast stitching.', 119.00, 'shirt', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800', ARRAY['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800'], 40, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'White'], false, true),
  ('NOIR DISTRICT HOODIE', 'All-black heavyweight hoodie with embossed logo.', 159.00, 'hoodie', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800', ARRAY['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800'], 25, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black'], true, false),
  ('REBEL GRAPHIC TEE', 'Statement tee with bold front graphic.', 55.00, 't-shirt', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800', ARRAY['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800'], 80, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'White'], false, false),
  ('URBAN FLOW SHIRT', 'Relaxed oversized shirt with drop shoulders.', 99.00, 'shirt', 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800', ARRAY['https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800'], 35, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'Olive'], false, true);