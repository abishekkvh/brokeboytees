import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

// 1. Define specific interfaces to solve "Unexpected any"
interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  size: string;
  color?: string;
  price_at_purchase: number;
  products?: {
    image_url: string;
  };
}

interface Order {
  id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  created_at: string;
  order_items: OrderItem[];
}

const statusIcons: Record<string, LucideIcon> = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: CheckCircle2,
};

export default function MyOrders() {
  // 2. The useOrders hook correctly fetches user-specific orders
  const { data: orders, isLoading } = useOrders();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-8">
        <Skeleton className="h-12 w-64 bg-black/10" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full bg-black/5 border-4 border-black" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 py-12">
      <div className="container mx-auto px-4">
        <header className="mb-12">
          <h1 className="font-heading text-5xl font-black tracking-tighter uppercase">Order History</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest mt-2">
            Your personal collection of drops
          </p>
        </header>

        {orders && (orders as unknown as Order[]).length > 0 ? (
          <div className="space-y-6">
            {(orders as unknown as Order[]).map((order, index) => {
              const StatusIcon = statusIcons[order.status] || Clock;
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-background border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
                >
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <h2 className="font-heading text-xl font-bold">
                        PLACED ON {new Date(order.created_at).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
                      </h2>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase flex items-center gap-2">
                          <StatusIcon className="w-3 h-3" />
                          {order.status}
                        </span>
                        <span className="text-sm font-bold uppercase">Total: {formatPrice(Number(order.total_amount))}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-4">
                        {order.order_items?.slice(0, 3).map((item, i) => (
                          <div key={i} className="w-12 h-12 border-2 border-black bg-white overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                             {item.products?.image_url ? (
                               <img 
                                 src={item.products.image_url} 
                                 alt={item.product_name} 
                                 className="w-full h-full object-cover"
                               />
                             ) : (
                               <div className="w-full h-full bg-zinc-200 flex items-center justify-center text-[8px] font-bold uppercase">Item</div>
                             )}
                          </div>
                        ))}
                      </div>
                      <Link to={`/order-confirmation/${order.id}`}>
                        <Button className="btn-brutal bg-white text-black hover:bg-black hover:text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all">
                          VIEW DETAILS <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 border-4 border-dashed border-black/20">
            <h3 className="font-heading text-2xl font-bold uppercase mb-4">You haven't copped anything yet</h3>
            <Link to="/shop">
              <Button className="btn-brutal bg-black text-white px-8 h-14 text-lg">
                BROWSE THE SHOP
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}