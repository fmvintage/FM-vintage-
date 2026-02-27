
import React, { useState, useEffect } from 'react';
import { CartItem, User, Order } from '../types';
import { INDIAN_STATES } from '../constants';

interface CheckoutProps {
  cart: CartItem[];
  user: User | null;
  onPlaceOrder: (order) => void;
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, user, onPlaceOrder, onBack }) => {
  const [step, setStep] = useState(1);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStage, setVerificationStage] = useState(0);

  // Address state
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [pincode, setPincode] = useState('');
  const [district, setDistrict] = useState('');
  const [subdivision, setSubdivision] = useState('');
  const [stateName, setStateName] = useState('');
  const [mobileNo, setMobileNo] = useState(user?.mobile || '');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CASHFREE'>('CASHFREE');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const verificationStatuses = [
    "Finalizing Acquisition Record",
    "Securing Logistic Channel",
    "Verifying Encrypted Payload",
    "Order Successfully Lodged"
  ];

  // Automated Pincode Lookup
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

  const handleAutoFillLocation = () => {
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
              setAddressLine1(`${addr.house_number || ''} ${addr.road || ''}`.trim());
            }
          }
        } catch (error) {
          console.error("Reverse geocoding failed", error);
        } finally {
          setIsPincodeLoading(false);
        }
      }, () => setIsPincodeLoading(false));
    }
  };

  // Handle Verification Stages
  useEffect(() => {
    if (isVerifying && verificationStage < verificationStatuses.length) {
      const timer = setTimeout(() => {
        setVerificationStage(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isVerifying && verificationStage === verificationStatuses.length) {
      handleFinish();
    }
  }, [isVerifying, verificationStage]);

  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'CASHFREE') {
      await handleCashfreePayment();
    } else {
      setIsVerifying(true);
    }
  };

  const handleCashfreePayment = async () => {
    setIsProcessingPayment(true);
    try {
      // 1. Create order on our server
      const response = await fetch('/api/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderAmount: totalPrice,
          customerId: user?.id || `guest_${Date.now()}`,
          customerPhone: mobileNo,
          customerEmail: user?.email || 'customer@fmvintage.com',
          orderId: `ORD_${Date.now()}`
        })
      });

      const orderData = await response.json();
      
      if (orderData.payment_session_id) {
        // 2. Initialize Cashfree SDK
        // @ts-ignore
        const cashfree = Cashfree({
          mode: "sandbox" // or "production"
        });

        // 3. Trigger Payment
        await cashfree.checkout({
          paymentSessionId: orderData.payment_session_id,
          redirectTarget: "_self"
        });
      } else {
        throw new Error("Failed to get payment session");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Payment initiation failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleFinish = () => {
    const fullAddress = `${addressLine1}${addressLine2 ? ', ' + addressLine2 : ''}, Subdiv: ${subdivision}, Dist: ${district}, ${stateName} - ${pincode}`;
    
    const d = new Date();
    d.setDate(d.getDate() + 5);

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      userId: user?.id || 'guest',
      items: cart,
      totalAmount: totalPrice,
      status: 'Pending',
      date: new Date().toISOString(),
      deliveryDate: d.toISOString(),
      paymentMethod: 'Standard Checkout',
      address: fullAddress
    };
    onPlaceOrder(newOrder);
  };

  const isAddressValid = addressLine1 && pincode.length >= 6 && district && stateName && mobileNo.length >= 10;

  return (
    <div className="bg-white min-h-screen p-4 relative">
      {/* Verification Overlay */}
      {isVerifying && (
        <div className="fixed inset-0 z-[120] bg-black text-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
           <div className="mb-12 relative w-20 h-20">
              <div className="absolute inset-0 border-2 border-neutral-900 rounded-full"></div>
              <div className="absolute inset-0 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
           </div>
           <h2 className="text-xl font-black italic uppercase tracking-tighter mb-2 text-center text-blue-400">
             {verificationStage < verificationStatuses.length ? verificationStatuses[verificationStage] : "Record Secured"}
           </h2>
           <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.3em] text-center max-w-[260px] leading-relaxed">
             Transmitting encrypted acquisition data.
           </p>
           <div className="mt-12 w-48 h-[2px] bg-neutral-900 overflow-hidden relative rounded-full">
              <div 
                className="h-full bg-blue-500 transition-all duration-1000 ease-linear" 
                style={{ width: `${(verificationStage / verificationStatuses.length) * 100}%` }}
              ></div>
           </div>
        </div>
      )}

      <h2 className="text-xl font-bold uppercase tracking-tight mb-6 border-b pb-4 text-blue-600">Secure Acquisition</h2>

      {/* STEP 1: SHIPPING INFORMATION */}
      <div className="border border-neutral-100 rounded-sm overflow-hidden mb-4 shadow-sm">
         <div className={`p-4 border-b flex justify-between items-center ${step === 1 ? 'bg-blue-50/30' : 'bg-white'}`}>
            <span className="font-bold text-xs tracking-widest flex items-center gap-2 text-neutral-800">
               <span className="bg-blue-600 text-white w-5 h-5 text-[10px] rounded-full flex items-center justify-center">1</span>
               SHIPPING LOGISTICS
            </span>
            {step > 1 && <button onClick={() => setStep(1)} className="text-blue-600 font-black text-[10px] border-b border-blue-600">EDIT</button>}
         </div>
         {step === 1 && (
           <div className="p-4 space-y-4">
              <button 
                onClick={handleAutoFillLocation}
                className="w-full bg-neutral-100 text-blue-600 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-blue-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Auto-fill Current Location
              </button>

              <div className="space-y-4">
                <input 
                  type="text" 
                  value={addressLine1} 
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Street Address, House No"
                  className="w-full border-b-2 border-neutral-100 py-3 text-sm focus:border-blue-600 outline-none font-bold uppercase"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input 
                      type="tel" 
                      value={pincode} 
                      maxLength={6}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Pin Code"
                      className="w-full border-b-2 border-neutral-100 py-3 text-sm focus:border-blue-600 outline-none font-bold"
                    />
                    {isPincodeLoading && <span className="absolute right-0 bottom-3 text-[7px] font-black animate-pulse text-blue-600">LOCATING</span>}
                  </div>
                  <select 
                    value={stateName} 
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full border-b-2 border-neutral-100 py-3 text-sm focus:border-blue-600 outline-none font-bold bg-white"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input type="text" value={subdivision} onChange={(e) => setSubdivision(e.target.value)} placeholder="Subdivision" className="w-full border-b-2 border-neutral-100 py-3 text-sm outline-none font-bold uppercase"/>
                  <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="District" className="w-full border-b-2 border-neutral-100 py-3 text-sm outline-none font-bold uppercase"/>
                </div>

                <input type="tel" value={mobileNo} maxLength={10} onChange={(e) => setMobileNo(e.target.value.replace(/\D/g, ''))} placeholder="Contact Number" className="w-full border-b-2 border-neutral-100 py-3 text-sm focus:border-blue-600 outline-none font-bold"/>
              </div>

              <div className="pt-6">
                <button 
                  onClick={() => setStep(2)}
                  disabled={!isAddressValid}
                  className="w-full bg-blue-600 text-white py-4 font-black rounded-sm uppercase tracking-[0.2em] text-[10px] disabled:bg-neutral-100 transition-all shadow-xl"
                >
                  Continue to Review
                </button>
              </div>
           </div>
         )}
      </div>

      {/* STEP 2: ORDER REVIEW */}
      <div className="border border-neutral-100 rounded-sm overflow-hidden shadow-sm">
         <div className={`p-4 border-b flex items-center gap-2 ${step === 2 ? 'bg-blue-50/30' : 'bg-white'}`}>
            <span className="bg-blue-600 text-white w-5 h-5 text-[10px] rounded-full flex items-center justify-center">2</span>
            <span className="font-bold text-xs tracking-widest text-neutral-800">FINAL REVIEW</span>
         </div>
         {step === 2 && (
           <div className="p-4 space-y-6">
              <div className="bg-neutral-50 p-4 rounded-sm space-y-3">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order Artifacts</h3>
                 {cart.map(item => (
                   <div key={item.id} className="flex justify-between items-center text-[10px] font-bold uppercase">
                      <span className="truncate flex-1 pr-4">{item.name} x{item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                   </div>
                 ))}
                 <div className="pt-3 border-t border-neutral-200 flex justify-between items-center text-xs font-black">
                    <span>Total Amount</span>
                    <span className="text-blue-600">₹{totalPrice.toLocaleString()}</span>
                 </div>
              </div>

              <div className="pt-4 space-y-4">
                 <div className="space-y-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment Method</h3>
                    <div className="grid grid-cols-2 gap-3">
                       <button 
                         onClick={() => setPaymentMethod('CASHFREE')}
                         className={`py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'CASHFREE' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-neutral-100 text-neutral-400'}`}
                       >
                         Online (Cashfree)
                       </button>
                       <button 
                         onClick={() => setPaymentMethod('COD')}
                         className={`py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'COD' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-neutral-100 text-neutral-400'}`}
                       >
                         Cash on Delivery
                       </button>
                    </div>
                 </div>

                 <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center leading-relaxed">
                   By confirming, you agree to the archive acquisition terms. Your order will be processed for standard delivery.
                 </p>
                 <button 
                   onClick={handlePlaceOrder}
                   disabled={isProcessingPayment}
                   className="w-full bg-blue-600 text-white py-5 font-black rounded-sm uppercase tracking-[0.3em] text-[10px] shadow-2xl active:scale-95 transition-all disabled:bg-neutral-300"
                 >
                   {isProcessingPayment ? 'Initiating Payment...' : paymentMethod === 'CASHFREE' ? 'Pay & Confirm Order' : 'Confirm Order (COD)'}
                 </button>
              </div>
           </div>
         )}
      </div>

      <button onClick={onBack} className="mt-8 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 flex items-center gap-2">
         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
         Abort Transaction
      </button>
    </div>
  );
};

export default Checkout;
