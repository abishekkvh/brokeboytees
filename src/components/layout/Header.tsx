import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User as UserIcon, ShoppingBag, Menu, X, PlusCircle, LogOut, Package } from 'lucide-react'; // Added Package icon
import { useCart } from '@/context/CartContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth'; 

import CartDrawer from '@/components/layout/CartDrawer';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const navLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/new-drops', label: 'New Drops' },
  { href: '/about', label: 'About' },
];

export default function Header() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { itemCount } = useCart();
  const { user, signOut } = useAuth(); 

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { data: isAdmin } = useQuery({
    queryKey: ['checkAdmin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      return !!data;
    },
    enabled: !!user
  });

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      setShowLogoutDialog(true);
    } else {
      navigate('/auth');
    }
  };

  const confirmLogout = async () => {
    try {
      await signOut();
      toast({ title: "Signed out successfully" });
      navigate('/auth');
      setShowLogoutDialog(false);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-header">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link 
            to="/" 
            className="font-heading text-2xl md:text-3xl font-bold tracking-tighter"
          >
            BROKEBOYTEES
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="font-heading text-sm tracking-wider hover:text-muted-foreground transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}

            {/* --- CUSTOMER ORDERS TAB (Only shows if logged in) --- */}
            {user && (
              <Link
                to="/my-orders"
                className="font-heading text-sm tracking-wider hover:text-muted-foreground transition-colors relative group flex items-center gap-1"
              >
                <Package className="w-4 h-4" />
                MY ORDERS
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            )}

            {isAdmin && (
              <Link to="/admin/add">
                <Button variant="destructive" size="sm" className="font-heading tracking-wider">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  NEW DROP
                </Button>
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <AnimatePresence>
              {isSearchOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="hidden md:block overflow-hidden"
                >
                  <Input
                    placeholder="Search..."
                    className="border-2 border-primary h-9"
                    autoFocus
                    onBlur={() => setIsSearchOpen(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-secondary transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={handleProfileClick}
              className="p-2 hover:bg-secondary transition-colors hidden md:flex"
              aria-label="Account"
            >
              {user ? <LogOut className="w-5 h-5 text-red-500" /> : <UserIcon className="w-5 h-5" />}
            </button>

            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <button
                  className="p-2 hover:bg-secondary transition-colors relative"
                  aria-label="Cart"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg p-0 border-l-2 border-primary">
                <CartDrawer setOpen={setIsCartOpen} />
              </SheetContent>
            </Sheet>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-secondary transition-colors md:hidden"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t-2 border-primary overflow-hidden"
            >
              <div className="py-4 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block font-heading text-lg tracking-wider py-2"
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Mobile Customer Orders Link */}
                {user && (
                  <Link
                    to="/my-orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block font-heading text-lg tracking-wider py-2 border-b border-muted flex items-center gap-2"
                  >
                    <Package className="w-5 h-5" />
                    MY ORDERS
                  </Link>
                )}
                
                {isAdmin && (
                  <Link
                    to="/admin/add"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block font-heading text-lg tracking-wider py-2 text-red-500 font-bold"
                  >
                    + NEW DROP (ADMIN)
                  </Link>
                )}

                <button
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    handleProfileClick(e);
                  }}
                  className="block w-full text-left font-heading text-lg tracking-wider py-2"
                >
                  {user ? "Sign Out" : "Login / Account"}
                </button>

              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="border-2 border-primary">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading tracking-wider">SIGN OUT?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="btn-brutal-outline border-2">CANCEL</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-heading tracking-wider"
            >
              SIGN OUT
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </header>
  );
}