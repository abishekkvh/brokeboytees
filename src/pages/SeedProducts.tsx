import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import clothesFiles from '@/clothesList.json';

export default function SeedProducts() {
  const [status, setStatus] = useState('');

  const seed = async () => {
    setStatus('Seeding...');
    
    let successCount = 0;
    
    for (let i = 0; i < clothesFiles.length; i++) {
      const path = `/clothes/${clothesFiles[i]}`;
      const name = `Drop ${i + 1} - Exclusive Edition`;
      const price = 1499 + Math.floor(Math.random() * 1000);
      const { error } = await supabase.from('products').insert({
        name: name,
        description: 'Premium heavyweight cotton streetwear. Oversized, boxy fit.',
        price: price,
        image_url: path,
        category: 't-shirt',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'White', 'Ash Grey'],
        stock_quantity: 50,
        is_featured: i < 8
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
      <p className="mb-4">Found {clothesFiles.length} images in your clothes folder.</p>
      <Button onClick={seed} className="btn-brutal bg-black text-white h-16 px-8 text-xl">
        UPLOAD ALL PRODUCTS TO DATABASE
      </Button>
      <p className="mt-8 font-bold text-red-500">{status}</p>
    </div>
  );
}
