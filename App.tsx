
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Product, CartItem, User, Order } from './types';
import { MOCK_PRODUCTS, CATEGORIES } from './constants';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ProductListings from './components/ProductListings';
import ProductDetails from './components/ProductDetails';
import Cart from './components/Cart';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import Checkout from './components/Checkout';
import Wishlist from './components/Wishlist';
import MyOrders from './components/MyOrders';
import OrderSuccess from './components/OrderSuccess';
import AiChatBox from './components/AiChatBox';

const App: React.FC = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Hidden Admin Auth State
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [passError, setPassError] = useState(false);

  // Global App State
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [user, userSetter] = useState<User | null>(null);
  const setUser = (u: User | null) => userSetter(u);

  const [allUsers, setAllUsers] = useState<User[]>([
    { id: 'admin-1', name: 'Archive Admin', mobile: '9999999999', role: 'admin', address: 'Command Center, HQ' },
    { id: 'user-1', name: 'Premium Collector', mobile: '9876543210', role: 'user', address: 'Flat 402, Vintage Towers, Mumbai' }
  ]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [newOrdersCount, setNewOrdersCount] = useState<number>(0);

  // Derived State
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  // Auth Helpers
  const handleLogin = (userData: User) => {
    setUser(userData);
    setAllUsers(prev => {
      if (prev.find(u => u.mobile === userData.mobile)) return prev;
      return [...prev, userData];
    });
    setCurrentView(View.HOME);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView(View.LOGIN);
  };

  const handleUpdateUser = (updatedData: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updatedData };
      setUser(updated);
      setAllUsers(prev => prev.map(u => u.id === user.id ? updated : u));
    }
  };

  const handleAdminAccess = () => {
    if (adminPass === 'FMV2024') {
      setShowAdminAuthModal(false);
      setAdminPass('');
      setCurrentView(View.ADMIN);
    } else {
      setPassError(true);
      setTimeout(() => setPassError(false), 2000);
    }
  };

  // Navigation Helpers
  const navigateTo = useCallback((view: View, payload?: any) => {
    if (view === View.ADMIN) {
       setShowAdminAuthModal(true);
       return;
    }

    if (view === View.PDP && payload) {
      setSelectedProduct(payload);
    }
    if (view === View.PLP) {
      setSelectedCategory(payload || null);
    }
    setCurrentView(view);
    window.scrollTo(0, 0);
  }, []);

  // Cart Helpers
  const addToCart = (product: Product, size?: string) => {
    if (!user) {
      setCurrentView(View.LOGIN);
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      if (existing) {
        return prev.map(item => (item.id === product.id && item.selectedSize === size) ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  // Buy Now Logic
  const handleBuyNow = (product: Product, size?: string) => {
    if (!user) {
      setCurrentView(View.LOGIN);
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      if (existing) {
        return prev.map(item => (item.id === product.id && item.selectedSize === size) ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size }];
    });
    navigateTo(View.CHECKOUT);
  };

  // Wishlist Helpers
  const toggleWishlist = (product: Product) => {
    if (!user) {
      setCurrentView(View.LOGIN);
      return;
    }
    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) return prev.filter(p => p.id !== product.id);
      return [...prev, product];
    });
  };

  // Order Helpers
  const placeOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    setLastOrder(order);
    setNewOrdersCount(prev => prev + 1);
    clearCart();
    setCurrentView(View.ORDER_SUCCESS);
  };

  const clearNewOrders = () => setNewOrdersCount(0);

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
  };

  // Product Management (Admin)
  const handleAddProduct = (p: Product) => setProducts([p, ...products]);
  const handleEditProduct = (p: Product) => setProducts(products.map(old => old.id === p.id ? p : old));
  const handleDeleteProduct = (id: string) => setProducts(products.filter(p => p.id !== id));

  // Render Logic
  const renderContent = () => {
    switch (currentView) {
      case View.HOME:
        return <Home products={products} onProductClick={(p) => navigateTo(View.PDP, p)} onCategoryClick={(c) => navigateTo(View.PLP, c)} onAddToCart={addToCart} onBuyNow={handleBuyNow} onNavigate={navigateTo} />;
      case View.PLP:
        return <ProductListings products={products} category={selectedCategory} onProductClick={(p) => navigateTo(View.PDP, p)} onNavigate={navigateTo} onAddToCart={addToCart} onBuyNow={handleBuyNow} />;
      case View.PDP:
        return selectedProduct ? <ProductDetails product={selectedProduct} onAddToCart={addToCart} onBuyNow={handleBuyNow} onToggleWishlist={toggleWishlist} isWishlisted={wishlist.some(p => p.id === selectedProduct.id)} onNavigate={navigateTo} /> : <Home products={products} onProductClick={(p) => navigateTo(View.PDP, p)} onCategoryClick={(c) => navigateTo(View.PLP, c)} onAddToCart={addToCart} onBuyNow={handleBuyNow} onNavigate={navigateTo} />;
      case View.CART:
        return <Cart cart={cart} onRemove={removeFromCart} onUpdateQty={updateQuantity} onCheckout={() => navigateTo(View.CHECKOUT)} />;
      case View.CHECKOUT:
        return <Checkout cart={cart} user={user} onPlaceOrder={placeOrder} onBack={() => navigateTo(View.CART)} />;
      case View.PROFILE:
        return <Profile user={user} onLogout={handleLogout} onNavigate={navigateTo} newOrdersCount={newOrdersCount} onUpdateUser={handleUpdateUser} orders={orders} />;
      case View.ADMIN:
        return (
          <AdminPanel 
            products={products} 
            onAdd={handleAddProduct} 
            onEdit={handleEditProduct} 
            onDelete={handleDeleteProduct} 
            orders={orders} 
            onUpdateOrderStatus={updateOrderStatus} 
            newOrdersCount={newOrdersCount} 
            clearNotifications={clearNewOrders} 
            customers={allUsers} 
          />
        );
      case View.LOGIN:
        return <Login onLogin={handleLogin} onNavigate={navigateTo} />;
      case View.SIGNUP:
        return <div className="p-8 text-center bg-white min-h-screen flex flex-col items-center justify-center"><h2 className="text-xl font-black uppercase tracking-tight mb-4">Membership</h2><p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-8">Join the vintage collective.</p><button onClick={() => navigateTo(View.LOGIN)} className="text-black font-black uppercase tracking-widest text-xs border-b-2 border-black pb-1">Enter Archive</button></div>;
      case View.WISHLIST:
        return <Wishlist items={wishlist} onProductClick={(p) => navigateTo(View.PDP, p)} onAddToCart={addToCart} />;
      case View.ORDERS:
        return <MyOrders orders={orders} onCancelOrder={handleCancelOrder} />;
      case View.ORDER_SUCCESS:
        return <OrderSuccess order={lastOrder} onNavigate={navigateTo} />;
      default:
        return <Home products={products} onProductClick={(p) => navigateTo(View.PDP, p)} onCategoryClick={(c) => navigateTo(View.PLP, c)} onAddToCart={addToCart} onBuyNow={handleBuyNow} onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto bg-white shadow-xl relative pb-16">
      {currentView !== View.ORDER_SUCCESS && (
        <Navbar 
          currentView={currentView} 
          onNavigate={navigateTo} 
          cartCount={cartCount} 
          user={user} 
          onAdminAuthTrigger={() => setShowAdminAuthModal(true)}
        />
      )}
      
      <main className={`flex-grow ${currentView !== View.ORDER_SUCCESS ? 'pt-14' : ''}`}>
        {renderContent()}
      </main>

      {/* AI Chat Bot Integration */}
      {[View.HOME, View.PLP, View.PDP, View.WISHLIST, View.PROFILE].includes(currentView) && (
        <AiChatBox products={products} />
      )}

      {/* Admin Passkey Modal */}
      {showAdminAuthModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xs p-8 rounded-sm shadow-2xl">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-600 rounded-sm">
                   <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-900">Admin Gate</h3>
             </div>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Identity Verification Required</p>
             <input 
               type="password" 
               autoFocus
               value={adminPass}
               onChange={(e) => setAdminPass(e.target.value)}
               placeholder="ENTER PASSKEY"
               className={`w-full border-b-2 ${passError ? 'border-red-500 animate-shake' : 'border-neutral-100'} py-3 outline-none focus:border-indigo-600 font-bold tracking-[0.4em] uppercase text-xs transition-all`}
               onKeyDown={(e) => e.key === 'Enter' && handleAdminAccess()}
             />
             <div className="mt-8 flex gap-4">
                <button onClick={() => { setShowAdminAuthModal(false); setAdminPass(''); }} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-gray-300">Discard</button>
                <button onClick={handleAdminAccess} className="flex-1 bg-indigo-600 text-white py-3 text-[10px] font-black uppercase tracking-widest shadow-lg">Verify</button>
             </div>
          </div>
        </div>
      )}

      {currentView !== View.ORDER_SUCCESS && (
        <footer className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t flex justify-around items-center py-3 z-50">
          <button onClick={() => navigateTo(View.HOME)} className={`flex flex-col items-center ${currentView === View.HOME ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
            <svg className="w-6 h-6" fill={currentView === View.HOME ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="text-[10px] mt-1">Home</span>
          </button>
          <button onClick={() => navigateTo(View.PLP)} className={`flex flex-col items-center ${currentView === View.PLP ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
            <svg className="w-6 h-6" fill={currentView === View.PLP ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            <span className="text-[10px] mt-1">Explore</span>
          </button>
          <button onClick={() => navigateTo(View.WISHLIST)} className={`flex flex-col items-center ${currentView === View.WISHLIST ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
            <svg className="w-6 h-6" fill={currentView === View.WISHLIST ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            <span className="text-[10px] mt-1">Wishlist</span>
          </button>
          <button onClick={() => navigateTo(View.PROFILE)} className={`flex flex-col items-center ${currentView === View.PROFILE ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
            <div className="relative">
              <svg className="w-6 h-6" fill={currentView === View.PROFILE ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              {(user?.role === 'admin' && newOrdersCount > 0) || (user?.role === 'user' && orders.some(o => o.status !== 'Delivered' && o.status !== 'Cancelled')) ? (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white animate-pulse"></span>
              ) : null}
            </div>
            <span className="text-[10px] mt-1">Account</span>
          </button>
        </footer>
      )}
    </div>
  );
};

export default App;
