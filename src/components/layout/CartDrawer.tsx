import { Link } from 'react-router-dom';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';

export default function CartDrawer() {
  const { state, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const { items } = state;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <SheetHeader className="p-6 border-b-2 border-primary">
          <SheetTitle className="font-heading text-xl tracking-wider">
            YOUR BAG
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
          <h3 className="font-heading text-xl mb-2">YOUR CART IS BROKE</h3>
          <p className="text-muted-foreground mb-6">Fix it.</p>
          <Link to="/shop">
            <Button className="btn-brutal">
              SHOP NOW
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="p-6 border-b-2 border-primary">
        <SheetTitle className="font-heading text-xl tracking-wider">
          YOUR BAG ({items.length})
        </SheetTitle>
      </SheetHeader>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {items.map((item) => (
          <div
            key={`${item.id}-${item.size}`}
            className="flex gap-4 pb-6 border-b border-primary/20"
          >
            {/* Image */}
            <div className="w-24 h-24 border-2 border-primary overflow-hidden flex-shrink-0">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-heading text-sm tracking-wider">
                    {item.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Size: {item.size}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.id, item.size)}
                  className="p-1 hover:bg-secondary transition-colors"
                  aria-label="Remove item"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-auto flex items-center justify-between">
                {/* Quantity */}
                <div className="flex items-center border-2 border-primary">
                  <button
                    onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                    className="p-2 hover:bg-secondary transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-3 font-medium text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                    className="p-2 hover:bg-secondary transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Price */}
                <p className="font-heading text-sm">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-6 border-t-2 border-primary bg-secondary">
        <div className="flex justify-between items-center mb-2">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-heading text-lg">{formatPrice(subtotal)}</span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Taxes calculated at checkout
        </p>
        
        <Button className="w-full btn-brutal text-lg py-6">
          CHECKOUT
        </Button>
        
        <button
          onClick={clearCart}
          className="w-full mt-3 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Clear cart
        </button>
      </div>
    </div>
  );
}