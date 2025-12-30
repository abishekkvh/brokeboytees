import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useNewProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewDrops() {
  const { data: products, isLoading, error } = useNewProducts();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-accent text-accent-foreground py-16 md:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="badge-new mb-4 inline-block text-lg px-4 py-1 bg-accent-foreground text-accent">
              JUST DROPPED
            </span>
            <h1 className="font-heading text-4xl md:text-6xl lg:text-8xl font-bold mb-4">
              NEW ARRIVALS
            </h1>
            <p className="text-accent-foreground/80 max-w-md mx-auto">
              The latest additions to our collection. Limited quantities, unlimited style.
            </p>
          </motion.div>
        </div>
        
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 border-4 border-accent-foreground/20 rotate-45" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 border-4 border-accent-foreground/20" />
        </div>
      </div>

      {/* Products */}
      <div className="container mx-auto px-4 py-16">
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="border-2 border-primary">
                <Skeleton className="aspect-[3/4]" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Failed to load products. Please try again.</p>
          </div>
        )}

        {!isLoading && !error && products && (
          <>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="font-heading text-2xl mb-4">NEW DROPS COMING SOON</h3>
                <p className="text-muted-foreground mb-8">
                  Sign up for our newsletter to be the first to know.
                </p>
                <Link to="/shop">
                  <Button className="btn-brutal">
                    SHOP ALL PRODUCTS
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Link to="/shop">
            <Button className="btn-brutal-outline">
              VIEW ALL PRODUCTS
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}