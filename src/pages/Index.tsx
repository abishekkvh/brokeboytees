import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-streetwear.jpg';

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Streetwear fashion"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/60" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 text-center text-primary-foreground px-4"
        >
          <h1 className="font-heading text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter mb-6">
            DEFINING<br />THE UNDEFINED
          </h1>
          <p className="text-lg md:text-xl opacity-80 mb-8 max-w-md mx-auto">
            Premium streetwear for those who refuse to be categorized.
          </p>
          <Link to="/shop">
            <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-2 border-primary-foreground px-8 py-6 text-lg font-heading tracking-wider">
              SHOP THE DROP
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Marquee */}
      <div className="bg-primary text-primary-foreground py-4 overflow-hidden border-y-2 border-primary-foreground">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="font-heading text-sm md:text-base tracking-widest mx-8">
              FREE SHIPPING AROUND INDIA • NEW DROP FRIDAY • LIMITED STOCK • BROKEBOYTEES EXCLUSIVE •
            </span>
          ))}
        </div>
      </div>

      {/* Featured Grid - Bento Style */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading text-4xl md:text-6xl font-bold text-center mb-12"
        >
          THE COLLECTION
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Hoodies - Large */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 lg:col-span-2 relative group cursor-pointer"
          >
            <Link to="/shop?category=hoodie">
              <div className="card-brutal aspect-[16/9] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200"
                  alt="Hoodies collection"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-primary/40 flex items-end p-6">
                  <div className="text-primary-foreground">
                    <h3 className="font-heading text-3xl md:text-5xl font-bold">HOODIES</h3>
                    <p className="mt-2 opacity-80">Essential oversized fits</p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* T-Shirts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative group cursor-pointer"
          >
            <Link to="/shop?category=t-shirt">
              <div className="card-brutal aspect-square overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"
                  alt="T-Shirts collection"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-primary/40 flex items-end p-6">
                  <div className="text-primary-foreground">
                    <h3 className="font-heading text-2xl md:text-3xl font-bold">TEES</h3>
                    <p className="mt-1 opacity-80 text-sm">Statement pieces</p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Shirts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative group cursor-pointer"
          >
            <Link to="/shop?category=shirt">
              <div className="card-brutal aspect-square overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800"
                  alt="Shirts collection"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-primary/40 flex items-end p-6">
                  <div className="text-primary-foreground">
                    <h3 className="font-heading text-2xl md:text-3xl font-bold">SHIRTS</h3>
                    <p className="mt-1 opacity-80 text-sm">Clean aesthetics</p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* New Drops CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2 lg:col-span-1"
          >
            <Link to="/new-drops">
              <div className="card-brutal aspect-square bg-accent flex items-center justify-center p-6 text-center">
                <div className="text-accent-foreground">
                  <span className="badge-new mb-4 inline-block">NEW</span>
                  <h3 className="font-heading text-3xl md:text-4xl font-bold">
                    LATEST<br />DROPS
                  </h3>
                  <p className="mt-4 flex items-center justify-center gap-2">
                    Shop now <ArrowRight className="w-4 h-4" />
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-secondary py-16 md:py-24 border-y-2 border-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
            JOIN THE MOVEMENT
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Be the first to know about new drops and exclusive offers.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border-2 border-primary bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="submit" className="btn-brutal">
              SUBSCRIBE
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}