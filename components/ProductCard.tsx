
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onAddToCart?: (p: Product) => void;
  onBuyNow?: (p: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onAddToCart, onBuyNow }) => {
  return (
    <div 
      className="bg-white border border-neutral-100 rounded-sm overflow-hidden flex flex-col cursor-pointer hover:border-blue-600 transition-all relative group shadow-sm active:scale-[0.99]"
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="h-44 overflow-hidden bg-white relative p-2 flex items-center justify-center">
        <img src={product.images[0]} alt={product.name} className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105" />
        
        {/* Wishlist Icon */}
        <button 
          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-neutral-300 hover:text-pink-500 transition-colors shadow-sm z-10"
          onClick={(e) => { e.stopPropagation(); }}
        >
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        </button>
      </div>

      {/* Info Section */}
      <div className="p-3 pb-2 flex-grow flex flex-col justify-between border-t border-neutral-50">
        <div>
          <h4 className="text-[11px] font-bold text-neutral-800 line-clamp-1 mb-1 leading-snug uppercase tracking-tight">{product.name}</h4>
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="bg-green-600 text-white text-[9px] px-1.5 py-0.5 rounded-sm flex items-center font-bold">
              {product.rating} <span className="ml-0.5 text-[7px]">★</span>
            </div>
            <span className="text-neutral-400 text-[9px] font-black uppercase tracking-widest">({product.reviewCount})</span>
          </div>
        </div>
        
        <div className="space-y-0.5 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-neutral-900">₹{product.price.toLocaleString()}</span>
            <span className="text-[9px] text-neutral-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
          </div>
          <span className="text-[10px] text-green-600 font-black uppercase tracking-tight">{product.discountPercentage}% OFF</span>
        </div>
      </div>

      {/* Action Buttons Group */}
      <div className="flex border-t border-neutral-100">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onAddToCart) onAddToCart(product);
          }}
          className="flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest bg-neutral-50 text-neutral-900 hover:bg-neutral-100 transition-colors border-r border-neutral-100 flex items-center justify-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          Add
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onBuyNow) onBuyNow(product);
          }}
          className="flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest bg-[#ff9f00] text-white hover:bg-[#f39700] transition-colors flex items-center justify-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          Buy
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
