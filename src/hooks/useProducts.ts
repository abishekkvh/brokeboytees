import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductCategory = Database['public']['Enums']['product_category'];

export interface Product extends Omit<ProductRow, 'category'> {
  category: ProductCategory;
}

export function useProducts(filters?: {
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'newest';
  featured?: boolean;
  isNew?: boolean;
}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*');

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters?.featured) {
        query = query.eq('is_featured', true);
      }

      if (filters?.isNew) {
        query = query.eq('is_new', true);
      }

      if (filters?.sortBy === 'price-asc') {
        query = query.order('price', { ascending: true });
      } else if (filters?.sortBy === 'price-desc') {
        query = query.order('price', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Product | null;
    },
    enabled: !!id,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .limit(6);

      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useNewProducts() {
  return useQuery({
    queryKey: ['products', 'new'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_new', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
  });
}