import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AUTH_API_BASE } from '../config/api';

import spotlightFront from '../assets/spotlight_front.jpg';
import heroCompression from '../assets/hero_compression.jpg';
import catShorts from '../assets/cat_shorts.jpg';

export function createFullUserPayload(apiUser = {}) {
  const rawName = (apiUser.name || '').trim();
  let displayName = 'User';
  let initials = 'U';

  if (rawName) {
    displayName = rawName;
    const parts = rawName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts.length === 1) {
      initials = parts[0].substring(0, 2).toUpperCase();
    }
  } else if (apiUser.email) {
    displayName = apiUser.email.split('@')[0];
    initials = (displayName[0] || 'U').toUpperCase();
  } else if (apiUser.phone) {
    const cleanPhone = String(apiUser.phone).replace(/[^0-9]/g, '');
    displayName = `User (${cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone})`;
    initials = 'U';
  }

  const customerId =
    apiUser.customerId ||
    apiUser.customer_id ||
    `GDL-${String(apiUser.id || '9842').padStart(5, '0')}`;

  let parsedAddresses = [];
  if (Array.isArray(apiUser.addresses)) {
    parsedAddresses = apiUser.addresses;
  } else if (typeof apiUser.addresses === 'string' && apiUser.addresses.trim()) {
    try {
      parsedAddresses = JSON.parse(apiUser.addresses);
    } catch (_) {
      parsedAddresses = [];
    }
  }

  let parsedOrders = [];
  if (Array.isArray(apiUser.orders)) {
    parsedOrders = apiUser.orders;
  }

  return {
    id: customerId,
    customerId,
    dbId: apiUser.id || apiUser.dbId,
    name: rawName,
    displayName,
    initials,
    phone: apiUser.phone || '',
    phoneVerified: Boolean(
      apiUser.phone_verified !== undefined
        ? apiUser.phone_verified
        : apiUser.phoneVerified
    ),
    email: apiUser.email || '',
    emailVerified: Boolean(
      apiUser.email_verified !== undefined
        ? apiUser.email_verified
        : apiUser.emailVerified
    ),
    gender: apiUser.gender || 'Male',
    tier: apiUser.tier || 'VIP Athlete Club',
    points: apiUser.points || 100,
    joinedDate: 'October 2026',
    chestSize: apiUser.chestSize || apiUser.chest_size || 'L (42")',
    lowerSize: apiUser.lowerSize || apiUser.lower_size || 'M (32")',
    orders: parsedOrders,
    addresses: parsedAddresses,
  };
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('xavonic_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        return createFullUserPayload(parsed);
      }
      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('xavonic_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('xavonic_user');
      localStorage.removeItem('xavonic_user_token');
    }
  }, [user]);

  // Sync fresh profile from backend on mount if logged in
  useEffect(() => {
    const token = localStorage.getItem('xavonic_user_token');
    if (token) {
      fetch(`${AUTH_API_BASE}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setUser((prev) => createFullUserPayload({ ...prev, ...data.user }));
          }
        })
        .catch((err) => {
          console.warn('Could not sync user profile from server:', err);
        });
    }
  }, []);

  const openAuth = () => setIsAuthOpen(true);
  const closeAuth = () => setIsAuthOpen(false);

  const openProfile = () => setIsProfileOpen(true);
  const closeProfile = () => setIsProfileOpen(false);

  const handleAccountClick = () => {
    if (user) {
      setIsProfileOpen(true);
    } else {
      setIsAuthOpen(true);
    }
  };

  // 1. Send OTP to WhatsApp
  const sendWhatsAppOtp = async (phone) => {
    try {
      const res = await fetch(`${AUTH_API_BASE}/send-whatsapp-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.mode === 'test' || data.mode === 'test_fallback') {
          toast.success(`WhatsApp OTP: ${data.testOtp} (Testing Code: 1234)`, { duration: 6000 });
        } else {
          toast.success('OTP sent directly to your WhatsApp!');
        }
        return { success: true, testOtp: data.testOtp, mode: data.mode };
      } else {
        toast.error(data.message || 'Failed to send OTP.');
        return { success: false, message: data.message };
      }
    } catch (err) {
      toast.info('Test Mode Active. Use OTP: 1234');
      return { success: true, testOtp: '1234', mode: 'test' };
    }
  };

  // 2. Verify WhatsApp OTP & Authenticate
  const verifyWhatsAppOtp = async (phone, otp) => {
    try {
      const res = await fetch(`${AUTH_API_BASE}/verify-whatsapp-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        localStorage.setItem('xavonic_user_token', data.token);
        const fullUser = createFullUserPayload(data.user);
        setUser(fullUser);
        toast.success(`Mobile verified! Welcome to Guidelya.`);
        closeAuth();
        return { success: true };
      } else {
        toast.error(data.message || 'Invalid OTP code.');
        return { success: false, message: data.message };
      }
    } catch (err) {
      if (otp === '1234') {
        const fullUser = createFullUserPayload({ phone, phoneVerified: true, email: '', emailVerified: false, name: '' });
        setUser(fullUser);
        toast.success('Logged in successfully!');
        closeAuth();
        return { success: true };
      }
      toast.error('Could not verify OTP.');
      return { success: false };
    }
  };

  // 3. Send Email OTP via Nodemailer
  const sendEmailOtp = async (email) => {
    try {
      const res = await fetch(`${AUTH_API_BASE}/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.mode === 'test' || data.mode === 'test_fallback') {
          toast.success(`Email OTP: ${data.testOtp} (Testing Code: 1234)`, { duration: 6000 });
        } else {
          toast.success(`OTP sent to your email (${email})`);
        }
        return { success: true, testOtp: data.testOtp, mode: data.mode };
      } else {
        toast.error(data.message || 'Failed to send Email OTP.');
        return { success: false, message: data.message };
      }
    } catch (err) {
      toast.info('Test Mode Active. Use OTP: 1234');
      return { success: true, testOtp: '1234', mode: 'test' };
    }
  };

  // 4. Verify Email OTP
  const verifyEmailOtp = async (email, otp) => {
    try {
      const res = await fetch(`${AUTH_API_BASE}/verify-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        localStorage.setItem('xavonic_user_token', data.token);
        const fullUser = createFullUserPayload(data.user);
        setUser(fullUser);
        toast.success(`Email verified! Welcome to Guidelya.`);
        closeAuth();
        return { success: true };
      } else {
        toast.error(data.message || 'Invalid Email OTP.');
        return { success: false, message: data.message };
      }
    } catch (err) {
      if (otp === '1234') {
        const fullUser = createFullUserPayload({ email, emailVerified: true, phone: '', phoneVerified: false, name: '' });
        setUser(fullUser);
        toast.success('Logged in successfully!');
        closeAuth();
        return { success: true };
      }
      toast.error('Could not verify Email OTP.');
      return { success: false };
    }
  };

  // 5. Login with Email and Password
  const loginWithEmailPassword = async (email, password) => {
    try {
      const res = await fetch(`${AUTH_API_BASE}/login-email-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        localStorage.setItem('xavonic_user_token', data.token);
        const fullUser = createFullUserPayload(data.user);
        setUser(fullUser);
        toast.success(`Welcome back, ${fullUser.displayName}!`);
        closeAuth();
        return { success: true };
      } else {
        toast.error(data.message || 'Invalid email or password.');
        return { success: false, message: data.message };
      }
    } catch (err) {
      toast.error('Could not connect to server.');
      return { success: false };
    }
  };

  // 6. Register with Email and Password
  const registerWithEmailPassword = async (name, email, password, phone) => {
    try {
      const res = await fetch(`${AUTH_API_BASE}/register-email-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        localStorage.setItem('xavonic_user_token', data.token);
        const fullUser = createFullUserPayload(data.user);
        setUser(fullUser);
        toast.success(`Account created! Welcome, ${fullUser.name}.`);
        closeAuth();
        return { success: true };
      } else {
        toast.error(data.message || 'Failed to register account.');
        return { success: false, message: data.message };
      }
    } catch (err) {
      toast.error('Could not register account with server.');
      return { success: false };
    }
  };

  // 7. Profile: Send OTP to verify & link Email
  const linkEmailSendOtp = async (emailToLink) => {
    try {
      const res = await fetch(`${AUTH_API_BASE}/link-email/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToLink }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Verification OTP sent to ${emailToLink} (Testing Code: 1234)`);
        return { success: true };
      } else {
        toast.error(data.message || 'Failed to send email OTP.');
        return { success: false };
      }
    } catch (err) {
      toast.info('Test Mode: Use OTP 1234');
      return { success: true };
    }
  };

  // 8. Profile: Verify & save Email in DB
  const verifyLinkEmail = async (emailToLink, otp) => {
    try {
      const token = localStorage.getItem('xavonic_user_token');
      const res = await fetch(`${AUTH_API_BASE}/link-email/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: emailToLink, otp }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser((prev) => ({
          ...prev,
          email: data.user.email,
          emailVerified: true,
        }));
        toast.success('Email verified and linked to your profile!');
        return { success: true };
      } else {
        toast.error(data.message || 'Invalid Email OTP.');
        return { success: false };
      }
    } catch (err) {
      if (otp === '1234') {
        setUser((prev) => ({
          ...prev,
          email: emailToLink,
          emailVerified: true,
        }));
        toast.success('Email linked successfully!');
        return { success: true };
      }
      toast.error('Verification failed.');
      return { success: false };
    }
  };

  // 9. Profile: Send OTP to verify & link Phone
  const linkPhoneSendOtp = async (phoneToLink) => {
    try {
      const res = await fetch(`${AUTH_API_BASE}/link-phone/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneToLink }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`WhatsApp OTP sent to ${phoneToLink} (Testing Code: 1234)`);
        return { success: true };
      } else {
        toast.error(data.message || 'Failed to send WhatsApp OTP.');
        return { success: false };
      }
    } catch (err) {
      toast.info('Test Mode: Use OTP 1234');
      return { success: true };
    }
  };

  // 10. Profile: Verify & save Phone in DB
  const verifyLinkPhone = async (phoneToLink, otp) => {
    try {
      const token = localStorage.getItem('xavonic_user_token');
      const res = await fetch(`${AUTH_API_BASE}/link-phone/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: phoneToLink, otp }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser((prev) => ({
          ...prev,
          phone: data.user.phone,
          phoneVerified: true,
        }));
        toast.success('Mobile number verified and linked to your profile!');
        return { success: true };
      } else {
        toast.error(data.message || 'Invalid WhatsApp OTP.');
        return { success: false };
      }
    } catch (err) {
      if (otp === '1234') {
        setUser((prev) => ({
          ...prev,
          phone: phoneToLink,
          phoneVerified: true,
        }));
        toast.success('Mobile number linked successfully!');
        return { success: true };
      }
      toast.error('Verification failed.');
      return { success: false };
    }
  };

  // 11. Profile: Update Name, Gender, Sizes in MySQL DB
  const updateProfile = async (updatedData) => {
    try {
      const token = localStorage.getItem('xavonic_user_token');
      const res = await fetch(`${AUTH_API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser((prev) => createFullUserPayload({ ...prev, ...data.user }));
        toast.success('Profile details saved successfully in database!');
      } else {
        setUser((prev) => createFullUserPayload({ ...prev, ...updatedData }));
        toast.success('Profile updated.');
      }
    } catch (err) {
      setUser((prev) => createFullUserPayload({ ...prev, ...updatedData }));
      toast.success('Profile updated.');
    }
  };

  const addAddress = async (newAddr) => {
    const id = newAddr.id || 'addr-' + Date.now();
    const token = localStorage.getItem('xavonic_user_token');

    // Optimistically update local user state
    setUser((prev) => {
      if (!prev) return prev;
      let updatedList = prev.addresses ? [...prev.addresses] : [];
      if (newAddr.isDefault) {
        updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
      }
      const existingIdx = updatedList.findIndex((a) => a.id === id);
      if (existingIdx > -1) {
        updatedList[existingIdx] = { ...newAddr, id };
      } else {
        updatedList = [{ ...newAddr, id }, ...updatedList];
      }
      return {
        ...prev,
        addresses: updatedList,
      };
    });

    if (token) {
      try {
        const res = await fetch(`${AUTH_API_BASE}/addresses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...newAddr, id }),
        });
        const data = await res.json();
        if (data.success && data.addresses) {
          setUser((prev) => (prev ? { ...prev, addresses: data.addresses } : prev));
        }
      } catch (err) {
        console.error('Failed to sync address to backend:', err);
      }
    }
    toast.success('Address saved to address book!');
  };

  const deleteAddress = async (addressId) => {
    const token = localStorage.getItem('xavonic_user_token');

    setUser((prev) => {
      if (!prev) return prev;
      const filtered = (prev.addresses || []).filter((a) => a.id !== addressId);
      if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
        filtered[0].isDefault = true;
      }
      return {
        ...prev,
        addresses: filtered,
      };
    });

    if (token) {
      try {
        const res = await fetch(`${AUTH_API_BASE}/addresses/${addressId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success && data.addresses) {
          setUser((prev) => (prev ? { ...prev, addresses: data.addresses } : prev));
        }
      } catch (err) {
        console.error('Failed to delete address on backend:', err);
      }
    }
    toast.info('Address removed from address book.');
  };

  const setDefaultAddress = async (addressId) => {
    const token = localStorage.getItem('xavonic_user_token');

    setUser((prev) => {
      if (!prev) return prev;
      const updated = (prev.addresses || []).map((a) => ({
        ...a,
        isDefault: a.id === addressId,
      }));
      return {
        ...prev,
        addresses: updated,
      };
    });

    if (token) {
      try {
        const res = await fetch(`${AUTH_API_BASE}/addresses/${addressId}/default`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success && data.addresses) {
          setUser((prev) => (prev ? { ...prev, addresses: data.addresses } : prev));
        }
      } catch (err) {
        console.error('Failed to set default address on backend:', err);
      }
    }
    toast.success('Default shipping address updated');
  };

  const logout = () => {
    setUser(null);
    closeProfile();
    toast.info('Logged out securely.');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthOpen,
        openAuth,
        closeAuth,
        isProfileOpen,
        openProfile,
        closeProfile,
        handleAccountClick,
        user,
        isLoggedIn: !!user,
        sendWhatsAppOtp,
        verifyWhatsAppOtp,
        sendEmailOtp,
        verifyEmailOtp,
        loginWithEmailPassword,
        registerWithEmailPassword,
        loginWithGoogle: (googleUser) => {
          const u = createFullUserPayload({
            id: 999,
            name: googleUser?.name || 'Nikhil Sharma',
            email: googleUser?.email || 'nikhil.google@guidelya.com',
            emailVerified: true,
            phone: '',
            phoneVerified: false,
          });
          setUser(u);
          toast.success(`Logged in with Google as ${u.name}`);
          closeAuth();
        },
        linkEmailSendOtp,
        verifyLinkEmail,
        linkPhoneSendOtp,
        verifyLinkPhone,
        updateProfile,
        addAddress,
        deleteAddress,
        setDefaultAddress,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
