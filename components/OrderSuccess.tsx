
import React, { useEffect } from 'react';
import { View, Order } from '../types';

interface OrderSuccessProps {
  order: Order | null;
  onNavigate: (view: View) => void;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({ order, onNavigate }) => {
  useEffect(() => {
    // Add custom style for animation to the head
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes checkmark {
        0% { stroke-dashoffset: 100; }
        100% { stroke-dashoffset: 0; }
      }
      .animate-check {
        stroke-dasharray: 100;
        stroke-dashoffset: 100;
        animation: checkmark 0.8s ease-in-out forwards 0.2s;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center p-8 text-center">
      {/* Right Animation (Checkmark) */}
      <div className="mb-8 relative">
        <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center border-4 border-neutral-100">
          <svg className="w-12 h-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path 
              className="animate-check"
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="3" 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
        <div className="absolute -inset-2 rounded-full border border-black/5 animate-ping"></div>
      </div>

      <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 italic">Congratulations</h1>
      <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-10">Your Archive Entry is Confirmed</p>
      
      <div className="bg-neutral-50 p-6 rounded-sm w-full max-w-xs border border-neutral-100 mb-10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Order ID</span>
          <span className="text-xs font-bold">{order?.id || 'ORD-VINTAGE'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Transaction</span>
          <span className="text-xs font-black">₹{order?.totalAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button 
          onClick={() => onNavigate(View.ORDERS)}
          className="w-full bg-black text-white py-4 font-black rounded-sm uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-neutral-900 transition-colors"
        >
          View Order History
        </button>
        <button 
          onClick={() => onNavigate(View.HOME)}
          className="w-full bg-white text-black py-4 font-black rounded-sm uppercase tracking-[0.2em] text-[10px] border border-neutral-200"
        >
          Return to Home
        </button>
      </div>

      <p className="mt-12 text-[8px] text-gray-300 font-bold uppercase tracking-[0.4em]">FM Vintage Curated Logistics</p>
    </div>
  );
};

export default OrderSuccess;
