import { useEffect, useState } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Menu,
  X,
  LogOut,
  ChevronRight,
  PlusCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
// 1. IMPORT THE GOOD DIALOG
import { AddProductDialog } from './AdminProducts'; 

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // 2. STATE FOR THE NEW DROP DIALOG
  const [isNewDropOpen, setIsNewDropOpen] = useState(false);

  const { data: isAdmin, isLoading: adminLoading } = useQuery({
    queryKey: ['adminLayoutCheck', user?.id],
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
    enabled: !!user,
    retry: false
  });

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) {
        navigate('/auth');
      } else if (isAdmin === false) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/');
      }
    }
  }, [authLoading, adminLoading, user, isAdmin, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-heading tracking-wider animate-pulse">
          VERIFYING PERMISSIONS...
        </p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-secondary flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary text-primary-foreground transform transition-transform duration-300 lg:relative lg:transform-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-primary-foreground/20">
            <Link to="/" className="font-heading text-2xl font-bold tracking-tighter">
              BROKEBOYTEES
            </Link>
            <p className="text-xs text-primary-foreground/60 mt-1">Admin Dashboard</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {/* Regular Links */}
            {[
              { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
              { path: '/admin/products', label: 'Products', icon: Package },
              { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
            ].map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    isActive
                      ? 'bg-primary-foreground text-primary'
                      : 'hover:bg-primary-foreground/10'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-heading text-sm tracking-wider">{item.label.toUpperCase()}</span>
                </Link>
              );
            })}

            {/* 3. UPDATED: NEW DROP BUTTON (Instead of Link) */}
            <button
              onClick={() => {
                setIsNewDropOpen(true);
                setIsSidebarOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 w-full transition-colors hover:bg-primary-foreground/10"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="font-heading text-sm tracking-wider">NEW DROP</span>
            </button>
          </nav>

          <div className="p-4 border-t border-primary-foreground/20">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 w-full hover:bg-primary-foreground/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-heading text-sm tracking-wider">SIGN OUT</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-primary/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-background border-b-2 border-primary p-4 flex items-center justify-between lg:justify-end">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-secondary transition-colors lg:hidden"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              View Store <ChevronRight className="inline w-4 h-4" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}