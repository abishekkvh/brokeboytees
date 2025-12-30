import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useOrder } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const trackingSteps = [
  { status: 'pending', label: 'Order Placed', icon: Clock },
  { status: 'processing', label: 'Processing', icon: Package },
  { status: 'shipped', label: 'Shipped', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: order, isLoading } = useOrder(orderId || '');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStepStatus = (stepStatus: string, orderStatus: string) => {
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(orderStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-secondary">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-64" />
            </div>
            <Skeleton className="h-80" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-3xl mb-4">ORDER NOT FOUND</h1>
          <p className="text-muted-foreground mb-8">This order doesn't exist.</p>
          <Link to="/orders">
            <Button className="btn-brutal">VIEW ALL ORDERS</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Orders
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background border-2 border-primary p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading text-2xl md:text-3xl font-bold">
                    ORDER #{order.id.slice(0, 8).toUpperCase()}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Placed on {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-2xl">{formatPrice(Number(order.total_amount))}</p>
                </div>
              </div>
            </motion.div>

            {/* Tracking Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-background border-2 border-primary p-6"
            >
              <h2 className="font-heading text-lg tracking-wider mb-6">ORDER STATUS</h2>
              
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted" />
                
                <div className="space-y-8">
                  {trackingSteps.map((step, index) => {
                    const stepStatus = getStepStatus(step.status, order.status);
                    const StepIcon = step.icon;
                    
                    return (
                      <div key={step.status} className="relative flex items-start gap-4">
                        <div
                          className={`relative z-10 w-12 h-12 flex items-center justify-center border-2 ${
                            stepStatus === 'completed'
                              ? 'bg-primary border-primary text-primary-foreground'
                              : stepStatus === 'current'
                              ? 'bg-accent border-accent text-accent-foreground'
                              : 'bg-background border-muted text-muted-foreground'
                          }`}
                        >
                          <StepIcon className="w-5 h-5" />
                        </div>
                        <div className="pt-2">
                          <h3 className={`font-heading text-sm tracking-wider ${
                            stepStatus === 'upcoming' ? 'text-muted-foreground' : ''
                          }`}>
                            {step.label.toUpperCase()}
                          </h3>
                          {stepStatus === 'current' && (
                            <p className="text-sm text-muted-foreground mt-1">In progress</p>
                          )}
                          {step.status === 'shipped' && order.tracking_number && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Tracking: {order.tracking_number}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-background border-2 border-primary p-6"
            >
              <h2 className="font-heading text-lg tracking-wider mb-6">ITEMS</h2>
              
              <div className="space-y-4">
                {order.order_items?.map((item: { 
                  id: string; 
                  product_name: string; 
                  quantity: number; 
                  size: string; 
                  color?: string;
                  price_at_purchase: number;
                  products?: { image_url: string };
                }) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-muted last:border-0 last:pb-0">
                    <div className="w-20 h-20 border-2 border-primary overflow-hidden flex-shrink-0 bg-secondary">
                      {item.products?.image_url && (
                        <img
                          src={item.products.image_url}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-heading text-sm">{item.product_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Size: {item.size} {item.color && `• Color: ${item.color}`} • Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-heading text-sm">
                      {formatPrice(item.price_at_purchase * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-background border-2 border-primary p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5" />
                <h2 className="font-heading text-lg tracking-wider">SHIPPING</h2>
              </div>
              
              <div className="text-sm space-y-1">
                <p>{order.shipping_address}</p>
                <p>{order.shipping_city}, {order.shipping_postal_code}</p>
                <p>{order.shipping_country}</p>
              </div>
            </motion.div>

            {/* Need Help */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-background border-2 border-primary p-6"
            >
              <h2 className="font-heading text-lg tracking-wider mb-4">NEED HELP?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Questions about your order? We're here to help.
              </p>
              <Button variant="outline" className="w-full btn-brutal-outline">
                CONTACT SUPPORT
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}