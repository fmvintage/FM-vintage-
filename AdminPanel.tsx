
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Product, Order, User } from '../types';
import { generateProductDescription } from '../services/geminiService';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  customers: User[];
  onAdd: (p: Product) => void;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  newOrdersCount: number;
  clearNotifications: () => void;
}

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '7', '8', '9', '10', 'OS'];

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  products, 
  onAdd, 
  onEdit, 
  onDelete, 
  orders, 
  onUpdateOrderStatus, 
  newOrdersCount, 
  clearNotifications, 
  customers 
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'customers' | 'analysis'>('analysis');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'fashion',
    price: 0,
    originalPrice: 0,
    images: [],
    description: '',
    stock: 10,
    sizes: []
  });
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analysis Stats
  const stats = useMemo(() => {
    const totalRevenue = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((acc, o) => acc + o.totalAmount, 0);
    
    const categoryDistribution = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
    const pendingCount = orders.filter(o => o.status === 'Pending').length;

    return { totalRevenue, categoryDistribution, deliveredCount, pendingCount };
  }, [orders, products]);

  useEffect(() => {
    if (activeTab === 'orders' && newOrdersCount > 0) {
      clearNotifications();
    }
  }, [activeTab, newOrdersCount, clearNotifications]);

  const handleAiDescribe = async () => {
    if (!formData.name || !formData.category) return;
    setIsAiLoading(true);
    const desc = await generateProductDescription(formData.name, formData.category);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsAiLoading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Fix: Explicitly cast Array.from(files) to File[] to ensure 'file' is inferred as 'File' (which is a Blob)
      const readers = (Array.from(files) as File[]).slice(0, 5).map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then(results => {
        setFormData(prev => ({ 
          ...prev, 
          images: [...(prev.images || []), ...results].slice(0, 5) 
        }));
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: (prev.images || []).filter((_, i) => i !== index) }));
  };

  const toggleSize = (size: string) => {
    setFormData(prev => {
      const currentSizes = prev.sizes || [];
      if (currentSizes.includes(size)) {
        return { ...prev, sizes: currentSizes.filter(s => s !== size) };
      } else {
        return { ...prev, sizes: [...currentSizes, size] };
      }
    });
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData(p);
    setIsAdding(false);
  };

  const handleSave = () => {
    if (!formData.name || !formData.price || (formData.images?.length || 0) < 1) {
      alert("Please enter Name, Price and upload at least 1 image (3-5 recommended).");
      return;
    }
    
    const productData: Product = {
      ...formData as Product,
      id: editingProduct?.id || `P-${Date.now()}`,
      discountPercentage: Math.round(((Number(formData.originalPrice || 0) - Number(formData.price || 0)) / Number(formData.originalPrice || 1)) * 100) || 0,
      rating: editingProduct?.rating || 4.0,
      reviewCount: editingProduct?.reviewCount || 0
    };

    if (editingProduct) {
      onEdit(productData);
      setEditingProduct(null);
    } else {
      onAdd(productData);
    }
    
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      category: 'fashion', 
      price: 0, 
      originalPrice: 0, 
      images: [], 
      description: '', 
      stock: 10,
      sizes: []
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Shipped': return 'bg-blue-600 text-white';
      case 'Cancelled': return 'bg-red-600 text-white';
      case 'Pending': return 'bg-amber-500 text-white';
      case 'Delivered': return 'bg-green-600 text-white';
      default: return 'bg-neutral-100 text-neutral-600';
    }
  };

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="bg-indigo-900 sticky top-14 z-[45] shadow-xl overflow-x-auto scrollbar-hide">
        <div className="flex justify-around items-center p-4 min-w-[400px]">
           <button onClick={() => setActiveTab('analysis')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'analysis' ? 'opacity-100' : 'opacity-50'}`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Analysis</span>
           </button>
           <button onClick={() => setActiveTab('inventory')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'inventory' ? 'opacity-100' : 'opacity-50'}`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Inventory</span>
           </button>
           <button onClick={() => setActiveTab('orders')} className={`flex flex-col items-center gap-1 transition-all relative ${activeTab === 'orders' ? 'opacity-100' : 'opacity-50'}`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {newOrdersCount > 0 && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>}
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Orders</span>
           </button>
           <button onClick={() => setActiveTab('customers')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'customers' ? 'opacity-100' : 'opacity-50'}`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Registry</span>
           </button>
        </div>
      </div>

      <div className="p-4 pb-32">
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-600 p-5 rounded-sm text-white shadow-xl">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Total Revenue</span>
                <div className="text-2xl font-black italic mt-1">₹{stats.totalRevenue.toLocaleString()}</div>
              </div>
              <div className="bg-white p-5 rounded-sm border border-neutral-100 shadow-sm">
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Artifacts</span>
                <div className="text-2xl font-black italic mt-1 text-indigo-900">{products.length}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center bg-white p-4 rounded-sm border border-neutral-100 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-900">Archive Items</h3>
                <button 
                  onClick={() => { setIsAdding(true); setEditingProduct(null); resetForm(); }}
                  className="bg-indigo-600 text-white px-4 py-2 text-[10px] font-black rounded-sm uppercase tracking-widest shadow-lg"
                >
                  Add Product
                </button>
             </div>

             {(isAdding || editingProduct) && (
               <div className="bg-white p-6 border-t-8 border-indigo-600 shadow-2xl rounded-sm">
                  <h4 className="font-black text-sm mb-6 uppercase tracking-tight italic">Product Specification</h4>
                  <div className="space-y-4">
                     {/* Images Section */}
                     <div>
                        <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Upload Photos (3-5 Recommended)</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                           {(formData.images || []).map((img, idx) => (
                             <div key={idx} className="relative w-20 h-20 bg-neutral-100 rounded-sm border border-neutral-200 flex-shrink-0">
                                <img src={img} className="w-full h-full object-cover" />
                                <button onClick={() => removeImage(idx)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 shadow-lg">
                                   <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 010-1.414z"/></svg>
                                </button>
                             </div>
                           ))}
                           {(formData.images?.length || 0) < 5 && (
                             <button 
                               onClick={() => fileInputRef.current?.click()}
                               className="w-20 h-20 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-sm flex items-center justify-center flex-shrink-0 text-gray-400 hover:border-indigo-600 transition-colors"
                             >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                             </button>
                           )}
                           <input type="file" ref={fileInputRef} onChange={handleImageUpload} multiple accept="image/*" className="hidden" />
                        </div>
                     </div>

                     {/* Size Selection */}
                     <div>
                        <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Available Sizes</label>
                        <div className="flex flex-wrap gap-2">
                           {AVAILABLE_SIZES.map(size => (
                             <button 
                               key={size}
                               onClick={() => toggleSize(size)}
                               className={`px-3 py-1.5 text-[10px] font-black rounded-sm border transition-all ${formData.sizes?.includes(size) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-400 border-neutral-200'}`}
                             >
                               {size}
                             </button>
                           ))}
                        </div>
                     </div>

                     <div>
                        <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Product Title</label>
                        <input type="text" className="w-full border-b border-neutral-200 p-2 text-sm focus:border-indigo-600 outline-none uppercase font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Selling Price (₹)</label>
                          <input type="number" className="w-full border-b border-neutral-200 p-2 text-sm focus:border-indigo-600 outline-none font-bold" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                        </div>
                        <div>
                          <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block mb-1">MRP Price (₹)</label>
                          <input type="number" className="w-full border-b border-neutral-200 p-2 text-sm focus:border-indigo-600 outline-none font-bold" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: Number(e.target.value)})} />
                        </div>
                     </div>

                     <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Narrative Description</label>
                          <button onClick={handleAiDescribe} disabled={isAiLoading} className="text-[7px] bg-indigo-600 text-white px-2 py-1 rounded-sm font-black uppercase shadow-sm">
                            {isAiLoading ? 'Thinking...' : '✨ Use AI'}
                          </button>
                        </div>
                        <textarea className="w-full border border-neutral-100 p-3 text-[11px] h-28 outline-none focus:border-indigo-600 leading-relaxed" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                     </div>

                     <div className="flex gap-4">
                        <button onClick={() => { setIsAdding(false); setEditingProduct(null); }} className="flex-1 py-3 text-[9px] font-black uppercase border border-neutral-100">Discard</button>
                        <button onClick={handleSave} className="flex-1 bg-indigo-600 text-white py-3 text-[9px] font-black uppercase shadow-lg">Save Artifact</button>
                     </div>
                  </div>
               </div>
             )}

             <div className="grid grid-cols-1 gap-3">
                {products.map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-sm border border-neutral-100 flex items-center gap-4 group">
                     <div className="w-12 h-12 flex-shrink-0 bg-neutral-50 rounded-sm">
                        <img src={p.images[0]} className="w-full h-full object-contain" alt="" />
                     </div>
                     <div className="flex-1">
                        <h4 className="text-[10px] font-black uppercase tracking-tight truncate">{p.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-bold text-indigo-600 italic">₹{p.price.toLocaleString()}</span>
                          <span className="text-[8px] text-gray-300 font-bold uppercase">Stock: {p.stock}</span>
                        </div>
                     </div>
                     <div className="flex gap-1">
                        <button onClick={() => handleOpenEdit(p)} className="p-2 text-neutral-300 hover:text-indigo-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        <button onClick={() => onDelete(p.id)} className="p-2 text-neutral-300 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
             {orders.map(order => (
               <div key={order.id} className="bg-white rounded-sm border border-neutral-200 overflow-hidden">
                  <div className="p-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                     <h4 className="text-[11px] font-black italic tracking-tighter">{order.id}</h4>
                     <span className={`text-[9px] font-black px-3 py-1 rounded-sm uppercase tracking-widest ${getStatusBadgeClass(order.status)}`}>{order.status}</span>
                  </div>
                  <div className="p-4">
                     {order.items.map(item => (
                        <div key={item.id} className="flex gap-3 mb-2">
                           <img src={item.images[0]} className="w-8 h-8 object-contain" />
                           <div className="text-[10px] font-bold uppercase truncate flex-1">{item.name} x{item.quantity}</div>
                        </div>
                     ))}
                     <div className="mt-4 flex gap-2">
                        {order.status === 'Pending' && (
                          <>
                            <button onClick={() => onUpdateOrderStatus(order.id, 'Shipped')} className="flex-1 bg-green-600 text-white py-2 font-black uppercase text-[8px]">Accept</button>
                            <button onClick={() => onUpdateOrderStatus(order.id, 'Cancelled')} className="flex-1 bg-red-600 text-white py-2 font-black uppercase text-[8px]">Reject</button>
                          </>
                        )}
                     </div>
                  </div>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-3">
             {customers.map(customer => (
               <div key={customer.id} className="bg-white p-4 rounded-sm border border-neutral-100 flex items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black italic">
                     {customer.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                     <h4 className="text-[10px] font-black uppercase tracking-tight">{customer.name}</h4>
                     <p className="text-[8px] text-gray-500 uppercase tracking-widest">{customer.mobile}</p>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
