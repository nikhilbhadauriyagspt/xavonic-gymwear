import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowRight, 
  ArrowLeft,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoWhite from '../assets/logo_white.png';
import logoBlack from '../assets/logo_balck.png';

export default function AuthDrawer() {
  const { isAuthOpen, closeAuth, user, isLoggedIn, loginWithPhone, loginWithEmail, logout } = useAuth();
  
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'email'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [activeTab, setActiveTab] = useState('orders');

  const otpInputsRef = useRef([]);

  useEffect(() => {
    if (isAuthOpen) {
      document.body.style.overflow = 'hidden';
      setStep('phone');
      setOtp(['', '', '', '']);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAuthOpen]);

  // Countdown timer for OTP
  useEffect(() => {
    let timer;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phoneNumber.replace(/[^0-9]/g, '').length < 10) return;
    setStep('otp');
    setCountdown(30);
    setTimeout(() => {
      otpInputsRef.current[0]?.focus();
    }, 150);
  };

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      setTimeout(() => {
        loginWithPhone(`+91 ${phoneNumber}`, 'Athlete');
      }, 300);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleDemoOtp = () => {
    setOtp(['1', '2', '3', '4']);
    setTimeout(() => {
      loginWithPhone(`+91 ${phoneNumber || '9876543210'}`, 'Nikhil Sharma');
    }, 300);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    loginWithEmail(email, password);
  };

  return (
    <AnimatePresence>
      {isAuthOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 font-sans select-none overflow-y-auto">
          
          {/* Bilkul Halki Si Subtle Backdrop Layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeAuth}
            className="fixed inset-0 bg-black/25 cursor-pointer"
          />

          {/* Luxury Minimal Split Card (Spacious max-w-4xl, Outer Pure Black, Inset White Form Card) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl bg-black text-white shadow-[0_25px_80px_rgba(0,0,0,0.4)] rounded-[14px] overflow-hidden z-10 grid grid-cols-1 md:grid-cols-12 my-auto border-0"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* ================= LEFT: SOLID PURE BLACK BRAND SIDE (NO IMAGES) ================= */}
            <div className="hidden md:flex md:col-span-5 bg-black text-white flex-col justify-between p-8 sm:p-10 select-none">
              
              {/* Top: Logo */}
              <div>
                <img src={logoWhite} alt="Xavonic" className="h-7 w-auto object-contain" />
              </div>

              {/* Bottom: Understated Brand Ethos & Content */}
              <div className="space-y-3.5">
                <div className="w-6 h-[2px] bg-red-600"></div>
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-500">
                    Athlete Club
                  </span>
                  <h3 className="text-2xl font-medium tracking-tight text-white leading-snug">
                    Uncompromising Fit. Zero Distraction.
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  Join the athlete circle for early drops, live tracking, and seamless 1-click checkout.
                </p>
              </div>

            </div>

            {/* ================= RIGHT: INSET WHITE CARD WITH 10px GAP (TOP, BOTTOM, RIGHT) ================= */}
            <div className="col-span-12 md:col-span-7 p-[10px] flex">
              
              <div className="w-full bg-white text-zinc-900 rounded-[10px] p-7 sm:p-10 flex flex-col justify-between relative shadow-sm">
                
                {/* Clean Close Button */}
                <button
                  onClick={closeAuth}
                  className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer rounded-full z-20"
                  aria-label="Close Modal"
                >
                  <X className="w-4 h-4 stroke-[1.8]" />
                </button>

                {/* Mobile Header Logo */}
                <div className="md:hidden mb-4 flex items-center justify-between pb-2.5 border-b border-zinc-100">
                  <img src={logoBlack} alt="Xavonic" className="h-5 w-auto" />
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400">Account</span>
                </div>

              {/* Main Auth Body */}
              <div className="my-auto py-2 space-y-6">
                
                {isLoggedIn && user ? (
                  
                  /* ================= LOGGED IN ATHLETE PASS ================= */
                  <div className="space-y-5">
                    
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-600">
                        Athlete Access
                      </span>
                      <h2 className="text-xl font-medium text-zinc-950 tracking-tight">
                        Hello, {user.name}
                      </h2>
                    </div>

                    {/* Clean Member Summary Card */}
                    <div className="p-4 bg-zinc-950 text-white rounded-[10px] space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400">{user.phone || user.email}</span>
                        <span className="text-red-500 font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {user.tier}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                        <span className="text-zinc-400">Reward Points</span>
                        <span className="font-semibold text-white">{user.points} pts</span>
                      </div>
                    </div>

                    {/* Orders Tab */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-zinc-900 uppercase tracking-wider block">
                        Recent Activity
                      </span>
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {user.orders?.map((order) => (
                          <div key={order.id} className="p-3 bg-zinc-50 border border-zinc-100 rounded-[8px] flex items-center justify-between text-xs">
                            <div className="space-y-0.5">
                              <span className="font-medium text-zinc-900">{order.id}</span>
                              <p className="text-[11px] text-zinc-500">{order.items}</p>
                            </div>
                            <span className={`text-[11px] font-medium ${order.statusColor}`}>{order.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sign Out Button */}
                    <button
                      onClick={logout}
                      className="w-full py-2.5 border border-zinc-200 hover:border-zinc-900 text-zinc-700 hover:text-black text-xs font-medium transition-colors cursor-pointer rounded-[8px] flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>

                  </div>

                ) : (

                  /* ================= NOT LOGGED IN: CLEAN MINIMAL SIGN IN ================= */
                  <div className="space-y-6">
                    
                    {/* Header */}
                    <div className="space-y-1">
                      <h2 className="text-2xl font-medium tracking-tight text-zinc-950">
                        {step === 'otp' ? 'Enter Verification Code' : 'Sign in to Xavonic'}
                      </h2>
                      <p className="text-xs text-zinc-500 font-light">
                        {step === 'otp' 
                          ? `We sent a 4-digit code to +91 ${phoneNumber}`
                          : 'Enter your phone number for instant access.'}
                      </p>
                    </div>

                    {/* PHONE NUMBER STEP */}
                    {step === 'phone' && (
                      <form onSubmit={handleSendOtp} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-medium text-zinc-600 block tracking-normal">
                            Phone Number
                          </label>
                          
                          {/* Minimal Sleek Input Field with Indian Flag */}
                          <div className="flex items-center border border-zinc-300 focus-within:border-zinc-950 rounded-[8px] px-3 py-2.5 transition-all bg-zinc-50/50 focus-within:bg-white focus-within:shadow-xs">
                            <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 pr-2.5 mr-2.5 border-r border-zinc-200 shrink-0 select-none">
                              <svg className="w-4 h-3 rounded-[2px] shadow-2xs shrink-0" viewBox="0 0 640 480">
                                <path fill="#FF9933" d="M0 0h640v160H0z"/>
                                <path fill="#FFFFFF" d="M0 160h640v160H0z"/>
                                <path fill="#138808" d="M0 320h640v160H0z"/>
                                <circle cx="320" cy="240" r="32" fill="none" stroke="#000080" strokeWidth="6"/>
                                <circle cx="320" cy="240" r="6" fill="#000080"/>
                              </svg>
                              <span>+91</span>
                            </span>
                            <input
                              type="tel"
                              maxLength={10}
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                              placeholder="98765 43210"
                              className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none tracking-wide font-normal"
                              autoFocus
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={phoneNumber.length < 10}
                          className={`w-full py-3 text-xs font-medium tracking-normal transition-all cursor-pointer flex items-center justify-center gap-2 rounded-[8px] ${
                            phoneNumber.length === 10
                              ? 'bg-zinc-950 hover:bg-red-600 text-white shadow-xs'
                              : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                          }`}
                        >
                          <span>Continue</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    )}

                    {/* OTP VERIFICATION STEP */}
                    {step === 'otp' && (
                      <div className="space-y-5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-center gap-3">
                          {otp.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => (otpInputsRef.current[idx] = el)}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              className="w-11 h-12 text-center text-lg font-medium border border-zinc-300 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 text-zinc-900 rounded-[8px] bg-zinc-50/50 focus:bg-white transition-all"
                            />
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                          <button
                            type="button"
                            onClick={() => setStep('phone')}
                            className="text-zinc-500 hover:text-black inline-flex items-center gap-1 cursor-pointer"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            <span>Change number</span>
                          </button>

                          {countdown > 0 ? (
                            <span className="text-[11px]">Resend in {countdown}s</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setCountdown(30)}
                              className="text-red-600 font-medium hover:underline cursor-pointer text-[11px]"
                            >
                              Resend Code
                            </button>
                          )}
                        </div>

                        {/* Demo Autofill Hint */}
                        <div className="pt-2 text-center">
                          <button
                            type="button"
                            onClick={handleDemoOtp}
                            className="text-[11px] text-zinc-500 hover:text-black underline cursor-pointer"
                          >
                            Auto-fill Test OTP (1234)
                          </button>
                        </div>
                      </div>
                    )}

                    {/* EMAIL FORM STEP */}
                    {step === 'email' && (
                      <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-zinc-600">Email Address</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="athlete@domain.com"
                            className="w-full border border-zinc-300 focus:border-zinc-950 px-3 py-2 text-xs text-zinc-900 rounded-[8px] focus:outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-zinc-600">Password</label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full border border-zinc-300 focus:border-zinc-950 px-3 py-2 text-xs text-zinc-900 rounded-[8px] focus:outline-none"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2.5 bg-zinc-950 hover:bg-red-600 text-white text-xs font-medium rounded-[8px] transition-colors cursor-pointer"
                        >
                          Sign In
                        </button>
                      </form>
                    )}

                    {/* Minimal Separator & Google One-Tap */}
                    <div className="pt-2 space-y-3">
                      <div className="relative flex items-center justify-center">
                        <div className="w-full border-t border-zinc-200" />
                        <span className="absolute bg-white px-3 text-[10px] uppercase tracking-wider text-zinc-400">
                          or
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => loginWithPhone('+91 98765 43210', 'Nikhil Sharma (Google)')}
                          className="flex-1 py-2.5 border border-zinc-200 hover:border-zinc-900 text-zinc-700 hover:text-black text-xs font-normal flex items-center justify-center gap-2 rounded-[8px] transition-colors cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                          </svg>
                          <span>Google</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStep(step === 'email' ? 'phone' : 'email')}
                          className="px-3 py-2.5 border border-zinc-200 hover:border-zinc-900 text-zinc-600 hover:text-black text-xs font-normal rounded-[8px] transition-colors cursor-pointer"
                        >
                          {step === 'email' ? 'Use Phone' : 'Use Email'}
                        </button>
                      </div>
                    </div>

                  </div>
                )}

              </div>

              {/* Discreet Footer Note */}
              <div className="pt-4 text-center text-[10px] text-zinc-400 font-light">
                <span>By continuing, you agree to Xavonic's <a href="#" className="underline text-zinc-500 hover:text-black">Terms</a> & <a href="#" className="underline text-zinc-500 hover:text-black">Privacy</a>.</span>
              </div>

            </div>
          </div>

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}
