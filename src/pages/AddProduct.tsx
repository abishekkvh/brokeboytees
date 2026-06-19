import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useNavigate } from "react-router-dom";

type CategoryType = "hoodie" | "t-shirt" | "shirt" | "bottoms";
const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL", "3XL"];

export default function AddProduct() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    sale_price: "",
    category: "hoodie" as CategoryType,
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
      
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from("products").getPublicUrl(fileName);
      setFormData((prev) => ({ ...prev, image_url: data.publicUrl }));
      toast.success("Image uploaded!");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!formData.name || !formData.price || !formData.image_url) {
        toast.error("Required: Name, Price, and Image");
        return;
      }

      // @ts-expect-error: Syncing with database schema columns for sizes and sale_price
      const { error } = await supabase.from("products").insert({
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        sale_price: formData.sale_price ? Number(formData.sale_price) : null,
        category: formData.category,
        stock_quantity: Number(formData.stock_quantity) || 0,
        image_url: formData.image_url,
        sizes: selectedSizes,
        colors: formData.colors,
        is_new: true,
      });

      if (error) throw error;
      toast.success("Product published!");
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      navigate("/admin/products");
    } catch (error) {
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const addColor = () => {
    if (colorInput && !formData.colors.includes(colorInput)) {
      setFormData(prev => ({ ...prev, colors: [...prev.colors, colorInput] }));
      setColorInput("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="bg-background border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="font-heading text-4xl font-bold mb-8 uppercase tracking-tighter border-b-4 border-black pb-4">
          Add New Drop
        </h1>
        
        <div className="space-y-8">
          {/* Image Section */}
          <div className="border-4 border-dashed border-black bg-secondary/30 p-8 flex flex-col items-center justify-center">
            {formData.image_url ? (
              <div className="relative w-48 h-48 border-4 border-black">
                <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setFormData(prev => ({ ...prev, image_url: "" }))} 
                  className="absolute -top-4 -right-4 bg-red-500 text-white border-4 border-black p-2 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center group">
                <Upload className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-heading text-sm uppercase font-bold">
                  {uploading ? "Uploading..." : "Click to Upload Product Image"}
                </span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest">Product Name</label>
              <Input className="border-4 border-black rounded-none h-12 text-lg font-bold focus-visible:ring-0" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest">Category</label>
              <Select value={formData.category} onValueChange={(val: CategoryType) => setFormData({...formData, category: val})}>
                <SelectTrigger className="border-4 border-black rounded-none h-12 font-bold focus:ring-0"><SelectValue /></SelectTrigger>
                <SelectContent className="border-4 border-black rounded-none">
                  <SelectItem value="hoodie">Hoodie</SelectItem>
                  <SelectItem value="t-shirt">T-shirt</SelectItem>
                  <SelectItem value="shirt">Shirt</SelectItem>
                  <SelectItem value="bottoms">Bottoms</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest">Description</label>
            <Textarea className="border-4 border-black rounded-none min-h-[120px] text-lg focus-visible:ring-0" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest">Price (₹)</label>
              <Input type="number" className="border-4 border-black rounded-none h-12 text-lg font-bold" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-red-600">Sale Price (₹)</label>
              <Input type="number" className="border-4 border-black rounded-none h-12 text-lg font-bold border-red-600" value={formData.sale_price} onChange={(e) => setFormData({...formData, sale_price: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest">Stock Quantity</label>
              <Input type="number" className="border-4 border-black rounded-none h-12 text-lg font-bold" value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest">Select Sizes</label>
            <div className="flex gap-3 flex-wrap">
              {AVAILABLE_SIZES.map((size) => (
                <button 
                  key={size} 
                  type="button"
                  onClick={() => setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])}
                  className={`w-14 h-14 border-4 font-black text-lg transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 ${
                    selectedSizes.includes(size) ? "bg-black text-white border-black" : "bg-white border-black hover:bg-secondary"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full bg-black text-white rounded-none h-16 font-heading text-2xl hover:bg-gray-900 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all" 
            disabled={loading || uploading}
          >
            {loading ? <Loader2 className="mr-4 h-6 w-6 animate-spin" /> : null}
            {loading ? "PUBLISHING..." : "PUBLISH NEW DROP"}
          </Button>
        </div>
      </div>
    </div>
  );
}