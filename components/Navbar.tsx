
import React, { useState, useRef } from 'react';
import { View, User } from '../types';

interface NavbarProps {
  currentView: View;
  onNavigate: (view: View, payload?: any) => void;
  cartCount: number;
  user: User | null;
  onAdminAuthTrigger: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, cartCount, user, onAdminAuthTrigger }) => {
  const [tapCount, setTapCount] = useState(0);
  // Using ReturnType<typeof setTimeout> to ensure compatibility with browser-based environments where NodeJS namespace is missing
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoTap = () => {
    // Hidden Admin Trigger: 5 taps in 3 seconds
    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);

    if (newCount >= 5) {
      onAdminAuthTrigger();
      setTapCount(0);
    } else {
      tapTimeoutRef.current = setTimeout(() => {
        setTapCount(0);
      }, 3000);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 max-w-lg mx-auto bg-black text-white z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => {
              handleLogoTap();
              onNavigate(View.HOME);
            }} 
            className="flex items-center gap-1 active:scale-95 transition-transform"
          >
            <span className="font-black italic text-xl tracking-tighter select-none bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-500 bg-clip-text text-transparent">FM VINTAGE</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {!user ? (
            <button onClick={() => onNavigate(View.LOGIN)} className="bg-white text-black px-4 py-1 font-semibold rounded-sm text-sm">
              Login
            </button>
          ) : (
             <button 
               onClick={() => onNavigate(View.PROFILE)} 
               className="w-8 h-8 rounded-full border-2 border-white overflow-hidden flex items-center justify-center bg-white text-black font-black italic text-xs shadow-lg active:scale-90 transition-transform"
             >
               {user.profileImage ? (
                 <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
               ) : (
                 user.name.charAt(0)
               )}
             </button>
          )}
          
          <button onClick={() => onNavigate(View.CART)} className="relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
      
      <div className="px-3 pb-2">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search our vintage collection..."
            className="w-full py-2 pl-10 pr-4 rounded-sm text-gray-800 text-sm focus:outline-none bg-neutral-100"
          />
          <svg className="w-5 h-5 absolute left-3 top-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
