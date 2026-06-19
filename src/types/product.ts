import { Database } from '@/api/supabase/types';

export type ProductRow = Database['public']['Tables']['products']['Row'];
export type ProductCategory = Database['public']['Enums']['product_category'];

export interface Product extends Omit<ProductRow, 'category'> {
  category: ProductCategory;
}

export interface NewProductDropConfig {
  daysAsNew: number;
}
