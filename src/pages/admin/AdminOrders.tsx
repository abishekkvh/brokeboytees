import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Loader2 } from 'lucide-react';
import { useAdminOrders, useUpdateOrderStatus, OrderStatus } from '@/hooks/useAdmin';
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

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  size: string;
  price_at_purchase: number;
}

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

export default function AdminOrders() {
  const { data: orders, isLoading } = useAdminOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredOrders = orders?.filter((order) => {
    const searchLower = search.toLowerCase();
    const orderIdMatches = order.id.toLowerCase().includes(searchLower);
    const profile = order.profiles as { email?: string; full_name?: string } | null;
    const emailMatches = profile?.email?.toLowerCase().includes(searchLower);
    return !search || orderIdMatches || emailMatches;
  });

  const currentOrder = orders?.find((o) => o.id === selectedOrder);

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      await updateOrderStatus.mutateAsync({
        id: selectedOrder,
        status: newStatus,
        trackingNumber: trackingNumber || undefined,
        carrier: carrier || undefined,
      });
      setSelectedOrder(null);
    } catch (error) {
      // Handled by mutation toast
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-8">
        <Skeleton className="h-10 w-48 bg-primary/10" />
        <Skeleton className="h-96 w-full bg-primary/5" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl font-bold tracking-tighter">ORDERS</h1>
        <p className="text-sm text-muted-foreground uppercase font-bold tracking-widest mt-1">
          {orders?.length || 0} Drops Processed
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
        <Input
          placeholder="SEARCH BY ORDER ID OR EMAIL..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-14 border-4 border-black rounded-none font-heading text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0"
        />
      </div>

      <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-black text-white border-b-4 border-black">
              <tr>
                <th className="p-4 font-heading text-xs tracking-widest uppercase">ID</th>
                <th className="p-4 font-heading text-xs tracking-widest uppercase">Customer</th>
                <th className="p-4 font-heading text-xs tracking-widest uppercase">Date</th>
                <th className="p-4 font-heading text-xs tracking-widest uppercase">Status</th>
                <th className="p-4 font-heading text-xs tracking-widest uppercase text-right">Action</th>
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
                    transition={{ delay: index * 0.03 }}
                    className="border-b-2 border-black hover:bg-secondary/20"
                  >
                    <td className="p-4 font-heading text-sm font-bold">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-black uppercase">{profile?.full_name || 'Guest'}</p>
                      <p className="text-[10px] text-muted-foreground">{profile?.email || 'N/A'}</p>
                    </td>
                    <td className="p-4 text-xs font-bold uppercase">{formatDate(order.created_at)}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase border-2 border-black ${statusColors[order.status as OrderStatus]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedOrder(order.id);
                          setNewStatus(order.status as OrderStatus);
                          setTrackingNumber(order.tracking_number || '');
                          setCarrier(order.carrier || '');
                        }}
                        className="border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl border-4 border-black rounded-none shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-0">
          <DialogHeader className="p-6 border-b-4 border-black bg-black text-white">
            <DialogTitle className="font-heading text-2xl tracking-tighter uppercase">
              Order Details #{currentOrder?.id.slice(0, 8).toUpperCase()}
            </DialogTitle>
          </DialogHeader>

          {currentOrder && (
            <div className="p-6 space-y-8">
              <div className="border-4 border-black p-4 bg-secondary/10">
                <h3 className="font-heading text-sm font-black tracking-widest mb-4 border-b-2 border-black pb-2 uppercase">Order Summary</h3>
                <div className="space-y-4">
                  {(currentOrder.order_items as unknown as OrderItem[])?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm font-bold">
                      <div className="flex flex-col">
                        <span className="uppercase">{item.product_name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">Size: {item.size} × {item.quantity}</span>
                      </div>
                      <span>{formatPrice(item.price_at_purchase * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="pt-4 border-t-4 border-black flex justify-between font-heading text-lg font-black">
                    <span>GRAND TOTAL</span>
                    <span>{formatPrice(Number(currentOrder.total_amount))}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-black text-xs uppercase">Order Status</Label>
                    <Select value={newStatus} onValueChange={(val: OrderStatus) => setNewStatus(val)}>
                      <SelectTrigger className="border-2 border-black rounded-none font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black rounded-none font-bold">
                        <SelectItem value="pending">PENDING</SelectItem>
                        <SelectItem value="processing">PROCESSING</SelectItem>
                        <SelectItem value="shipped">SHIPPED</SelectItem>
                        <SelectItem value="delivered">DELIVERED</SelectItem>
                        <SelectItem value="cancelled">CANCELLED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleUpdateStatus}
                      disabled={updateOrderStatus.isPending}
                      className="w-full h-10 btn-brutal bg-green-500 text-white hover:bg-green-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                    >
                      {updateOrderStatus.isPending ? <Loader2 className="animate-spin" /> : 'SAVE CHANGES'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}