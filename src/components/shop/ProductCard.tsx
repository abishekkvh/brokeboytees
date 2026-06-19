import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import type { Product } from '@/hooks/useProducts';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock_quantity === 0) {
      toast.error('This item is sold out');
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.is_on_sale && product.sale_price ? product.sale_price : product.price,
      image_url: product.image_url,
      size: product.sizes?.[0] || 'M',
    });
    
    toast.success(`${product.name} added to bag`);
  };

  const isOutOfStock = product.stock_quantity === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Link to={`/product/${product.id}`} className="group block">
        <div className="card-brutal overflow-hidden">
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.is_new && (
                <span className="badge-new">NEW</span>
              )}
              {product.is_on_sale && (
                <span className="badge-sale">SALE</span>
              )}
              {isOutOfStock && (
                <span className="badge-sold-out">SOLD OUT</span>
              )}
            </div>

            {/* Quick Add Button */}
            <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handleQuickAdd}
                disabled={isOutOfStock}
                className={`w-full py-3 font-heading text-sm tracking-wider transition-colors ${
                  isOutOfStock
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {isOutOfStock ? 'SOLD OUT' : 'QUICK ADD'}
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4 bg-background border-t-2 border-primary">
            <h3 className="font-heading text-sm tracking-wider truncate">
              {product.name}
            </h3>
            <div className="mt-2 flex items-center gap-2">
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
          </div>
        </div>
      </Link>
    </motion.div>
  );
}