import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Truck, Recycle, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import image from "../assets/hero-streetwear.jpg";

const values = [
  {
    icon: Users,
    title: 'Community First',
    description: 'Built by and for the streets. Every design is a collaboration with our community.',
  },
  {
    icon: Recycle,
    title: 'Sustainable Fashion',
    description: 'Organic materials, ethical production, and packaging that doesn\'t cost the earth.',
  },
  {
    icon: Truck,
    title: 'Nation Reach',
  description: 'Free worldwide shipping on orders over ₹500. No borders, no limits.',
  },
  {
    icon: Award,
    title: 'Quality Promise',
    description: 'Premium materials and construction. Built to last, not just for the season.',
  },
];

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={image}
            alt="About BROKEBOY"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/70" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-primary-foreground px-4"
        >
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6">
            OUR STORY
          </h1>
          <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
            Born from the streets, made for the undefined.
          </p>
        </motion.div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">
                DEFINING THE UNDEFINED SINCE 2020
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  BROKEBOY was born from a simple frustration: streetwear had become 
                  predictable. The same logos, the same drops, the same hype. We wanted 
                  to create something different—clothes for people who refuse to be 
                  categorized.
                </p>
                <p>
                  Starting with a single hoodie design and a ₹500 budget, we built a 
                  brand that speaks to the outsiders, the dreamers, and the ones who 
                  were told they'd never make it.
                </p>
                <p>
                  Today, we ship to over 100 countries, but we haven't forgotten where 
                  we came from. Every piece is still designed with intention, crafted 
                  with care, and made to last.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="card-brutal overflow-hidden"
            >
              <img
                src={image}
                alt="BROKEBOY founder"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-3xl md:text-5xl font-bold text-center mb-12"
          >
            OUR VALUES
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-brutal p-6 bg-background"
              >
                <value.icon className="w-10 h-10 mb-4" />
                <h3 className="font-heading text-lg tracking-wider mb-2">
                  {value.title.toUpperCase()}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10+', label: 'Cities' },
              { value: '5K+', label: 'Customers' },
              { value: '500+', label: 'Designs' },
              { value: '4.9', label: 'Rating' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="font-heading text-4xl md:text-6xl font-bold mb-2">
                  {stat.value}
                </div>
                <div className="text-primary-foreground/70 text-sm tracking-wider">
                  {stat.label.toUpperCase()}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">
              JOIN THE MOVEMENT
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Ready to define your own style? Start shopping the collection.
            </p>
            <Link to="/shop">
              <Button className="btn-brutal">
                SHOP NOW
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}