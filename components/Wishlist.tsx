
import React from 'react';
import { Product } from '../types';

interface WishlistProps {
  items: Product[];
  onProductClick: (p: Product) => void;
  onAddToCart: (p: Product) => void;
}

const Wishlist: React.FC<WishlistProps> = ({ items, onProductClick, onAddToCart }) => {
  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="bg-white p-4 mb-2 border-b border-neutral-100">
        <h2 className="font-black text-lg uppercase tracking-tight text-pink-500">Wishlist Vault ({items.length})</h2>
      </div>

      <div className="p-2 space-y-2">
        {items.map(p => (
          <div key={p.id} className="bg-white p-4 flex gap-4 rounded-sm border border-neutral-100 shadow-sm">
            <div className="w-24 h-24 flex-shrink-0 cursor-pointer overflow-hidden bg-white rounded-sm" onClick={() => onProductClick(p)}>
               <img src={p.images[0]} className="w-full h-full object-contain transition-transform hover:scale-110" alt={p.name} />
            </div>
            <div className="flex-1 flex flex-col justify-between">
               <div>
                  <h3 className="text-[10px] font-black uppercase tracking-tight line-clamp-1 cursor-pointer" onClick={() => onProductClick(p)}>{p.name}</h3>
                  <div className="flex items-center gap-2 mt-1 mb-2">
                    <span className="text-sm font-black text-black">₹{p.price.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400 line-through font-bold">₹{p.originalPrice.toLocaleString()}</span>
                  </div>
               </div>
               <button 
                 onClick={() => onAddToCart(p)}
                 className="w-full bg-blue-600 text-white py-2 text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-blue-700 transition-colors shadow-md"
               >
                 Move to Cart
               </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="bg-white p-12 text-center rounded-sm border border-neutral-100 mt-10 mx-2">
            <div className="text-6xl mb-6 text-pink-100">💗</div>
            <h3 className="text-lg font-black mb-1 uppercase tracking-tight">Vault Empty</h3>
            <p className="text-[10px] text-gray-400 mb-8 font-bold uppercase tracking-widest">Mark artifacts to archive them here.</p>
            <button className="bg-black text-white px-10 py-3 font-black rounded-sm uppercase tracking-[0.2em] text-[10px]">Explore Gallery</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
