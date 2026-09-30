import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Lock, Zap, RefreshCw, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import logoBlack from '../../assets/logo_balck.png';
import { toast } from 'sonner';
import { ADMIN_API_BASE } from '../../config/api';

export default function AdminLogin({ onLoginSuccess }) {
  const [loginEmail, setLoginEmail] = useState('admin@xavonic.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      const response = await fetch(`${ADMIN_API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem('xavonic_admin_auth', 'true');
        localStorage.setItem('xavonic_admin_token', data.token);
        localStorage.setItem('xavonic_admin_user', JSON.stringify(data.admin));
        toast.success(`Access Granted. Welcome, ${data.admin.name}!`);
        onLoginSuccess(data.admin);
      } else {
        toast.error(data.message || 'Invalid admin credentials.');
      }
    } catch (err) {
      console.warn('Backend API connection error:', err);
      // Fallback in case of server restart
      if (loginEmail === 'admin@xavonic.com' && loginPassword === 'admin123') {
        localStorage.setItem('xavonic_admin_auth', 'true');
        onLoginSuccess({ name: 'Master Admin', email: 'admin@xavonic.com', role: 'Super Admin' });
        toast.success('Authenticated in offline fallback mode.');
      } else {
        toast.error('Could not connect to backend server. Please check backend is running.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 flex flex-col justify-center items-center px-4 py-10 font-sans selection:bg-red-600 selection:text-white">
      <div className="w-full max-w-sm space-y-5">
        
        {/* Brand Header with Official Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <img
              src={logoBlack}
              alt="Guidelya Xavonic Athletics"
              className="h-10 sm:h-12 w-auto mx-auto object-contain"
            />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-neutral-100 border border-neutral-200 text-[10px] font-medium tracking-wider text-neutral-700 uppercase">
            <Shield className="h-3 w-3 text-red-600" />
            <span>Admin Management Console</span>
          </div>
        </div>

        {/* Clean White Card: Sharp subtle radius, No shadows, crisp borders */}
        <div className="bg-white border border-neutral-200 rounded-sm p-6 space-y-5">
          <form onSubmit={handleAdminLogin} className="space-y-3.5 text-xs">
            
            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-600">
                Admin Email
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@xavonic.com"
                  className="w-full h-10 bg-neutral-50/50 hover:bg-white focus:bg-white border border-neutral-200 rounded-sm pl-9 pr-3 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-600">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-neutral-400 hover:text-neutral-800 flex items-center gap-1 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 bg-neutral-50/50 hover:bg-white focus:bg-white border border-neutral-200 rounded-sm pl-9 pr-9 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 transition-colors"
                />
              </div>
            </div>

            {/* Demo Credentials Box */}
            <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-sm text-[11px] text-neutral-600 space-y-1">
              <div className="font-medium text-neutral-800 flex items-center gap-1">
                <Zap className="h-3 w-3 text-red-600 fill-red-600" /> Demo Credentials:
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-500">
                <span>Email: <strong className="text-neutral-800 font-mono">admin@xavonic.com</strong></span>
                <span>Pass: <strong className="text-neutral-800 font-mono">admin123</strong></span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-10 bg-neutral-900 hover:bg-red-600 active:scale-[0.99] text-white font-medium text-xs tracking-wider uppercase rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-1 text-center border-t border-neutral-100">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Back to Storefront
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[10px] text-neutral-400 uppercase tracking-wider">
          Xavonic Aesthetics • HQ Console v2.4
        </p>
      </div>
    </div>
  );
}
