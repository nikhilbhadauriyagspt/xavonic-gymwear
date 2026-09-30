import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

import spotlightFront from '../assets/spotlight_front.jpg';
import catShorts from '../assets/cat_shorts.jpg';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false); // Center login modal
  const [isProfileOpen, setIsProfileOpen] = useState(false); // Right slide-over profile drawer
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('xavonic_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('xavonic_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('xavonic_user');
    }
  }, [user]);

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

  const loginWithPhone = (phone, name = 'Nikhil Sharma') => {
    const initials = name
      ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : 'NS';

    const newUser = {
      id: 'ATH-9842',
      name: name || 'Nikhil Sharma',
      initials: initials || 'NS',
      phone: phone,
      email: 'nikhil@athlete.xavonic.com',
      gender: 'Male',
      tier: 'VIP Athlete Club',
      points: 850,
      joinedDate: 'October 2026',
      chestSize: 'L (42")',
      lowerSize: 'M (32")',
      orders: [
        {
          id: 'ORD-98214',
          date: 'Yesterday, 4:20 PM',
          status: 'In Transit',
          statusColor: 'text-amber-600 bg-amber-50 border-amber-200',
          step: 2, // 1: Confirmed, 2: Shipped, 3: Out for delivery, 4: Delivered
          estimatedDelivery: 'Tomorrow by 2:00 PM',
          items: [
            {
              title: 'Acid Wash Heavyweight Oversized Tee',
              size: 'L',
              color: 'Washed Onyx',
              quantity: 1,
              price: '₹1,499',
              image: spotlightFront
            }
          ],
          subtotal: '₹1,499',
          shipping: 'FREE',
          total: '₹1,499',
          paymentMethod: 'UPI (Prepaid - Verified)',
          trackingNumber: 'BLUEDART-882190',
          shippingAddress: 'Plot 42, Sector 18, Cyber City, Gurugram, Haryana - 122002'
        },
        {
          id: 'ORD-77102',
          date: '12 Sep 2026',
          status: 'Delivered',
          statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
          step: 4,
          estimatedDelivery: 'Delivered on 14 Sep 2026',
          items: [
            {
              title: '5" Tactical Inseam Gym Shorts',
              size: 'M',
              color: 'Stealth Black',
              quantity: 2,
              price: '₹1,099',
              image: catShorts
            }
          ],
          subtotal: '₹2,198',
          shipping: 'FREE',
          total: '₹2,198',
          paymentMethod: 'Cash on Delivery (COD)',
          trackingNumber: 'DELHIVERY-441029',
          shippingAddress: 'Plot 42, Sector 18, Cyber City, Gurugram, Haryana - 122002'
        }
      ],
      addresses: [
        {
          id: 'addr-1',
          type: 'Home (Default)',
          name: 'Nikhil Sharma',
          addressLine: 'Plot 42, Sector 18, Cyber City',
          city: 'Gurugram',
          pincode: '122002',
          state: 'Haryana',
          phone: phone,
          isDefault: true
        },
        {
          id: 'addr-2',
          type: 'Gym Locker Address',
          name: 'Nikhil Sharma (Cult Gym)',
          addressLine: 'Club House, Sector 54, Golf Course Rd',
          city: 'Gurugram',
          pincode: '122011',
          state: 'Haryana',
          phone: phone,
          isDefault: false
        }
      ]
    };
    setUser(newUser);
    toast.success(`Welcome back, ${newUser.name}! Athlete portal unlocked.`);
    closeAuth();
  };

  const loginWithEmail = (email, password) => {
    const defaultName = email.split('@')[0] || 'Nikhil Sharma';
    loginWithPhone('+91 98765 43210', defaultName);
  };

  const updateProfile = (updatedData) => {
    setUser((prev) => {
      if (!prev) return prev;
      const initials = updatedData.name
        ? updatedData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : prev.initials;
      return {
        ...prev,
        ...updatedData,
        initials
      };
    });
    toast.success('Profile details saved successfully!');
  };

  const addAddress = (newAddr) => {
    setUser((prev) => {
      if (!prev) return prev;
      const id = 'addr-' + Date.now();
      const updatedList = prev.addresses ? [...prev.addresses] : [];
      if (newAddr.isDefault) {
        updatedList.forEach(a => a.isDefault = false);
      }
      return {
        ...prev,
        addresses: [{ ...newAddr, id }, ...updatedList]
      };
    });
    toast.success('New address added successfully!');
  };

  const deleteAddress = (addressId) => {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        addresses: prev.addresses.filter(a => a.id !== addressId)
      };
    });
    toast.info('Address removed');
  };

  const setDefaultAddress = (addressId) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = prev.addresses.map(a => ({
        ...a,
        isDefault: a.id === addressId
      }));
      return {
        ...prev,
        addresses: updated
      };
    });
    toast.success('Default delivery address updated');
  };

  const logout = () => {
    setUser(null);
    closeProfile();
    toast.info('Logged out securely. See you on the next workout!');
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
        loginWithPhone,
        loginWithEmail,
        updateProfile,
        addAddress,
        deleteAddress,
        setDefaultAddress,
        logout
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
