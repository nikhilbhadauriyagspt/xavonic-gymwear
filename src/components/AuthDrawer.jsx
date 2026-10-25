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
  CheckCircle2,
  Lock,
  Smartphone,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBrand } from '../context/BrandContext';
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

  const { brand } = useBrand();

  // Dynamic Admin Uploaded Logos with local asset fallback
  const activeLogoWhite = (brand?.logo_white && brand.logo_white.trim()) || logoWhite;
  const activeLogoBlack = (brand?.logo_black && brand.logo_black.trim()) || logoBlack;
  const brandName = brand?.brand_name || 'RageX Activewear';

  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'success'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [countdown, setCountdown] = useState(30);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [verifiedUserData, setVerifiedUserData] = useState(null);

  const otpInputsRef = useRef([]);

  // Reset drawer state on open/close
  useEffect(() => {
    if (isAuthOpen) {
      document.body.style.overflow = 'hidden';
      setStep('phone');
      setOtp(['', '', '', '']);
      setShakeError(false);
      setErrorMessage('');
      setVerifiedUserData(null);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAuthOpen]);

  // Resend countdown timer
  useEffect(() => {
    let timer;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Handle Phone Submit (Animated OTP Sending)
  const handlePhoneSubmit = async (e) => {
    e?.preventDefault?.();
    const cleanDigits = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 10 || isSending) return;

    setErrorMessage('');
    setIsSending(true);

    try {
      const res = await sendWhatsAppOtp(cleanDigits);
      if (res && res.success) {
        setStep('otp');
        setCountdown(30);
        setOtp(['', '', '', '']);
        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 250);
      } else {
        setErrorMessage(res?.message || 'Failed to send OTP to WhatsApp.');
      }
    } catch (err) {
      setErrorMessage('Could not connect to WhatsApp gateway. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Handle OTP Input Changes
  const handleOtpChange = async (index, value) => {
    // Only accept numeric single digit
    const cleaned = value.replace(/[^0-9]/g, '');
    const char = cleaned.slice(-1);

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);
    setErrorMessage('');

    // Auto-advance focus to next digit
    if (char && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }

    // When all 4 digits are completed, trigger auto-verification
    if (newOtp.every((digit) => digit !== '')) {
      const fullCode = newOtp.join('');
      setIsVerifying(true);
      setErrorMessage('');

      try {
        const res = await verifyWhatsAppOtp(phoneNumber, fullCode);
        if (res?.success) {
          setVerifiedUserData(res.user || user);
          setStep('success');
          // Graceful auto-close after celebration animation
          setTimeout(() => {
            closeAuth();
            setStep('phone');
            setOtp(['', '', '', '']);
          }, 1400);
        } else {
          // Trigger shake animation and error
          setShakeError(true);
          setErrorMessage(res?.message || 'Incorrect verification code. Please check WhatsApp.');
          setTimeout(() => setShakeError(false), 600);
          // Clear and refocus first input
          setOtp(['', '', '', '']);
          setTimeout(() => {
            otpInputsRef.current[0]?.focus();
            setFocusedIndex(0);
          }, 150);
        }
      } catch (err) {
        setShakeError(true);
        setErrorMessage('Verification failed. Please try again.');
        setTimeout(() => setShakeError(false), 600);
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
    if (!pastedData) return;

    const digits = pastedData.split('');
    const newOtp = ['', '', '', ''];
    digits.forEach((d, i) => {
      if (i < 4) newOtp[i] = d;
    });
    setOtp(newOtp);

    if (digits.length === 4) {
      otpInputsRef.current[3]?.focus();
      handleOtpChange(3, digits[3]);
    } else {
      const nextIdx = Math.min(digits.length, 3);
      otpInputsRef.current[nextIdx]?.focus();
      setFocusedIndex(nextIdx);
    }
  };

  return (
    <AnimatePresence>
      {isAuthOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 font-sans select-none overflow-y-auto">
          
          {/* Subtle Backdrop Layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeAuth}
            className="fixed inset-0 bg-black/50 cursor-pointer backdrop-blur-sm"
          />

          {/* Luxury Minimal Split Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl bg-black text-white shadow-2xl rounded-xl overflow-hidden z-10 grid grid-cols-1 md:grid-cols-12 my-auto border border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Shimmer Progress Beam on Loading */}
            {(isSending || isVerifying) && (
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent z-30 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
              />
            )}
            
            {/* ================= LEFT: SOLID BLACK BRAND SIDE ================= */}
            <div className="hidden md:flex md:col-span-5 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white flex-col justify-between p-8 sm:p-10 select-none border-r border-zinc-900/80 relative overflow-hidden">
              {/* Background ambient light */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

              {/* Top: Admin Uploaded White Logo */}
              <div className="relative z-10">
                <img 
                  src={activeLogoWhite} 
                  alt={brandName} 
                  className="h-9 sm:h-10 w-auto object-contain max-w-[200px] transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = logoWhite;
                  }}
                />
              </div>

              {/* Bottom: Understated Brand Ethos */}
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-[2px] bg-red-600"></div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-500">
                    VIP Athlete Portal
                  </span>
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-xl font-semibold tracking-tight text-white leading-snug">
                    Uncompromising Fit. Zero Distraction.
                  </h3>
                  <p className="text-xs text-zinc-400 font-normal leading-relaxed">
                    Instant passwordless access via WhatsApp. Track orders in real-time, unlock members-only drops, and claim loyalty rewards.
                  </p>
                </div>

                {/* Secure Badge */}
                <div className="pt-2 flex items-center gap-2 text-[11px] text-zinc-400 border-t border-zinc-900">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-300">
                    Meta Cloud WhatsApp Verified
                  </span>
                </div>
              </div>
            </div>

            {/* ================= RIGHT: INSET WHITE CARD ================= */}
            <div className="col-span-12 md:col-span-7 p-2 sm:p-3 flex">
              <div className="w-full bg-white text-zinc-900 rounded-lg p-6 sm:p-8 flex flex-col justify-between relative shadow-xs">
                
                {/* Close Button */}
                <button
                  onClick={closeAuth}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer rounded-full z-20"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Mobile Header Logo */}
                <div className="md:hidden mb-5 flex items-center justify-between pb-3 border-b border-zinc-100">
                  <img 
                    src={activeLogoBlack} 
                    alt={brandName} 
                    className="h-6 w-auto object-contain max-w-[140px]" 
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = logoBlack;
                    }}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Secure Access</span>
                </div>

                {/* Main Auth Body */}
                <div className="my-auto py-2">
                  
                  {isLoggedIn && user ? (
                    
                    /* LOGGED IN USER SUMMARY */
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-red-600 block">
                            Active Session
                          </span>
                          {user.customerId && (
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-md border border-zinc-200">
                              {user.customerId}
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl font-bold text-zinc-950">
                          Hello, {user.name || user.displayName || 'Athlete'}
                        </h2>
                      </div>

                      <div className="p-4 bg-zinc-950 text-white rounded-xl space-y-3 text-xs shadow-md">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400 font-mono flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5 text-zinc-500" />
                            +{user.phone?.replace(/[^0-9]/g, '')}
                          </span>
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            {user.tier || 'VIP Athlete Club'}
                          </span>
                        </div>
                        <div className="pt-2.5 border-t border-zinc-800 flex items-center justify-between text-[11px]">
                          <span className="text-zinc-400">Club Rewards Balance</span>
                          <span className="font-semibold text-white tracking-wide">{user.points || 100} pts</span>
                        </div>
                      </div>

                      <button
                        onClick={logout}
                        className="w-full py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out of Account</span>
                      </button>
                    </div>

                  ) : (

                    /* NOT LOGGED IN AUTH FORMS */
                    <div className="space-y-5">
                      
                      {/* Step 3: SUCCESS CELEBRATION SCREEN */}
                      {step === 'success' && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="py-6 flex flex-col items-center justify-center text-center space-y-4"
                        >
                          <motion.div
                            initial={{ scale: 0, rotate: -30 }}
                            animate={{ scale: [0, 1.15, 1], rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-md relative"
                          >
                            <CheckCircle2 className="w-9 h-9" />
                            <motion.span 
                              initial={{ scale: 0.8, opacity: 0.8 }}
                              animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0] }}
                              transition={{ duration: 1.2, repeat: Infinity }}
                              className="absolute inset-0 rounded-full border-2 border-emerald-500"
                            />
                          </motion.div>

                          <div className="space-y-1">
                            <motion.h3 
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.15 }}
                              className="text-xl font-bold text-zinc-950"
                            >
                              Verification Successful!
                            </motion.h3>
                            <motion.p 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.25 }}
                              className="text-xs text-zinc-500 max-w-xs mx-auto"
                            >
                              Welcome to {brandName}. Your VIP athlete access has been unlocked.
                            </motion.p>
                          </div>

                          <motion.div 
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-[11px] font-medium text-zinc-700"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Redirecting to your session...</span>
                          </motion.div>
                        </motion.div>
                      )}

                      {/* Title Header (for Phone & OTP steps) */}
                      {step !== 'success' && (
                        <div className="space-y-1">
                          <h2 className="text-xl font-bold tracking-tight text-zinc-950 flex items-center justify-between">
                            <span>{step === 'otp' ? 'Enter WhatsApp Code' : 'Sign In / Register'}</span>
                            {step === 'otp' && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                OTP Dispatched
                              </span>
                            )}
                          </h2>
                          <p className="text-xs text-zinc-500">
                            {step === 'otp'
                              ? `We sent a 4-digit code to +91 ${phoneNumber}`
                              : 'Enter your 10-digit mobile number for 1-click WhatsApp verification'}
                          </p>
                        </div>
                      )}

                      {/* Error Banner */}
                      {errorMessage && (
                        <motion.div 
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs"
                        >
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                          <span>{errorMessage}</span>
                        </motion.div>
                      )}

                      {/* ================= 1. PHONE FORM STEP ================= */}
                      {step === 'phone' && (
                        <form onSubmit={handlePhoneSubmit} className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider">
                              Mobile Number (WhatsApp)
                            </label>
                            
                            <div className="flex items-center border border-zinc-300 focus-within:border-zinc-950 focus-within:ring-2 focus-within:ring-zinc-900/10 rounded-xl px-3.5 py-3 transition-all bg-zinc-50/70 focus-within:bg-white shadow-xs">
                              {/* Country Flag & Prefix */}
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 pr-3 mr-3 border-r border-zinc-200 shrink-0 select-none">
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
                                className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none font-mono tracking-wider font-medium"
                                autoFocus
                              />

                              {phoneNumber.length === 10 && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0"
                                >
                                  <Check className="w-3 h-3" />
                                </motion.div>
                              )}
                            </div>
                          </div>

                          {/* Animated Send OTP Button */}
                          <motion.button
                            type="submit"
                            disabled={phoneNumber.length < 10 || isSending}
                            whileHover={phoneNumber.length === 10 && !isSending ? { scale: 1.01 } : {}}
                            whileTap={phoneNumber.length === 10 && !isSending ? { scale: 0.98 } : {}}
                            className={`w-full py-3.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 relative overflow-hidden ${
                              phoneNumber.length === 10 && !isSending
                                ? 'bg-zinc-950 hover:bg-emerald-600 text-white shadow-lg shadow-zinc-950/20 active:bg-emerald-700'
                                : isSending
                                ? 'bg-zinc-950 text-white shadow-md'
                                : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                            }`}
                          >
                            {isSending ? (
                              <div className="flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                                <span className="font-medium tracking-wide">Connecting to WhatsApp...</span>
                              </div>
                            ) : (
                              <>
                                <span>Get OTP on WhatsApp</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </motion.button>

                          <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-zinc-500">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>100% Secure. Official WhatsApp API. No password required.</span>
                          </div>
                        </form>
                      )}

                      {/* ================= 2. OTP VERIFICATION STEP ================= */}
                      {step === 'otp' && (
                        <div className="space-y-6">
                          
                          {/* 4 Animated OTP Boxes */}
                          <motion.div 
                            animate={shakeError ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
                            transition={{ duration: 0.5 }}
                            className="flex items-center justify-center gap-3 sm:gap-4 py-1"
                            onPaste={handleOtpPaste}
                          >
                            {otp.map((digit, idx) => {
                              const isFilled = digit !== '';
                              const isCurrent = focusedIndex === idx;

                              return (
                                <motion.div
                                  key={idx}
                                  animate={
                                    isFilled 
                                      ? { scale: [1, 1.08, 1], borderColor: '#10b981' } 
                                      : isCurrent 
                                      ? { scale: 1.04 } 
                                      : { scale: 1 }
                                  }
                                  transition={{ duration: 0.2 }}
                                  className={`relative w-12 h-14 sm:w-14 sm:h-16 rounded-xl border-2 transition-all flex items-center justify-center ${
                                    isFilled
                                      ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                                      : isCurrent
                                      ? 'border-zinc-950 bg-white ring-4 ring-zinc-950/5 shadow-sm'
                                      : 'border-zinc-200 bg-zinc-50/60'
                                  }`}
                                >
                                  <input
                                    ref={(el) => (otpInputsRef.current[idx] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onFocus={() => setFocusedIndex(idx)}
                                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                    className="w-full h-full text-center text-xl sm:text-2xl font-bold text-zinc-950 bg-transparent focus:outline-none font-mono caret-emerald-600"
                                  />

                                  {/* Pulsing indicator line for focused empty box */}
                                  {isCurrent && !isFilled && (
                                    <motion.div 
                                      animate={{ opacity: [0, 1, 0] }}
                                      transition={{ duration: 0.8, repeat: Infinity }}
                                      className="absolute bottom-2.5 w-4 h-0.5 bg-emerald-500 rounded-full pointer-events-none"
                                    />
                                  )}
                                </motion.div>
                              );
                            })}
                          </motion.div>

                          {/* Verification State Indicator */}
                          {isVerifying && (
                            <motion.div 
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700"
                            >
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                              <span>Verifying one-time code...</span>
                            </motion.div>
                          )}

                          {/* Back & Resend Bar */}
                          <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 border-t border-zinc-100">
                            <button
                              type="button"
                              onClick={() => {
                                setStep('phone');
                                setErrorMessage('');
                              }}
                              className="text-zinc-600 hover:text-black font-medium inline-flex items-center gap-1.5 py-1 px-1.5 -ml-1.5 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                              <span>Change Number</span>
                            </button>

                            {countdown > 0 ? (
                              <div className="inline-flex items-center gap-1.5 text-zinc-500 font-mono text-[11px] bg-zinc-100 px-2.5 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                                <span>Resend in {countdown}s</span>
                              </div>
                            ) : (
                              <motion.button
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                type="button"
                                onClick={handlePhoneSubmit}
                                disabled={isSending}
                                className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer text-xs inline-flex items-center gap-1 hover:underline"
                              >
                                <RefreshCw className={`w-3 h-3 ${isSending ? 'animate-spin' : ''}`} />
                                <span>Resend Code</span>
                              </motion.button>
                            )}
                          </div>

                        </div>
                      )}

                    </div>
                  )}

                </div>

                {/* Discreet Footer Note */}
                <div className="pt-4 text-center text-[10px] text-zinc-400 font-light border-t border-zinc-100">
                  <span>By continuing, you agree to {brandName}'s <a href="/terms" className="underline text-zinc-500 hover:text-black">Terms</a> & <a href="/privacy" className="underline text-zinc-500 hover:text-black">Privacy Policy</a>.</span>
                </div>

              </div>
            </div>

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}
