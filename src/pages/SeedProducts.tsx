import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

// This grabs all the image paths from the public folder
const images = import.meta.glob('/public/clothes/*.{jpg,png,jpeg,webp}', { eager: true });

export default function SeedProducts() {
  const [status, setStatus] = useState('');

  const seed = async () => {
    setStatus('Seeding...');
    const imagePaths = Object.keys(images).map(key => key.replace('/public', ''));
    
    let successCount = 0;
    
    for (let i = 0; i < imagePaths.length; i++) {
      const path = imagePaths[i];
      const name = `Drop ${i + 1} - Exclusive Edition`;
      const price = 1499 + Math.floor(Math.random() * 1000);
      const is_on_sale = Math.random() > 0.5;
      const sale_price = is_on_sale ? price - 500 : null;
      const is_new = i < 10;
      
      const { error } = await supabase.from('products').insert({
        name: name,
        description: 'Premium heavyweight cotton streetwear. Oversized, boxy fit.',
        price: price,
        sale_price: sale_price,
        image_url: path,
        category: 't-shirt',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'White', 'Ash Grey'],
        stock_quantity: 50,
        is_featured: i < 8,
        is_new: is_new,
        is_on_sale: is_on_sale
      });
      
      if (error) {
        console.error(error);
        setStatus(`Error on item ${i}: ${error.message}. Make sure you are logged in as an Admin!`);
        return;
      }
      
      successCount++;
    }
    setStatus(`Done Seeding! Successfully added ${successCount} products.`);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-20 bg-secondary">
      <h1 className="text-4xl font-black mb-8 uppercase font-heading">Product Seeder</h1>
      <p className="mb-4">Found {Object.keys(images).length} images in your clothes folder.</p>
      <Button onClick={seed} className="btn-brutal bg-black text-white h-16 px-8 text-xl">
        UPLOAD ALL PRODUCTS TO DATABASE
      </Button>
      <p className="mt-8 font-bold text-red-500">{status}</p>
    </div>
  );
}
