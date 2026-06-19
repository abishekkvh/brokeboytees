import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Minus, Plus, Heart, Share2 } from 'lucide-react';
import { useProduct } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useProduct(id || '');
  const { addItem } = useCart();
  
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.is_on_sale && product.sale_price ? product.sale_price : product.price,
      image_url: product.image_url,
      size: selectedSize,
      quantity,
    });

    toast.success(`${product.name} added to bag`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <div className="space-y-4">
            <Skeleton className="aspect-[3/4] w-full" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-20 h-20" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-heading text-3xl mb-4">PRODUCT NOT FOUND</h1>
        <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
        <Link to="/shop">
          <Button className="btn-brutal">BACK TO SHOP</Button>
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.image_url];
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-[3/4] border-2 border-primary overflow-hidden"
            >
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 flex-shrink-0 border-2 transition-all ${
                      selectedImage === index
                        ? 'border-primary'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Badges */}
              <div className="flex gap-2 mb-4">
                {product.is_new && <span className="badge-new">NEW</span>}
                {product.is_on_sale && <span className="badge-sale">SALE</span>}
                {isOutOfStock && <span className="badge-sold-out">SOLD OUT</span>}
              </div>

              {/* Title & Price */}
              <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                {product.is_on_sale && product.sale_price ? (
                  <>
                    <span className="font-heading text-2xl text-accent">
                      {formatPrice(product.sale_price)}
                    </span>
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="font-heading text-2xl">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-8">
                {product.description}
              </p>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-heading text-sm tracking-wider mb-3">
                    COLOR: {selectedColor || 'Select'}
                  </h3>
                  <div className="flex gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColor === color
                            ? 'border-primary ring-2 ring-primary ring-offset-2'
                            : 'border-muted hover:border-primary'
                        }`}
                        style={{
                          backgroundColor:
                            color.toLowerCase() === 'black'
                              ? '#000'
                              : color.toLowerCase() === 'white'
                              ? '#fff'
                              : color.toLowerCase() === 'gray'
                              ? '#888'
                              : color.toLowerCase() === 'olive'
                              ? '#556B2F'
                              : color,
                        }}
                        aria-label={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-heading text-sm tracking-wider mb-3">
                    SIZE: {selectedSize || 'Select'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[48px] px-4 py-2 border-2 border-primary font-heading text-sm transition-colors ${
                          selectedSize === size
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background hover:bg-secondary'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-8">
                <h3 className="font-heading text-sm tracking-wider mb-3">QUANTITY</h3>
                <div className="flex items-center border-2 border-primary w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-secondary transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 font-heading">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-secondary transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mb-8">
                <Button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 btn-brutal py-6 text-lg"
                >
                  {isOutOfStock ? 'SOLD OUT' : 'ADD TO BAG'}
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-primary p-3"
                  aria-label="Add to wishlist"
                >
                  <Heart className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-primary p-3"
                  aria-label="Share"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Accordion */}
              <Accordion type="single" collapsible className="border-t-2 border-primary">
                <AccordionItem value="materials" className="border-b-2 border-primary">
                  <AccordionTrigger className="font-heading text-sm tracking-wider py-4">
                    MATERIALS
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    Premium 100% organic cotton. Heavyweight 400gsm fabric. 
                    Pre-shrunk and garment-dyed for a lived-in feel from day one.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="size-guide" className="border-b-2 border-primary">
                  <AccordionTrigger className="font-heading text-sm tracking-wider py-4">
                    SIZE GUIDE
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    <div className="space-y-2 text-sm">
                      <p>S: Chest 38" | Length 27"</p>
                      <p>M: Chest 40" | Length 28"</p>
                      <p>L: Chest 42" | Length 29"</p>
                      <p>XL: Chest 44" | Length 30"</p>
                      <p>XXL: Chest 46" | Length 31"</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="shipping" className="border-b-2 border-primary">
                  <AccordionTrigger className="font-heading text-sm tracking-wider py-4">
                    SHIPPING & RETURNS
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    Free worldwide shipping on orders over $150. 
                    Standard delivery 5-7 business days. 
                    Free returns within 30 days of purchase.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}