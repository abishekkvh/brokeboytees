import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useAdmin() {
  const { user } = useAuth();

  const { data: isAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      if (error) return false;
      return data;
    },
    enabled: !!user,
  });

  return { isAdmin: isAdmin ?? false, isCheckingAdmin };
}

export function useAdminProducts() {
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createProduct = useMutation({
    mutationFn: async (product: {
      name: string;
      description?: string;
      price: number;
      category: 'hoodie' | 't-shirt' | 'shirt';
      image_url: string;
      stock_quantity: number;
      sizes?: string[];
      colors?: string[];
      is_featured?: boolean;
      is_new?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: unknown }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    products,
    isLoading,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

export function useAdminOrders() {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (full_name, email),
          order_items (
            id,
            product_name,
            quantity,
            size,
            price_at_purchase
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status, trackingNumber, carrier }: {
      id: string;
      status: string;
      trackingNumber?: string;
      carrier?: string;
    }) => {
      const updates: Record<string, unknown> = { status };
      
      if (trackingNumber) updates.tracking_number = trackingNumber;
      if (carrier) updates.carrier = carrier;
      if (status === 'shipped') updates.shipped_at = new Date().toISOString();
      if (status === 'delivered') updates.delivered_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  return {
    orders,
    isLoading,
    updateOrderStatus,
  };
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Get total revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, status');

      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) ?? 0;
      const activeOrders = orders?.filter((o) => o.status === 'pending' || o.status === 'processing').length ?? 0;

      // Get low stock products
      const { data: lowStockProducts } = await supabase
        .from('products')
        .select('id, name, stock_quantity')
        .lt('stock_quantity', 10)
        .order('stock_quantity', { ascending: true });

      // Get total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      return {
        totalRevenue,
        activeOrders,
        lowStockProducts: lowStockProducts ?? [],
        totalProducts: totalProducts ?? 0,
      };
    },
  });
}