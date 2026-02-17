
import React, { useState, useEffect } from 'react';
import { Product, View } from '../types';
import { CATEGORIES } from '../constants';
import ProductCard from './ProductCard';

interface HomeProps {
  products: Product[];
  onProductClick: (p: Product) => void;
  onCategoryClick: (c: string) => void;
  onAddToCart: (p: Product) => void;
  onBuyNow: (p: Product) => void;
  onNavigate: (view: View) => void;
}

const Home: React.FC<HomeProps> = ({ products, onProductClick, onCategoryClick, onNavigate, onAddToCart, onBuyNow }) => {
  const featuredProducts = products.slice(0, 4);
  const bannerProducts = products.slice(0, 4); // The 4 "live" products for the cover
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerProducts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [bannerProducts.length]);

  return (
    <div className="bg-white min-h-screen">
      {/* Categories Horizontal Scroll */}
      <div className="bg-white mb-2 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-6 px-4 py-4 border-b">
        {CATEGORIES.map(cat => (
          <button 
            key={cat.id} 
            onClick={() => onCategoryClick(cat.id)}
            className="flex flex-col items-center min-w-[60px]"
          >
            <div className="w-12 h-12 flex items-center justify-center text-xl bg-neutral-100 rounded-full mb-1">
              {cat.icon}
            </div>
            <span className="text-[10px] font-bold uppercase text-gray-800">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Dynamic Live Banner / Carousel */}
      <div className="px-2 mb-4">
        <div className="w-full h-56 rounded-sm bg-black overflow-hidden relative shadow-2xl">
          {bannerProducts.map((p, idx) => (
            <div 
              key={p.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                idx === currentBanner ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'
              }`}
            >
              <img 
                src={p.images[0]} 
                alt={p.name} 
                className="w-full h-full object-cover opacity-40 blur-[1px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30"></div>
              
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white pb-10">
                <div className="flex items-center gap-2 mb-2">
                   <div className="flex items-center gap-1.5 bg-red-600 px-2 py-0.5 rounded-sm">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                      <span className="text-[8px] font-black uppercase tracking-[0.2em]">Live Spotlight</span>
                   </div>
                   <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/60">Limited Entry</span>
                </div>
                
                <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-tight mb-1 drop-shadow-md">
                  {p.name}
                </h2>
                <div className="flex items-center gap-3 mb-4">
                   <span className="text-blue-400 font-black text-lg">₹{p.price.toLocaleString()}</span>
                   <span className="text-white/40 line-through text-xs">₹{p.originalPrice.toLocaleString()}</span>
                   <span className="bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded-sm text-[8px] font-black uppercase">Save {p.discountPercentage}%</span>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => onBuyNow(p)}
                    className="bg-white text-black px-6 py-2 text-[10px] font-black rounded-sm uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
                  >
                    Buy Now
                  </button>
                  <button 
                    onClick={() => onAddToCart(p)}
                    className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 text-[10px] font-black rounded-sm uppercase tracking-widest active:scale-95 transition-transform"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Dots */}
          <div className="absolute bottom-4 left-6 flex gap-1.5 z-20">
             {bannerProducts.map((_, i) => (
               <button 
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={`h-1 rounded-full transition-all duration-500 ${i === currentBanner ? 'bg-blue-500 w-8' : 'bg-white/20 w-3'}`}
               />
             ))}
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="bg-white p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold tracking-tight uppercase">New Arrivals</h3>
          <button onClick={() => onNavigate(View.PLP)} className="text-blue-600 font-bold text-xs border-b border-blue-600">View All</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {featuredProducts.map(p => (
            <ProductCard 
              key={p.id} 
              product={p} 
              onClick={() => onProductClick(p)} 
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
            />
          ))}
        </div>
      </div>

      {/* Handpicked Classics Section */}
      <div className="bg-neutral-50 mt-2 p-4">
         <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold uppercase tracking-tight">Handpicked Classics</h3>
          <button onClick={() => onNavigate(View.PLP)} className="bg-blue-600 text-white p-2 rounded-full shadow-lg">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {products.filter(p => p.category === 'fashion').map(p => (
            <div key={p.id} onClick={() => onProductClick(p)} className="min-w-[140px] flex flex-col items-center cursor-pointer group">
              <div className="w-[120px] h-[120px] bg-white rounded-sm border border-neutral-200 overflow-hidden mb-2 relative">
                <img src={p.images[0]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={p.name} />
              </div>
              <p className="text-[10px] font-bold text-center line-clamp-1 uppercase text-gray-600">{p.name}</p>
              <p className="text-blue-600 font-black text-xs mt-0.5">₹{p.price.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Panel Access Card */}
      <div className="px-4 mt-6">
        <div className="bg-indigo-900 rounded-sm p-6 text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
           </div>
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                 <span className="text-[8px] font-black uppercase tracking-[0.4em] text-indigo-300">System Secure</span>
              </div>
              <h3 className="text-xl font-black italic tracking-tighter uppercase mb-1">Admin Panel</h3>
              <p className="text-[10px] text-indigo-200 font-medium uppercase tracking-widest mb-6 opacity-80">Manage Orders, Inventory & Store Performance</p>
              
              <button 
                onClick={() => onNavigate(View.ADMIN)}
                className="bg-white text-indigo-900 px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center gap-3"
              >
                Open Admin Dashboard
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7" /></svg>
              </button>
           </div>
           
           <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-[7px] font-black text-indigo-400 uppercase tracking-widest">Authorized Personnel Only</span>
              <div className="flex gap-1">
                 <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
                 <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
                 <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
              </div>
           </div>
        </div>
      </div>

      {/* App Location & About Footer */}
      <div className="bg-neutral-900 text-white p-8 mt-4 pb-12">
        <div className="flex items-center gap-2 mb-8">
           <span className="font-black italic text-xl tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">FM VINTAGE</span>
           <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
           <span className="text-[8px] font-black uppercase tracking-[0.4em]">Archive Hub</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           {/* Physical Location Details */}
           <div className="space-y-6">
             <div className="bg-white/5 p-4 rounded-sm border-l-2 border-blue-600">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Archive HQ Location</h4>
                <p className="text-xs font-light leading-relaxed text-neutral-300">
                  Plot 402, Vintage Lane,<br/>
                  Curated District, South Mumbai,<br/>
                  Maharashtra - 400001, India
                </p>
             </div>

             <div className="bg-white/5 p-4 rounded-sm border-l-2 border-blue-600">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Protocol Contact</h4>
                <p className="text-xs font-light text-neutral-300">
                  registry@fmvintage.com<br/>
                  +91 99999 00000
                </p>
             </div>
           </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col gap-4">
           <div className="flex flex-wrap gap-6">
              <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Curated Logistics</span>
              <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Global Shipping</span>
              <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Secured Payments</span>
           </div>
           <p className="text-[8px] font-black uppercase tracking-[0.3em] text-neutral-600">© 2024 FM VINTAGE COLLECTIVE. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
