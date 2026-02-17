
import React, { useState, useEffect } from 'react';
import { User, View } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onNavigate: (view: View) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigate }) => {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [showSmsNotification, setShowSmsNotification] = useState(false);

  // Auto-trigger OTP when 10 digits are entered (optional UX enhancement)
  // Removed auto-trigger to give user control over the 'Get Code' button click

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const triggerOtpRequest = () => {
    setError('');
    setIsLoading(true);
    
    // Generate a random 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    
    // Simulate real-world network delay for sending SMS
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setTimer(30);
      
      // Trigger high-fidelity simulated SMS notification
      setShowSmsNotification(true);
      // Auto-hide notification after 8 seconds
      setTimeout(() => setShowSmsNotification(false), 8000);
    }, 2000);
  };

  const handleGetOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    triggerOtpRequest();
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }

    // Verify against the dynamically generated OTP
    if (otp !== generatedOtp) {
      setError('Invalid code. Please check the SMS notification at the top.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const isAdmin = mobile === '9999999999';
      onLogin({
        id: isAdmin ? 'admin-1' : `user-${Date.now()}`,
        name: isAdmin ? 'Archive Admin' : 'Vintage Collector',
        mobile: mobile,
        role: isAdmin ? 'admin' : 'user',
        address: '123 Noir Avenue, Monochrome District, 000000'
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* High-Fidelity Simulated SMS Push Notification */}
      {showSmsNotification && (
        <div className="fixed top-4 left-4 right-4 z-[200] animate-in slide-in-from-top-10 duration-500">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-neutral-200 p-4 flex gap-4 max-w-sm mx-auto overflow-hidden relative">
             <div className="absolute bottom-0 left-0 h-1 bg-blue-600 animate-[shrink_8s_linear_forwards]" style={{width: '100%'}}></div>
             <style>{`
               @keyframes shrink {
                 from { width: 100%; }
                 to { width: 0%; }
               }
             `}</style>
             
             <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white font-black italic text-[10px]">FMV</span>
             </div>
             <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                   <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Gateway • Just Now</span>
                </div>
                <p className="text-xs text-neutral-800 font-medium leading-snug">
                   <span className="font-black text-black">FM Vintage:</span> Your private access code for <span className="text-blue-600 font-bold">+91 {mobile}</span> is <span className="font-black text-blue-600 tracking-wider text-sm select-all px-1 bg-blue-50 rounded-sm">{generatedOtp}</span>. Valid for 10 minutes.
                </p>
             </div>
             <button onClick={() => setShowSmsNotification(false)} className="self-start text-neutral-300 hover:text-black transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
          <div className="w-12 h-1.5 bg-neutral-300 rounded-full mx-auto mt-2 opacity-30 shadow-inner"></div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-black h-64 flex flex-col justify-center px-10 text-white relative overflow-hidden">
        <h1 className="text-4xl font-black italic tracking-tighter mb-2 uppercase">
          {step === 'mobile' ? 'IDENTITY' : 'VERIFY'}
        </h1>
        <p className="text-neutral-400 text-xs font-bold uppercase tracking-[0.2em] max-w-[220px] leading-relaxed">
          {step === 'mobile' 
            ? 'Enter your mobile registry number to receive your secure access key.' 
            : `A secure transmission has been sent to +91 ${mobile.slice(0, 2)}******${mobile.slice(8)}`}
        </p>

        <div className="absolute -bottom-10 -right-10 text-9xl opacity-5 pointer-events-none select-none italic font-black">
          {step === 'mobile' ? 'NODE' : 'KEY'}
        </div>
        <div className="absolute top-10 right-10 w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
      </div>

      <div className="p-10 -mt-8 bg-white rounded-t-3xl relative z-10 shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
        {step === 'mobile' ? (
          <form onSubmit={handleGetOtp} className="space-y-12">
            <div className="relative border-b-2 border-neutral-100 focus-within:border-blue-600 transition-all duration-300">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Mobile Registry</label>
              <div className="flex items-center">
                <span className="text-sm font-bold mr-2 text-neutral-300 tracking-widest">+91</span>
                <input 
                  type="tel" 
                  value={mobile}
                  onChange={(e) => { 
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 10) setMobile(val);
                    setError(''); 
                  }}
                  required
                  autoFocus
                  placeholder="00000 00000"
                  className="w-full py-3 bg-transparent outline-none text-xl font-black tracking-[0.2em] text-neutral-900 placeholder:text-neutral-100"
                />
              </div>
            </div>
            
            {error && <p className="text-red-500 text-[9px] font-black uppercase tracking-widest bg-red-50 p-3 rounded-sm border-l-4 border-red-500 animate-in fade-in slide-in-from-left-2">{error}</p>}

            <button 
              type="submit"
              disabled={isLoading || mobile.length !== 10}
              className="w-full bg-black text-white py-5 rounded-sm font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl active:scale-[0.98] transition-all disabled:bg-neutral-100 disabled:text-neutral-300 flex items-center justify-center gap-3 group"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Requesting...</span>
                </>
              ) : (
                <>
                  <span>Get Secure Code</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7" /></svg>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-12">
            <div className="space-y-6">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center">Verify Authentication Key</label>
              <input 
                type="tel" 
                value={otp}
                autoFocus
                onChange={(e) => { 
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 6) setOtp(val);
                  setError(''); 
                }}
                required
                maxLength={6}
                placeholder="••••••"
                className="w-full py-5 bg-neutral-50 border-2 border-neutral-100 rounded-xl outline-none text-4xl font-black tracking-[0.5em] text-center focus:border-blue-600 focus:bg-white transition-all text-blue-600 placeholder:text-neutral-200"
              />
              <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest text-center px-4 leading-relaxed">
                We have transmitted your one-time key. <br/> Check the top notification for the code.
              </p>
            </div>

            {error && <p className="text-red-500 text-[9px] font-black uppercase tracking-widest bg-red-50 p-3 rounded-sm border-l-4 border-red-500 text-center animate-in fade-in zoom-in-95">{error}</p>}

            <div className="space-y-6">
              <button 
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-blue-600 text-white py-5 rounded-sm font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl active:scale-[0.98] transition-all disabled:bg-neutral-100 disabled:text-neutral-300"
              >
                {isLoading ? 'Decrypting...' : 'Complete Verification'}
              </button>
              
              <div className="flex justify-between items-center px-2">
                <button 
                  type="button" 
                  onClick={() => setStep('mobile')}
                  className="text-[9px] text-neutral-400 font-black uppercase tracking-widest hover:text-black transition-colors"
                >
                  Edit Registry
                </button>
                <button 
                  type="button" 
                  disabled={timer > 0}
                  onClick={() => triggerOtpRequest()}
                  className={`text-[9px] font-black uppercase tracking-widest transition-all ${timer > 0 ? 'text-neutral-200' : 'text-blue-600 border-b border-blue-600'}`}
                >
                  {timer > 0 ? `Resend in ${timer}s` : 'Request New Key'}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="mt-20 text-center">
          <p className="text-[9px] text-gray-400 font-medium uppercase tracking-[0.2em] leading-loose mb-8">
            Secured by FM Vintage Encryption Protocol <br/>
            <span className="text-black/20">v8.4.2-LOCKED</span>
          </p>
          <button 
            type="button" 
            onClick={() => onNavigate(View.SIGNUP)} 
            className="text-[10px] text-black font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:text-blue-600 hover:border-blue-600 transition-all"
          >
            Create Collective Membership
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
