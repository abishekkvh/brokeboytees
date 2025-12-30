import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function Wishlist() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { wishlistItems, isLoading, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();

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

  const handleAddToCart = (item: NonNullable<typeof wishlistItems>[0]) => {
    if (!item.products) return;
    
    const product = item.products as {
      id: string;
      name: string;
      price: number;
      image_url: string;
      is_on_sale: boolean | null;
      sale_price: number | null;
      stock_quantity: number;
    };

    if (product.stock_quantity === 0) {
      toast.error('This item is sold out');
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.is_on_sale && product.sale_price ? product.sale_price : product.price,
      image_url: product.image_url,
      size: 'M',
    });

    toast.success(`${product.name} added to bag`);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-secondary">
        <div className="bg-primary text-primary-foreground py-12">
          <div className="container mx-auto px-4">
            <Skeleton className="h-10 w-48 bg-primary-foreground/20" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-3xl md:text-4xl font-bold">MY WISHLIST</h1>
          <p className="text-primary-foreground/70 mt-2">
            {wishlistItems?.length || 0} saved items
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {!wishlistItems || wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Heart className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h2 className="font-heading text-2xl mb-4">YOUR WISHLIST IS EMPTY</h2>
            <p className="text-muted-foreground mb-8">
              Save items you love by clicking the heart icon.
            </p>
            <Link to="/shop">
              <Button className="btn-brutal">BROWSE PRODUCTS</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlistItems.map((item, index) => {
              const product = item.products as {
                id: string;
                name: string;
                price: number;
                image_url: string;
                is_new: boolean | null;
                is_on_sale: boolean | null;
                sale_price: number | null;
                stock_quantity: number;
              } | null;

              if (!product) return null;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="card-brutal overflow-hidden">
                    {/* Image */}
                    <Link to={`/product/${product.id}`}>
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {product.is_new && <span className="badge-new">NEW</span>}
                          {product.is_on_sale && <span className="badge-sale">SALE</span>}
                          {product.stock_quantity === 0 && <span className="badge-sold-out">SOLD OUT</span>}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            removeFromWishlist(product.id);
                          }}
                          className="absolute top-3 right-3 p-2 bg-background border-2 border-primary hover:bg-accent hover:text-accent-foreground transition-colors"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="p-4 bg-background border-t-2 border-primary">
                      <h3 className="font-heading text-sm tracking-wider truncate mb-2">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-4">
                        {product.is_on_sale && product.sale_price ? (
                          <>
                            <span className="font-heading text-accent">
                              {formatPrice(product.sale_price)}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="font-heading">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>

                      <Button
                        onClick={() => handleAddToCart(item)}
                        disabled={product.stock_quantity === 0}
                        className="w-full btn-brutal text-sm py-2"
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        {product.stock_quantity === 0 ? 'SOLD OUT' : 'ADD TO BAG'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}