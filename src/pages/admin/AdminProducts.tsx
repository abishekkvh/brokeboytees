import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Loader2, Search } from 'lucide-react';
import { useAdminProducts } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: 'hoodie' | 't-shirt' | 'shirt';
  image_url: string;
  stock_quantity: string;
  is_featured: boolean;
  is_new: boolean;
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: '',
  category: 'hoodie',
  image_url: '',
  stock_quantity: '',
  is_featured: false,
  is_new: false,
};

export default function AdminProducts() {
  const { products, isLoading, createProduct, updateProduct, deleteProduct } = useAdminProducts();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      category: formData.category,
      image_url: formData.image_url,
      stock_quantity: parseInt(formData.stock_quantity),
      is_featured: formData.is_featured,
      is_new: formData.is_new,
    };

    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct, ...productData });
        toast.success('Product updated');
      } else {
        await createProduct.mutateAsync(productData);
        toast.success('Product created');
      }
      setIsDialogOpen(false);
      setEditingProduct(null);
      setFormData(initialFormData);
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleEdit = (product: NonNullable<typeof products>[0]) => {
    setEditingProduct(product.id);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      image_url: product.image_url,
      stock_quantity: product.stock_quantity.toString(),
      is_featured: product.is_featured || false,
      is_new: product.is_new || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id);
      toast.success('Product deleted');
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">PRODUCTS</h1>
          <p className="text-muted-foreground mt-1">{products?.length || 0} total products</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewProduct} className="btn-brutal">
              <Plus className="w-4 h-4 mr-2" />
              ADD PRODUCT
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg border-2 border-primary">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">
                {editingProduct ? 'EDIT PRODUCT' : 'NEW PRODUCT'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 border-2 border-primary"
                  required
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 border-2 border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="mt-1 border-2 border-primary"
                    required
                  />
                </div>
                <div>
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="mt-1 border-2 border-primary"
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v as 'hoodie' | 't-shirt' | 'shirt' })}
                >
                  <SelectTrigger className="mt-1 border-2 border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hoodie">Hoodie</SelectItem>
                    <SelectItem value="t-shirt">T-Shirt</SelectItem>
                    <SelectItem value="shirt">Shirt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Image URL</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="mt-1 border-2 border-primary"
                  required
                />
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(c) => setFormData({ ...formData, is_featured: c as boolean })}
                  />
                  <Label htmlFor="is_featured">Featured</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_new"
                    checked={formData.is_new}
                    onCheckedChange={(c) => setFormData({ ...formData, is_new: c as boolean })}
                  />
                  <Label htmlFor="is_new">New</Label>
                </div>
              </div>
              <Button
                type="submit"
                disabled={createProduct.isPending || updateProduct.isPending}
                className="w-full btn-brutal"
              >
                {(createProduct.isPending || updateProduct.isPending) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingProduct ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 border-2 border-primary"
        />
      </div>

      {/* Products Table */}
      <div className="bg-background border-2 border-primary overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="text-left p-4 font-heading text-sm tracking-wider">PRODUCT</th>
                <th className="text-left p-4 font-heading text-sm tracking-wider">CATEGORY</th>
                <th className="text-left p-4 font-heading text-sm tracking-wider">PRICE</th>
                <th className="text-left p-4 font-heading text-sm tracking-wider">STOCK</th>
                <th className="text-right p-4 font-heading text-sm tracking-wider">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts?.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t border-muted"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 border-2 border-primary overflow-hidden flex-shrink-0">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-heading text-sm">{product.name}</p>
                        <div className="flex gap-2 mt-1">
                          {product.is_new && <span className="badge-new text-[10px]">NEW</span>}
                          {product.is_featured && <span className="bg-secondary px-1.5 py-0.5 text-[10px] font-heading">FEATURED</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm capitalize">{product.category}</td>
                  <td className="p-4 font-heading text-sm">{formatPrice(product.price)}</td>
                  <td className="p-4">
                    <span className={`text-sm ${
                      product.stock_quantity === 0 ? 'text-red-500' :
                      product.stock_quantity < 10 ? 'text-yellow-500' : ''
                    }`}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        className="border-2 border-primary"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-2 border-primary">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-heading">DELETE PRODUCT?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the product.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="btn-brutal-outline">CANCEL</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(product.id)}
                              className="btn-brutal bg-accent"
                            >
                              DELETE
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}