import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Mail,
  Shield,
  Zap,
  Send,
  Save,
  Key,
  Smartphone,
  Layers,
  Image as ImageIcon,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
  Server,
  Lock,
  MapPin,
  Navigation,
  Truck,
  CheckCircle2,
  Box,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { ADMIN_API_BASE } from '../../config/api';

export default function GatewaySettingsTab() {
  const [activeSubTab, setActiveSubTab] = useState('whatsapp'); // 'whatsapp' | 'email' | 'cloudinary' | 'maps' | 'logistics'

  // WhatsApp Config State
  const [waConfig, setWaConfig] = useState({
    mode: 'test',
    meta_token: '',
    phone_number_id: '',
    waba_id: '',
    template_name: 'guidelya_otp_auth',
  });

  // Nodemailer SMTP Email Config State
  const [smtpConfig, setSmtpConfig] = useState({
    mode: 'test',
    host: 'smtp.gmail.com',
    port: '465',
    secure: 'true',
    user: '',
    pass: '',
    sender_name: 'Guidelya Athletics',
  });

  // Cloudinary Storage Config State
  const [cloudinaryConfig, setCloudinaryConfig] = useState({
    cloud_name: 'fwlidd7t',
    api_key: '887531852538712',
    api_secret: 'lkB-KXtVa7j9Zi8pzhTn1VhT5xU',
  });

  // Google Maps & Geocoding Config State
  const [mapsConfig, setMapsConfig] = useState({
    api_key: 'AIzaSyAWnFjD1hsIsyYB7nQs_fAUd2BVuziu0xE',
    enable_places_autocomplete: true,
    enable_gps_geocoding: true,
  });

  // Courier & Logistics Config State (Shiprocket / NimbusPost / Manual)
  const [logisticsConfig, setLogisticsConfig] = useState({
    default_gateway: 'shiprocket', // 'shiprocket' | 'nimbuspost' | 'manual'
    shiprocket_mode: 'test',
    shiprocket_email: '',
    shiprocket_password: '',
    shiprocket_pickup_location: 'Primary',
    nimbuspost_mode: 'test',
    nimbuspost_email: '',
    nimbuspost_token: '',
    nimbuspost_warehouse_id: '',
    default_courier_partner: 'Bluedart Express',
    default_estimated_days: '2-4 Business Days',
    auto_send_whatsapp: 'true',
    auto_send_email: 'true',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingShiprocket, setIsTestingShiprocket] = useState(false);
  const [isTestingNimbus, setIsTestingNimbus] = useState(false);
  const [showWaToken, setShowWaToken] = useState(false);
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [showCloudSecret, setShowCloudSecret] = useState(false);
  const [showMapsKey, setShowMapsKey] = useState(false);
  const [showShiprocketPass, setShowShiprocketPass] = useState(false);
  const [showNimbusToken, setShowNimbusToken] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testEmail, setTestEmail] = useState('');

  // Fetch all gateway configurations from MySQL DB
  useEffect(() => {
    fetchAllConfigs();
  }, []);

  const fetchAllConfigs = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('xavonic_admin_token');

      const [waRes, smtpRes, cloudRes, mapsRes, logRes] = await Promise.all([
        fetch(`${ADMIN_API_BASE}/settings/whatsapp`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${ADMIN_API_BASE}/settings/smtp`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${ADMIN_API_BASE}/settings/cloudinary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${ADMIN_API_BASE}/settings/maps`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${ADMIN_API_BASE}/settings/logistics`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const waData = await waRes.json();
      const smtpData = await smtpRes.json();
      const cloudData = await cloudRes.json();
      const mapsData = await mapsRes.json();
      const logData = await logRes.json();

      if (waData.success && waData.config) setWaConfig(waData.config);
      if (smtpData.success && smtpData.config) setSmtpConfig(smtpData.config);
      if (cloudData.success && cloudData.config) setCloudinaryConfig(cloudData.config);
      if (mapsData.success && mapsData.config) setMapsConfig(mapsData.config);
      if (logData.success && logData.config) setLogisticsConfig((prev) => ({ ...prev, ...logData.config }));
    } catch (err) {
      console.warn('Failed to fetch gateway configs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMaps = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const token = localStorage.getItem('xavonic_admin_token');
      const res = await fetch(`${ADMIN_API_BASE}/settings/maps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(mapsConfig),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Google Maps API & Geolocation settings saved to MySQL database!');
      } else {
        toast.error(data.message || 'Failed to save Google Maps settings.');
      }
    } catch (err) {
      toast.error('Could not connect to backend server.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCloudinary = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const token = localStorage.getItem('xavonic_admin_token');
      const res = await fetch(`${ADMIN_API_BASE}/settings/cloudinary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cloudinaryConfig),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Cloudinary storage credentials saved to MySQL database!');
      } else {
        toast.error(data.message || 'Failed to save Cloudinary settings.');
      }
    } catch (err) {
      toast.error('Could not connect to backend server.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save WhatsApp Config
  const handleSaveWhatsApp = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const token = localStorage.getItem('xavonic_admin_token');
      const res = await fetch(`${ADMIN_API_BASE}/settings/whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(waConfig),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('WhatsApp Gateway settings saved to MySQL database!');
      } else {
        toast.error(data.message || 'Failed to save settings.');
      }
    } catch (err) {
      toast.error('Could not connect to backend server.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save SMTP Email Config
  const handleSaveSmtp = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const token = localStorage.getItem('xavonic_admin_token');
      const res = await fetch(`${ADMIN_API_BASE}/settings/smtp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(smtpConfig),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Nodemailer SMTP Email settings saved to MySQL database!');
      } else {
        toast.error(data.message || 'Failed to save SMTP settings.');
      }
    } catch (err) {
      toast.error('Could not connect to backend server.');
    } finally {
      setIsSaving(false);
    }
  };

  // Send Test WhatsApp Message
  const handleSendTestWhatsApp = async () => {
    if (!testPhone || testPhone.replace(/[^0-9]/g, '').length < 10) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setIsTesting(true);
      const token = localStorage.getItem('xavonic_admin_token');
      const res = await fetch(`${ADMIN_API_BASE}/settings/whatsapp/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ test_phone: testPhone }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Test OTP dispatched to +${testPhone}!`);
      } else {
        toast.error(data.message || 'Test message failed.');
      }
    } catch (err) {
      toast.error('Failed to trigger test message.');
    } finally {
      setIsTesting(false);
    }
  };

  // Send Test Email Message via Nodemailer
  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    try {
      setIsTesting(true);
      const token = localStorage.getItem('xavonic_admin_token');
      const res = await fetch(`${ADMIN_API_BASE}/settings/smtp/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ test_email: testEmail }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Test email dispatched to ${testEmail}!`);
      } else {
        toast.error(data.message || 'Test email failed.');
      }
    } catch (err) {
      toast.error('Failed to trigger test email.');
    } finally {
      setIsTesting(false);
    }
  };

  // Save Courier & Logistics Config
  const handleSaveLogistics = async (e) => {
    e?.preventDefault?.();
    try {
      setIsSaving(true);
      const token = localStorage.getItem('xavonic_admin_token');
      const res = await fetch(`${ADMIN_API_BASE}/settings/logistics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(logisticsConfig),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Courier & Logistics settings saved to MySQL database!');
      } else {
        toast.error(data.message || 'Failed to save logistics settings.');
      }
    } catch (err) {
      toast.error('Could not connect to backend server.');
    } finally {
      setIsSaving(false);
    }
  };

  // Test Shiprocket Connection
  const handleTestShiprocket = async () => {
    if (!logisticsConfig.shiprocket_email || !logisticsConfig.shiprocket_password) {
      toast.error('Please enter Shiprocket API Email and API Password.');
      return;
    }
    try {
      setIsTestingShiprocket(true);
      const token = localStorage.getItem('xavonic_admin_token');
      const res = await fetch(`${ADMIN_API_BASE}/settings/logistics/test-shiprocket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: logisticsConfig.shiprocket_email,
          password: logisticsConfig.shiprocket_password,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Shiprocket API connected successfully!');
      } else {
        toast.error(data.message || 'Shiprocket test failed.');
      }
    } catch (err) {
      toast.error('Failed to test Shiprocket connection.');
    } finally {
      setIsTestingShiprocket(false);
    }
  };

  // Test NimbusPost Connection
  const handleTestNimbusPost = async () => {
    if (!logisticsConfig.nimbuspost_email || !logisticsConfig.nimbuspost_token) {
      toast.error('Please enter NimbusPost API Email and Secret Token.');
      return;
    }
    try {
      setIsTestingNimbus(true);
      const token = localStorage.getItem('xavonic_admin_token');
      const res = await fetch(`${ADMIN_API_BASE}/settings/logistics/test-nimbuspost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: logisticsConfig.nimbuspost_email,
          token: logisticsConfig.nimbuspost_token,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'NimbusPost API connected successfully!');
      } else {
        toast.error(data.message || 'NimbusPost test failed.');
      }
    } catch (err) {
      toast.error('Failed to test NimbusPost connection.');
    } finally {
      setIsTestingNimbus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-12 bg-white border border-neutral-200 rounded-sm text-center">
        <RefreshCw className="h-5 w-5 animate-spin mx-auto text-neutral-400" />
        <span className="text-xs text-neutral-500 mt-2 block">Loading Gateway Configurations...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900 uppercase tracking-tight">
            Authentication Gateways & API Settings
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure WhatsApp, Email, Cloudinary, Maps, and Courier Logistics (Shiprocket/NimbusPost)
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center flex-wrap gap-1 p-0.5 bg-neutral-100 rounded-sm border border-neutral-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveSubTab('whatsapp')}
            className={`px-3 py-1.5 font-medium rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'whatsapp'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
            <span>WhatsApp Gateway</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('email')}
            className={`px-3 py-1.5 font-medium rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'email'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Mail className="h-3.5 w-3.5 text-red-600" />
            <span>Email (SMTP)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('cloudinary')}
            className={`px-3 py-1.5 font-medium rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'cloudinary'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-sky-600" />
            <span>Cloudinary CDN</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('maps')}
            className={`px-3 py-1.5 font-medium rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'maps'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <MapPin className="h-3.5 w-3.5 text-amber-600" />
            <span>Google Maps</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('logistics')}
            className={`px-3 py-1.5 font-medium rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'logistics'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Truck className="h-3.5 w-3.5 text-indigo-600" />
            <span>Courier & Delivery</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. WHATSAPP GATEWAY CONFIGURATION TAB                   */}
      {/* ======================================================== */}
      {activeSubTab === 'whatsapp' && (
        <div className="space-y-4">
          
          {/* Status Bar */}
          <div className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-sm text-xs">
            <div className="flex items-center gap-2">
              <span className="text-neutral-600">Current Status:</span>
              {waConfig.mode === 'live' ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Meta Cloud API Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-xs border border-amber-200">
                  <Zap className="h-3 w-3" />
                  Test Mode Active (Testing OTP: 1234)
                </span>
              )}
            </div>

            <span className="text-[11px] text-neutral-400">Target DB: MySQL `store_settings`</span>
          </div>

          <form onSubmit={handleSaveWhatsApp} className="space-y-4">
            
            {/* Mode Selector */}
            <div className="bg-white border border-neutral-200 rounded-sm p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-neutral-700" />
                Select Gateway Mode
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setWaConfig({ ...waConfig, mode: 'test' })}
                  className={`p-3 border rounded-sm cursor-pointer transition-all ${
                    waConfig.mode === 'test'
                      ? 'border-neutral-900 bg-neutral-50/70 ring-1 ring-neutral-900'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-900">Testing Mode (Fixed OTP: 1234)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-xs bg-neutral-200 text-neutral-800 font-medium">Default</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">Instant simulated delivery. 0 external API cost for development.</p>
                </div>

                <div
                  onClick={() => setWaConfig({ ...waConfig, mode: 'live' })}
                  className={`p-3 border rounded-sm cursor-pointer transition-all ${
                    waConfig.mode === 'live'
                      ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-900">Live Meta WhatsApp Cloud API</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-xs bg-emerald-100 text-emerald-800 font-medium">Live</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">Dispatches official messages to customer WhatsApp phones via Meta.</p>
                </div>
              </div>
            </div>

            {/* Meta Credentials Form */}
            <div className="bg-white border border-neutral-200 rounded-sm p-4 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-neutral-700" />
                    Meta Cloud API Credentials
                  </h3>
                </div>
                <a
                  href="https://developers.facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-red-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>developers.facebook.com</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="md:col-span-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-medium uppercase text-neutral-700">Meta Access Token</label>
                    <button
                      type="button"
                      onClick={() => setShowWaToken(!showWaToken)}
                      className="text-[10px] text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
                    >
                      {showWaToken ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      <span>{showWaToken ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <input
                    type={showWaToken ? 'text' : 'password'}
                    value={waConfig.meta_token}
                    onChange={(e) => setWaConfig({ ...waConfig, meta_token: e.target.value })}
                    placeholder="EAAOx..."
                    className="w-full h-8.5 bg-neutral-50 focus:bg-white border border-neutral-200 rounded-sm px-3 text-xs text-neutral-900 font-mono outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-medium uppercase text-neutral-700">Phone Number ID</label>
                  <input
                    type="text"
                    value={waConfig.phone_number_id}
                    onChange={(e) => setWaConfig({ ...waConfig, phone_number_id: e.target.value })}
                    placeholder="e.g. 105928374829104"
                    className="w-full h-8.5 bg-neutral-50 focus:bg-white border border-neutral-200 rounded-sm px-3 text-xs text-neutral-900 font-mono outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-medium uppercase text-neutral-700">WhatsApp Business Account ID</label>
                  <input
                    type="text"
                    value={waConfig.waba_id}
                    onChange={(e) => setWaConfig({ ...waConfig, waba_id: e.target.value })}
                    placeholder="e.g. 108492019481023"
                    className="w-full h-8.5 bg-neutral-50 focus:bg-white border border-neutral-200 rounded-sm px-3 text-xs text-neutral-900 font-mono outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-red-600 text-white text-xs font-medium uppercase tracking-wider rounded-sm transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  <span>Save WhatsApp Settings</span>
                </button>
              </div>
            </div>

          </form>

          {/* Test WhatsApp Dispatcher */}
          <div className="bg-white border border-neutral-200 rounded-sm p-4 space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
              <Send className="h-3.5 w-3.5 text-neutral-700" />
              Test WhatsApp Dispatcher
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-2 max-w-md">
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                className="w-full h-8.5 bg-neutral-50 border border-neutral-200 rounded-sm px-3 text-xs text-neutral-900 outline-none font-mono"
              />
              <button
                type="button"
                onClick={handleSendTestWhatsApp}
                disabled={isTesting}
                className="w-full sm:w-auto shrink-0 h-8.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-sm transition-colors cursor-pointer disabled:opacity-60"
              >
                {isTesting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <span>Send Test WhatsApp</span>}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 2. NODEMAILER SMTP EMAIL GATEWAY CONFIGURATION TAB       */}
      {/* ======================================================== */}
      {activeSubTab === 'email' && (
        <div className="space-y-4">
          
          {/* Status Bar */}
          <div className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-sm text-xs">
            <div className="flex items-center gap-2">
              <span className="text-neutral-600">Email Gateway Status:</span>
              {smtpConfig.mode === 'live' ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live SMTP Delivery Active ({smtpConfig.user || 'Configured'})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-xs border border-amber-200">
                  <Zap className="h-3 w-3" />
                  Test Mode Active (Testing OTP: 1234)
                </span>
              )}
            </div>

            <span className="text-[11px] text-neutral-400">Powered by Nodemailer</span>
          </div>

          <form onSubmit={handleSaveSmtp} className="space-y-4">
            
            {/* Mode Selector */}
            <div className="bg-white border border-neutral-200 rounded-sm p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-neutral-700" />
                Select Email Delivery Mode
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setSmtpConfig({ ...smtpConfig, mode: 'test' })}
                  className={`p-3 border rounded-sm cursor-pointer transition-all ${
                    smtpConfig.mode === 'test'
                      ? 'border-neutral-900 bg-neutral-50/70 ring-1 ring-neutral-900'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-900">Testing Mode (Fixed OTP: 1234)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-xs bg-neutral-200 text-neutral-800 font-medium">Default</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">Simulates email delivery instantly without sending external emails.</p>
                </div>

                <div
                  onClick={() => setSmtpConfig({ ...smtpConfig, mode: 'live' })}
                  className={`p-3 border rounded-sm cursor-pointer transition-all ${
                    smtpConfig.mode === 'live'
                      ? 'border-red-600 bg-red-50/30 ring-1 ring-red-600'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-900">Live SMTP Server (Nodemailer)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-xs bg-red-100 text-red-800 font-medium">Production</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">Sends real HTML emails to customer inboxes via Gmail, Hostinger, or SMTP.</p>
                </div>
              </div>
            </div>

            {/* SMTP Server Credentials */}
            <div className="bg-white border border-neutral-200 rounded-sm p-4 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                    <Server className="h-3.5 w-3.5 text-neutral-700" />
                    SMTP Server & Mailer Configuration
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    For Gmail, use an <strong>App Password</strong> (from Google Account Security → 2-Step Verification)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                
                {/* SMTP Host */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium uppercase text-neutral-700">SMTP Host Server</label>
                  <input
                    type="text"
                    required
                    value={smtpConfig.host}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                    placeholder="smtp.gmail.com"
                    className="w-full h-8.5 bg-neutral-50 focus:bg-white border border-neutral-200 rounded-sm px-3 text-xs text-neutral-900 font-mono outline-none"
                  />
                </div>

                {/* SMTP Port */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium uppercase text-neutral-700">Port Number</label>
                  <select
                    value={smtpConfig.port}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                    className="w-full h-8.5 bg-neutral-50 focus:bg-white border border-neutral-200 rounded-sm px-3 text-xs text-neutral-900 outline-none"
                  >
                    <option value="465">465 (SSL - Recommended for Gmail/Hostinger)</option>
                    <option value="587">587 (TLS)</option>
                    <option value="25">25</option>
                  </select>
                </div>

                {/* Sender Email / User */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium uppercase text-neutral-700">Sender Email / SMTP User</label>
                  <input
                    type="email"
                    value={smtpConfig.user}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                    placeholder="support@guidelya.com or yourname@gmail.com"
                    className="w-full h-8.5 bg-neutral-50 focus:bg-white border border-neutral-200 rounded-sm px-3 text-xs text-neutral-900 outline-none"
                  />
                </div>

                {/* SMTP Password / App Password */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-medium uppercase text-neutral-700">SMTP Password / App Password</label>
                    <button
                      type="button"
                      onClick={() => setShowSmtpPass(!showSmtpPass)}
                      className="text-[10px] text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
                    >
                      {showSmtpPass ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      <span>{showSmtpPass ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <input
                    type={showSmtpPass ? 'text' : 'password'}
                    value={smtpConfig.pass}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
                    placeholder="Enter 16-character App Password"
                    className="w-full h-8.5 bg-neutral-50 focus:bg-white border border-neutral-200 rounded-sm px-3 text-xs text-neutral-900 font-mono outline-none"
                  />
                </div>

                {/* Sender Name */}
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-[11px] font-medium uppercase text-neutral-700">Display Sender Name</label>
                  <input
                    type="text"
                    value={smtpConfig.sender_name}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, sender_name: e.target.value })}
                    placeholder="Guidelya Athletics"
                    className="w-full h-8.5 bg-neutral-50 focus:bg-white border border-neutral-200 rounded-sm px-3 text-xs text-neutral-900 outline-none"
                  />
                </div>

              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-red-600 text-white text-xs font-medium uppercase tracking-wider rounded-sm transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  <span>Save SMTP Configuration</span>
                </button>
              </div>
            </div>

          </form>

          {/* Test Email Dispatcher */}
          <div className="bg-white border border-neutral-200 rounded-sm p-4 space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
              <Send className="h-3.5 w-3.5 text-neutral-700" />
              Test Email Dispatcher
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-2 max-w-md">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter test recipient email address"
                className="w-full h-8.5 bg-neutral-50 border border-neutral-200 rounded-sm px-3 text-xs text-neutral-900 outline-none"
              />
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isTesting}
                className="w-full sm:w-auto shrink-0 h-8.5 px-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-sm transition-colors cursor-pointer disabled:opacity-60"
              >
                {isTesting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <span>Send Test Email</span>}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 3. CLOUDINARY CDN IMAGE STORAGE CONFIGURATION TAB        */}
      {/* ======================================================== */}
      {activeSubTab === 'cloudinary' && (
        <form onSubmit={handleSaveCloudinary} className="space-y-4">
          <div className="bg-white border border-neutral-200 rounded-sm p-5 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xs bg-sky-50 text-sky-700">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                    Cloudinary CDN Image Storage Credentials
                  </h2>
                  <p className="text-[11px] text-neutral-500">
                    Direct high-speed image uploads and automatic WebP/AVIF compression
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-xs border border-sky-200">
                <Shield className="h-3 w-3" />
                Active Storage
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              
              {/* Cloud Name */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium uppercase text-neutral-700">
                  Cloud Name *
                </label>
                <input
                  type="text"
                  required
                  value={cloudinaryConfig.cloud_name}
                  onChange={(e) => setCloudinaryConfig({ ...cloudinaryConfig, cloud_name: e.target.value })}
                  placeholder="e.g. fwlidd7t"
                  className="w-full h-8.5 bg-neutral-50 focus:bg-white border border-neutral-200 rounded-sm px-3 text-xs text-neutral-900 font-mono outline-none"
                />
              </div>

              {/* API Key */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium uppercase text-neutral-700">
                  API Key *
                </label>
                <input
                  type="text"
                  required
                  value={cloudinaryConfig.api_key}
                  onChange={(e) => setCloudinaryConfig({ ...cloudinaryConfig, api_key: e.target.value })}
                  placeholder="e.g. 887531852538712"
                  className="w-full h-8.5 bg-neutral-50 focus:bg-white border border-neutral-200 rounded-sm px-3 text-xs text-neutral-900 font-mono outline-none"
                />
              </div>

              {/* API Secret */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-medium uppercase text-neutral-700">
                    API Secret *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCloudSecret(!showCloudSecret)}
                    className="text-[10px] text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
                  >
                    {showCloudSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    <span>{showCloudSecret ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <input
                  type={showCloudSecret ? 'text' : 'password'}
                  required
                  value={cloudinaryConfig.api_secret}
                  onChange={(e) => setCloudinaryConfig({ ...cloudinaryConfig, api_secret: e.target.value })}
                  placeholder="Enter API Secret"
                  className="w-full h-8.5 bg-neutral-50 focus:bg-white border border-neutral-200 rounded-sm px-3 text-xs text-neutral-900 font-mono outline-none"
                />
              </div>

            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-red-600 text-white text-xs font-medium uppercase tracking-wider rounded-sm transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>Save Cloudinary Settings</span>
              </button>
            </div>

          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* 4. GOOGLE MAPS & GEOLOCATION API CONFIGURATION TAB      */}
      {/* ======================================================== */}
      {activeSubTab === 'maps' && (
        <form onSubmit={handleSaveMaps} className="space-y-4">
          <div className="bg-white border border-neutral-200 rounded-sm p-4 sm:p-5 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-sm bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold uppercase text-neutral-900 tracking-wider">
                    Google Maps Platform & Places Autocomplete
                  </h2>
                  <p className="text-[11px] text-neutral-500">
                    Powers live GPS auto-detect, customer address autocomplete, and exact delivery coordinates
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200">
                <Shield className="h-3 w-3" />
                Active Key Loaded
              </span>
            </div>

            <div className="space-y-3.5">
              
              {/* Google Maps API Key */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-medium uppercase text-neutral-700">
                    Google Maps API Key (Places & Geocoding) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMapsKey(!showMapsKey)}
                    className="text-[10px] text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
                  >
                    {showMapsKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    <span>{showMapsKey ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <input
                  type={showMapsKey ? 'text' : 'password'}
                  required
                  value={mapsConfig.api_key}
                  onChange={(e) => setMapsConfig({ ...mapsConfig, api_key: e.target.value })}
                  placeholder="AIzaSyAWnFjD1hsIsyYB7nQs_fAUd2BVuziu0xE"
                  className="w-full h-8.5 bg-neutral-50 focus:bg-white border border-neutral-200 rounded-sm px-3 text-xs text-neutral-900 font-mono outline-none"
                />
                <p className="text-[10px] text-neutral-400">
                  You can change this API key anytime in the future. It will instantly update across checkout.
                </p>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-sm cursor-pointer hover:bg-neutral-100">
                  <input
                    type="checkbox"
                    checked={mapsConfig.enable_places_autocomplete}
                    onChange={(e) => setMapsConfig({ ...mapsConfig, enable_places_autocomplete: e.target.checked })}
                    className="accent-neutral-900 h-4 w-4"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-neutral-900 block">Google Places Autocomplete</span>
                    <span className="text-[11px] text-neutral-500">Auto-suggest street, colony, and area as user types</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-sm cursor-pointer hover:bg-neutral-100">
                  <input
                    type="checkbox"
                    checked={mapsConfig.enable_gps_geocoding}
                    onChange={(e) => setMapsConfig({ ...mapsConfig, enable_gps_geocoding: e.target.checked })}
                    className="accent-neutral-900 h-4 w-4"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-neutral-900 block">High-Accuracy GPS Auto-Detection</span>
                    <span className="text-[11px] text-neutral-500">Allow customers to 1-click fill city, state, and pin code</span>
                  </div>
                </label>
              </div>

            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-red-600 text-white text-xs font-medium uppercase tracking-wider rounded-sm transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>Save Google Maps Settings</span>
              </button>
            </div>

          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* 5. COURIER & LOGISTICS DELIVERY GATEWAY TAB (NEW)        */}
      {/* ======================================================== */}
      {activeSubTab === 'logistics' && (
        <form onSubmit={handleSaveLogistics} className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-sm p-4 sm:p-6 space-y-6 shadow-xs">
            
            {/* Top Heading */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
                      Logistics & Courier Delivery Gateway
                    </h2>
                    <span className="text-[10px] px-2 py-0.5 font-semibold bg-indigo-100 text-indigo-800 rounded-full">
                      Shiprocket • NimbusPost • Manual
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Connect shipping aggregators for 1-click AWB generation, label printing, and automated tracking alerts.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 font-medium">Default Mode:</span>
                <span className="px-2.5 py-1 text-xs font-semibold bg-neutral-900 text-white rounded-sm uppercase tracking-wider">
                  {logisticsConfig.default_gateway}
                </span>
              </div>
            </div>

            {/* 1. Default Courier Gateway Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block">
                Select Default Shipping Partner
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Shiprocket Option */}
                <label
                  onClick={() => setLogisticsConfig({ ...logisticsConfig, default_gateway: 'shiprocket' })}
                  className={`p-4 border rounded-sm cursor-pointer transition-all ${
                    logisticsConfig.default_gateway === 'shiprocket'
                      ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-600 flex items-center justify-center">
                        {logisticsConfig.default_gateway === 'shiprocket' && (
                          <div className="w-2 h-2 rounded-full bg-indigo-600" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-neutral-900">Shiprocket API</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 font-medium bg-emerald-100 text-emerald-800 rounded-xs">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-2">
                    India's most popular D2C aggregator with automated WhatsApp tracking & courier allocation.
                  </p>
                </label>

                {/* NimbusPost Option */}
                <label
                  onClick={() => setLogisticsConfig({ ...logisticsConfig, default_gateway: 'nimbuspost' })}
                  className={`p-4 border rounded-sm cursor-pointer transition-all ${
                    logisticsConfig.default_gateway === 'nimbuspost'
                      ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-600 flex items-center justify-center">
                        {logisticsConfig.default_gateway === 'nimbuspost' && (
                          <div className="w-2 h-2 rounded-full bg-indigo-600" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-neutral-900">NimbusPost API</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 font-medium bg-blue-100 text-blue-800 rounded-xs">
                      Lowest Rates
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-2">
                    Ultra low shipping rates starting ₹21/500g with 15+ integrated courier partners.
                  </p>
                </label>

                {/* Manual Option */}
                <label
                  onClick={() => setLogisticsConfig({ ...logisticsConfig, default_gateway: 'manual' })}
                  className={`p-4 border rounded-sm cursor-pointer transition-all ${
                    logisticsConfig.default_gateway === 'manual'
                      ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-600 flex items-center justify-center">
                        {logisticsConfig.default_gateway === 'manual' && (
                          <div className="w-2 h-2 rounded-full bg-indigo-600" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-neutral-900">Manual Courier</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 font-medium bg-neutral-100 text-neutral-700 rounded-xs">
                      Self Delivery
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-2">
                    Enter any courier partner (Bluedart, Delhivery, DTDC, Speed Post) and tracking ID manually.
                  </p>
                </label>

              </div>
            </div>

            {/* 2. SHIPROCKET API CREDENTIALS CARD */}
            <div className="p-4 sm:p-5 bg-neutral-50 border border-neutral-200 rounded-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                    1. Shiprocket API Credentials
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestShiprocket}
                    disabled={isTestingShiprocket}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-neutral-100 border border-neutral-300 text-xs font-medium text-neutral-800 rounded-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isTestingShiprocket ? <RefreshCw className="h-3 w-3 animate-spin text-indigo-600" /> : <Zap className="h-3 w-3 text-amber-500" />}
                    <span>Test Shiprocket Connection</span>
                  </button>
                  <a
                    href="https://app.shiprocket.in/api-user"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>Get API Key</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Shiprocket Mode */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                    Environment Mode
                  </label>
                  <select
                    value={logisticsConfig.shiprocket_mode}
                    onChange={(e) => setLogisticsConfig({ ...logisticsConfig, shiprocket_mode: e.target.value })}
                    className="w-full h-8.5 bg-white border border-neutral-200 rounded-sm px-2.5 text-xs text-neutral-900 outline-none"
                  >
                    <option value="test">Test / Sandbox Simulator</option>
                    <option value="live">Live Production Account</option>
                  </select>
                </div>

                {/* Shiprocket Email */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                    Shiprocket API Email
                  </label>
                  <input
                    type="email"
                    value={logisticsConfig.shiprocket_email}
                    onChange={(e) => setLogisticsConfig({ ...logisticsConfig, shiprocket_email: e.target.value })}
                    placeholder="logistics@guidelya.com"
                    className="w-full h-8.5 bg-white border border-neutral-200 rounded-sm px-2.5 text-xs text-neutral-900 font-mono outline-none"
                  />
                </div>

                {/* Shiprocket Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-neutral-700">
                      API Password / Secret
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowShiprocketPass(!showShiprocketPass)}
                      className="text-[10px] text-neutral-500 hover:text-neutral-900"
                    >
                      {showShiprocketPass ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    type={showShiprocketPass ? 'text' : 'password'}
                    value={logisticsConfig.shiprocket_password}
                    onChange={(e) => setLogisticsConfig({ ...logisticsConfig, shiprocket_password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full h-8.5 bg-white border border-neutral-200 rounded-sm px-2.5 text-xs text-neutral-900 font-mono outline-none"
                  />
                </div>

                {/* Pickup Location */}
                <div className="sm:col-span-3">
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                    Pickup Location / Warehouse Nickname (as set in Shiprocket Dashboard)
                  </label>
                  <input
                    type="text"
                    value={logisticsConfig.shiprocket_pickup_location}
                    onChange={(e) => setLogisticsConfig({ ...logisticsConfig, shiprocket_pickup_location: e.target.value })}
                    placeholder="Primary"
                    className="w-full h-8.5 bg-white border border-neutral-200 rounded-sm px-2.5 text-xs text-neutral-900 font-mono outline-none"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Matches your default dispatch warehouse address configured on Shiprocket.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. NIMBUSPOST API CREDENTIALS CARD */}
            <div className="p-4 sm:p-5 bg-neutral-50 border border-neutral-200 rounded-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                    2. NimbusPost API Credentials
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestNimbusPost}
                    disabled={isTestingNimbus}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-neutral-100 border border-neutral-300 text-xs font-medium text-neutral-800 rounded-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isTestingNimbus ? <RefreshCw className="h-3 w-3 animate-spin text-blue-600" /> : <Zap className="h-3 w-3 text-amber-500" />}
                    <span>Test NimbusPost Connection</span>
                  </button>
                  <a
                    href="https://app.nimbuspost.com/api"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>Get API Token</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Nimbus Mode */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                    Environment Mode
                  </label>
                  <select
                    value={logisticsConfig.nimbuspost_mode}
                    onChange={(e) => setLogisticsConfig({ ...logisticsConfig, nimbuspost_mode: e.target.value })}
                    className="w-full h-8.5 bg-white border border-neutral-200 rounded-sm px-2.5 text-xs text-neutral-900 outline-none"
                  >
                    <option value="test">Test / Sandbox Simulator</option>
                    <option value="live">Live Production Account</option>
                  </select>
                </div>

                {/* Nimbus Email */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                    NimbusPost Account Email
                  </label>
                  <input
                    type="email"
                    value={logisticsConfig.nimbuspost_email}
                    onChange={(e) => setLogisticsConfig({ ...logisticsConfig, nimbuspost_email: e.target.value })}
                    placeholder="shipping@guidelya.com"
                    className="w-full h-8.5 bg-white border border-neutral-200 rounded-sm px-2.5 text-xs text-neutral-900 font-mono outline-none"
                  />
                </div>

                {/* Nimbus Token */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-neutral-700">
                      API Secret Token / Key
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNimbusToken(!showNimbusToken)}
                      className="text-[10px] text-neutral-500 hover:text-neutral-900"
                    >
                      {showNimbusToken ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    type={showNimbusToken ? 'text' : 'password'}
                    value={logisticsConfig.nimbuspost_token}
                    onChange={(e) => setLogisticsConfig({ ...logisticsConfig, nimbuspost_token: e.target.value })}
                    placeholder="np_live_token_••••••••"
                    className="w-full h-8.5 bg-white border border-neutral-200 rounded-sm px-2.5 text-xs text-neutral-900 font-mono outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 4. MANUAL COURIER & NOTIFICATION RULES */}
            <div className="p-4 sm:p-5 bg-neutral-50 border border-neutral-200 rounded-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                  3. Automated Dispatch & Notification Settings
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Default Courier Partner */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                    Default Courier Partner for Manual Dispatch
                  </label>
                  <select
                    value={logisticsConfig.default_courier_partner}
                    onChange={(e) => setLogisticsConfig({ ...logisticsConfig, default_courier_partner: e.target.value })}
                    className="w-full h-8.5 bg-white border border-neutral-200 rounded-sm px-2.5 text-xs text-neutral-900 outline-none"
                  >
                    <option value="Bluedart Express">Bluedart Express</option>
                    <option value="Delhivery Surface">Delhivery Surface</option>
                    <option value="Delhivery Express">Delhivery Express</option>
                    <option value="DTDC Priority">DTDC Priority</option>
                    <option value="Ekart Logistics">Ekart Logistics</option>
                    <option value="Shadowfax">Shadowfax</option>
                    <option value="Xpressbees">Xpressbees</option>
                    <option value="India Post Speed Post">India Post Speed Post</option>
                    <option value="Trackon Couriers">Trackon Couriers</option>
                  </select>
                </div>

                {/* Default Estimated Delivery Timeline */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                    Estimated Delivery Timeline Template
                  </label>
                  <input
                    type="text"
                    value={logisticsConfig.default_estimated_days}
                    onChange={(e) => setLogisticsConfig({ ...logisticsConfig, default_estimated_days: e.target.value })}
                    placeholder="Within 2–4 Business Days"
                    className="w-full h-8.5 bg-white border border-neutral-200 rounded-sm px-2.5 text-xs text-neutral-900 outline-none"
                  />
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2.5 p-3 bg-white border border-neutral-200 rounded-sm cursor-pointer hover:bg-neutral-100">
                  <input
                    type="checkbox"
                    checked={logisticsConfig.auto_send_whatsapp === 'true' || logisticsConfig.auto_send_whatsapp === true}
                    onChange={(e) => setLogisticsConfig({ ...logisticsConfig, auto_send_whatsapp: e.target.checked ? 'true' : 'false' })}
                    className="accent-neutral-900 h-4 w-4"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-neutral-900 block flex items-center gap-1.5">
                      <MessageSquare className="h-3 w-3 text-emerald-600" />
                      Auto-Send WhatsApp Tracking Alert
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Dispatches tracking code & live tracking URL to customer's WhatsApp on order dispatch
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 bg-white border border-neutral-200 rounded-sm cursor-pointer hover:bg-neutral-100">
                  <input
                    type="checkbox"
                    checked={logisticsConfig.auto_send_email === 'true' || logisticsConfig.auto_send_email === true}
                    onChange={(e) => setLogisticsConfig({ ...logisticsConfig, auto_send_email: e.target.checked ? 'true' : 'false' })}
                    className="accent-neutral-900 h-4 w-4"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-neutral-900 block flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-red-600" />
                      Auto-Send Email Tracking Alert
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Sends branded HTML email with "Track Live Shipment" button on order dispatch
                    </span>
                  </div>
                </label>
              </div>

            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-red-600 text-white text-xs font-medium uppercase tracking-wider rounded-sm transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>Save Logistics & Courier Settings</span>
              </button>
            </div>

          </div>
        </form>
      )}

    </div>
  );
}

