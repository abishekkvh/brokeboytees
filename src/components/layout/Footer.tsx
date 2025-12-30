import { Link } from 'react-router-dom';
import { Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tighter mb-4">
              BROKEBOY
            </h2>
            <p className="text-primary-foreground/70 max-w-sm">
              Premium streetwear for those who define their own rules. 
              Limited drops, unlimited style.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-sm tracking-wider mb-4 opacity-60">
              SHOP
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shop?category=hoodie" className="hover:underline">
                  Hoodies
                </Link>
              </li>
              <li>
                <Link to="/shop?category=t-shirt" className="hover:underline">
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link to="/shop?category=shirt" className="hover:underline">
                  Shirts
                </Link>
              </li>
              <li>
                <Link to="/new-drops" className="hover:underline">
                  New Drops
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-heading text-sm tracking-wider mb-4 opacity-60">
              INFO
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:underline">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:underline">
                  Shipping
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:underline">
                  Returns
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm opacity-60">
            © 2024 BROKEBOY TEES. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-primary-foreground/10 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-primary-foreground/10 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}