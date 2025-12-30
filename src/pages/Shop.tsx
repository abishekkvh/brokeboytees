import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

type SortOption = 'newest' | 'price-asc' | 'price-desc';
type CategoryOption = 'hoodie' | 't-shirt' | 'shirt' | undefined;

const categories = [
  { value: 'hoodie', label: 'Hoodies' },
  { value: 't-shirt', label: 'T-Shirts' },
  { value: 'shirt', label: 'Shirts' },
] as const;

const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    size: true,
  });

  const categoryParam = searchParams.get('category') as CategoryOption;

  const { data: products, isLoading, error } = useProducts({
    category: categoryParam,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    sortBy,
  });

  const handleCategoryChange = (category: CategoryOption) => {
    if (category) {
      setSearchParams({ category });
    } else {
      searchParams.delete('category');
      setSearchParams(searchParams);
    }
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size]
    );
  };

  const clearFilters = () => {
    searchParams.delete('category');
    setSearchParams(searchParams);
    setPriceRange([0, 200]);
    setSelectedSizes([]);
    setSortBy('newest');
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <Collapsible open={openSections.category} onOpenChange={() => toggleSection('category')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-heading text-sm tracking-wider border-b-2 border-primary">
          CATEGORY
          <ChevronDown className={`w-4 h-4 transition-transform ${openSections.category ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-3">
          <button
            onClick={() => handleCategoryChange(undefined)}
            className={`block text-sm transition-colors ${!categoryParam ? 'font-bold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`block text-sm transition-colors ${categoryParam === cat.value ? 'font-bold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {cat.label}
            </button>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Price Filter */}
      <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-heading text-sm tracking-wider border-b-2 border-primary">
          PRICE
          <ChevronDown className={`w-4 h-4 transition-transform ${openSections.price ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              min={0}
              max={200}
              step={10}
              className="mb-4"
            />
            <div className="flex justify-between text-sm">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Size Filter */}
      <Collapsible open={openSections.size} onOpenChange={() => toggleSection('size')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-heading text-sm tracking-wider border-b-2 border-primary">
          SIZE
          <ChevronDown className={`w-4 h-4 transition-transform ${openSections.size ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => handleSizeToggle(size)}
                className={`py-2 border-2 border-primary text-sm font-heading transition-colors ${
                  selectedSizes.includes(size)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-secondary'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Clear Filters */}
      <button
        onClick={clearFilters}
        className="w-full py-3 border-2 border-primary text-sm font-heading tracking-wider hover:bg-secondary transition-colors"
      >
        CLEAR ALL FILTERS
      </button>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold"
          >
            {categoryParam
              ? categories.find((c) => c.value === categoryParam)?.label.toUpperCase() || 'SHOP'
              : 'THE SHOP'}
          </motion.h1>
          <p className="mt-4 text-primary-foreground/70">
            {products?.length || 0} Products
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Mobile Filter & Sort Bar */}
        <div className="flex items-center justify-between gap-4 mb-8 lg:hidden">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="btn-brutal-outline flex-1">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                FILTERS
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-md border-r-2 border-primary">
              <SheetHeader className="mb-6">
                <SheetTitle className="font-heading text-xl tracking-wider">
                  FILTERS
                </SheetTitle>
              </SheetHeader>
              <FilterContent />
            </SheetContent>
          </Sheet>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="flex-1 border-2 border-primary font-heading text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h2 className="font-heading text-lg tracking-wider mb-6">FILTERS</h2>
              <FilterContent />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Desktop Sort */}
            <div className="hidden lg:flex justify-end mb-6">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-48 border-2 border-primary font-heading text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
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

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Failed to load products. Please try again.</p>
              </div>
            )}

            {/* Products */}
            {!isLoading && !error && products && (
              <>
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="font-heading text-xl mb-2">NO PRODUCTS FOUND</h3>
                    <p className="text-muted-foreground mb-6">Try adjusting your filters.</p>
                    <Button onClick={clearFilters} className="btn-brutal">
                      CLEAR FILTERS
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}