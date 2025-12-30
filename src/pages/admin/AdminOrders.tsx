import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Truck, CheckCircle, Loader2 } from 'lucide-react';
import { useAdminOrders } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AdminOrders() {
  const { orders, isLoading, updateOrderStatus } = useAdminOrders();
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredOrders = orders?.filter((order) =>
    order.id.toLowerCase().includes(search.toLowerCase()) ||
    (order.profiles as { email?: string } | null)?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const currentOrder = orders?.find((o) => o.id === selectedOrder);

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      await updateOrderStatus.mutateAsync({
        id: selectedOrder,
        status: newStatus,
        trackingNumber: trackingNumber || undefined,
        carrier: carrier || undefined,
      });
      toast.success('Order status updated');
      setSelectedOrder(null);
      setNewStatus('');
      setTrackingNumber('');
      setCarrier('');
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">ORDERS</h1>
        <p className="text-muted-foreground mt-1">{orders?.length || 0} total orders</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by order ID or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 border-2 border-primary"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-background border-2 border-primary overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="text-left p-4 font-heading text-sm tracking-wider">ORDER</th>
                <th className="text-left p-4 font-heading text-sm tracking-wider">CUSTOMER</th>
                <th className="text-left p-4 font-heading text-sm tracking-wider">DATE</th>
                <th className="text-left p-4 font-heading text-sm tracking-wider">STATUS</th>
                <th className="text-left p-4 font-heading text-sm tracking-wider">TOTAL</th>
                <th className="text-right p-4 font-heading text-sm tracking-wider">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders?.map((order, index) => {
                const profile = order.profiles as { full_name?: string; email?: string } | null;
                
                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t border-muted"
                  >
                    <td className="p-4">
                      <span className="font-heading text-sm">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm">{profile?.full_name || 'Guest'}</p>
                        <p className="text-xs text-muted-foreground">{profile?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{formatDate(order.created_at)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-heading uppercase ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 font-heading text-sm">
                      {formatPrice(Number(order.total_amount))}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order.id);
                            setNewStatus(order.status);
                            setTrackingNumber(order.tracking_number || '');
                            setCarrier(order.carrier || '');
                          }}
                          className="border-2 border-primary"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg border-2 border-primary">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              ORDER #{currentOrder?.id.slice(0, 8).toUpperCase()}
            </DialogTitle>
          </DialogHeader>

          {currentOrder && (
            <div className="space-y-6">
              {/* Order Items */}
              <div>
                <h3 className="font-heading text-sm tracking-wider mb-3">ITEMS</h3>
                <div className="space-y-2 text-sm">
                  {(currentOrder.order_items as { id: string; product_name: string; quantity: number; size: string; price_at_purchase: number }[] | null)?.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>
                        {item.product_name} × {item.quantity}
                        <span className="text-muted-foreground ml-2">({item.size})</span>
                      </span>
                      <span>{formatPrice(item.price_at_purchase * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-muted flex justify-between font-heading">
                    <span>TOTAL</span>
                    <span>{formatPrice(Number(currentOrder.total_amount))}</span>
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <div className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="mt-1 border-2 border-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newStatus === 'shipped' && (
                  <>
                    <div>
                      <Label>Carrier</Label>
                      <Input
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value)}
                        className="mt-1 border-2 border-primary"
                        placeholder="e.g., UPS, FedEx"
                      />
                    </div>
                    <div>
                      <Label>Tracking Number</Label>
                      <Input
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="mt-1 border-2 border-primary"
                        placeholder="Enter tracking number"
                      />
                    </div>
                  </>
                )}

                <Button
                  onClick={handleUpdateStatus}
                  disabled={updateOrderStatus.isPending}
                  className="w-full btn-brutal"
                >
                  {updateOrderStatus.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'UPDATE ORDER'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}