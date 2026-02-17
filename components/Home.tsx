
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
      {/* Categories - Optimized for Visibility */}
      <div className="bg-white mb-2 grid grid-cols-4 gap-2 px-2 py-4 border-b shadow-sm">
        {CATEGORIES.map(cat => (
          <button 
            key={cat.id} 
            onClick={() => onCategoryClick(cat.id)}
            className="flex flex-col items-center justify-center transition-transform active:scale-90"
          >
            <div className="w-14 h-14 flex items-center justify-center text-2xl bg-neutral-50 rounded-2xl mb-1.5 shadow-sm border border-neutral-100">
              {cat.icon}
            </div>
            <span className="text-[9px] font-black uppercase text-gray-900 tracking-tighter">{cat.name}</span>
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
                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Location</h4>
                <p className="text-xs font-light leading-relaxed text-neutral-300">
                  Lakhipur Town,<br/>
                  Goalpara, Assam - 783129,<br/>
                  India
                </p>
             </div>

             <div className="bg-white/5 p-4 rounded-sm border-l-2 border-blue-600">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Contact</h4>
                <p className="text-xs font-light text-neutral-300">
                  registry@fmvintage.com<br/>
                  <a href="https://wa.me/917002761845" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mt-2 hover:text-green-400 transition-colors w-fit">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.435-9.89 9.884-.001 2.225.586 3.891 1.546 5.45l-1.02 3.711 3.964-.9zM15.111 11.69c-.272-.136-1.608-.792-1.857-.882-.25-.09-.432-.136-.614.136-.182.273-.705.882-.864 1.064-.158.182-.318.204-.59.068-.272-.136-1.15-.424-2.191-1.353-.81-.722-1.356-1.614-1.515-1.886-.159-.272-.017-.42.119-.555.123-.122.272-.318.409-.477.136-.159.182-.272.272-.454.091-.181.045-.341-.023-.477-.068-.136-.614-1.477-.841-2.022-.221-.532-.443-.459-.614-.468l-.523-.009c-.182 0-.477.068-.727.341-.25.272-.954.932-.954 2.272 0 1.341.977 2.636 1.114 2.818.136.182 1.921 2.934 4.653 4.113.65.28 1.157.447 1.551.572.653.208 1.247.178 1.717.108.524-.078 1.608-.659 1.836-1.295.227-.636.227-1.181.159-1.295-.068-.113-.25-.182-.523-.318z"/>
                    </svg>
                    <span className="font-bold underline decoration-white/20 underline-offset-4">7002761845</span>
                  </a>
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
