
import React from 'react';
import { Order } from '../types';

interface MyOrdersProps {
  orders: Order[];
  onCancelOrder: (id: string) => void;
}

const MyOrders: React.FC<MyOrdersProps> = ({ orders, onCancelOrder }) => {
  const isCancellable = (orderDate: string) => {
    try {
      const diffTime = Math.abs(new Date().getTime() - new Date(orderDate).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3;
    } catch (e) {
      return false;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStepStatus = (orderStatus: string, step: string) => {
    const sequence = ['Pending', 'Packed', 'Shipped', 'Delivered'];
    const currentIndex = sequence.indexOf(orderStatus === 'Cancelled' ? 'Pending' : orderStatus);
    const stepIndex = sequence.indexOf(step);

    if (orderStatus === 'Cancelled') return 'inactive';
    if (currentIndex >= stepIndex) return 'completed';
    return 'pending';
  };

  const TrackerStep = ({ label, date, status, isLast }: { label: string, date?: string, status: 'completed' | 'pending' | 'inactive', isLast?: boolean }) => {
    const isActive = status === 'completed';
    return (
      <div className="flex flex-col items-center flex-1 relative">
        {/* Connector Line */}
        {!isLast && (
          <div className={`absolute top-2 left-1/2 w-full h-[2px] z-0 ${isActive ? 'bg-blue-600' : 'bg-neutral-200'}`}></div>
        )}
        
        {/* Dot */}
        <div className={`w-4 h-4 rounded-full border-2 z-10 flex items-center justify-center transition-all duration-500 ${
          isActive ? 'bg-blue-600 border-blue-600' : 'bg-white border-neutral-300'
        }`}>
          {isActive && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        
        {/* Label */}
        <div className="mt-2 text-center">
          <p className={`text-[8px] font-black uppercase tracking-tighter ${isActive ? 'text-blue-600' : 'text-neutral-400'}`}>
            {label}
          </p>
          {date && isActive && (
            <p className="text-[6px] font-bold text-neutral-400 uppercase mt-0.5">{date}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="bg-white p-4 mb-2 border-b border-neutral-100">
        <h2 className="font-black text-lg uppercase tracking-tight text-blue-600">Acquisition Archive</h2>
      </div>

      <div className="p-2 space-y-3 pb-24">
        {orders.map(order => (
          <div key={order.id} className="bg-white p-5 rounded-sm border border-neutral-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
            {order.status === 'Cancelled' && (
              <div className="absolute top-12 left-0 right-0 py-1 bg-red-600 text-white text-[8px] font-black uppercase tracking-[0.5em] text-center z-10 -rotate-12 opacity-80 pointer-events-none">
                Cancelled Transaction
              </div>
            )}
            
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-neutral-50">
               <div className="flex flex-col">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Transaction ID</span>
                  <span className="text-[10px] font-black text-black">{order.id}</span>
               </div>
               <div className="text-right">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Order Summary</span>
                  <span className="text-[10px] font-black block text-blue-600">₹{order.totalAmount.toLocaleString()}</span>
               </div>
            </div>
            
            <div className="space-y-4 mb-6">
              {order.items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 bg-neutral-50 p-1 border border-neutral-100 rounded-sm overflow-hidden flex-shrink-0">
                    <img src={item.images[0]} className="w-full h-full object-contain" alt={item.name} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[10px] font-black uppercase tracking-tight line-clamp-1 text-gray-800">{item.name}</h4>
                    <div className="flex gap-2 items-center">
                      <p className="text-[9px] text-gray-400 font-bold uppercase">Qty: {item.quantity}</p>
                      {item.selectedSize && <span className="text-[8px] bg-neutral-100 px-1 rounded-sm font-black">SZ: {item.selectedSize}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Flipkart Style Delivery Tracker */}
            {order.status !== 'Cancelled' && (
              <div className="bg-neutral-50 p-4 rounded-sm border border-neutral-100 mb-6">
                <div className="flex justify-between relative">
                  <TrackerStep 
                    label="Ordered" 
                    date={formatDate(order.date)} 
                    status={getStepStatus(order.status, 'Pending')} 
                  />
                  <TrackerStep 
                    label="Packed" 
                    status={getStepStatus(order.status, 'Packed')} 
                  />
                  <TrackerStep 
                    label="Shipped" 
                    status={getStepStatus(order.status, 'Shipped')} 
                  />
                  <TrackerStep 
                    label="Delivered" 
                    date={order.deliveryDate ? formatDate(order.deliveryDate) : undefined} 
                    status={getStepStatus(order.status, 'Delivered')} 
                    isLast 
                  />
                </div>
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-neutral-50 flex justify-between items-center">
               <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'Cancelled' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${order.status === 'Cancelled' ? 'text-red-500' : 'text-black'}`}>
                    {order.status === 'Pending' ? 'Arriving Soon' : order.status}
                  </span>
               </div>
               
               <div className="flex gap-4">
                 {order.status !== 'Cancelled' && isCancellable(order.date) && order.status === 'Pending' && (
                    <button 
                      onClick={() => {
                        if (confirm("Are you sure you want to cancel this acquisition?")) {
                          onCancelOrder(order.id);
                        }
                      }}
                      className="text-[9px] font-black text-red-500 border-b border-red-500 uppercase tracking-widest"
                    >
                      Cancel Entry
                    </button>
                 )}
                 <button className="text-[9px] font-black text-blue-600 border-b border-blue-600 uppercase tracking-widest">Need Help?</button>
               </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="bg-white p-12 text-center rounded-sm border border-neutral-100 mt-10 mx-2">
            <div className="text-6xl mb-6 opacity-20">📦</div>
            <h3 className="text-lg font-black mb-1 uppercase tracking-tight">No History</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Your acquisition history is currently empty.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
