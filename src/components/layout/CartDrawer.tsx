import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';

// Full corrected CartDrawer
export default function CartDrawer({ setOpen }: { setOpen?: (open: boolean) => void }) {
  const navigate = useNavigate();
  const { state, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const { items } = state;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = () => {
    // 1. Manually close the drawer state
    if (setOpen) {
      setOpen(false);
    }
    
    // 2. Navigate to the checkout page
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col h-full bg-background">
        <SheetHeader className="p-6 border-b-2 border-primary">
          <SheetTitle className="font-heading text-xl tracking-wider">
            YOUR BAG
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
          <h3 className="font-heading text-xl mb-2 uppercase">Your bag is empty</h3>
          <p className="text-muted-foreground mb-6 italic">Add some heat to your collection.</p>
          <Link to="/shop">
            <Button className="btn-brutal bg-black text-white" onClick={() => setOpen?.(false)}>
              SHOP NOW
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <SheetHeader className="p-6 border-b-2 border-primary bg-white">
        <SheetTitle className="font-heading text-xl tracking-wider uppercase">
          Your Bag ({items.length})
        </SheetTitle>
      </SheetHeader>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {items.map((item) => (
          <div
            key={`${item.id}-${item.size}`}
            className="flex gap-4 pb-6 border-b-2 border-primary/10"
          >
            {/* Image Container with Brutalist Shadow */}
            <div className="w-24 h-24 border-2 border-primary overflow-hidden flex-shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Item Details */}
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-heading text-sm tracking-wider uppercase font-bold">
                    {item.name}
                  </h4>
                  <p className="text-xs font-bold text-muted-foreground mt-1 uppercase">
                    Size: {item.size}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.id, item.size)}
                  className="p-1 hover:bg-red-100 hover:text-red-600 transition-colors border border-transparent hover:border-red-600"
                  aria-label="Remove item"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-auto flex items-center justify-between">
                {/* Quantity Control */}
                <div className="flex items-center border-2 border-primary bg-white">
                  <button
                    onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))}
                    className="p-2 hover:bg-secondary transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-3 font-black text-sm border-x-2 border-primary">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                    className="p-2 hover:bg-secondary transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Price logic prioritizing sale_price */}
                <p className="font-heading text-sm font-bold">
                  {formatPrice((item.sale_price || item.price) * item.quantity)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Drawer Footer with Subtotal in INR */}
      <div className="p-6 border-t-2 border-primary bg-secondary/30">
        <div className="flex justify-between items-center mb-2 font-bold uppercase tracking-tight">
          <span className="text-muted-foreground text-sm">Subtotal</span>
          <span className="font-heading text-xl">{formatPrice(subtotal)}</span>
        </div>
        <p className="text-[10px] text-muted-foreground mb-6 uppercase italic font-medium">
          Taxes and shipping calculated at checkout
        </p>
        
        <Button 
          onClick={handleCheckout}
          className="w-full btn-brutal bg-black text-white text-lg py-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
        >
          CHECKOUT
        </Button>
        
        <button
          onClick={clearCart}
          className="w-full mt-4 text-[10px] font-bold text-muted-foreground hover:text-red-600 uppercase tracking-widest transition-colors"
        >
          Clear bag
        </button>
      </div>
    </div>
  );
}