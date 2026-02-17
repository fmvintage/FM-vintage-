
import React from 'react';
import { CartItem } from '../types';

interface CartProps {
  cart: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({ cart, onRemove, onUpdateQty, onCheckout }) => {
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalOriginal = cart.reduce((acc, item) => acc + (item.originalPrice * item.quantity), 0);
  const totalDiscount = totalOriginal - totalPrice;

  if (cart.length === 0) {
    return (
      <div className="p-8 text-center bg-white min-h-screen flex flex-col items-center justify-center">
        <div className="text-8xl mb-6 grayscale opacity-10">🛍️</div>
        <h2 className="text-xl font-bold mb-2 uppercase tracking-tighter">Your collection is empty</h2>
        <p className="text-gray-400 text-sm mb-6 font-light">Let's find something unique.</p>
        <button className="bg-black text-white px-10 py-3 rounded-sm font-bold uppercase tracking-widest text-xs">Start Browsing</button>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen pb-24">
      <div className="bg-white p-4 mb-2 shadow-sm border-b">
         <h2 className="font-bold text-lg uppercase tracking-tight">Shopping Bag ({cart.length})</h2>
      </div>

      <div className="space-y-1">
        {cart.map(item => (
          <div key={item.id} className="bg-white p-4 flex gap-4 border-b">
            <div className="w-20 h-20 bg-neutral-100 rounded-sm">
              <img src={item.images[0]} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-bold uppercase tracking-tight text-black line-clamp-1 mb-1">{item.name}</h3>
              <p className="text-[10px] text-gray-400 font-bold mb-2 uppercase">{item.category}</p>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-black text-black">₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-black rounded-sm">
                  <button onClick={() => onUpdateQty(item.id, -1)} className="px-3 py-0.5 text-black font-bold">-</button>
                  <span className="px-3 py-0.5 font-black text-xs">{item.quantity}</span>
                  <button onClick={() => onUpdateQty(item.id, 1)} className="px-3 py-0.5 text-black font-bold">+</button>
                </div>
                <button onClick={() => onRemove(item.id)} className="text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-widest">Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white mt-2 p-6">
         <h3 className="font-bold text-black text-[10px] mb-6 uppercase tracking-[0.2em] border-b pb-2">Investment Summary</h3>
         <div className="space-y-4 text-xs font-medium">
            <div className="flex justify-between text-gray-500">
               <span className="uppercase">Original Value</span>
               <span>₹{totalOriginal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-black font-bold">
               <span className="uppercase">Exclusive Savings</span>
               <span>- ₹{totalDiscount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
               <span className="uppercase">Logistics</span>
               <span className="text-black font-bold">COMPLIMENTARY</span>
            </div>
            <div className="flex justify-between font-black text-lg border-t border-black pt-4 mt-2">
               <span className="uppercase tracking-tighter">Total Payable</span>
               <span>₹{totalPrice.toLocaleString()}</span>
            </div>
         </div>
      </div>

      <div className="fixed bottom-14 left-0 right-0 max-w-lg mx-auto bg-white border-t px-4 py-3 flex justify-between items-center z-40">
         <div>
            <span className="text-lg font-black text-black">₹{totalPrice.toLocaleString()}</span>
            <p className="text-gray-400 text-[8px] font-bold uppercase tracking-widest">Inclusive of taxes</p>
         </div>
         <button 
           onClick={onCheckout}
           className="bg-black text-white px-10 py-3 font-bold rounded-sm shadow-xl uppercase text-xs tracking-widest"
         >
           Checkout Now
         </button>
      </div>
    </div>
  );
};

export default Cart;
