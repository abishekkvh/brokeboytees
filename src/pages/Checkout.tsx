import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, CreditCard, Truck, Shield, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const checkoutSchema = z.object({
  email: z.string().email('Invalid email'),
  fullName: z.string().min(2, 'Name is required').max(100),
  address: z.string().min(5, 'Address is required').max(200),
  city: z.string().min(2, 'City is required').max(100),
  postalCode: z.string().min(3, 'Postal code is required').max(20),
  country: z.string().min(2, 'Country is required').max(100),
});

export default function Checkout() {
  const navigate = useNavigate();
  const { state, subtotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const { items } = state;
  const shipping = subtotal > 150 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsLoading(true);

    try {
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          status: 'pending',
          total_amount: total,
          shipping_address: formData.address,
          shipping_city: formData.city,
          shipping_postal_code: formData.postalCode,
          shipping_country: formData.country,
          payment_status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        size: item.size,
        price_at_purchase: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart and redirect to success
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-3xl mb-4">YOUR CART IS EMPTY</h1>
          <p className="text-muted-foreground mb-8">Add some items to checkout.</p>
          <Link to="/shop">
            <Button className="btn-brutal">SHOP NOW</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Continue Shopping
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Checkout Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-8">CHECKOUT</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact */}
              <div className="bg-background p-6 border-2 border-primary">
                <h2 className="font-heading text-lg tracking-wider mb-4">CONTACT</h2>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-2 border-2 border-primary"
                  />
                  {errors.email && <p className="text-sm text-accent mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-background p-6 border-2 border-primary">
                <h2 className="font-heading text-lg tracking-wider mb-4">SHIPPING ADDRESS</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="mt-2 border-2 border-primary"
                    />
                    {errors.fullName && <p className="text-sm text-accent mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="mt-2 border-2 border-primary"
                    />
                    {errors.address && <p className="text-sm text-accent mt-1">{errors.address}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="mt-2 border-2 border-primary"
                      />
                      {errors.city && <p className="text-sm text-accent mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="mt-2 border-2 border-primary"
                      />
                      {errors.postalCode && <p className="text-sm text-accent mt-1">{errors.postalCode}</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="mt-2 border-2 border-primary"
                    />
                    {errors.country && <p className="text-sm text-accent mt-1">{errors.country}</p>}
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-8 py-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm">Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  <span className="text-sm">Free Shipping $150+</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full btn-brutal py-6 text-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    PLACE ORDER • {formatPrice(total)}
                  </>
                )}
              </Button>
            </form>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="bg-background p-6 border-2 border-primary">
              <h2 className="font-heading text-lg tracking-wider mb-6">ORDER SUMMARY</h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4">
                    <div className="w-16 h-16 border-2 border-primary overflow-hidden flex-shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-heading text-sm">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Size: {item.size} • Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-heading text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="bg-primary my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
              </div>

              <Separator className="bg-primary my-4" />

              <div className="flex justify-between font-heading text-lg">
                <span>TOTAL</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}