import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  LogOut, 
  Sparkles, 
  RefreshCw,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoWhite from '../assets/logo_white.png';
import logoBlack from '../assets/logo_balck.png';

export default function AuthDrawer() {
  const {
    isAuthOpen,
    closeAuth,
    user,
    isLoggedIn,
    sendWhatsAppOtp,
    verifyWhatsAppOtp,
    logout,
  } = useAuth();

  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Handle Phone Submit (Sends WhatsApp OTP)
  const handlePhoneSubmit = async (e) => {
    e?.preventDefault?.();
    const cleanDigits = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 10) return;

    setIsSubmitting(true);
    const res = await sendWhatsAppOtp(cleanDigits);
    setIsSubmitting(false);

    if (res.success) {
      setStep('otp');
      setCountdown(30);
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    }
  };

  // Handle OTP Input Changes
  const handleOtpChange = async (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      const fullCode = newOtp.join('');
      setIsSubmitting(true);
      const res = await verifyWhatsAppOtp(phoneNumber, fullCode);
      setIsSubmitting(false);
      if (res?.success) {
        closeAuth();
        setStep('phone');
        setOtp(['', '', '', '']);
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleDemoOtp = async () => {
    setOtp(['1', '2', '3', '4']);
    setIsSubmitting(true);
    const res = await verifyWhatsAppOtp(phoneNumber || '9876543210', '1234');
    setIsSubmitting(false);
    if (res?.success) {
      closeAuth();
      setStep('phone');
      setOtp(['', '', '', '']);
    }
  };

  return (
    <AnimatePresence>
      {isAuthOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 font-sans select-none overflow-y-auto">
          
          {/* Subtle Backdrop Layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeAuth}
            className="fixed inset-0 bg-black/30 cursor-pointer backdrop-blur-xs"
          />

          {/* Luxury Minimal Split Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl bg-black text-white shadow-2xl rounded-sm overflow-hidden z-10 grid grid-cols-1 md:grid-cols-12 my-auto border border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* ================= LEFT: SOLID BLACK BRAND SIDE ================= */}
            <div className="hidden md:flex md:col-span-5 bg-black text-white flex-col justify-between p-8 sm:p-10 select-none border-r border-zinc-900">
              {/* Top: Logo */}
              <div>
                <img src={logoWhite} alt="Guidelya" className="h-8 w-auto object-contain" />
              </div>

              {/* Bottom: Understated Brand Ethos */}
              <div className="space-y-3">
                <div className="w-6 h-[2px] bg-red-600"></div>
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-600 block">
                    Athlete Club
                  </span>
                  <h3 className="text-xl font-medium tracking-tight text-white leading-snug">
                    Uncompromising Fit. Zero Distraction.
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 font-normal leading-relaxed">
                  Sign in with your mobile number for instant 1-click checkout, express delivery tracking, and early drop reservations.
                </p>
              </div>
            </div>

            {/* ================= RIGHT: INSET WHITE CARD ================= */}
            <div className="col-span-12 md:col-span-7 p-2 sm:p-3 flex">
              <div className="w-full bg-white text-zinc-900 rounded-sm p-6 sm:p-8 flex flex-col justify-between relative shadow-xs">
                
                {/* Close Button */}
                <button
                  onClick={closeAuth}
                  className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer rounded-sm z-20"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Mobile Header Logo */}
                <div className="md:hidden mb-4 flex items-center justify-between pb-2 border-b border-zinc-100">
                  <img src={logoBlack} alt="Guidelya" className="h-5 w-auto" />
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400">Account Access</span>
                </div>

                {/* Main Auth Body */}
                <div className="my-auto py-1 space-y-5">
                  
                  {isLoggedIn && user ? (
                    
                    /* LOGGED IN USER SUMMARY */
                    <div className="space-y-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-red-600 block">
                            Athlete Profile
                          </span>
                          {user.customerId && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-neutral-100 text-neutral-700 rounded-xs border border-neutral-200">
                              {user.customerId}
                            </span>
                          )}
                        </div>
                        <h2 className="text-lg font-semibold text-zinc-950">
                          Hello, {user.name || user.displayName || 'Athlete'}
                        </h2>
                      </div>

                      <div className="p-3.5 bg-zinc-950 text-white rounded-sm space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400 font-mono">+{user.phone?.replace(/[^0-9]/g, '')}</span>
                          <span className="text-red-500 font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {user.tier}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px]">
                          <span className="text-zinc-400">Club Rewards</span>
                          <span className="font-semibold text-white">{user.points} pts</span>
                        </div>
                      </div>

                      <button
                        onClick={logout}
                        className="w-full py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>

                  ) : (

                    /* NOT LOGGED IN AUTH FORMS */
                    <div className="space-y-4">
                      
                      {/* Title Header */}
                      <div className="space-y-0.5">
                        <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
                          {step === 'otp' ? 'Enter Verification Code' : 'Sign In / Register'}
                        </h2>
                        <p className="text-xs text-zinc-500">
                          {step === 'otp'
                            ? `Enter the 4-digit code sent to +91 ${phoneNumber}`
                            : 'Enter your 10-digit mobile number to receive OTP on WhatsApp'}
                        </p>
                      </div>

                      {/* 1. PHONE FORM STEP */}
                      {step === 'phone' && (
                        <form onSubmit={handlePhoneSubmit} className="space-y-3.5">
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-zinc-600">Mobile Number (WhatsApp)</label>
                            
                            <div className="flex items-center border border-zinc-300 focus-within:border-zinc-950 rounded-[8px] px-3 py-2.5 transition-all bg-zinc-50/50 focus-within:bg-white">
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 pr-2.5 mr-2.5 border-r border-zinc-200 shrink-0 select-none">
                                <svg className="w-4 h-3 rounded-[2px] shadow-xs shrink-0 overflow-hidden border border-zinc-200" viewBox="0 0 640 480">
                                  <path fill="#f93" d="M0 0h640v160H0z"/>
                                  <path fill="#fff" d="M0 160h640v160H0z"/>
                                  <path fill="#128807" d="M0 320h640v160H0z"/>
                                  <g transform="matrix(3.2 0 0 3.2 320 240)">
                                    <circle r="20" fill="#008"/>
                                    <circle r="17.5" fill="#fff"/>
                                    <circle r="3.5" fill="#008"/>
                                    <g id="d">
                                      <g id="c">
                                        <g id="b">
                                          <g id="a">
                                            <path fill="#008" d="M0-17.5L.6-3.5 0-3l-.6-.5z"/>
                                          </g>
                                          <use href="#a" transform="rotate(15)"/>
                                        </g>
                                        <use href="#b" transform="rotate(30)"/>
                                      </g>
                                      <use href="#c" transform="rotate(60)"/>
                                    </g>
                                    <use href="#d" transform="rotate(120)"/>
                                    <use href="#d" transform="rotate(240)"/>
                                  </g>
                                </svg>
                                <span className="font-mono text-zinc-900">+91</span>
                              </span>
                              <input
                                type="tel"
                                maxLength={10}
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="98765 43210"
                                className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none font-mono"
                                autoFocus
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={phoneNumber.length < 10 || isSubmitting}
                            className={`w-full py-2.5 text-xs font-medium rounded-[8px] transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                              phoneNumber.length === 10 && !isSubmitting
                                ? 'bg-zinc-950 hover:bg-red-600 text-white shadow-xs'
                                : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                            }`}
                          >
                            {isSubmitting ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <span>Send OTP to WhatsApp</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>

                          <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-zinc-500">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Instant OTP verification. No password needed.</span>
                          </div>
                        </form>
                      )}

                      {/* 2. OTP VERIFICATION STEP */}
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
                                className="w-11 h-12 text-center text-lg font-medium border border-zinc-300 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 text-zinc-900 rounded-[8px] bg-zinc-50/50 focus:bg-white transition-all font-mono"
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
                                onClick={handlePhoneSubmit}
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
                              className="text-[11px] text-zinc-500 hover:text-black underline cursor-pointer inline-flex items-center gap-1"
                            >
                              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <span>Auto-fill Test OTP (1234)</span>
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>

                {/* Discreet Footer Note */}
                <div className="pt-4 text-center text-[10px] text-zinc-400 font-light">
                  <span>By continuing, you agree to Guidelya's <a href="#" className="underline text-zinc-500 hover:text-black">Terms</a> & <a href="#" className="underline text-zinc-500 hover:text-black">Privacy</a>.</span>
                </div>

              </div>
            </div>

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}
