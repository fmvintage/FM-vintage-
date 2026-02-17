
import React, { useState } from 'react';
import { Product, View } from '../types';

interface ProductDetailsProps {
  product: Product;
  onAddToCart: (p: Product, size?: string) => void;
  onBuyNow: (p: Product, size?: string) => void;
  onToggleWishlist: (p: Product) => void;
  isWishlisted: boolean;
  onNavigate: (view: View) => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onAddToCart, onBuyNow, onToggleWishlist, isWishlisted }) => {
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  return (
    <div className="bg-white min-h-screen pb-24">
      <div className="relative group bg-white">
        <div className="h-[400px] w-full overflow-hidden flex items-center justify-center p-4">
          <img 
            src={product.images[activeImg]} 
            className="max-w-full max-h-full object-contain transition-transform duration-700" 
            alt={product.name} 
          />
        </div>
        
        <button 
          onClick={() => onToggleWishlist(product)}
          className={`absolute top-4 right-4 p-2.5 rounded-full shadow-lg border transition-all z-10 ${isWishlisted ? 'bg-pink-50 border-pink-200 text-pink-500 scale-110' : 'bg-white/80 border-neutral-100 text-neutral-300'}`}
        >
          <svg className="w-6 h-6" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {product.images.length > 1 && (
          <div className="flex justify-center gap-2 mt-2 absolute bottom-4 left-0 right-0">
            {product.images.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setActiveImg(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === activeImg ? 'bg-blue-600 w-4' : 'bg-neutral-300'}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-5 py-6 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 mb-1 leading-tight">{product.name}</h1>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{product.category}</p>
        </div>

        <div className="flex items-center gap-2">
           <div className="bg-green-600 text-white text-[11px] px-2 py-0.5 rounded-sm flex items-center font-bold">
            {product.rating} <span className="ml-0.5 text-[8px]">★</span>
          </div>
          <span className="text-neutral-400 text-xs font-bold uppercase tracking-widest">{product.reviewCount} Ratings</span>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-neutral-900">₹{product.price.toLocaleString()}</span>
          <span className="text-neutral-400 line-through text-sm">₹{product.originalPrice.toLocaleString()}</span>
          <span className="text-green-600 font-black text-sm">{product.discountPercentage}% OFF</span>
        </div>

        {/* Sizes Selection */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="space-y-3 pt-2">
             <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-neutral-900">Select Size</h3>
             <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[40px] h-[40px] flex items-center justify-center border text-xs font-black transition-all rounded-sm ${selectedSize === size ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-neutral-200 text-neutral-800'}`}
                  >
                    {size}
                  </button>
                ))}
             </div>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-sm border border-green-100">
           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path></svg>
           <p className="text-[10px] font-black uppercase tracking-widest">In Stock • Fast Delivery</p>
        </div>

        <div className="border-t border-neutral-100 pt-6">
          <h3 className="font-black text-xs mb-3 uppercase tracking-[0.2em] text-neutral-900">Product Narrative</h3>
          <p className="text-sm text-neutral-600 leading-relaxed font-normal">{product.description}</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t flex h-16 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => {
            if (product.sizes?.length && !selectedSize) { alert("Please select a size"); return; }
            onAddToCart(product, selectedSize || undefined);
          }}
          className="flex-1 bg-white text-neutral-900 font-black flex items-center justify-center uppercase tracking-[0.1em] text-xs hover:bg-neutral-50 transition-colors border-r border-neutral-100"
        >
          Add to Bag
        </button>
        <button 
          onClick={() => {
            if (product.sizes?.length && !selectedSize) { alert("Please select a size"); return; }
            onBuyNow(product, selectedSize || undefined);
          }}
          className="flex-1 bg-[#ff9f00] text-white font-black flex items-center justify-center uppercase tracking-[0.1em] text-xs hover:bg-[#f39700] transition-colors"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
