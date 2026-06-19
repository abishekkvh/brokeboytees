import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Type for strict status safety
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

// 1. STATS (Dashboard)
export const useAdminStats = () => {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const { data: products } = await supabase.from('products').select('*');
      const { data: orders } = await supabase.from('orders').select('total_amount, status');

      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0;
      const activeOrders = orders?.filter(o => o.status === 'pending' || o.status === 'processing').length || 0;
      const lowStockProducts = products?.filter(p => (p.stock_quantity || 0) < 5) || [];

      return { totalRevenue, activeOrders, totalProducts: products?.length || 0, lowStockProducts };
    }
  });
};

// 2. PRODUCTS (List View)
export const useAdminProducts = () => {
  return useQuery({
    queryKey: ['adminProducts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

// 3. DELETE PRODUCT
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    }
  });
};

// 4. ORDERS (Order Management) - TEST VERSION
export const useAdminOrders = () => {
  return useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          payment_status,
          total_amount,
          created_at,
          shipping_address,
          tracking_number,
          carrier,
          order_items (
            id,
            product_name,
            quantity,
            size,
            color,
            price_at_purchase
          )
        `) // Removed profiles join to isolate the error
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });
};

// 5. UPDATE ORDER STATUS
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, trackingNumber, carrier }: { 
      id: string; 
      status: OrderStatus; 
      trackingNumber?: string; 
      carrier?: string; 
    }) => {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status, 
          tracking_number: trackingNumber, 
          carrier 
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Order updated successfully');
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to update order';
      toast.error(message);
      console.error(error);
    }
  });
};