import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart, Package, AlertTriangle } from 'lucide-react';
import { useAdminStats } from '@/hooks/useAdmin';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: 'text-green-500',
    },
    {
      title: 'Active Orders',
      value: stats?.activeOrders || 0,
      icon: ShoppingCart,
      color: 'text-blue-500',
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-purple-500',
    },
    {
      title: 'Low Stock Alerts',
      value: stats?.lowStockProducts?.length || 0,
      icon: AlertTriangle,
      color: 'text-yellow-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">DASHBOARD</h1>
        <p className="text-muted-foreground mt-1">Welcome back to your admin dashboard.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-background border-2 border-primary p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="font-heading text-2xl mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 bg-secondary ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Low Stock Alert */}
      {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-background border-2 border-yellow-500 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h2 className="font-heading text-lg tracking-wider">LOW STOCK ALERTS</h2>
          </div>
          
          <div className="space-y-3">
            {stats.lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between py-2 border-b border-muted last:border-0"
              >
                <span className="text-sm">{product.name}</span>
                <span className={`text-sm font-heading ${
                  product.stock_quantity === 0 ? 'text-red-500' : 'text-yellow-500'
                }`}>
                  {product.stock_quantity} left
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}