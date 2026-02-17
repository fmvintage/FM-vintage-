
import React from 'react';
import { Product, View } from '../types';
import ProductCard from './ProductCard';

interface ProductListingsProps {
  products: Product[];
  category: string | null;
  onProductClick: (p: Product) => void;
  onNavigate: (view: View) => void;
  onAddToCart?: (p: Product) => void;
  onBuyNow?: (p: Product) => void;
}

const ProductListings: React.FC<ProductListingsProps> = ({ products, category, onProductClick, onAddToCart, onBuyNow }) => {
  const filteredProducts = category 
    ? products.filter(p => p.category === category)
    : products;

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-white p-3 sticky top-14 z-40 flex justify-between items-center border-b border-neutral-100 shadow-sm">
        <h2 className="font-black text-sm uppercase tracking-tighter text-neutral-900">{category || 'All Artifacts'}</h2>
        <div className="flex gap-4">
           <button className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 text-neutral-400 hover:text-blue-600 transition-colors">
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg> Sort
           </button>
           <button className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 text-neutral-400 hover:text-blue-600 transition-colors">
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg> Filter
           </button>
        </div>
      </div>

      <div className="p-2 grid grid-cols-2 gap-2">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(p => (
            <ProductCard 
              key={p.id} 
              product={p} 
              onClick={() => onProductClick(p)} 
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
            />
          ))
        ) : (
          <div className="col-span-2 py-20 text-center text-neutral-300">
            <div className="text-5xl mb-4 opacity-10">🔍</div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">No matching archives found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListings;
