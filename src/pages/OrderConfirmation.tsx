import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { useOrder } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading } = useOrder(orderId || '');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-16 w-16 mx-auto rounded-full" />
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="bg-background border-2 border-primary p-8 md:p-12">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-6" />
            
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              ORDER CONFIRMED
            </h1>
            
            <p className="text-muted-foreground mb-2">
              Thank you for your order!
            </p>
            
            {order && (
              <p className="text-sm text-muted-foreground mb-8">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </p>
            )}

            {order && (
              <div className="bg-secondary p-6 mb-8 text-left">
                <h2 className="font-heading text-sm tracking-wider mb-4">ORDER DETAILS</h2>
                <div className="space-y-3">
                  {order.order_items?.map((item: { id: string; product_name: string; quantity: number; size: string; price_at_purchase: number }) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.product_name} × {item.quantity}
                        <span className="text-muted-foreground ml-2">({item.size})</span>
                      </span>
                      <span>{formatPrice(item.price_at_purchase * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-primary flex justify-between font-heading">
                    <span>TOTAL</span>
                    <span>{formatPrice(Number(order.total_amount))}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-8">
              <Package className="w-5 h-5" />
              <span>You'll receive shipping updates via email</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {order && (
                <Link to={`/orders/${order.id}`}>
                  <Button variant="outline" className="btn-brutal-outline">
                    TRACK ORDER
                  </Button>
                </Link>
              )}
              <Link to="/shop">
                <Button className="btn-brutal">
                  CONTINUE SHOPPING
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}