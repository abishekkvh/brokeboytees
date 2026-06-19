import { useState } from "react";
import { Plus, Trash2, Upload, X, Loader2 } from "lucide-react";
import { useAdminProducts, useDeleteProduct } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

// Define the specific type your DB expects
type CategoryType = "hoodie" | "t-shirt" | "shirt" | "bottoms";

const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL", "3XL"];

export default function AdminProducts() {
  // Now this hook returns the standard { data, isLoading } object
  const { data: products, isLoading } = useAdminProducts();
  const deleteProduct = useDeleteProduct();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isLoading) return <div className="p-8">Loading products...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-heading font-bold">PRODUCTS</h1>
        <AddProductDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      </div>

      <div className="grid gap-4">
        {products?.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-4 border-2 border-primary bg-background"
          >
            <div className="flex items-center gap-4">
              <img
                src={product.image_url || "/placeholder.png"}
                alt={product.name}
                className="w-16 h-16 object-cover border border-muted"
              />
              <div>
                <h3 className="font-heading font-bold">{product.name}</h3>
                <p className="text-sm text-muted-foreground">
                  ₹{product.sale_price || product.price}
                  {product.sale_price && (
                    <span className="ml-2 line-through text-red-400 text-xs">
                      ₹{product.price}
                    </span>
                  )}
                </p>
                <div className="flex gap-1 mt-1">
                  {product.sizes?.map((s: string) => (
                    <span key={s} className="text-[10px] bg-secondary px-1 border border-primary">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => {
                if (confirm("Are you sure you want to delete this product?")) {
                  deleteProduct.mutate(product.id);
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AddProductDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Typed State to match Supabase Enums
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    sale_price: "",
    category: "hoodie" as CategoryType, // <--- FIXED: Explicit Type
    stock_quantity: "",
    image_url: "",
    colors: [] as string[],
  });
  
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("products").getPublicUrl(filePath);
      
      setFormData((prev) => ({ ...prev, image_url: data.publicUrl }));
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Error uploading image");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const addColor = () => {
    if (colorInput && !formData.colors.includes(colorInput)) {
      setFormData(prev => ({ ...prev, colors: [...prev.colors, colorInput] }));
      setColorInput("");
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!formData.name || !formData.price || !formData.image_url) {
        toast.error("Please fill in all required fields (Name, Price, Image)");
        return;
      }

      // @ts-expect-error: Database types are not yet synced with local definitions
      const { error } = await supabase.from("products").insert({
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        sale_price: formData.sale_price ? Number(formData.sale_price) : null,
        category: formData.category, // TypeScript now knows this is valid
        stock_quantity: Number(formData.stock_quantity) || 0,
        image_url: formData.image_url,
        sizes: selectedSizes,
        colors: formData.colors,
        is_new: true,
      });

      if (error) throw error;

      toast.success("Product added successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      onOpenChange(false);
      
      // Reset Form
      setFormData({
        name: "", description: "", price: "", sale_price: "", 
        category: "hoodie", stock_quantity: "", image_url: "", colors: []
      });
      setSelectedSizes([]);

    } catch (error) {
      console.error(error);
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="btn-brutal bg-black text-white hover:bg-gray-800">
          <Plus className="mr-2 h-4 w-4" /> NEW DROP
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-2 border-black">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">ADD NEW DROP</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg">
            {formData.image_url ? (
              <div className="relative w-40 h-40">
                <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover rounded-md" />
                <button 
                  onClick={() => setFormData(prev => ({ ...prev, image_url: "" }))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center">
                {uploading ? <Loader2 className="w-8 h-8 animate-spin text-gray-400" /> : <Upload className="w-8 h-8 text-gray-400 mb-2" />}
                <span className="text-sm text-gray-500">{uploading ? "Uploading..." : "Click to Upload Image"}</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">Product Name</label>
              <Input placeholder="Black Oversized Hoodie" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Category</label>
              <Select 
                value={formData.category} 
                onValueChange={(val: CategoryType) => setFormData({...formData, category: val})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoodie">Hoodie</SelectItem>
                  <SelectItem value="t-shirt">T-Shirt</SelectItem>
                  <SelectItem value="shirt">Shirt</SelectItem>
                  <SelectItem value="bottoms">Bottoms</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Description</label>
            <Textarea placeholder="Product details..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">Original Price (₹)</label>
              <Input type="number" placeholder="999" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-red-500">Sale Price (Optional)</label>
              <Input type="number" placeholder="799" className="border-red-200 focus:border-red-500" value={formData.sale_price} onChange={(e) => setFormData({...formData, sale_price: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Stock Qty</label>
              <Input type="number" placeholder="50" value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Available Sizes</label>
            <div className="flex gap-2 flex-wrap">
              {AVAILABLE_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`w-10 h-10 border-2 font-bold text-sm transition-all ${
                    selectedSizes.includes(size)
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Colors</label>
            <div className="flex gap-2">
              <Input 
                placeholder="Type color & press Enter" 
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addColor(); } }}
              />
              <Button type="button" onClick={addColor} variant="outline"><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="flex gap-2 flex-wrap mt-2">
              {formData.colors.map((color, idx) => (
                <span key={idx} className="bg-secondary px-3 py-1 text-sm border border-primary flex items-center gap-2">
                  {color}
                  <button onClick={() => setFormData(prev => ({ ...prev, colors: prev.colors.filter((_, i) => i !== idx) }))}>
                    <X className="w-3 h-3 hover:text-red-500" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full btn-brutal bg-green-500 text-white hover:bg-green-600 h-12 text-lg" disabled={loading || uploading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {loading ? "ADDING..." : "PUBLISH DROP"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}