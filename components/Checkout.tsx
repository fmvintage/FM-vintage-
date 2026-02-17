
import React, { useState, useEffect, useRef } from 'react';
import { CartItem, User, Order } from '../types';
import { INDIAN_STATES } from '../constants';

interface CheckoutProps {
  cart: CartItem[];
  user: User | null;
  onPlaceOrder: (order: Order) => void;
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, user, onPlaceOrder, onBack }) => {
  const [step, setStep] = useState(1);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStage, setVerificationStage] = useState(0);
  const [showUpiIdInput, setShowUpiIdInput] = useState(false);
  const [customerUpiId, setCustomerUpiId] = useState('');
  const [paymentWaiting, setPaymentWaiting] = useState(false);
  const [automaticSuccess, setAutomaticSuccess] = useState(false);
  
  // Timer state (300 seconds = 5 minutes)
  const [timeLeft, setTimeLeft] = useState(300);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSuccessTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Address state
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [pincode, setPincode] = useState('');
  const [district, setDistrict] = useState('');
  const [subdivision, setSubdivision] = useState('');
  const [stateName, setStateName] = useState('');
  const [mobileNo, setMobileNo] = useState(user?.mobile || '');
  
  const [paymentMethod, setPaymentMethod] = useState<'UPI_QR' | 'UPI_ID' | 'COD'>('UPI_QR');

  const verificationStatuses = [
    "Initiating Secure Handshake",
    "Awaiting Banking Confirmation",
    "Verifying Encrypted Payload",
    "Payment Successfully Captured",
    "Finalizing Acquisition Record"
  ];

  // Timer logic
  useEffect(() => {
    if (paymentWaiting && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      alert("Payment session expired. Please try again.");
      resetPaymentState();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paymentWaiting, timeLeft]);

  // Simulated Automatic Success Logic
  useEffect(() => {
    if (paymentWaiting && !automaticSuccess) {
      // Simulate bank confirmation after 8 seconds
      autoSuccessTimeoutRef.current = setTimeout(() => {
        setAutomaticSuccess(true);
      }, 8000);
    }
    return () => {
      if (autoSuccessTimeoutRef.current) clearTimeout(autoSuccessTimeoutRef.current);
    };
  }, [paymentWaiting]);

  const resetPaymentState = () => {
    setPaymentWaiting(false);
    setAutomaticSuccess(false);
    setShowUpiIdInput(false);
    setIsVerifying(false);
    setTimeLeft(300);
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoSuccessTimeoutRef.current) clearTimeout(autoSuccessTimeoutRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
      }, 1200);
      return () => clearTimeout(timer);
    } else if (isVerifying && verificationStage === verificationStatuses.length) {
      handleFinish();
    }
  }, [isVerifying, verificationStage]);

  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleFinish = () => {
    const method = paymentMethod === 'UPI_QR' ? 'UPI (QR SCAN)' : paymentMethod === 'UPI_ID' ? `UPI ID (${customerUpiId})` : 'COD';
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
      paymentMethod: method,
      address: fullAddress
    };
    onPlaceOrder(newOrder);
  };

  const startPaymentProcess = () => {
    if (paymentMethod === 'UPI_QR') {
      setPaymentWaiting(true);
    } else if (paymentMethod === 'UPI_ID') {
      setShowUpiIdInput(true);
    } else {
      setIsVerifying(true);
    }
  };

  const handleUpiIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerUpiId.includes('@')) {
      alert("Please enter a valid UPI ID (e.g. name@bank)");
      return;
    }
    setShowUpiIdInput(false);
    setPaymentWaiting(true);
  };

  const confirmPaymentPaid = () => {
    setIsVerifying(true);
    setVerificationStage(0);
    setPaymentWaiting(false);
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

      {/* UPI ID Input Modal */}
      {showUpiIdInput && (
        <div className="fixed inset-0 z-[115] bg-black/80 flex items-center justify-center p-6 backdrop-blur-md">
           <div className="bg-white w-full max-w-xs p-8 rounded-sm shadow-2xl animate-in zoom-in-95">
              <h3 className="text-sm font-black uppercase tracking-widest text-neutral-900 mb-6 border-b pb-2">UPI ID Protocol</h3>
              <form onSubmit={handleUpiIdSubmit} className="space-y-6">
                 <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Enter Your UPI Address</label>
                    <input 
                      type="text" 
                      value={customerUpiId}
                      onChange={(e) => setCustomerUpiId(e.target.value)}
                      placeholder="username@bank"
                      className="w-full border-b-2 border-neutral-100 py-3 outline-none focus:border-blue-600 font-bold tracking-widest uppercase text-xs"
                      autoFocus
                    />
                 </div>
                 <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowUpiIdInput(false)} className="flex-1 text-[10px] font-black uppercase tracking-widest text-gray-300">Cancel</button>
                    <button type="submit" className="flex-1 bg-blue-600 text-white py-3 text-[10px] font-black uppercase tracking-widest shadow-lg">Verify ID</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Global Payment Waiting Overlay */}
      {paymentWaiting && (
        <div className="fixed inset-0 z-[110] bg-white flex flex-col items-center justify-start p-6 animate-in slide-in-from-bottom-5 duration-300 overflow-y-auto">
          {/* Timer Header */}
          <div className="w-full bg-red-50 border border-red-100 p-4 rounded-sm flex items-center justify-between mb-8 shadow-sm">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Payment Session Active</span>
             </div>
             <div className="text-xl font-black text-red-600 tabular-nums">
                {formatTime(timeLeft)}
             </div>
          </div>

          <div className="flex-1 flex flex-col items-center text-center w-full max-w-sm">
            {paymentMethod === 'UPI_QR' ? (
              <>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-1">SCAN THE ARCHIVE QR</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">Payable Amount: ₹{totalPrice.toLocaleString()}</p>
                
                <div className="relative p-2 bg-white rounded-lg shadow-2xl border border-neutral-100 mb-6">
                   <div className="border-[6px] border-black rounded-md p-4">
                      <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=mofidakh@ybl&pn=MOFIDA%20KHATUN&cu=INR" 
                        className="w-64 h-64 object-contain" 
                        alt="Archive QR" 
                      />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-black">
                         <span className="font-black italic text-[10px]">FMV</span>
                      </div>
                   </div>
                </div>
              </>
            ) : (
              <div className="py-10 flex flex-col items-center">
                 <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-8 animate-bounce">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                 </div>
                 <h3 className="text-xl font-black uppercase tracking-tighter mb-2">MONEY REQUEST SENT</h3>
                 <p className="text-xs font-medium text-gray-500 px-10 leading-relaxed mb-4">
                    A payment request has been sent to <span className="text-blue-600 font-bold">{customerUpiId}</span>. 
                    Please open your UPI app to complete the transaction.
                 </p>
              </div>
            )}

            {/* Success Signal Area */}
            <div className={`w-full p-6 rounded-sm border transition-all duration-500 ${automaticSuccess ? 'bg-green-50 border-green-200' : 'bg-neutral-50 border-neutral-100'}`}>
               <div className="flex items-center justify-center gap-3">
                  {!automaticSuccess ? (
                    <>
                      <div className="w-4 h-4 border-2 border-neutral-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Waiting for Bank Signal...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600">Payment Successfully Detected</span>
                    </>
                  )}
               </div>
            </div>

            <div className="w-full mt-auto pb-10 space-y-4 pt-10">
               {automaticSuccess && (
                 <button 
                   onClick={confirmPaymentPaid}
                   className="w-full bg-black text-white py-4 font-black rounded-sm uppercase tracking-[0.2em] text-[10px] shadow-2xl animate-in fade-in zoom-in-95 duration-500"
                 >
                   I Have Successfully Paid
                 </button>
               )}
               <button 
                 onClick={resetPaymentState}
                 className="w-full bg-white text-gray-300 py-2 font-black rounded-sm uppercase tracking-widest text-[8px]"
               >
                 Cancel Payment Session
               </button>
               <p className="text-[7px] text-gray-300 font-bold uppercase tracking-[0.4em]">FM VINTAGE SECURE TRANSACTION NODE v4.1</p>
            </div>
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
                  Confirm Registry
                </button>
              </div>
           </div>
         )}
      </div>

      {/* STEP 2: PAYMENT ARCHIVE */}
      <div className="border border-neutral-100 rounded-sm overflow-hidden shadow-sm">
         <div className={`p-4 border-b flex items-center gap-2 ${step === 2 ? 'bg-blue-50/30' : 'bg-white'}`}>
            <span className="bg-blue-600 text-white w-5 h-5 text-[10px] rounded-full flex items-center justify-center">2</span>
            <span className="font-bold text-xs tracking-widest text-neutral-800">FINANCIAL CLEARANCE</span>
         </div>
         {step === 2 && (
           <div className="p-4 space-y-6">
              <div className="space-y-3">
                 <button 
                   onClick={() => setPaymentMethod('UPI_QR')}
                   className={`w-full p-5 rounded-sm border-2 flex items-center justify-between transition-all ${paymentMethod === 'UPI_QR' ? 'border-blue-600 bg-blue-50' : 'border-neutral-100 hover:bg-neutral-50'}`}
                 >
                    <div className="flex items-center gap-4 text-left">
                       <svg className="w-6 h-6 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m0 11v1m5-16v1m0 11v1M4 8h1m11 0h1M4 16h1m11 0h1m-4-8h.01M9 16h.01M9 12h.01M13 12h.01M4 4h4v4H4V4zm0 12h4v4H4v-4zm12 0h4v4h-4v-4zm0-12h4v4h-4V4z" /></svg>
                       <div>
                          <p className="text-[11px] font-black uppercase tracking-widest">Scan Archive QR</p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase">Instant Confirmation</p>
                       </div>
                    </div>
                    {paymentMethod === 'UPI_QR' && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}
                 </button>

                 <button 
                   onClick={() => setPaymentMethod('UPI_ID')}
                   className={`w-full p-5 rounded-sm border-2 flex items-center justify-between transition-all ${paymentMethod === 'UPI_ID' ? 'border-blue-600 bg-blue-50' : 'border-neutral-100 hover:bg-neutral-50'}`}
                 >
                    <div className="flex items-center gap-4 text-left">
                       <svg className="w-6 h-6 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                       <div>
                          <p className="text-[11px] font-black uppercase tracking-widest">Pay via UPI ID</p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase">Remote Approval</p>
                       </div>
                    </div>
                    {paymentMethod === 'UPI_ID' && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}
                 </button>

                 <button 
                   onClick={() => setPaymentMethod('COD')}
                   className={`w-full p-5 rounded-sm border-2 flex items-center justify-between transition-all ${paymentMethod === 'COD' ? 'border-blue-600 bg-blue-50' : 'border-neutral-100 hover:bg-neutral-50'}`}
                 >
                    <div className="flex items-center gap-4 text-left">
                       <svg className="w-6 h-6 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                       <div>
                          <p className="text-[11px] font-black uppercase tracking-widest">Handover Payment</p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase">Cash on Delivery</p>
                       </div>
                    </div>
                    {paymentMethod === 'COD' && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}
                 </button>
              </div>

              <div className="pt-4 space-y-4">
                 <div className="flex justify-between items-center text-neutral-400 font-black text-[9px] uppercase tracking-widest">
                    <span>Total Liability</span>
                    <span className="text-sm text-neutral-900 italic">₹{totalPrice.toLocaleString()}</span>
                 </div>
                 <button 
                   onClick={startPaymentProcess}
                   className="w-full bg-blue-600 text-white py-5 font-black rounded-sm uppercase tracking-[0.3em] text-[10px] shadow-2xl active:scale-95 transition-all"
                 >
                   Authorize Payment
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
