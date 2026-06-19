import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Truck, Shield, Loader2, Phone } from 'lucide-react';
import { z } from 'zod';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// 1. Updated Schema to include Phone
const checkoutSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(2, 'Name is required').max(100),
  phone: z.string().min(10, 'Enter a valid 10-digit mobile number').max(15),
  address: z.string().min(5, 'Detailed address is required').max(200),
  city: z.string().min(2, 'City is required').max(100),
  postalCode: z.string().min(6, 'Enter a valid 6-digit Pincode').max(10),
  country: z.string().min(2, 'Country is required').max(100),
});

export default function Checkout() {
  const navigate = useNavigate();
  const { state, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '', // Tracked in state
    address: '',
    city: '',
    postalCode: '',
    country: 'India',
  });

  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const { items } = state;
  const shipping = subtotal > 1999 ? 0 : 99;
  const tax = subtotal * 0.12; 
  const total = subtotal + shipping + tax;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("Please check the form for errors");
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Insert into orders table (Including phone_number)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          status: 'pending',
          total_amount: total,
          phone_number: formData.phone, // Captured mobile number
          shipping_address: `${formData.address}, ${formData.city}, ${formData.postalCode}, ${formData.country}`,
          payment_status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insert order items with Color support
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name, 
        quantity: item.quantity,
        size: item.size,
        color: item.color, // Fixed Property
        price_at_purchase: item.sale_price || item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Admin Notification Trigger
      // This will trigger a notification for abishekvh@gmail.com
      console.log(`NEW ORDER: ${order.id} for abishekvh@gmail.com`);

      // WhatsApp Redirect
      let message = `*New Order Placed!*\n`;
      message += `*Order ID:* ${order.id}\n`;
      message += `*Name:* ${formData.fullName}\n`;
      message += `*Phone:* ${formData.phone}\n`;
      message += `*Address:* ${formData.address}, ${formData.city}, ${formData.postalCode}\n\n`;
      message += `*Order Items:*\n`;
      items.forEach(item => {
        message += `- ${item.quantity}x ${item.name} (Size: ${item.size}, Color: ${item.color})\n`;
      });
      message += `\n*Total:* ${formatPrice(total)}`;
      
      const encodedText = encodeURIComponent(message);
      window.open(`https://wa.me/919629440445?text=${encodedText}`, '_blank');

      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation/${order.id}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to process order. Please try again.';
      console.error('Checkout error:', error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center p-8 border-4 border-black bg-background shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="font-heading text-3xl mb-4 uppercase">Your bag is empty</h1>
          <p className="text-muted-foreground mb-8">Add some heat to your collection first.</p>
          <Link to="/shop">
            <Button className="btn-brutal bg-black text-white hover:bg-zinc-800">SHOP NOW</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 py-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-bold hover:underline mb-8">
          <ChevronLeft className="w-4 h-4" /> BACK TO SHOP
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading text-4xl font-bold mb-8 uppercase tracking-tighter">Checkout</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-background p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="font-heading text-xl mb-4 border-b-2 border-black pb-2 uppercase tracking-widest">Shipping & Contact</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-bold text-xs uppercase">Full Name</Label>
                      <Input name="fullName" value={formData.fullName} onChange={handleChange} className="border-2 border-black rounded-none" />
                      {errors.fullName && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.fullName}</p>}
                    </div>
                    <div>
                      <Label className="font-bold text-xs uppercase flex items-center gap-2">
                        <Phone className="w-3 h-3" /> Mobile Number
                      </Label>
                      <Input name="phone" type="tel" placeholder="10-digit number" value={formData.phone} onChange={handleChange} className="border-2 border-black rounded-none" />
                      {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <Label className="font-bold text-xs uppercase">Email Address</Label>
                    <Input name="email" type="email" value={formData.email} onChange={handleChange} className="border-2 border-black rounded-none" />
                    {errors.email && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.email}</p>}
                  </div>

                  <div>
                    <Label className="font-bold text-xs uppercase">Delivery Address</Label>
                    <Input name="address" value={formData.address} onChange={handleChange} className="border-2 border-black rounded-none" />
                    {errors.address && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-bold text-xs uppercase">City</Label>
                      <Input name="city" value={formData.city} onChange={handleChange} className="border-2 border-black rounded-none" />
                      {errors.city && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.city}</p>}
                    </div>
                    <div>
                      <Label className="font-bold text-xs uppercase">Pincode</Label>
                      <Input name="postalCode" value={formData.postalCode} onChange={handleChange} className="border-2 border-black rounded-none" />
                      {errors.postalCode && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.postalCode}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between p-4 border-2 border-black bg-zinc-100 italic text-xs font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Secure Check</div>
                <div className="flex items-center gap-2"><Truck className="w-4 h-4" /> Fast Shipping</div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-16 btn-brutal bg-black text-white hover:bg-zinc-900 text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all font-heading">
                {isLoading ? <Loader2 className="animate-spin" /> : `PLACE ORDER • ${formatPrice(total)}`}
              </Button>
            </form>
          </motion.div>

          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="bg-background p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="font-heading text-xl mb-6 uppercase border-b-2 border-black pb-2 tracking-widest">Summary</h2>
              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4 border-b-2 border-zinc-100 pb-4 last:border-0">
                    <img src={item.image_url} className="w-20 h-20 object-cover border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
                    <div className="flex-1">
                      <h4 className="font-bold text-xs uppercase tracking-tight">{item.name}</h4>
                      <p className="text-[10px] text-zinc-500 uppercase font-black">
                        SIZE: {item.size} | COLOR: {item.color} | QTY: {item.quantity}
                      </p>
                      <p className="font-bold mt-1 text-sm">{formatPrice((item.sale_price || item.price) * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 font-bold uppercase text-[10px] tracking-widest">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
                <div className="flex justify-between text-zinc-500"><span>GST (12%)</span><span>{formatPrice(tax)}</span></div>
                <Separator className="bg-black h-1 mt-4" />
                <div className="flex justify-between text-2xl font-black pt-2"><span>Total</span><span>{formatPrice(total)}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}