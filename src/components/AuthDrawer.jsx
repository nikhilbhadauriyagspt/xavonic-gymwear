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
  Check,
  User,
  KeyRound,
  Mail,
  MailCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBrand } from '../context/BrandContext';
import authBanner from '../assets/auth_banner.png';
import logoBlack from '../assets/logo_balck.png';

const WhatsAppIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export default function AuthDrawer() {
  const {
    isAuthOpen,
    closeAuth,
    user,
    isLoggedIn,
    sendWhatsAppOtp,
    verifyWhatsAppOtp,
    updateProfile,
    linkEmailSendOtp,
    verifyLinkEmail,
    logout,
  } = useAuth();

  const { brand } = useBrand();
  const activeLogoBlack = (brand?.logo_black && brand.logo_black.trim()) || logoBlack;
  const brandName = brand?.brand_name || 'RageX Activewear';

  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'name' | 'email' | 'email_otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendStage, setSendStage] = useState(0); // 0: idle, 1: connecting (0-1s), 2: generating code (1-2s), 3: dispatched (2-2.5s)
  const [errorMessage, setErrorMessage] = useState('');

  // New user onboarding states
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [emailOtp, setEmailOtp] = useState(['', '', '', '']);
  const [emailCountdown, setEmailCountdown] = useState(30);

  const otpInputsRef = useRef([]);
  const emailOtpInputsRef = useRef([]);

  // Reset state on open
  useEffect(() => {
    if (isAuthOpen) {
      document.body.style.overflow = 'hidden';
      setStep('phone');
      setOtp(['', '', '', '']);
      setFullName('');
      setEmailAddress('');
      setEmailOtp(['', '', '', '']);
      setErrorMessage('');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAuthOpen]);

  // Resend countdown timer for phone and email OTP
  useEffect(() => {
    let timer;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (step === 'email_otp' && emailCountdown > 0) {
      timer = setInterval(() => setEmailCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown, emailCountdown]);

  // Handle Phone Submit (2.5-second rich animated WhatsApp sending sequence)
  const handlePhoneSubmit = async (e) => {
    e?.preventDefault?.();
    const cleanDigits = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 10 || isSubmitting) return;

    setErrorMessage('');
    setIsSubmitting(true);
    setSendStage(1);

    let apiSuccess = false;
    let apiErrorMsg = '';

    // Fire actual network API call in parallel
    const apiPromise = sendWhatsAppOtp(cleanDigits)
      .then((res) => {
        if (res && res.success) {
          apiSuccess = true;
        } else {
          apiErrorMsg = res?.message || 'Failed to send OTP to WhatsApp.';
        }
      })
      .catch((err) => {
        apiErrorMsg = 'Network error sending OTP. Please try again.';
      });

    // Stage 2 after 900ms: Generating code
    setTimeout(() => {
      setSendStage(2);
    }, 900);

    // Stage 3 after 1800ms: Dispatched
    setTimeout(() => {
      setSendStage(3);
    }, 1800);

    // Stage 4 after 2500ms total: Seamless screen transition
    setTimeout(async () => {
      try {
        await apiPromise;
      } catch (_) {}

      if (apiSuccess) {
        setStep('otp');
        setCountdown(30);
        setOtp(['', '', '', '']);
        setIsSubmitting(false);
        setSendStage(0);
        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 150);
      } else {
        setIsSubmitting(false);
        setSendStage(0);
        setErrorMessage(apiErrorMsg || 'Failed to dispatch WhatsApp OTP. Please try again.');
      }
    }, 2500);
  };

  // Handle OTP Input Changes
  const handleOtpChange = async (index, value) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    const char = cleaned.slice(-1);

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);
    setErrorMessage('');

    if (char && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto-verify on 4th digit
    if (newOtp.every((digit) => digit !== '')) {
      const fullCode = newOtp.join('');
      setIsSubmitting(true);
      try {
        const res = await verifyWhatsAppOtp(phoneNumber, fullCode);
        if (res?.success) {
          const isNew = Boolean(
            res.isNewUser ||
            !res.user?.name ||
            res.user.name.trim() === '' ||
            res.user.name.toLowerCase() === 'athlete'
          );

          if (isNew) {
            // New user proceeds to step 'name' in the same popup
            setStep('name');
            setErrorMessage('');
            setOtp(['', '', '', '']);
          } else {
            // Existing user finishes login
            closeAuth();
            setStep('phone');
            setOtp(['', '', '', '']);
          }
        } else {
          setErrorMessage(res?.message || 'Invalid or expired OTP code.');
          setOtp(['', '', '', '']);
          setTimeout(() => {
            otpInputsRef.current[0]?.focus();
          }, 80);
        }
      } catch (_) {
        setErrorMessage('Verification error. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
    if (!pasted) return;

    const digits = pasted.split('');
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
    }
  };

  // Step 3: Handle Name Submit
  const handleNameSubmit = async (e) => {
    e?.preventDefault?.();
    const cleanName = fullName.trim();
    if (!cleanName) {
      setErrorMessage('Please enter your name.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await updateProfile({ name: cleanName });
      setStep('email');
    } catch (_) {
      setErrorMessage('Could not save name. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 4: Handle Email Submit (Send Email OTP)
  const handleEmailSubmit = async (e) => {
    e?.preventDefault?.();
    const cleanEmail = emailAddress.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await linkEmailSendOtp(cleanEmail);
      if (res?.success) {
        setStep('email_otp');
        setEmailCountdown(30);
        setEmailOtp(['', '', '', '']);
        setTimeout(() => {
          emailOtpInputsRef.current[0]?.focus();
        }, 120);
      } else {
        setErrorMessage(res?.message || 'Failed to dispatch email verification code.');
      }
    } catch (_) {
      setErrorMessage('Network error sending verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 5: Handle Email OTP Change & Verification
  const handleEmailOtpChange = async (index, value) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    const char = cleaned.slice(-1);

    const newOtp = [...emailOtp];
    newOtp[index] = char;
    setEmailOtp(newOtp);
    setErrorMessage('');

    if (char && index < 3) {
      emailOtpInputsRef.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      const fullCode = newOtp.join('');
      setIsSubmitting(true);
      try {
        const res = await verifyLinkEmail(emailAddress.trim().toLowerCase(), fullCode);
        if (res?.success) {
          closeAuth();
          setStep('phone');
          setEmailOtp(['', '', '', '']);
        } else {
          setErrorMessage(res?.message || 'Invalid or expired email verification code.');
          setEmailOtp(['', '', '', '']);
          setTimeout(() => {
            emailOtpInputsRef.current[0]?.focus();
          }, 80);
        }
      } catch (_) {
        setErrorMessage('Verification error. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEmailOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !emailOtp[index] && index > 0) {
      emailOtpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleEmailOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
    if (!pasted) return;

    const digits = pasted.split('');
    const newOtp = ['', '', '', ''];
    digits.forEach((d, i) => {
      if (i < 4) newOtp[i] = d;
    });
    setEmailOtp(newOtp);

    if (digits.length === 4) {
      emailOtpInputsRef.current[3]?.focus();
      handleEmailOtpChange(3, digits[3]);
    } else {
      const nextIdx = Math.min(digits.length, 3);
      emailOtpInputsRef.current[nextIdx]?.focus();
    }
  };

  // Skip Email Option
  const handleSkipEmail = () => {
    closeAuth();
    setStep('phone');
    setFullName('');
    setEmailAddress('');
    setEmailOtp(['', '', '', '']);
  };

  return (
    <AnimatePresence>
      {isAuthOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 font-sans select-none overflow-y-auto">
          
          {/* Subtle Backdrop Layer with Smooth Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeAuth}
            className="fixed inset-0 bg-black/50 cursor-pointer backdrop-blur-xs"
          />

          {/* Luxury Glossy Modal Container with Dark Gradient & GPU Acceleration for 60fps Smooth Open */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-4xl transform-gpu will-change-transform bg-black backdrop-blur-xl border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] rounded-sm overflow-hidden z-10 grid grid-cols-1 md:grid-cols-12 my-auto p-2.5 sm:p-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glossy Top Glass Refection Line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none z-20" />

            {/* ================= LEFT: PURE IMAGE CARD ================= */}
            <div className="hidden md:block md:col-span-5 relative overflow-hidden rounded-sm min-h-[460px] md:min-h-[480px] bg-zinc-950 border border-white/5 shadow-inner">
              <img 
                src={authBanner} 
                alt="RageX" 
                className="w-full h-full object-cover object-center select-none"
              />
              {/* Subtle glass vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* ================= RIGHT: INSET WHITE CARD ================= */}
            <div className="col-span-12 md:col-span-7 flex flex-col pl-0 md:pl-2.5">
              <div 
                className="w-full h-full min-h-[460px] md:min-h-[480px] bg-white text-zinc-900 rounded-sm p-6 sm:p-8 flex flex-col justify-between relative shadow-sm border border-zinc-100" 
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                
                {/* Close Button */}
                <button
                  onClick={closeAuth}
                  className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer rounded-sm z-20"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* NOT LOGGED IN AUTH FORMS & ONBOARDING */}
                <div className="w-full h-full flex flex-col justify-between flex-1">
                    
                    {/* CENTERED VERTICALLY (my-auto) with text-left */}
                    <div className="my-auto space-y-5">
                      
                      {/* Header with rounded icon & subtitle (Left Aligned) */}
                      <div className="space-y-1.5 text-left">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-800 shrink-0 border border-zinc-200">
                            {step === 'otp' && <KeyRound className="w-4 h-4" />}
                            {step === 'phone' && <User className="w-4 h-4" />}
                            {step === 'name' && <User className="w-4 h-4" />}
                            {step === 'email' && <Mail className="w-4 h-4" />}
                            {step === 'email_otp' && <MailCheck className="w-4 h-4" />}
                          </div>
                          <h2 className="text-xl font-semibold tracking-normal text-zinc-950 text-left">
                            {step === 'phone' && 'Sign In / Register'}
                            {step === 'otp' && 'Enter Verification Code'}
                            {step === 'name' && 'Enter Your Name'}
                            {step === 'email' && 'Enter Your Email'}
                            {step === 'email_otp' && 'Verify Email Code'}
                          </h2>
                        </div>
                        <p className="text-xs text-zinc-500 font-normal leading-relaxed text-left">
                          {step === 'phone' && 'Enter your 10-digit mobile number to receive OTP on WhatsApp'}
                          {step === 'otp' && `Enter the 4-digit code sent to +91 ${phoneNumber}`}
                          {step === 'name' && 'Please enter your full name to personalize your account'}
                          {step === 'email' && 'We will send a 4-digit verification code to your email'}
                          {step === 'email_otp' && `Enter the 4-digit code sent to ${emailAddress}`}
                        </p>
                      </div>

                      {/* Error Banner */}
                      {errorMessage && (
                        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm text-left">
                          {errorMessage}
                        </div>
                      )}

                      {/* Phone Step: Input + Button + Reassurance */}
                      {step === 'phone' && (
                        <form onSubmit={handlePhoneSubmit} className="space-y-3.5">
                          <div className="space-y-1.5 text-left">
                            <label className="text-[11px] font-medium text-zinc-600 block uppercase tracking-wide text-left">
                              Mobile Number (WhatsApp)
                            </label>
                            
                            <div className="flex items-center border border-zinc-300 focus-within:border-black rounded-sm px-3.5 py-3 transition-colors bg-zinc-50/50 focus-within:bg-white">
                              <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-800 pr-3 mr-3 border-r border-zinc-200 shrink-0 select-none">
                                <svg className="w-4 h-3 rounded-none shrink-0 overflow-hidden" viewBox="0 0 640 480">
                                  <path fill="#f93" d="M0 0h640v160H0z"/>
                                  <path fill="#fff" d="M0 160h640v160H0z"/>
                                  <path fill="#128807" d="M0 320h640v160H0z"/>
                                  <g transform="matrix(3.2 0 0 3.2 320 240)">
                                    <circle r="20" fill="#008"/>
                                    <circle r="17.5" fill="#fff"/>
                                    <circle r="3.5" fill="#008"/>
                                    <g id="d"><g id="c"><g id="b"><g id="a"><path fill="#008" d="M0-17.5L.6-3.5 0-3l-.6-.5z"/></g><use href="#a" transform="rotate(15)"/></g><use href="#b" transform="rotate(30)"/></g><use href="#c" transform="rotate(60)"/></g>
                                    <use href="#d" transform="rotate(120)"/><use href="#d" transform="rotate(240)"/>
                                  </g>
                                </svg>
                                <span className=" text-zinc-900">+91</span>
                              </span>
                              <input
                                type="tel"
                                maxLength={10}
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder=""
                                className="w-full bg-transparent text-sm text-zinc-900 focus:outline-none  font-normal tracking-wide"
                                autoFocus
                              />
                              {phoneNumber.length === 10 && (
                                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </div>
                          </div>

                          {/* Flat Red Button with WhatsApp Icon & Animation */}
                          <motion.button
                            type="submit"
                            disabled={phoneNumber.length < 10 || isSubmitting}
                            whileHover={phoneNumber.length === 10 && !isSubmitting ? { scale: 1.01 } : {}}
                            whileTap={phoneNumber.length === 10 && !isSubmitting ? { scale: 0.985 } : {}}
                            className={`relative overflow-hidden w-full py-3.5 text-xs font-medium rounded-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-none select-none ${
                              phoneNumber.length === 10 && !isSubmitting
                                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-none'
                                : isSubmitting
                                ? 'bg-red-600 text-white cursor-wait shadow-none'
                                : 'bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none'
                            }`}
                          >
                            {/* Smooth internal progress fill bar over 2.5s */}
                            {isSubmitting && (
                              <motion.div
                                initial={{ width: '0%' }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 2.5, ease: 'easeInOut' }}
                                className="absolute inset-y-0 left-0 bg-black/20 pointer-events-none"
                              />
                            )}

                            {/* Shimmer laser highlight */}
                            {isSubmitting && (
                              <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                              />
                            )}

                            {/* Button Content */}
                            {isSubmitting ? (
                              <div className="flex items-center gap-2 z-10">
                                {sendStage === 3 ? (
                                  <Check className="w-4 h-4 text-white shrink-0 stroke-[2.5]" />
                                ) : (
                                  <WhatsAppIcon className="w-4 h-4 shrink-0 text-white animate-pulse" />
                                )}
                                <span className="tracking-wide font-normal">
                                  {sendStage === 1 && 'Connecting to WhatsApp...'}
                                  {sendStage === 2 && 'Generating 4-Digit Passcode...'}
                                  {sendStage === 3 && 'Code Dispatched!'}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 z-10">
                                <WhatsAppIcon className={`w-4 h-4 shrink-0 ${phoneNumber.length === 10 ? 'text-white' : 'text-zinc-400'}`} />
                                <span className="font-medium">Send OTP on WhatsApp</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </motion.button>

                          {/* Instant OTP verification reassurance */}
                          <div className="flex items-center justify-center gap-1.5 pt-0.5 text-xs text-zinc-500 font-normal">
                            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>Instant OTP verification. No password needed.</span>
                          </div>
                        </form>
                      )}

                      {/* OTP Step Verification */}
                      {step === 'otp' && (
                        <div className="space-y-5 pt-2 animate-in fade-in duration-150">
                          <div className="flex items-center justify-center gap-2.5 sm:gap-3" onPaste={handleOtpPaste}>
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
                                className="w-11 h-12 sm:w-12 sm:h-13 text-center text-lg font-medium border border-zinc-300 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 text-zinc-900 rounded-sm bg-zinc-50/50 focus:bg-white transition-all "
                              />
                            ))}
                          </div>

                          {isSubmitting && (
                            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-600 font-normal">
                              <RefreshCw className="w-3 h-3 animate-spin text-zinc-700" />
                              <span>Verifying code...</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setStep('phone');
                                setErrorMessage('');
                              }}
                              className="text-zinc-500 hover:text-black font-normal inline-flex items-center gap-1 cursor-pointer"
                            >
                              <ArrowLeft className="w-3 h-3" />
                              <span>Change number</span>
                            </button>

                            {countdown > 0 ? (
                              <span className="text-[11px] font-normal text-zinc-400">Resend in {countdown}s</span>
                            ) : (
                              <button
                                type="button"
                                onClick={handlePhoneSubmit}
                                disabled={isSubmitting}
                                className="text-red-600 font-medium hover:underline cursor-pointer text-[11px]"
                              >
                                Resend Code
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 3. NAME STEP (FOR NEW USERS) */}
                      {step === 'name' && (
                        <form onSubmit={handleNameSubmit} className="space-y-4 animate-in fade-in duration-150">
                          <div className="space-y-1.5 text-left">
                            <label className="text-[11px] font-medium text-zinc-600 block uppercase tracking-wide text-left">
                              Your Full Name
                            </label>
                            
                            <div className="flex items-center border border-zinc-300 focus-within:border-black rounded-sm px-3.5 py-3 transition-colors bg-zinc-50/50 focus-within:bg-white">
                              <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder=""
                                className="w-full bg-transparent text-sm text-zinc-900 focus:outline-none font-normal tracking-wide"
                                autoFocus
                              />
                              {fullName.trim().length >= 2 && (
                                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </div>
                          </div>

                          <motion.button
                            type="submit"
                            disabled={fullName.trim().length < 2 || isSubmitting}
                            whileHover={fullName.trim().length >= 2 && !isSubmitting ? { scale: 1.01 } : {}}
                            whileTap={fullName.trim().length >= 2 && !isSubmitting ? { scale: 0.985 } : {}}
                            className={`w-full py-3.5 text-xs font-medium rounded-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-none select-none ${
                              fullName.trim().length >= 2 && !isSubmitting
                                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white cursor-pointer'
                                : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                            }`}
                          >
                            <span>Continue</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </motion.button>
                        </form>
                      )}

                      {/* 4. EMAIL STEP (FOR NEW USERS) */}
                      {step === 'email' && (
                        <form onSubmit={handleEmailSubmit} className="space-y-4 animate-in fade-in duration-150">
                          <div className="space-y-1.5 text-left">
                            <label className="text-[11px] font-medium text-zinc-600 block uppercase tracking-wide text-left">
                              Email Address
                            </label>
                            
                            <div className="flex items-center border border-zinc-300 focus-within:border-black rounded-sm px-3.5 py-3 transition-colors bg-zinc-50/50 focus-within:bg-white">
                              <input
                                type="email"
                                value={emailAddress}
                                onChange={(e) => setEmailAddress(e.target.value)}
                                placeholder=""
                                className="w-full bg-transparent text-sm text-zinc-900 focus:outline-none font-normal tracking-wide lowercase"
                                autoFocus
                              />
                              {emailAddress.includes('@') && emailAddress.includes('.') && (
                                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </div>
                          </div>

                          <motion.button
                            type="submit"
                            disabled={!emailAddress.includes('@') || isSubmitting}
                            whileHover={emailAddress.includes('@') && !isSubmitting ? { scale: 1.01 } : {}}
                            whileTap={emailAddress.includes('@') && !isSubmitting ? { scale: 0.985 } : {}}
                            className={`w-full py-3.5 text-xs font-medium rounded-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-none select-none ${
                              emailAddress.includes('@') && !isSubmitting
                                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white cursor-pointer'
                                : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                            }`}
                          >
                            {isSubmitting ? (
                              <div className="flex items-center gap-2">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Sending code...</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span>Send Verification Code</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </motion.button>

                          {/* Small Skip Option */}
                          <div className="pt-1 text-center">
                            <button
                              type="button"
                              onClick={handleSkipEmail}
                              className="text-[11px] text-zinc-400 hover:text-black transition-colors underline cursor-pointer"
                            >
                              Skip for now
                            </button>
                          </div>
                        </form>
                      )}

                      {/* 5. EMAIL OTP STEP */}
                      {step === 'email_otp' && (
                        <div className="space-y-5 pt-2 animate-in fade-in duration-150">
                          <div className="flex items-center justify-center gap-2.5 sm:gap-3" onPaste={handleEmailOtpPaste}>
                            {emailOtp.map((digit, idx) => (
                              <input
                                key={idx}
                                ref={(el) => (emailOtpInputsRef.current[idx] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleEmailOtpChange(idx, e.target.value)}
                                onKeyDown={(e) => handleEmailOtpKeyDown(idx, e)}
                                className="w-11 h-12 sm:w-12 sm:h-13 text-center text-lg font-medium border border-zinc-300 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 text-zinc-900 rounded-sm bg-zinc-50/50 focus:bg-white transition-all "
                              />
                            ))}
                          </div>

                          {isSubmitting && (
                            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-600 font-normal">
                              <RefreshCw className="w-3 h-3 animate-spin text-zinc-700" />
                              <span>Verifying email code...</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setStep('email');
                                setErrorMessage('');
                              }}
                              className="text-zinc-500 hover:text-black font-normal inline-flex items-center gap-1 cursor-pointer"
                            >
                              <ArrowLeft className="w-3 h-3" />
                              <span>Change email</span>
                            </button>

                            {emailCountdown > 0 ? (
                              <span className="text-[11px] font-normal text-zinc-400">Resend in {emailCountdown}s</span>
                            ) : (
                              <button
                                type="button"
                                onClick={handleEmailSubmit}
                                disabled={isSubmitting}
                                className="text-red-600 font-medium hover:underline cursor-pointer text-[11px]"
                              >
                                Resend Code
                              </button>
                            )}
                          </div>

                          {/* Small Skip Option */}
                          <div className="pt-1 text-center">
                            <button
                              type="button"
                              onClick={handleSkipEmail}
                              className="text-[11px] text-zinc-400 hover:text-black transition-colors underline cursor-pointer"
                            >
                              Skip for now
                            </button>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Centered Legal Footer at the very bottom */}
                    <div className="pt-6 text-center text-[10px] sm:text-xs text-zinc-400 font-normal">
                      <span>
                        By continuing, you agree to Rage X’s{' '}
                        <a href="/terms" className="underline text-zinc-500 hover:text-black">Terms</a>
                        {' '}&amp;{' '}
                        <a href="/privacy" className="underline text-zinc-500 hover:text-black">Privacy</a>.
                      </span>
                    </div>

                  </div>

              </div>
            </div>

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}
