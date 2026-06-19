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

      // Category Filter
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      // Price Filters
      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      // Featured Filter (Manual Flag)
      if (filters?.featured) {
        query = query.eq('is_featured', true);
      }

      // UPDATED: "New" Filter (Automatic 45-day Logic)
      if (filters?.isNew) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 45);
        query = query.gt('created_at', cutoffDate.toISOString());
      }

      // Sorting
      if (filters?.sortBy === 'price-asc') {
        query = query.order('price', { ascending: true });
      } else if (filters?.sortBy === 'price-desc') {
        query = query.order('price', { ascending: false });
      } else {
        // Default sort: Newest first
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

// UPDATED: Dedicated hook for "New Drops" page
// Automatically fetches only items from the last 45 days
export function useNewProducts() {
  return useQuery({
    queryKey: ['products', 'new'],
    queryFn: async () => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 45);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gt('created_at', cutoffDate.toISOString()) // gt = Greater Than (newer than)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
  });
}