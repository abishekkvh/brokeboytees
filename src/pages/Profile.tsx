import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, Heart, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function Profile() {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      toast.success('Signed out successfully');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-12 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const menuItems = [
    {
      icon: User,
      title: 'Account Details',
      description: 'Update your personal information',
      href: '/profile/details',
    },
    {
      icon: Package,
      title: 'Orders',
      description: 'View your order history',
      href: '/profile/orders',
    },
    {
      icon: Heart,
      title: 'Wishlist',
      description: 'Products you\'ve saved',
      href: '/profile/wishlist',
    },
    {
      icon: Settings,
      title: 'Settings',
      description: 'Manage preferences',
      href: '/profile/settings',
    },
  ];

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-heading text-3xl md:text-5xl font-bold mb-2">
              MY ACCOUNT
            </h1>
            <p className="text-primary-foreground/70">
              Welcome back, {user.email}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={item.href}>
                  <div className="card-brutal p-6 bg-background hover:bg-surface-hover transition-colors cursor-pointer">
                    <item.icon className="w-8 h-8 mb-4" />
                    <h3 className="font-heading text-lg tracking-wider mb-1">
                      {item.title.toUpperCase()}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Sign Out */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full btn-brutal-outline"
            >
              <LogOut className="w-4 h-4 mr-2" />
              SIGN OUT
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}