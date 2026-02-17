
import React, { useState, useRef, useEffect } from 'react';
import { User, View, Order } from '../types';
import { INDIAN_STATES } from '../constants';

interface ProfileProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (view: View) => void;
  newOrdersCount: number;
  onUpdateUser?: (updatedData: Partial<User>) => void;
  orders?: Order[];
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, onNavigate, newOrdersCount, onUpdateUser, orders = [] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  
  // Structured Address State for editing
  const [line1, setLine1] = useState('');
  const [pincode, setPincode] = useState('');
  const [subdivision, setSubdivision] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('');
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);

  const [tempImage, setTempImage] = useState<string | null>(user?.profileImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const latestOrder = orders.length > 0 ? orders[0] : null;

  // Initialize editing states when modal opens
  useEffect(() => {
    if (isEditing && user?.address) {
      setLine1(user.address);
    }
  }, [isEditing, user]);

  // Pincode Lookup logic
  useEffect(() => {
    const lookupPincode = async () => {
      if (pincode.length === 6) {
        setIsPincodeLoading(true);
        try {
          const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
          const data = await response.json();
          if (data[0].Status === "Success") {
            const details = data[0].PostOffice[0];
            setDistrict(details.District);
            setSubdivision(details.Block !== "Not Available" ? details.Block : details.Division);
            setStateName(details.State);
          }
        } catch (error) {
          console.error("Pincode lookup failed", error);
        } finally {
          setIsPincodeLoading(false);
        }
      }
    };
    lookupPincode();
  }, [pincode]);

  const handleDetectLocation = () => {
    if ("geolocation" in navigator) {
      setIsPincodeLoading(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await response.json();
          if (data && data.address) {
            const addr = data.address;
            setPincode(addr.postcode || '');
            setDistrict(addr.city_district || addr.district || addr.city || '');
            setSubdivision(addr.suburb || addr.neighbourhood || addr.state_district || '');
            const matchedState = INDIAN_STATES.find(s => s.toLowerCase() === addr.state?.toLowerCase());
            if (matchedState) setStateName(matchedState);
            if (addr.road || addr.house_number) {
              setLine1(`${addr.house_number || ''} ${addr.road || ''}`.trim());
            }
          }
        } catch (error) {
          console.error("Reverse geocoding failed", error);
        } finally {
          setIsPincodeLoading(false);
        }
      }, () => {
        setIsPincodeLoading(false);
        alert("Unable to fetch location.");
      });
    }
  };

  if (!user) {
    return (
      <div className="p-10 flex flex-col items-center justify-center bg-white min-h-screen text-center">
        <div className="w-24 h-24 bg-neutral-50 border-2 border-neutral-100 rounded-full flex items-center justify-center text-4xl mb-6">👤</div>
        <h2 className="text-xl font-bold mb-2 uppercase tracking-tight text-blue-600">Identity Required</h2>
        <p className="text-gray-400 text-xs mb-8 uppercase tracking-widest">Sign in to manage your collection.</p>
        <button onClick={() => onNavigate(View.LOGIN)} className="bg-blue-600 text-white px-12 py-3 font-bold rounded-sm uppercase tracking-widest text-xs shadow-lg">Sign In</button>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    if (onUpdateUser) {
      const fullAddress = pincode 
        ? `${line1}, Subdiv: ${subdivision}, Dist: ${district}, ${stateName} - ${pincode}`
        : line1;
        
      onUpdateUser({
        name: editedName,
        address: fullAddress,
        profileImage: tempImage || undefined
      });
    }
    setIsEditing(false);
  };

  const curatorRank = user.role === 'admin' ? 'Chief Curator' : 'Vintage Archivist';

  return (
    <div className="bg-neutral-50 min-h-screen pb-20">
      {/* Account Header Section */}
      <div className="bg-blue-600 p-10 text-white flex flex-col items-center gap-4 relative overflow-hidden">
        <div className="relative group">
          <div className="w-28 h-28 bg-white text-blue-600 border-4 border-white rounded-full flex items-center justify-center text-4xl font-black italic overflow-hidden shadow-2xl relative">
            {user.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0)
            )}
            <div className="absolute inset-0 border-4 border-blue-600/10 rounded-full pointer-events-none"></div>
          </div>
          
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute bottom-1 right-1 bg-white text-blue-600 p-2 rounded-full shadow-lg border-2 border-blue-600 hover:scale-110 active:scale-95 transition-all z-10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>

        <div className="text-center z-10">
           <div className="inline-block px-3 py-0.5 bg-white/20 rounded-full border border-white/30 mb-2">
             <span className="text-[8px] font-black uppercase tracking-[0.3em]">{curatorRank}</span>
           </div>
           <h2 className="text-2xl font-black uppercase tracking-tighter italic">{user.name}</h2>
           <p className="text-[10px] font-bold text-blue-100 uppercase tracking-[0.2em] mt-1">Client ID: {user.id.toUpperCase()}</p>
        </div>
      </div>

      {/* Orders Tracking Card (Flipkart Style) */}
      {latestOrder && latestOrder.status !== 'Cancelled' && latestOrder.status !== 'Delivered' && (
        <div className="px-4 -mt-4 mb-4 relative z-20">
          <div className="bg-white rounded-sm border border-neutral-100 shadow-xl overflow-hidden p-4">
             <div className="flex justify-between items-center mb-3">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600">Track Recent Order</h3>
               <button onClick={() => onNavigate(View.ORDERS)} className="text-[9px] font-bold text-gray-400 uppercase">View All</button>
             </div>
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-neutral-50 p-1 border rounded-sm flex-shrink-0">
                   <img src={latestOrder.items[0].images[0]} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1">
                   <p className="text-[10px] font-bold text-neutral-800 line-clamp-1 uppercase">{latestOrder.items[0].name}</p>
                   <p className="text-[9px] text-green-600 font-black uppercase tracking-tight mt-1">
                     {latestOrder.status === 'Pending' ? 'Ordered' : latestOrder.status}
                   </p>
                </div>
             </div>
             <div className="relative pt-2 pb-6 px-2">
                <div className="absolute top-4 left-0 right-0 h-[2px] bg-neutral-100 mx-6"></div>
                <div 
                  className="absolute top-4 left-0 h-[2px] bg-blue-600 mx-6 transition-all duration-1000"
                  style={{ width: `${latestOrder.status === 'Pending' ? '0%' : latestOrder.status === 'Packed' ? '33%' : latestOrder.status === 'Shipped' ? '66%' : '100%'}` }}
                ></div>
                <div className="flex justify-between relative">
                   <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full border-2 ${latestOrder.status !== 'Cancelled' ? 'bg-blue-600 border-blue-600' : 'bg-white border-neutral-200'}`}></div>
                      <span className="text-[7px] font-black uppercase mt-1 opacity-60">Ordered</span>
                   </div>
                   <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full border-2 ${['Packed', 'Shipped', 'Delivered'].includes(latestOrder.status) ? 'bg-blue-600 border-blue-600' : 'bg-white border-neutral-200'}`}></div>
                      <span className="text-[7px] font-black uppercase mt-1 opacity-60">Packed</span>
                   </div>
                   <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full border-2 ${['Shipped', 'Delivered'].includes(latestOrder.status) ? 'bg-blue-600 border-blue-600' : 'bg-white border-neutral-200'}`}></div>
                      <span className="text-[7px] font-black uppercase mt-1 opacity-60">Shipped</span>
                   </div>
                   <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full border-2 ${latestOrder.status === 'Delivered' ? 'bg-blue-600 border-blue-600' : 'bg-white border-neutral-200'}`}></div>
                      <span className="text-[7px] font-black uppercase mt-1 opacity-60">Delivered</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Identity Dossier */}
      <div className={`px-4 ${latestOrder && latestOrder.status !== 'Cancelled' && latestOrder.status !== 'Delivered' ? '' : '-mt-4'} relative z-20`}>
        <div className="bg-white rounded-sm border border-neutral-100 shadow-xl overflow-hidden">
          <div className="p-4 bg-neutral-50 border-b border-neutral-100 flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Identity Records</h3>
            <span className="text-[8px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase">Verified</span>
          </div>
          <div className="grid grid-cols-1 divide-y divide-neutral-50">
            <div className="p-4 flex justify-between items-start">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Registered Name</span>
              <span className="text-xs font-bold uppercase tracking-tight text-right">{user.name}</span>
            </div>
            <div className="p-4 flex justify-between items-start">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Contact Registry</span>
              <span className="text-xs font-bold uppercase tracking-tight text-right">+91 {user.mobile}</span>
            </div>
            <div className="p-4 flex flex-col gap-2">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Delivery Residence</span>
              <span className="text-xs font-medium text-gray-600 leading-relaxed uppercase">
                {user.address || 'Address not registered.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action List */}
      <div className="bg-white mt-6 border-t border-b border-neutral-100">
         {user.role === 'admin' && (
           <button 
             onClick={() => onNavigate(View.ADMIN)} 
             className="w-full p-5 flex items-center justify-between border-b-2 border-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
           >
              <div className="flex items-center gap-4">
                 <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                 <span className="font-black text-xs uppercase tracking-[0.2em] text-indigo-900">Archive Control Center</span>
              </div>
           </button>
         )}

         <button onClick={() => onNavigate(View.ORDERS)} className="w-full p-5 flex items-center justify-between border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center gap-4">
               <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
               <span className="font-bold text-xs uppercase tracking-widest text-gray-700">My Orders</span>
            </div>
            <div className="flex items-center gap-2">
               {orders.length > 0 && <span className="bg-neutral-100 text-[10px] font-black px-2 py-0.5 rounded-full text-neutral-400">{orders.length}</span>}
               <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </div>
         </button>

         <button onClick={() => onNavigate(View.WISHLIST)} className="w-full p-5 flex items-center justify-between border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center gap-4">
               <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
               <span className="font-bold text-xs uppercase tracking-widest text-gray-700">Wishlist Vault</span>
            </div>
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
         </button>

         <div className="p-4">
            <button 
              onClick={onLogout}
              className="w-full p-4 text-center font-bold text-xs uppercase tracking-widest text-red-400 border border-neutral-200 hover:text-red-600 hover:border-red-600 transition-all"
            >
              Sign Out
            </button>
         </div>
      </div>

      {/* Edit Profile Overlay */}
      {isEditing && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-sm rounded-sm my-10 animate-in zoom-in-95 duration-200 shadow-2xl overflow-hidden">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tight italic">Update Identity</h3>
              <button onClick={() => setIsEditing(false)} className="opacity-60 hover:opacity-100">✕</button>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
              <div className="flex flex-col items-center">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-full flex items-center justify-center cursor-pointer hover:border-blue-600 transition-colors relative group overflow-hidden"
                >
                  {tempImage ? (
                    <img src={tempImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-6 h-6 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                   <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                   <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="w-full py-2 border-b border-neutral-100 focus:border-blue-600 outline-none text-sm font-bold uppercase"/>
                </div>

                <div className="space-y-4 pt-2">
                   <div className="flex justify-between items-center">
                      <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Address Identity</label>
                      <button onClick={handleDetectLocation} className="text-[8px] font-black text-blue-600 uppercase tracking-widest border-b border-blue-600">Detect Location</button>
                   </div>
                   
                   <input type="text" placeholder="Address Line 1" value={line1} onChange={(e) => setLine1(e.target.value)} className="w-full py-2 border-b border-neutral-100 focus:border-blue-600 outline-none text-xs font-medium uppercase"/>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <input type="tel" placeholder="Pincode" maxLength={6} value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))} className="w-full py-2 border-b border-neutral-100 focus:border-blue-600 outline-none text-xs font-medium"/>
                        {isPincodeLoading && <span className="absolute right-0 bottom-2 text-[7px] text-blue-600 animate-pulse font-black">SEARCHING</span>}
                      </div>
                      <select value={stateName} onChange={(e) => setStateName(e.target.value)} className="w-full py-2 border-b border-neutral-100 focus:border-blue-600 outline-none text-xs font-medium uppercase bg-white">
                         <option value="">State</option>
                         {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="Subdivision" value={subdivision} onChange={(e) => setSubdivision(e.target.value)} className="w-full py-2 border-b border-neutral-100 focus:border-blue-600 outline-none text-[10px] font-medium uppercase"/>
                      <input type="text" placeholder="District" value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full py-2 border-b border-neutral-100 focus:border-blue-600 outline-none text-[10px] font-medium uppercase"/>
                   </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-neutral-50 flex gap-4">
              <button onClick={() => setIsEditing(false)} className="flex-1 py-3 font-black text-[10px] uppercase tracking-widest text-gray-400">Discard</button>
              <button onClick={handleSaveProfile} className="flex-1 bg-blue-600 text-white py-3 font-black text-[10px] uppercase tracking-widest shadow-lg">Commit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
